import asyncHandler from 'express-async-handler';
import Hospital from '../models/Hospital.js';

// @desc    Create a new hospital
// @route   POST /api/hospitals
// @access  Private (Admin)
const createHospital = asyncHandler(async (req, res) => {
    const { name, address, contactPhone, active } = req.body;

    if (!name) {
        res.status(400);
        throw new Error('Hospital name is required');
    }

    const hospitalExists = await Hospital.findOne({ name });
    if (hospitalExists) {
        res.status(400);
        throw new Error('Hospital with this name already exists');
    }

    const hospital = await Hospital.create({
        name,
        address,
        contactPhone,
        active,
    });

    res.status(201).json(hospital);
});

// @desc    Get all active hospitals (add filtering later if needed)
// @route   GET /api/hospitals
// @access  Private (Staff, Doctor, Admin) - Needed for creating referrals/appointments
const getHospitals = asyncHandler(async (req, res) => {
    // Can add filters like ?active=true later
    const hospitals = await Hospital.find({ active: true }); // Usually only show active ones
    res.json(hospitals);
});

// @desc    Get hospital by ID
// @route   GET /api/hospitals/:id
// @access  Private (Staff, Doctor, Admin)
const getHospitalById = asyncHandler(async (req, res) => {
    const hospital = await Hospital.findById(req.params.id);

    if (hospital) {
        res.json(hospital);
    } else {
        res.status(404);
        throw new Error('Hospital not found');
    }
});

// @desc    Update hospital
// @route   PUT /api/hospitals/:id
// @access  Private (Admin)
const updateHospital = asyncHandler(async (req, res) => {
    const hospital = await Hospital.findById(req.params.id);

    if (hospital) {
        hospital.name = req.body.name || hospital.name;
        hospital.address = req.body.address || hospital.address; // Assumes full address obj overwrite or null
        hospital.contactPhone = req.body.contactPhone || hospital.contactPhone;
        hospital.active = req.body.active !== undefined ? req.body.active : hospital.active;

        // Add logic if address is partially updated

        const updatedHospital = await hospital.save();
        res.json(updatedHospital);
    } else {
        res.status(404);
        throw new Error('Hospital not found');
    }
});

// @desc    Delete (or deactivate) a hospital
// @route   DELETE /api/hospitals/:id
// @access  Private (Admin)
const deleteHospital = asyncHandler(async (req, res) => {
    const hospital = await Hospital.findById(req.params.id);

    if (hospital) {
        // Option 1: Soft delete (recommended)
        hospital.active = false;
        await hospital.save();
        res.json({ message: 'Hospital deactivated' });

        // Option 2: Hard delete (use with caution, check dependencies)
        // await hospital.deleteOne();
        // res.json({ message: 'Hospital removed' });
    } else {
        res.status(404);
        throw new Error('Hospital not found');
    }
});


export {
    createHospital,
    getHospitals,
    getHospitalById,
    updateHospital,
    deleteHospital,
};