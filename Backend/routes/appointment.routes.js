import express from "express"
import {
  createAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  cancelAppointment,
} from "../controllers/appointment.controller.js"
import { protect, doctor } from "../middleware/auth.middleware.js"

const router = express.Router()

router.route("/").post(protect, createAppointment)

router.get("/patient", protect, getPatientAppointments)
router.get("/doctor", protect, doctor, getDoctorAppointments)

router.route("/:id").get(protect, getAppointmentById)

router.route("/:id/status").put(protect, doctor, updateAppointmentStatus)

router.route("/:id/cancel").put(protect, cancelAppointment)

export default router
