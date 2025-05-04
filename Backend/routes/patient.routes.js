import express from "express"
import {
  getPatients,
  getPatientById,
  createPatient,
  updatePatientProfile,
  searchPatients,
  getPatientProfile, // Added getPatientProfile import
} from "../controllers/patient.controller.js"
import { protect, doctor } from "../middleware/auth.middleware.js"

const router = express.Router()

router.route("/").post(protect, createPatient).get(protect, doctor, getPatients)

router.route("/profile").get(protect, getPatientProfile).put(protect, updatePatientProfile)

router.route("/:id").get(protect, doctor, getPatientById)

// Search patients
router.route("/search").get(protect, searchPatients)

export default router
