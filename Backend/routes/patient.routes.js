import express from "express"
import { authMiddleware } from "../middleware/auth.middleware.js"
import { restrictTo } from "../middleware/role.middleware.js"

const router = express.Router()

// Protect all routes
router.use(authMiddleware)

// Routes for patients
// Note: These are placeholder routes - you'll need to implement the controller functions
router.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Patient routes are set up correctly",
  })
})

router.get("/:id", (req, res) => {
  res.status(200).json({
    status: "success",
    message: `Get patient with ID: ${req.params.id}`,
  })
})

router.post("/", restrictTo("admin"), (req, res) => {
  res.status(201).json({
    status: "success",
    message: "Create patient route is working",
    data: req.body,
  })
})

router.patch("/:id", restrictTo("admin", "patient"), (req, res) => {
  res.status(200).json({
    status: "success",
    message: `Update patient with ID: ${req.params.id}`,
    data: req.body,
  })
})

router.delete("/:id", restrictTo("admin"), (req, res) => {
  res.status(200).json({
    status: "success",
    message: `Delete patient with ID: ${req.params.id}`,
  })
})

export default router
