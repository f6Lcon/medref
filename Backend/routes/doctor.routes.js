import express from "express"
import {
  createDoctor,
  getDoctorProfile,
  updateDoctorProfile,
  getDoctors,
  getDoctorById,
  getDoctorsBySpecialization,
  getDoctorsByHospital,
} from "../controllers/doctor.controller.js"
import { protect } from "../middleware/auth.middleware.js"

const router = express.Router()

router.route("/").post(protect, createDoctor).get(getDoctors)

router.route("/profile").get(protect, getDoctorProfile).put(protect, updateDoctorProfile)

router.route("/specialization/:specialization").get(getDoctorsBySpecialization)

router.route("/hospital/:hospitalId").get(getDoctorsByHospital)

router.route("/:id").get(getDoctorById)

export default router
