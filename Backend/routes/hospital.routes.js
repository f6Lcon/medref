import express from "express"
import {
  createHospital,
  getAllHospitals,
  getHospitalById,
  updateHospital,
  deleteHospital,
  searchHospitalsBySpecialty,
  searchHospitalsByLocation,
  rateHospital,
} from "../controller/hospital.controller.js"
import { authMiddleware } from "../middleware/auth.middleware.js"
import { restrictTo } from "../middleware/role.middleware.js"

const router = express.Router()

// Protect all routes
router.use(authMiddleware)

// Public routes (still require authentication)
router.get("/", getAllHospitals)
router.get("/:id", getHospitalById)
router.get("/specialty/:specialty", searchHospitalsBySpecialty)
router.get("/location/:city/:state", searchHospitalsByLocation)

// Routes with role restrictions
router.post("/", restrictTo("admin"), createHospital)
router.patch("/:id", restrictTo("admin"), updateHospital)
router.delete("/:id", restrictTo("admin"), deleteHospital)
router.post("/:id/rate", restrictTo("patient", "doctor"), rateHospital)

export default router
