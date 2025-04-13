import jwt from "jsonwebtoken"
import asyncHandler from "express-async-handler"
import User from "../models/user.model.js"

// Protect routes
const protect = asyncHandler(async (req, res, next) => {
  let token

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1]

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      // Get user from the token
      req.user = await User.findById(decoded.id).select("-password")

      if (!req.user) {
        res.status(404)
        throw new Error("User not found")
      }

      next()
    } catch (error) {
      console.error("Auth middleware error:", error)

      if (error.name === "JsonWebTokenError") {
        res.status(401)
        throw new Error("Invalid token")
      } else if (error.name === "TokenExpiredError") {
        res.status(401)
        throw new Error("Token expired")
      } else {
        res.status(401)
        throw new Error("Not authorized, token failed")
      }
    }
  } else if (!token) {
    res.status(401)
    throw new Error("Not authorized, no token")
  }
})

// Admin middleware
const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next()
  } else {
    res.status(401)
    throw new Error("Not authorized as an admin")
  }
}

// Doctor middleware
const doctor = (req, res, next) => {
  if (req.user && (req.user.role === "doctor" || req.user.role === "admin")) {
    next()
  } else {
    res.status(401)
    throw new Error("Not authorized as a doctor")
  }
}

// Patient middleware
const patient = (req, res, next) => {
  if (req.user && req.user.role === "patient") {
    next()
  } else {
    res.status(401)
    throw new Error("Not authorized as a patient")
  }
}

export { protect, admin, doctor, patient }
