import jwt from "jsonwebtoken"
import asyncHandler from "express-async-handler"
import User from "../models/user.model.js"
import Doctor from "../models/doctor.model.js"
import Patient from "../models/patient.model.js"

const protect = asyncHandler(async (req, res, next) => {
  let token

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1]

      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      req.user = await User.findById(decoded.id).select("-password")

      next()
    } catch (error) {
      console.error(error)
      res.status(401)
      throw new Error("Not authorized, token failed")
    }
  }

  if (!token) {
    res.status(401)
    throw new Error("Not authorized, no token")
  }
})

// Admin middleware
const admin = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next()
  } else {
    res.status(401)
    throw new Error("Not authorized as an admin")
  }
})

// Doctor middleware
const doctor = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.role === "doctor") {
    // Optionally fetch doctor details
    const doctorDetails = await Doctor.findOne({ user: req.user._id })
    if (!doctorDetails) {
      res.status(404)
      throw new Error("Doctor profile not found")
    }
    req.doctor = doctorDetails
    next()
  } else {
    res.status(401)
    throw new Error("Not authorized as a doctor")
  }
})

// Patient middleware
const patient = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.role === "patient") {
    // Optionally fetch patient details
    const patientDetails = await Patient.findOne({ user: req.user._id })
    if (!patientDetails) {
      res.status(404)
      throw new Error("Patient profile not found")
    }
    req.patient = patientDetails
    next()
  } else {
    res.status(401)
    throw new Error("Not authorized as a patient")
  }
})

export { protect, admin, doctor, patient }
