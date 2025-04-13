import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import connectDB from "./config/db.js"
import authRoutes from "./routes/auth.routes.js"
import patientRoutes from "./routes/patient.routes.js"
import doctorRoutes from "./routes/doctor.routes.js"
import hospitalRoutes from "./routes/hospital.routes.js"
import appointmentRoutes from "./routes/appointment.routes.js"
import referralRoutes from "./routes/referral.routes.js"
import adminRoutes from "./routes/admin.routes.js"
import medicalRecordRoutes from "./routes/medicalRecord.routes.js"
import { notFound, errorHandler } from "./middleware/error.middleware.js"
import path from "path"
import { fileURLToPath } from "url"

dotenv.config()

// Connect to database
connectDB()

const app = express()

// CORS setup
const allowedOrigins = [
  "http://localhost:5173",
  "https://medref-fy.vercel.app"
]

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error("Not allowed by CORS"))
    }
  },
  credentials: true
}))

// Body parser
app.use(express.json())

// Get directory path
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/patients", patientRoutes)
app.use("/api/doctors", doctorRoutes)
app.use("/api/hospitals", hospitalRoutes)
app.use("/api/appointments", appointmentRoutes)
app.use("/api/referrals", referralRoutes)
app.use("/api/admins", adminRoutes)
app.use("/api/medical-records", medicalRecordRoutes)

// Error handlers
app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
