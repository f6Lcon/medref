import asyncHandler from "express-async-handler"
import Doctor from "../models/doctor.model.js"
import User from "../models/user.model.js"

// @desc    Create a doctor profile
// @route   POST /api/doctors
// @access  Private
const createDoctor = asyncHandler(async (req, res) => {
  const { email, specialization, licenseNumber, hospital, education, experience, availability, contactInfo } = req.body

  // Check if doctor profile already exists
  const existingDoctor = await Doctor.findOne({ user: req.user._id })

  if (existingDoctor) {
    res.status(400)
    throw new Error("Doctor profile already exists")
  }

  // Verify email matches the authenticated user's email
  const user = await User.findById(req.user._id)
  if (!user || user.email !== email) {
    res.status(400)
    throw new Error("Email does not match authenticated user")
  }

  const doctor = await Doctor.create({
    user: req.user._id,
    email, // Include email from request
    specialization,
    licenseNumber,
    hospital,
    education,
    experience,
    availability,
    contactInfo,
  })

  if (doctor) {
    res.status(201).json(doctor)
  } else {
    res.status(400)
    throw new Error("Invalid doctor data")
  }
})

// @desc    Get doctor profile
// @route   GET /api/doctors/profile
// @access  Private
const getDoctorProfile = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findOne({ user: req.user._id }).populate("user", "name email").populate("hospital")

  if (doctor) {
    res.json(doctor)
  } else {
    res.status(404)
    throw new Error("Doctor not found")
  }
})

// @desc    Update doctor profile
// @route   PUT /api/doctors/profile
// @access  Private
const updateDoctorProfile = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findOne({ user: req.user._id })

  if (doctor) {
    doctor.specialization = req.body.specialization || doctor.specialization
    doctor.licenseNumber = req.body.licenseNumber || doctor.licenseNumber
    doctor.hospital = req.body.hospital || doctor.hospital
    doctor.education = req.body.education || doctor.education
    doctor.experience = req.body.experience || doctor.experience
    doctor.availability = req.body.availability || doctor.availability
    doctor.contactInfo = req.body.contactInfo || doctor.contactInfo

    const updatedDoctor = await doctor.save()
    res.json(updatedDoctor)
  } else {
    res.status(404)
    throw new Error("Doctor not found")
  }
})

// @desc    Get all doctors
// @route   GET /api/doctors
// @access  Public
const getDoctors = asyncHandler(async (req, res) => {
  const doctors = await Doctor.find({}).populate("user", "name email").populate("hospital")
  res.json(doctors)
})

// @desc    Get doctor by ID
// @route   GET /api/doctors/:id
// @access  Public
const getDoctorById = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id).populate("user", "name email").populate("hospital")

  if (doctor) {
    res.json(doctor)
  } else {
    res.status(404)
    throw new Error("Doctor not found")
  }
})

// @desc    Get doctors by specialization
// @route   GET /api/doctors/specialization/:specialization
// @access  Public
const getDoctorsBySpecialization = asyncHandler(async (req, res) => {
  const doctors = await Doctor.find({ specialization: req.params.specialization })
    .populate("user", "name email")
    .populate("hospital")

  res.json(doctors)
})

// @desc    Get doctors by hospital
// @route   GET /api/doctors/hospital/:hospitalId
// @access  Public
const getDoctorsByHospital = asyncHandler(async (req, res) => {
  const doctors = await Doctor.find({ hospital: req.params.hospitalId })
    .populate("user", "name email")
    .populate("hospital")

  res.json(doctors)
})

// @desc    Search doctors
// @route   GET /api/doctors/search
// @access  Private
const searchDoctors = asyncHandler(async (req, res) => {
  try {
    const { search } = req.query

    console.log(`Doctor search request received with search term: ${search}`)

    // Return a simple response for debugging
    return res.json([
      {
        _id: "test123",
        name: "Test Doctor",
        email: "test@example.com",
        role: "doctor",
        specialization: "General",
      },
    ])

    // The code below is commented out for debugging
    /*
    if (!search || search.length < 2) {
      return res.status(400).json({ message: "Search term must be at least 2 characters" })
    }

    // Simple approach - just find users with doctor role
    const users = await User.find({
      role: "doctor",
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ]
    }).select("_id name email role");

    // Format response
    const formattedResults = users.map(user => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      specialization: "General" // Default value
    }));

    res.json(formattedResults);
    */
  } catch (error) {
    console.error("Doctor search error:", error)
    res.status(500).json({
      message: "Server error during doctor search",
      error: error.message,
      stack: process.env.NODE_ENV === "production" ? "🥞" : error.stack,
    })
  }
})

export {
  createDoctor,
  getDoctorProfile,
  updateDoctorProfile,
  getDoctors,
  getDoctorById,
  getDoctorsBySpecialization,
  getDoctorsByHospital,
  searchDoctors,
}
