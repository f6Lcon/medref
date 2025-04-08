import express from "express"
import { authMiddleware } from "../middleware/auth.middleware.js"
import { restrictTo } from "../middleware/role.middleware.js"

const router = express.Router()

// Protect all routes
router.use(authMiddleware)

// Routes for doctors
// Note: These are placeholder routes - you'll need to implement the controller functions
router.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Doctor routes are set up correctly",
  })
})

router.get("/:id", (req, res) => {
  res.status(200).json({
    status: "success",
    message: `Get doctor with ID: ${req.params.id}`,
  })
})

router.post("/", restrictTo("admin"), (req, res) => {
  res.status(201).json({
    status: "success",
    message: "Create doctor route is working",
    data: req.body,
  })
})

router.patch("/:id", restrictTo("admin", "doctor"), (req, res) => {
  res.status(200).json({
    status: "success",
    message: `Update doctor with ID: ${req.params.id}`,
    data: req.body,
  })
})

router.delete("/:id", restrictTo("admin"), (req, res) => {
  res.status(200).json({
    status: "success",
    message: `Delete doctor with ID: ${req.params.id}`,
  })
})

export default router
