import { Hospital } from "../models/Hospital.js";
export const createHospital = async (req, res) => {
  try {
    const hospital = new Hospital(req.body);
    await hospital.save();
    res.status(201).json(hospital);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all hospitals
export const getHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find();
    res.status(200).json(hospitals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a hospital by ID
export const getHospitalById = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) return res.status(404).json({ error: 'Hospital not found' });
    res.status(200).json(hospital);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update hospital info
export const updateHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!hospital) return res.status(404).json({ error: 'Hospital not found' });
    res.status(200).json(hospital);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a hospital
export const deleteHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findByIdAndDelete(req.params.id);
    if (!hospital) return res.status(404).json({ error: 'Hospital not found' });
    res.status(200).json({ message: 'Hospital deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
