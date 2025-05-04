import express from "express"
import { getUsers, deleteUser, getUserById, updateUser, searchUsers } from "../controllers/user.controller.js"
import { protect, admin } from "../middleware/auth.middleware.js"

const router = express.Router()

router.route("/").get(protect, admin, getUsers)
router.route("/search").get(protect, searchUsers)
router.route("/:id").delete(protect, admin, deleteUser).get(protect, admin, getUserById).put(protect, admin, updateUser)

export default router
