import express from "express"
import { createAdmin, getAdminProfile, updateAdminProfile } from "../controllers/admin.controller.js"
import { protect, admin } from "../middleware/auth.middleware.js"

const router = express.Router()

router.route("/").post(protect, createAdmin)
router.route("/profile").get(protect, admin, getAdminProfile).put(protect, admin, updateAdminProfile)

export default router
