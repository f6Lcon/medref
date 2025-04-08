import jwt from "jsonwebtoken"
import User from "../models/user.model.js"
import { catchAsync } from "../utils/catchAsync.js"
import { AppError } from "../utils/appError.js"


// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  })
}

// Register a new user
export const register = catchAsync(async (req, res, next) => {
  const { firstName, lastName, email, password, role, phoneNumber } = req.body

  // Check if user already exists
  const existingUser = await User.findOne({ email })
  if (existingUser) {
    return next(new AppError("Email already in use", 400))
  }

  // Create new user
  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    role,
    phoneNumber,
  })

  // Generate token
  const token = generateToken(user._id)

  res.status(201).json({
    status: "success",
    token,
    data: {
      user,
    },
  })
})

// Login user
export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body

  // Check if email and password exist
  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400))
  }

  // Check if user exists and password is correct
  const user = await User.findOne({ email }).select("+password")

  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError("Incorrect email or password", 401))
  }

  // Generate token
  const token = generateToken(user._id)

  res.status(200).json({
    status: "success",
    token,
    data: {
      user,
    },
  })
})

// Get current user
export const getCurrentUser = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: "success",
    data: {
      user: req.user,
    },
  })
})

// Update password
export const updatePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body

  // Get user from collection
  const user = await User.findById(req.user.id).select("+password")

  // Check if current password is correct
  if (!(await user.comparePassword(currentPassword))) {
    return next(new AppError("Your current password is incorrect", 401))
  }

  // Update password
  user.password = newPassword
  await user.save()

  // Generate new token
  const token = generateToken(user._id)

  res.status(200).json({
    status: "success",
    token,
    message: "Password updated successfully",
  })
})

// Forgot password
export const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body

  // Find user by email
  const user = await User.findOne({ email })
  if (!user) {
    return next(new AppError("There is no user with that email address", 404))
  }

  // Generate reset token (in a real app, you would send this via email)
  const resetToken = user.createPasswordResetToken()
  await user.save({ validateBeforeSave: false })

  res.status(200).json({
    status: "success",
    message: "Token sent to email",
    resetToken, // In production, don't send this in the response
  })
})

// Reset password
export const resetPassword = catchAsync(async (req, res, next) => {
  const { token } = req.params
  const { password } = req.body

  // Find user by reset token
  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: Date.now() },
  })

  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400))
  }

  // Update password
  user.password = password
  user.passwordResetToken = undefined
  user.passwordResetExpires = undefined
  await user.save()

  // Generate new token
  const newToken = generateToken(user._id)

  res.status(200).json({
    status: "success",
    token: newToken,
    message: "Password reset successfully",
  })
})
