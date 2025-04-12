import express from "express"
import multer from "multer"
import path from "path"
import { v4 as uuidv4 } from "uuid"
import {
  uploadMedicalRecord,
  getPatientMedicalRecords,
  getMedicalRecordById,
  downloadMedicalRecord,
  deleteMedicalRecord,
} from "../controllers/medicalRecord.controller.js"
import { protect } from "../middleware/auth.middleware.js"

const router = express.Router()

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/")
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = uuidv4()
    cb(null, uniqueSuffix + path.extname(file.originalname))
  },
})

// File filter
const fileFilter = (req, file, cb) => {
  // Accept images, PDFs, and common document formats
  if (
    file.mimetype.startsWith("image/") ||
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
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: fileFilter,
})

// Routes
router.post("/upload", protect, upload.single("file"), uploadMedicalRecord)
router.get("/patient/:patientId", protect, getPatientMedicalRecords)
router.get("/:id", protect, getMedicalRecordById)
router.get("/download/:id", protect, downloadMedicalRecord)
router.delete("/:id", protect, deleteMedicalRecord)

export default router
