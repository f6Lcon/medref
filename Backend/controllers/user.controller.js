import asyncHandler from "express-async-handler"
import User from "../models/user.model.js"
import Doctor from "../models/doctor.model.js"
import Patient from "../models/patient.model.js"
import Admin from "../models/admin.model.js"

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({})
  res.json(users)
})

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)

  if (user) {
    // Delete associated profile based on role
    if (user.role === "doctor") {
      await Doctor.findOneAndDelete({ user: user._id })
    } else if (user.role === "patient") {
      await Patient.findOneAndDelete({ user: user._id })
    } else if (user.role === "admin") {
      await Admin.findOneAndDelete({ user: user._id })
    }

    // Use findByIdAndDelete instead of remove()
    await User.findByIdAndDelete(req.params.id)
    res.json({ message: "User removed" })
  } else {
    res.status(404)
    throw new Error("User not found")
  }
})

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password")
  if (user) {
    res.json(user)
  } else {
    res.status(404)
    throw new Error("User not found")
  }
})

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)

  if (user) {
    user.name = req.body.name || user.name
    user.email = req.body.email || user.email
    user.username = req.body.username || user.username
    user.role = req.body.role || user.role

    const updatedUser = await user.save()

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      username: updatedUser.username,
      role: updatedUser.role,
    })
  } else {
    res.status(404)
    throw new Error("User not found")
  }
})

// @desc    Search users
// @route   GET /api/users/search
// @access  Private/Admin
const searchUsers = asyncHandler(async (req, res) => {
  const { search } = req.query

  if (!search || search.length < 2) {
    return res.status(400).json({ message: "Search term must be at least 2 characters" })
  }

  const users = await User.find({
    $or: [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { username: { $regex: search, $options: "i" } },
    ],
  }).select("-password")

  res.json(users)
})

export { getUsers, deleteUser, getUserById, updateUser, searchUsers }
