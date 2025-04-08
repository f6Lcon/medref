import express from "express"
import {
  createAppointment,
  getAllAppointments,
  getAppointmentById,
  updateAppointment,
  cancelAppointment,
  completeAppointment,
} from "../controller/appointment.controller.js"
import { authMiddleware } from "../middleware/auth.middleware.js"
import { restrictTo } from "../middleware/role.middleware.js"

const router = express.Router()

// Protect all routes
router.use(authMiddleware)

// Routes accessible by all authenticated users
router.get("/", getAllAppointments)
router.get("/:id", getAppointmentById)

// Routes with role restrictions
router.post("/", restrictTo("doctor", "admin"), createAppointment)
router.patch("/:id", restrictTo("doctor", "admin"), updateAppointment)
router.patch("/:id/cancel", cancelAppointment)
router.patch("/:id/complete", restrictTo("doctor", "admin"), completeAppointment)

export default router
