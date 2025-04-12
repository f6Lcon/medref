import asyncHandler from "express-async-handler"
import generateToken from "../utils/generateToken.js"
import generateOTP from "../utils/generateOTP.js"
import sendEmail from "../utils/sendEmail.js"
import User from "../models/user.model.js"
import Patient from "../models/patient.model.js"
import Doctor from "../models/doctor.model.js"
import OTP from "../models/otp.model.js"

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
    // Check if user is verified
    if (!user.isVerified) {
      res.status(401)
      throw new Error("Please verify your email address before logging in")
    }

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

  // Create user with isVerified set to false
  const user = await User.create({
    name,
    username,
    email,
    password,
    role,
    isVerified: false,
  })

  if (user) {
    // Generate OTP
    const otp = generateOTP()

    // Save OTP to database
    await OTP.create({
      user: user._id,
      email: user.email,
      otp,
    })

    // Send verification email
    const verificationEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #2c3e50; text-align: center;">Welcome to MEDREF</h2>
        <p>Hello ${user.name},</p>
        <p>Thank you for registering with MEDREF. To complete your registration, please use the following One-Time Password (OTP) to verify your email address:</p>
        <div style="background-color: #f5f7fa; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
          <h3 style="margin: 0; color: #3498db; font-size: 24px;">${otp}</h3>
        </div>
        <p>This OTP will expire in 1 hour.</p>
        <p>If you did not register for a MEDREF account, please ignore this email.</p>
        <p>Best regards,<br>The MEDREF Team</p>
      </div>
    `

    await sendEmail({
      email: user.email,
      subject: "MEDREF - Email Verification",
      html: verificationEmailHtml,
    })

    res.status(201).json({
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      message: "Registration successful! Please check your email for verification OTP.",
    })
  } else {
    res.status(400)
    throw new Error("Invalid user data")
  }
})

// @desc    Verify user email with OTP
// @route   POST /api/auth/verify
// @access  Public
const verifyEmail = asyncHandler(async (req, res) => {
  const { email, otp } = req.body

  if (!email || !otp) {
    res.status(400)
    throw new Error("Please provide email and OTP")
  }

  // Find the user by email
  const user = await User.findOne({ email })
  if (!user) {
    res.status(404)
    throw new Error("User not found")
  }

  // If user is already verified
  if (user.isVerified) {
    return res.json({
      message: "Email already verified. Please login.",
    })
  }

  // Find the OTP record
  const otpRecord = await OTP.findOne({ user: user._id, email, otp })
  if (!otpRecord) {
    res.status(400)
    throw new Error("Invalid or expired OTP")
  }

  // Verify the user
  user.isVerified = true
  await user.save()

  // Delete the OTP record
  await OTP.deleteOne({ _id: otpRecord._id })

  res.json({
    _id: user._id,
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
    token: generateToken(user._id),
    message: "Email verified successfully! You can now log in.",
  })
})

// @desc    Resend verification OTP
// @route   POST /api/auth/resend-otp
// @access  Public
const resendOTP = asyncHandler(async (req, res) => {
  const { email } = req.body

  if (!email) {
    res.status(400)
    throw new Error("Please provide email")
  }

  // Find the user by email
  const user = await User.findOne({ email })
  if (!user) {
    res.status(404)
    throw new Error("User not found")
  }

  // If user is already verified
  if (user.isVerified) {
    return res.json({
      message: "Email already verified. Please login.",
    })
  }

  // Delete any existing OTP for this user
  await OTP.deleteMany({ user: user._id })

  // Generate new OTP
  const otp = generateOTP()

  // Save OTP to database
  await OTP.create({
    user: user._id,
    email: user.email,
    otp,
  })

  // Send verification email
  const verificationEmailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h2 style="color: #2c3e50; text-align: center;">MEDREF Email Verification</h2>
      <p>Hello ${user.name},</p>
      <p>You requested a new verification code. Please use the following One-Time Password (OTP) to verify your email address:</p>
      <div style="background-color: #f5f7fa; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
        <h3 style="margin: 0; color: #3498db; font-size: 24px;">${otp}</h3>
      </div>
      <p>This OTP will expire in 1 hour.</p>
      <p>If you did not request this code, please ignore this email.</p>
      <p>Best regards,<br>The MEDREF Team</p>
    </div>
  `

  await sendEmail({
    email: user.email,
    subject: "MEDREF - New Verification Code",
    html: verificationEmailHtml,
  })

  res.json({
    message: "New verification code sent to your email.",
  })
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
      isVerified: user.isVerified,
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
      isVerified: updatedUser.isVerified,
      token: generateToken(updatedUser._id),
    })
  } else {
    res.status(404)
    throw new Error("User not found")
  }
})

export { loginUser, registerUser, verifyEmail, resendOTP, getUserProfile, updateUserProfile }
