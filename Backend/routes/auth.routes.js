import express from "express"
import {
  loginUser,
  registerUser,
  verifyEmail,
  resendOTP,
  getUserProfile,
  updateUserProfile,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/auth.controller.js"
import { protect, admin } from "../middleware/auth.middleware.js"

const router = express.Router()

router.post("/login", loginUser)
router.post("/register", registerUser)
router.post("/verify", verifyEmail)
router.post("/resend-otp", resendOTP)
router.route("/profile").get(protect, getUserProfile).put(protect, updateUserProfile)

// Add these new routes after the existing routes

// Admin routes for user management
router.route("/users").get(protect, admin, getUsers)

router
  .route("/users/:id")
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUser)
  .delete(protect, admin, deleteUser)

export default router
