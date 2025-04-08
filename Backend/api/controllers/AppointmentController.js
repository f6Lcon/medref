import asyncHandler from 'express-async-handler';
import Appointment from '../models/Appointment.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import Referral from '../models/Referral.js'; // Needed for linking

// @desc    Create a new appointment
// @route   POST /api/appointments
// @access  Private (Staff, Admin, maybe Patient if portal exists)
const createAppointment = asyncHandler(async (req, res) => {
    const { patientId, doctorId, appointmentDateTime, reason, originatingReferralId } = req.body;

    // 1. Validate Basic Inputs
    if (!patientId || !doctorId || !appointmentDateTime) {
        res.status(400);
        throw new Error('Patient, Doctor, and Appointment Date/Time are required');
    }

    // 2. Validate Patient and Doctor exist
    const patientExists = await Patient.findById(patientId);
    if (!patientExists) {
        res.status(404); throw new Error('Patient not found');
    }
    const doctorExists = await Doctor.findById(doctorId);
    if (!doctorExists) {
        res.status(404); throw new Error('Doctor not found');
    }

    // 3. Handle Optional Referral Linking
    let referralToUpdate = null;
    if (originatingReferralId) {
        referralToUpdate = await Referral.findById(originatingReferralId);
        if (!referralToUpdate) {
            res.status(404); throw new Error('Originating referral not found');
        }
        // Optional: Add more validation (e.g., does referral match patient? Is status appropriate?)
        if (!referralToUpdate.patient.equals(patientId)) {
             res.status(400); throw new Error('Referral does not belong to the specified patient.');
        }
        // Optional: Check if doctor matches referral specialty/hospital (adds complexity)
        const isAffiliated = doctorExists.affiliations.some(aff => aff.hospital.equals(referralToUpdate.referredHospital));
        if (doctorExists.specialty !== referralToUpdate.referredSpecialty /*|| !isAffiliated */) {
             console.warn(`Booking doctor ${doctorExists._id} specialty/affiliation may not match referral ${referralToUpdate._id}`);
             // Decide: block the booking or just warn? For now, allow but log.
            // res.status(400); throw new Error('Doctor specialty or hospital affiliation does not match the referral.');
        }
    }

    // 4. Create Appointment
    const appointment = await Appointment.create({
        patient: patientId,
        doctor: doctorId,
        appointmentDateTime,
        reason,
        status: 'Scheduled', // Initial status
        originatingReferral: originatingReferralId || undefined, // Only add if provided
    });

    // 5. Update Referral Status (if linked) - CRITICAL STEP
    if (referralToUpdate) {
        referralToUpdate.relatedAppointment = appointment._id;
        referralToUpdate.status = 'AppointmentScheduled';
        await referralToUpdate.save();
    }

    // 6. Populate for response
    const populatedAppointment = await Appointment.findById(appointment._id)
        .populate('patient', 'firstName lastName')
        .populate({
             path: 'doctor',
             select: 'specialty',
             populate: { path: 'user', select: 'name' }
         })
        .populate('originatingReferral', 'reason referredSpecialty');


    res.status(201).json(populatedAppointment);
});


// @desc    Get appointments (filtered)
// @route   GET /api/appointments
// @access  Private (Admin, Staff, Doctor, maybe Patient)
const getAppointments = asyncHandler(async (req, res) => {
    const filter = {};
    const userRole = req.user.role;
    const userDoctorProfileId = req.user.doctorProfile;

    // Query param filters
    if (req.query.patientId) filter.patient = req.query.patientId;
    if (req.query.doctorId) filter.doctor = req.query.doctorId;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.startDate && req.query.endDate) {
         filter.appointmentDateTime = {
             $gte: new Date(req.query.startDate),
             $lte: new Date(req.query.endDate),
         };
    } else if (req.query.date) {
        // Basic filtering for a specific day
        const startOfDay = new Date(req.query.date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(req.query.date);
        endOfDay.setHours(23, 59, 59, 999);
        filter.appointmentDateTime = { $gte: startOfDay, $lte: endOfDay };
    }


    // Role-based access / Default filtering
    if (userRole === 'doctor') {
         if (userDoctorProfileId) {
             // Doctors typically see their own appointments
             filter.doctor = userDoctorProfileId;
         } else {
            return res.json([]); // Doctor role but no profile ID? Empty result.
         }
    // Add logic here if patients can login and see their appointments
    // } else if (userRole === 'patient') {
    //     filter.patient = req.user.patientProfile; // Need to link user to patient
    } else if (userRole !== 'admin' && userRole !== 'staff') {
        // Restrict other potential roles unless explicitly allowed
        res.status(403);
        throw new Error('Not authorized to view appointments');
    }
     // Admin/Staff can see potentially all appointments based on query filters

    const appointments = await Appointment.find(filter)
        .populate('patient', 'firstName lastName')
        .populate({
             path: 'doctor',
             select: 'specialty', // Include fields you need
             populate: { path: 'user', select: 'name' } // Get the doctor's name from User
         })
        .populate('originatingReferral', 'reason referredSpecialty referredHospital') // Populate ref details
        .sort({ appointmentDateTime: 1 }); // Sort chronologically

    res.json(appointments);
});

// @desc    Get single appointment by ID
// @route   GET /api/appointments/:id
// @access  Private (Admin, Staff, Doctor/Patient involved)
const getAppointmentById = asyncHandler(async (req, res) => {
    const appointment = await Appointment.findById(req.params.id)
        .populate('patient', 'firstName lastName dateOfBirth contact') // More patient detail
        .populate({
             path: 'doctor',
             select: 'specialty',
             populate: { path: 'user', select: 'name email' }
         })
        .populate({
            path: 'originatingReferral',
            populate: [ // Multi-populate on referral
                 {path: 'referredHospital', select: 'name'},
                 {path: 'referringDoctor', populate: {path: 'user', select: 'name'}}
            ]
        });

    if (!appointment) {
        res.status(404); throw new Error('Appointment not found');
    }

    // Authorization Check: Can this user view this appointment?
    const isOwnDoctorAppointment = req.user.doctorProfile && appointment.doctor._id.equals(req.user.doctorProfile);
    // const isOwnPatientAppointment = req.user.patientProfile && appointment.patient._id.equals(req.user.patientProfile);

    if (req.user.role === 'admin' || req.user.role === 'staff' || isOwnDoctorAppointment /* || isOwnPatientAppointment */) {
        res.json(appointment);
    } else {
         res.status(403); throw new Error('Not authorized to view this appointment');
    }

});


// @desc    Update appointment status or details (e.g., reschedule, confirm, complete, cancel)
// @route   PUT /api/appointments/:id
// @access  Private (Admin, Staff, involved Doctor, maybe Patient for cancellations)
const updateAppointment = asyncHandler(async (req, res) => {
    const { appointmentDateTime, status, reason, notes } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
        res.status(404); throw new Error('Appointment not found');
    }

    // Authorization - Very granular: Who can change what?
    // Example: Staff/Admin can change anything. Doctor can change status/notes for their own appointments. Patient might only cancel.
     const isOwnDoctorAppointment = req.user.doctorProfile && appointment.doctor.equals(req.user.doctorProfile);
     // Add patient check if needed

    if (!(req.user.role === 'admin' || req.user.role === 'staff' || isOwnDoctorAppointment)) {
          res.status(403); throw new Error('Not authorized to update this appointment');
    }

     // Validate status if provided
     if (status && !Appointment.schema.path('status').enumValues.includes(status)) {
        res.status(400); throw new Error(`Invalid status: ${status}`);
    }

    // Update allowed fields
    if (appointmentDateTime && (req.user.role === 'admin' || req.user.role === 'staff')) { // Only admin/staff reschedule?
         appointment.appointmentDateTime = appointmentDateTime;
    }
     if (status) appointment.status = status;
     if (reason) appointment.reason = reason; // Can reason be updated?
     if (notes) appointment.notes = notes; // Typically doctor adds notes post-appt

    const updatedAppointment = await appointment.save();

     // Repopulate before sending response
     const populatedAppointment = await Appointment.findById(updatedAppointment._id)
         .populate('patient', 'firstName lastName')
         .populate({
              path: 'doctor', select: 'specialty',
              populate: { path: 'user', select: 'name' }
          });

    res.json(populatedAppointment);
});


export {
    createAppointment,
    getAppointments,
    getAppointmentById,
    updateAppointment,
    // Maybe add specific cancelAppointment function
};