import express from "express"
import {
  createPatient,
  getPatientProfile,
  updatePatientProfile,
  getPatients,
  getPatientById,
} from "../controllers/patient.controller.js"
import { protect, doctor } from "../middleware/auth.middleware.js"

const router = express.Router()

router.route("/").post(protect, createPatient).get(protect, doctor, getPatients)

router.route("/profile").get(protect, getPatientProfile).put(protect, updatePatientProfile)

router.route("/:id").get(protect, doctor, getPatientById)

export default router
