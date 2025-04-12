import express from "express"
import {
  loginUser,
  registerUser,
  verifyEmail,
  resendOTP,
  getUserProfile,
  updateUserProfile,
} from "../controllers/auth.controller.js"
import { protect } from "../middleware/auth.middleware.js"

const router = express.Router()

router.post("/login", loginUser)
router.post("/register", registerUser)
router.post("/verify", verifyEmail)
router.post("/resend-otp", resendOTP)
router.route("/profile").get(protect, getUserProfile).put(protect, updateUserProfile)

export default router
