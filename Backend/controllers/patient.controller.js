import asyncHandler from "express-async-handler"
import Patient from "../models/patient.model.js"
import User from "../models/user.model.js"

// @desc    Create a patient profile
// @route   POST /api/patients
// @access  Private
const createPatient = asyncHandler(async (req, res) => {
  const {
    email,
    dateOfBirth,
    gender,
    address,
    phoneNumber,
    medicalHistory,
    allergies,
    currentMedications,
    insuranceInfo,
    emergencyContact,
  } = req.body

  // Check if patient profile already exists
  const existingPatient = await Patient.findOne({ user: req.user._id })

  if (existingPatient) {
    res.status(400)
    throw new Error("Patient profile already exists")
  }

  // Verify email matches the authenticated user's email
  const user = await User.findById(req.user._id)
  if (!user || user.email !== email) {
    res.status(400)
    throw new Error("Email does not match authenticated user")
  }

  const patient = await Patient.create({
    user: req.user._id,
    email, // Include email from request
    dateOfBirth,
    gender,
    address,
    phoneNumber,
    medicalHistory,
    allergies,
    currentMedications,
    insuranceInfo,
    emergencyContact,
  })

  if (patient) {
    res.status(201).json(patient)
  } else {
    res.status(400)
    throw new Error("Invalid patient data")
  }
})

// @desc    Get patient profile
// @route   GET /api/patients/profile
// @access  Private
const getPatientProfile = asyncHandler(async (req, res) => {
  const patient = await Patient.findOne({ user: req.user._id }).populate("user", "name email")

  if (patient) {
    res.json(patient)
  } else {
    res.status(404)
    throw new Error("Patient not found")
  }
})

// @desc    Update patient profile
// @route   PUT /api/patients/profile
// @access  Private
const updatePatientProfile = asyncHandler(async (req, res) => {
  const patient = await Patient.findOne({ user: req.user._id })

  if (patient) {
    patient.dateOfBirth = req.body.dateOfBirth || patient.dateOfBirth
    patient.gender = req.body.gender || patient.gender
    patient.address = req.body.address || patient.address
    patient.phoneNumber = req.body.phoneNumber || patient.phoneNumber
    patient.medicalHistory = req.body.medicalHistory || patient.medicalHistory
    patient.allergies = req.body.allergies || patient.allergies
    patient.currentMedications = req.body.currentMedications || patient.currentMedications
    patient.insuranceInfo = req.body.insuranceInfo || patient.insuranceInfo
    patient.emergencyContact = req.body.emergencyContact || patient.emergencyContact

    const updatedPatient = await patient.save()
    res.json(updatedPatient)
  } else {
    res.status(404)
    throw new Error("Patient not found")
  }
})

// @desc    Get all patients
// @route   GET /api/patients
// @access  Private/Admin/Doctor
const getPatients = asyncHandler(async (req, res) => {
  const patients = await Patient.find({}).populate("user", "name email")
  res.json(patients)
})

// @desc    Get patient by ID
// @route   GET /api/patients/:id
// @access  Private/Admin/Doctor
const getPatientById = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id).populate("user", "name email")

  if (patient) {
    res.json(patient)
  } else {
    res.status(404)
    throw new Error("Patient not found")
  }
})

// @desc    Search patients
// @route   GET /api/patients/search
// @access  Private
const searchPatients = asyncHandler(async (req, res) => {
  const { search } = req.query

  if (!search || search.length < 2) {
    return res.status(400).json({ message: "Search term must be at least 2 characters" })
  }

  // Find patients whose name or email contains the search term
  const patients = await Patient.find().populate({
    path: "user",
    match: {
      $or: [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }],
    },
    select: "name email role",
  })

  // Filter out patients where user is null (no match)
  const filteredPatients = patients.filter((patient) => patient.user !== null)

  // Format the response to include user details at the top level
  const formattedPatients = filteredPatients.map((patient) => ({
    _id: patient.user._id,
    name: patient.user.name,
    email: patient.user.email,
    role: patient.user.role,
    patientId: patient._id,
  }))

  res.json(formattedPatients)
})

export { createPatient, getPatientProfile, updatePatientProfile, getPatients, getPatientById, searchPatients }
