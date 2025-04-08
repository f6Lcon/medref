import express from "express"
import {
  createReferral,
  getAllReferrals,
  getReferralById,
  updateReferral,
  acceptReferral,
  rejectReferral,
  completeReferral,
  getReferralsByPatient,
  getReferralsByHospital,
  verifyInsurance,
} from "../controller/referral.controller.js"
import { authMiddleware } from "../middleware/auth.middleware.js"
import { restrictTo } from "../middleware/role.middleware.js"

const router = express.Router()

// Protect all routes
router.use(authMiddleware)

// Routes accessible by all authenticated users
router.get("/", getAllReferrals)
router.get("/:id", getReferralById)
router.get("/patient/:patientId", getReferralsByPatient)
router.get("/hospital/:hospitalId", getReferralsByHospital)

// Routes with role restrictions
router.post("/", restrictTo("doctor", "admin"), createReferral)
router.patch("/:id", restrictTo("doctor", "admin"), updateReferral)
router.patch("/:id/accept", restrictTo("admin"), acceptReferral)
router.patch("/:id/reject", restrictTo("admin"), rejectReferral)
router.patch("/:id/complete", restrictTo("admin", "doctor"), completeReferral)
router.patch("/:id/verify-insurance", restrictTo("admin"), verifyInsurance)

export default router
