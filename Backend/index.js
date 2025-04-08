import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"
import morgan from "morgan"

// Route imports
import authRoutes from "./routes/auth.routes.js"
import userRoutes from "./routes/user.routes.js"
import doctorRoutes from "./routes/doctor.routes.js"
import patientRoutes from "./routes/patient.routes.js"
import appointmentRoutes from "./routes/appointment.routes.js"
import referralRoutes from "./routes/referral.routes.js"
import hospitalRoutes from "./routes/hospital.routes.js"

// Middleware imports
import { errorHandler } from "./middleware/error.middleware.js"
import { authMiddleware } from "./middleware/auth.middleware.js"

// Load environment variables
dotenv.config()

// Initialize express app
const app = express()
const PORT = process.env.PORT || 5000

// ✅ CORS configuration to allow frontend requests
app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true                // allow cookies/headers if using auth
}))

// Middleware
app.use(express.json())
app.use(morgan("dev"))

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/users", authMiddleware, userRoutes)
app.use("/api/doctors", authMiddleware, doctorRoutes)
app.use("/api/patients", authMiddleware, patientRoutes)
app.use("/api/appointments", authMiddleware, appointmentRoutes)
app.use("/api/referrals", authMiddleware, referralRoutes)
app.use("/api/hospitals", authMiddleware, hospitalRoutes)

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" })
})

// Error handling middleware
app.use(errorHandler)

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

export default app
