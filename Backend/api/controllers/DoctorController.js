import asyncHandler from 'express-async-handler';
import Doctor from '../models/Doctor.js';
import User from '../models/User.js'; // Needed if updating user part too
import Hospital from '../models/Hospital.js'; // Needed for validation

// @desc    Get doctors (with filtering by specialty and hospital)
// @route   GET /api/doctors
// @access  Public or Private (for booking / lookups)
const getDoctors = asyncHandler(async (req, res) => {
    const filter = {};
    const { specialty, hospitalId } = req.query;

    if (specialty) {
        // Case-insensitive search for specialty
        filter.specialty = { $regex: specialty, $options: 'i' };
    }
    if (hospitalId) {
        // Find doctors whose affiliations array contains an element matching the hospitalId
        filter['affiliations.hospital'] = hospitalId;
    }

    // Find doctors based on the filter, populating necessary fields
    const doctors = await Doctor.find(filter)
        .populate('user', 'name email') // Populate basic user info (name, email)
        .populate('affiliations.hospital', 'name city'); // Populate hospital info within affiliations

    res.json(doctors);
});

// @desc    Get doctor by ID
// @route   GET /api/doctors/:id
// @access  Public or Private
const getDoctorById = asyncHandler(async (req, res) => {
    const doctor = await Doctor.findById(req.params.id)
        .populate('user', 'name email role') // Get more user info if needed
        .populate('affiliations.hospital', 'name address contactPhone'); // Full hospital details

    if (doctor) {
        res.json(doctor);
    } else {
        res.status(404);
        throw new Error('Doctor not found');
    }
});


// @desc    Add a hospital affiliation to a doctor
// @route   POST /api/doctors/:id/affiliations
// @access  Private (Admin or the Doctor themselves)
const addDoctorAffiliation = asyncHandler(async (req, res) => {
    const { hospitalId, department } = req.body;
    const doctorId = req.params.id;

    if (!hospitalId) {
        res.status(400);
        throw new Error('Hospital ID is required');
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
        res.status(404); throw new Error('Doctor not found');
    }

    // Authorization check: Is logged-in user admin OR the doctor themselves?
    const isSelf = req.user.doctorProfile && req.user.doctorProfile.equals(doctor._id);
    if (req.user.role !== 'admin' && !isSelf) {
        res.status(403);
        throw new Error('Not authorized to modify affiliations for this doctor');
    }


    // Validate hospital exists
    const hospitalExists = await Hospital.findById(hospitalId);
    if (!hospitalExists || !hospitalExists.active) {
        res.status(404); throw new Error('Hospital not found or inactive');
    }

    // Check if affiliation already exists
    const alreadyAffiliated = doctor.affiliations.some(aff => aff.hospital.equals(hospitalId));
    if (alreadyAffiliated) {
         res.status(400); throw new Error('Doctor is already affiliated with this hospital');
    }

    // Add the affiliation using $push
    doctor.affiliations.push({ hospital: hospitalId, department });
    await doctor.save();

    // Repopulate for response
    const updatedDoctor = await Doctor.findById(doctorId)
        .populate('user', 'name email')
        .populate('affiliations.hospital', 'name');


    res.status(201).json(updatedDoctor);
});


// @desc    Remove a hospital affiliation from a doctor
// @route   DELETE /api/doctors/:id/affiliations/:affiliationHospitalId
// @access  Private (Admin or the Doctor themselves)
const removeDoctorAffiliation = asyncHandler(async (req, res) => {
    const doctorId = req.params.id;
    const affiliationHospitalId = req.params.affiliationHospitalId; // Get hospital ID from route

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
        res.status(404); throw new Error('Doctor not found');
    }

     // Authorization check
    const isSelf = req.user.doctorProfile && req.user.doctorProfile.equals(doctor._id);
    if (req.user.role !== 'admin' && !isSelf) {
        res.status(403);
        throw new Error('Not authorized to modify affiliations for this doctor');
    }

    // Find the index of the affiliation to remove
    const affiliationIndex = doctor.affiliations.findIndex(aff => aff.hospital.equals(affiliationHospitalId));

    if (affiliationIndex === -1) {
         res.status(404); throw new Error('Affiliation with this hospital not found for this doctor');
    }

    // Remove the affiliation using splice (or $pull could be used before finding)
    doctor.affiliations.splice(affiliationIndex, 1);
    await doctor.save();

     // Repopulate for response
    const updatedDoctor = await Doctor.findById(doctorId)
        .populate('user', 'name email')
        .populate('affiliations.hospital', 'name');


    res.json(updatedDoctor);
});


export {
    getDoctors,
    getDoctorById,
    addDoctorAffiliation,
    removeDoctorAffiliation,
    // Add updateDoctorProfile if needed (likely modifying related User doc too)
};