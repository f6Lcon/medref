import express from "express"
import {
  createHospital,
  getHospitals,
  getHospitalById,
  updateHospital,
  deleteHospital,
  searchHospitals,
} from "../controllers/hospital.controller.js"
import { protect, admin } from "../middleware/auth.middleware.js"

const router = express.Router()

router.route("/").post(protect, admin, createHospital).get(getHospitals)

router.get("/search", searchHospitals)

router.route("/:id").get(getHospitalById).put(protect, admin, updateHospital).delete(protect, admin, deleteHospital)

export default router
