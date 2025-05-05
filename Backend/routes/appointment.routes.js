import express from "express"
import {
  createAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  getAllAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  cancelAppointment,
  createAppointmentFromReferral,
  completeAppointment,
} from "../controllers/appointment.controller.js"
import { protect, doctor, admin } from "../middleware/auth.middleware.js"

const router = express.Router()

// Create a new appointment
router.route("/").post(protect, createAppointment)

// Create a new appointment from a referral
router.route("/from-referral").post(protect, doctor, createAppointmentFromReferral)

// Get appointments for the current user
router.get("/patient", protect, getPatientAppointments)
router.get("/doctor", protect, doctor, getDoctorAppointments)
router.get("/all", protect, admin, getAllAppointments)

// Get, update, or cancel a specific appointment
router.route("/:id").get(protect, getAppointmentById)
router.route("/:id/status").put(protect, doctor, updateAppointmentStatus)
router.route("/:id/cancel").put(protect, cancelAppointment)
router.route("/:id/complete").put(protect, doctor, completeAppointment)

export default router
