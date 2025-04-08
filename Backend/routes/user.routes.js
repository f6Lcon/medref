import express from "express"
import { authMiddleware } from "../middleware/auth.middleware.js"
import { restrictTo } from "../middleware/role.middleware.js"

const router = express.Router()

// Protect all routes
router.use(authMiddleware)

// Routes for users
// Note: These are placeholder routes - you'll need to implement the controller functions
router.get("/", restrictTo("admin"), (req, res) => {
  res.status(200).json({
    status: "success",
    message: "User routes are set up correctly",
  })
})

router.get("/:id", (req, res) => {
  res.status(200).json({
    status: "success",
    message: `Get user with ID: ${req.params.id}`,
  })
})

router.patch("/:id", (req, res) => {
  res.status(200).json({
    status: "success",
    message: `Update user with ID: ${req.params.id}`,
    data: req.body,
  })
})

router.delete("/:id", restrictTo("admin"), (req, res) => {
  res.status(200).json({
    status: "success",
    message: `Delete user with ID: ${req.params.id}`,
  })
})

export default router
