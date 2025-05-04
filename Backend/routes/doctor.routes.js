import express from "express"
import {
  createDoctor,
  getDoctorProfile,
  updateDoctorProfile,
  getDoctors,
  getDoctorById,
  getDoctorsBySpecialization,
  getDoctorsByHospital,
  searchDoctors,
} from "../controllers/doctor.controller.js"
import { protect } from "../middleware/auth.middleware.js"

const router = express.Router()

// Search doctors - moved to the top to avoid route conflicts
router.get("/search", searchDoctors)

router.route("/").post(protect, createDoctor).get(getDoctors)

router.route("/profile").get(protect, getDoctorProfile).put(protect, updateDoctorProfile)

router.route("/specialization/:specialization").get(getDoctorsBySpecialization)

router.route("/hospital/:hospitalId").get(getDoctorsByHospital)

router.route("/:id").get(getDoctorById)

export default router
