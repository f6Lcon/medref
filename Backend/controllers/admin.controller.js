import asyncHandler from "express-async-handler"
import Admin from "../models/admin.model.js"
import User from "../models/user.model.js"

// @desc    Create an admin profile
// @route   POST /api/admins
// @access  Private
const createAdmin = asyncHandler(async (req, res) => {
  const { email, department, permissions, contactInfo } = req.body

  // Check if admin profile already exists
  const existingAdmin = await Admin.findOne({ user: req.user._id })

  if (existingAdmin) {
    res.status(400)
    throw new Error("Admin profile already exists")
  }

  // Verify email matches the authenticated user's email
  const user = await User.findById(req.user._id)
  if (!user || user.email !== email) {
    res.status(400)
    throw new Error("Email does not match authenticated user")
  }

  // Verify user has admin role
  if (user.role !== "admin") {
    res.status(403)
    throw new Error("User does not have admin privileges")
  }

  const admin = await Admin.create({
    user: req.user._id,
    email,
    department,
    permissions,
    contactInfo,
  })

  if (admin) {
    res.status(201).json(admin)
  } else {
    res.status(400)
    throw new Error("Invalid admin data")
  }
})

// @desc    Get admin profile
// @route   GET /api/admins/profile
// @access  Private/Admin
const getAdminProfile = asyncHandler(async (req, res) => {
  const admin = await Admin.findOne({ user: req.user._id }).populate("user", "name email")

  if (admin) {
    res.json(admin)
  } else {
    res.status(404)
    throw new Error("Admin profile not found")
  }
})

// @desc    Update admin profile
// @route   PUT /api/admins/profile
// @access  Private/Admin
const updateAdminProfile = asyncHandler(async (req, res) => {
  const admin = await Admin.findOne({ user: req.user._id })

  if (admin) {
    admin.department = req.body.department || admin.department
    admin.permissions = req.body.permissions || admin.permissions
    admin.contactInfo = req.body.contactInfo || admin.contactInfo

    const updatedAdmin = await admin.save()
    res.json(updatedAdmin)
  } else {
    res.status(404)
    throw new Error("Admin profile not found")
  }
})

export { createAdmin, getAdminProfile, updateAdminProfile }
