import express from "express"
import multer from "multer"
import path from "path"
import { fileURLToPath } from "url"
import {
  uploadMedicalRecord,
  getPatientMedicalRecords,
  getMedicalRecordById,
  deleteMedicalRecord,
  downloadMedicalRecord,
} from "../controllers/medicalRecord.controller.js"
import { protect } from "../middleware/auth.middleware.js"

// Get the directory name
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads/"))
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`)
  },
})

// File filter
const fileFilter = (req, file, cb) => {
  // Accept images, PDFs, and common document formats
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "application/pdf" ||
    file.mimetype === "application/msword" ||
    file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    cb(null, true)
  } else {
    cb(new Error("Unsupported file format"), false)
  }
}

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter: fileFilter,
})

const router = express.Router()

// Create uploads directory if it doesn't exist
import fs from "fs"
const uploadsDir = path.join(__dirname, "../uploads")
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

router.post("/upload", protect, upload.single("file"), uploadMedicalRecord)
router.get("/patient/:patientId", protect, getPatientMedicalRecords)
router.get("/download/:id", protect, downloadMedicalRecord)
router.route("/:id").get(protect, getMedicalRecordById).delete(protect, deleteMedicalRecord)

export default router
