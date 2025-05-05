import express from "express"
import {
  getHospitals,
  getHospitalById,
  createHospital,
  updateHospital,
  deleteHospital,
  getNearbyHospitals,
} from "../controllers/hospital.controller.js"
import { protect, admin } from "../middleware/auth.middleware.js"

const router = express.Router()

// Route for nearby hospitals must come before /:id route to avoid conflict
router.get("/near", getNearbyHospitals)

router.route("/").get(getHospitals).post(protect, admin, createHospital)

router.route("/:id").get(getHospitalById).put(protect, admin, updateHospital).delete(protect, admin, deleteHospital)

export default router
