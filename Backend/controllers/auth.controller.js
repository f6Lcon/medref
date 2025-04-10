import asyncHandler from "express-async-handler"
import generateToken from "../utils/generateToken.js"
import User from "../models/user.model.js"
import Patient from "../models/patient.model.js"
import Doctor from "../models/doctor.model.js"

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body

  // Allow login with either email or username
  let user

  if (email) {
    user = await User.findOne({ email })
  } else if (username) {
    user = await User.findOne({ username })
  } else {
    res.status(400)
    throw new Error("Please provide email or username")
  }

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    })
  } else {
    res.status(401)
    throw new Error("Invalid email/username or password")
  }
})

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, username, email, password, role } = req.body

  // Check if email exists
  const emailExists = await User.findOne({ email })
  if (emailExists) {
    res.status(400)
    throw new Error("Email already in use")
  }

  // Check if username exists
  const usernameExists = await User.findOne({ username })
  if (usernameExists) {
    res.status(400)
    throw new Error("Username already taken")
  }

  // Validate role
  if (role && !["patient", "doctor", "admin"].includes(role)) {
    res.status(400)
    throw new Error("Invalid role specified")
  }

  const user = await User.create({
    name,
    username,
    email,
    password,
    role,
  })

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    })
  } else {
    res.status(400)
    throw new Error("Invalid user data")
  }
})

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  if (user) {
    const profileData = {
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
    }

    // If user is a patient, get patient data
    if (user.role === "patient") {
      const patient = await Patient.findOne({ user: user._id })
      if (patient) {
        profileData.patientData = patient
      }
    }

    // If user is a doctor, get doctor data
    if (user.role === "doctor") {
      const doctor = await Doctor.findOne({ user: user._id }).populate("hospital")
      if (doctor) {
        profileData.doctorData = doctor
      }
    }

    res.json(profileData)
  } else {
    res.status(404)
    throw new Error("User not found")
  }
})

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  if (user) {
    user.name = req.body.name || user.name
    user.email = req.body.email || user.email

    // Only update username if provided
    if (req.body.username) {
      // Check if username is already taken
      const usernameExists = await User.findOne({ username: req.body.username })
      if (usernameExists && usernameExists._id.toString() !== user._id.toString()) {
        res.status(400)
        throw new Error("Username already taken")
      }
      user.username = req.body.username
    }

    if (req.body.password) {
      user.password = req.body.password
    }

    const updatedUser = await user.save()

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
      token: generateToken(updatedUser._id),
    })
  } else {
    res.status(404)
    throw new Error("User not found")
  }
})

export { loginUser, registerUser, getUserProfile, updateUserProfile }
