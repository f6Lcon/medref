import express from "express"
import {
  register,
  login,
  getCurrentUser,
  updatePassword,
  forgotPassword,
  resetPassword,
} from "../controller/auth.controller.js"
import { authMiddleware } from "../middleware/auth.middleware.js"

const router = express.Router()

// Public routes
router.post("/register", register)
router.post("/login", login)
router.post("/forgot-password", forgotPassword)
router.patch("/reset-password/:token", resetPassword)

// Protected routes
router.use(authMiddleware)
router.get("/me", getCurrentUser)
router.patch("/update-password", updatePassword)

export default router
