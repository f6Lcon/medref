import asyncHandler from 'express-async-handler';
import Referral from '../models/Referral.js';
import Patient from '../models/Patient.js'; // To validate patient exists
import Hospital from '../models/Hospital.js'; // To validate hospital exists
// Assuming the logged-in user (doctor) is the referrer
// If staff can refer on behalf of a doctor, logic needs adjustment

// @desc    Create a new referral
// @route   POST /api/referrals
// @access  Private (Doctor, potentially Staff)
const createReferral = asyncHandler(async (req, res) => {
    const { patientId, referredHospitalId, referredSpecialty, reason, notes } = req.body;

    // 1. Get Referring Doctor ID from logged-in user
    const referringDoctorId = req.user.doctorProfile; // Assumes user has doctorProfile populated if role is 'doctor'
    if (!referringDoctorId || req.user.role !== 'doctor') {
        // Or adjust if staff can select referring doctor
        res.status(400);
        throw new Error('User is not a doctor or doctor profile not linked.');
    }

    // 2. Validate Inputs
    if (!patientId || !referredHospitalId || !referredSpecialty || !reason) {
        res.status(400);
        throw new Error('Missing required referral information: patient, hospital, specialty, reason.');
    }

    // 3. Validate Patient and Hospital exist
    const patientExists = await Patient.findById(patientId);
    if (!patientExists) {
        res.status(404);
        throw new Error('Patient not found');
    }
    const hospitalExists = await Hospital.findById(referredHospitalId);
    if (!hospitalExists || !hospitalExists.active) {
        res.status(404);
        throw new Error('Referred hospital not found or is inactive');
    }

    // 4. Create Referral
    const referral = await Referral.create({
        patient: patientId,
        referringDoctor: referringDoctorId,
        referredHospital: referredHospitalId,
        referredSpecialty,
        reason,
        notes,
        status: 'Pending', // Initial status
    });

    // 5. Populate for response (optional but good practice)
    const populatedReferral = await Referral.findById(referral._id)
        .populate('patient', 'firstName lastName')
        .populate({
            path: 'referringDoctor',
            select: 'specialty',
            populate: { path: 'user', select: 'name' }
         })
        .populate('referredHospital', 'name');

    res.status(201).json(populatedReferral);
});


// @desc    Get referrals (filtered based on context)
// @route   GET /api/referrals
// @access  Private (Admin, Staff, Doctor)
const getReferrals = asyncHandler(async (req, res) => {
    const filter = {};
    const userRole = req.user.role;
    const doctorProfileId = req.user.doctorProfile; // If user is a doctor

    // Add filters from query params
    if (req.query.patientId) {
        filter.patient = req.query.patientId;
    }
    if (req.query.hospitalId) {
        filter.referredHospital = req.query.hospitalId;
    }
    if (req.query.status) {
        filter.status = req.query.status;
    }
    if (req.query.specialty) {
         filter.referredSpecialty = { $regex: req.query.specialty, $options: 'i' }; // Case-insensitive search
    }


    // Authorization-based filtering (Example)
    if (userRole === 'doctor') {
        // Doctors typically see referrals *they* made
        // Or potentially referrals TO them (requires adding 'assignedDoctor' field if workflow supports it)
         if (doctorProfileId) {
             filter.referringDoctor = doctorProfileId;
         } else {
             // Handle case where user has role doctor but no profile? Should not happen if setup is correct.
             return res.json([]);
         }
    } else if (userRole !== 'admin' && userRole !== 'staff') {
        // If other roles exist, restrict access
        res.status(403);
        throw new Error('Not authorized to view all referrals');
    }
    // Admins/Staff can potentially see all (with client-side filtering or more specific server filters)

    const referrals = await Referral.find(filter)
        .populate('patient', 'firstName lastName dateOfBirth')
        .populate({
           path: 'referringDoctor',
           select: 'specialty', // Select fields from Doctor model
           populate: { path: 'user', select: 'name' } // Populate nested User within Doctor
        })
        .populate('referredHospital', 'name city') // Select fields from Hospital
        .populate('relatedAppointment', 'appointmentDateTime status') // Populate linked appointment if exists
        .sort({ createdAt: -1 }); // Sort by most recent

    res.json(referrals);
});

// @desc    Get single referral by ID
// @route   GET /api/referrals/:id
// @access  Private (Admin, Staff, Doctor involved in referral)
const getReferralById = asyncHandler(async (req, res) => {
    const referral = await Referral.findById(req.params.id)
       .populate('patient', 'firstName lastName dateOfBirth contact address') // More details for single view
       .populate({
           path: 'referringDoctor',
           select: 'specialty qualifications',
           populate: { path: 'user', select: 'name email' }
        })
       .populate('referredHospital', 'name address contactPhone')
       .populate({
            path: 'relatedAppointment',
            select: 'appointmentDateTime status doctor',
             populate: {
                 path: 'doctor',
                 select: 'specialty',
                 populate: { path: 'user', select: 'name' } // Doctor who has the appointment
             }
        });

    if (!referral) {
        res.status(404);
        throw new Error('Referral not found');
    }

    // Authorization Check: Ensure the user viewing has a relation to the referral
    // Example: Only admin, staff, the referring doctor, or staff at the referred hospital (more complex) can view.
    const isReferringDoctor = req.user.doctorProfile && referral.referringDoctor._id.equals(req.user.doctorProfile);

    if (req.user.role === 'admin' || req.user.role === 'staff' || isReferringDoctor) {
         res.json(referral);
    } else {
        // Add logic here if e.g., doctors/staff at the *referred hospital* should see it
        res.status(403);
        throw new Error('Not authorized to view this referral');
    }

});

// @desc    Update referral status
// @route   PUT /api/referrals/:id/status
// @access  Private (Admin, Staff, potentially Doctor depending on status transition)
const updateReferralStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const referral = await Referral.findById(req.params.id);

    if (!referral) {
        res.status(404);
        throw new Error('Referral not found');
    }

    // Basic Validation - check if status is valid enum value (Mongoose does this on save too)
    const validStatuses = Referral.schema.path('status').enumValues;
    if (!validStatuses.includes(status)) {
        res.status(400);
        throw new Error(`Invalid status value: ${status}`);
    }

    // Authorization - Who can change to which status? (Example)
    // Maybe only Admin/Staff can mark as 'SentToHospital', 'Cancelled' etc.
    // Status might be updated automatically when appointment linked (handled in appointment controller)

    referral.status = status;
    await referral.save();

    // Repopulate before sending back? Optional.
    const populatedReferral = await Referral.findById(referral._id)
        .populate('patient', 'firstName lastName')
        .populate({path: 'referringDoctor', populate: { path: 'user', select: 'name' } })
        .populate('referredHospital', 'name');


    res.json(populatedReferral);
});


export {
    createReferral,
    getReferrals,
    getReferralById,
    updateReferralStatus,
};