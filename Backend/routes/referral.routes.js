import express from "express"
import {
  createReferral,
  getPatientReferrals,
  getReferringDoctorReferrals,
  getReferredDoctorReferrals,
  getAllReferrals,
  getReferralById,
  updateReferralStatus,
  createAppointmentFromReferral,
} from "../controllers/referral.controller.js"
import { protect, doctor, admin } from "../middleware/auth.middleware.js"

const router = express.Router()

router.route("/").post(protect, doctor, createReferral)

router.get("/patient", protect, getPatientReferrals)
router.get("/referring", protect, doctor, getReferringDoctorReferrals)
router.get("/referred", protect, doctor, getReferredDoctorReferrals)
router.get("/all", protect, admin, getAllReferrals)

router.route("/:id").get(protect, getReferralById)

router.route("/:id/status").put(protect, doctor, updateReferralStatus)

router.route("/:id/appointment").post(protect, doctor, createAppointmentFromReferral)

export default router
