import asyncHandler from "express-async-handler"
import MedicalRecord from "../models/medicalRecord.model.js"
import Patient from "../models/patient.model.js"
import Doctor from "../models/doctor.model.js"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

// Get the directory name
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// @desc    Upload a medical record
// @route   POST /api/medical-records/upload
// @access  Private
const uploadMedicalRecord = asyncHandler(async (req, res) => {
  const { title, description, patientId, tags } = req.body

  console.log("Uploading medical record:", { title, patientId })

  // Check if patient exists
  const patient = await Patient.findById(patientId)
  if (!patient) {
    res.status(404)
    throw new Error("Patient not found")
  }

  // Check if the user is authorized to upload records for this patient
  const isDoctor = await Doctor.findOne({ user: req.user._id })
  const isPatientUser = patient.user.toString() === req.user._id.toString()
  const isAdmin = req.user.role === "admin"

  if (!isPatientUser && !isDoctor && !isAdmin) {
    res.status(401)
    throw new Error("Not authorized to upload records for this patient")
  }

  // Handle file upload
  let fileUrl = null
  let fileType = null
  let fileSize = null

  if (req.file) {
    fileUrl = `/uploads/${req.file.filename}`
    fileType = req.file.mimetype
    fileSize = req.file.size
  }

  // Create the medical record
  const medicalRecord = await MedicalRecord.create({
    patient: patientId,
    title,
    description,
    fileUrl,
    fileType,
    fileSize,
    uploadedBy: req.user._id,
    tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
  })

  if (medicalRecord) {
    res.status(201).json(medicalRecord)
  } else {
    res.status(400)
    throw new Error("Invalid medical record data")
  }
})

// @desc    Get all medical records for a patient
// @route   GET /api/medical-records/patient/:patientId
// @access  Private
const getPatientMedicalRecords = asyncHandler(async (req, res) => {
  const { patientId } = req.params

  console.log(`Fetching medical records for patient: ${patientId}`)

  // Check if patient exists
  const patient = await Patient.findById(patientId)
  if (!patient) {
    res.status(404)
    throw new Error("Patient not found")
  }

  // Check if the user is authorized to view records for this patient
  const isDoctor = await Doctor.findOne({ user: req.user._id })
  const isPatientUser = patient.user.toString() === req.user._id.toString()
  const isAdmin = req.user.role === "admin"

  if (!isPatientUser && !isDoctor && !isAdmin) {
    res.status(401)
    throw new Error("Not authorized to view records for this patient")
  }

  // Get all medical records for the patient
  const medicalRecords = await MedicalRecord.find({ patient: patientId })
    .populate("uploadedBy", "name email")
    .sort({ uploadDate: -1 })

  res.json(medicalRecords)
})

// @desc    Get medical record by ID
// @route   GET /api/medical-records/:id
// @access  Private
const getMedicalRecordById = asyncHandler(async (req, res) => {
  const medicalRecord = await MedicalRecord.findById(req.params.id)
    .populate("patient", "user")
    .populate("uploadedBy", "name email")

  if (medicalRecord) {
    // Check if the user is authorized to view this record
    const patient = await Patient.findById(medicalRecord.patient._id)
    const isDoctor = await Doctor.findOne({ user: req.user._id })
    const isPatientUser = patient.user.toString() === req.user._id.toString()
    const isAdmin = req.user.role === "admin"

    if (isPatientUser || isDoctor || isAdmin) {
      res.json(medicalRecord)
    } else {
      res.status(401)
      throw new Error("Not authorized to view this medical record")
    }
  } else {
    res.status(404)
    throw new Error("Medical record not found")
  }
})

// @desc    Delete medical record
// @route   DELETE /api/medical-records/:id
// @access  Private
const deleteMedicalRecord = asyncHandler(async (req, res) => {
  const medicalRecord = await MedicalRecord.findById(req.params.id).populate("patient", "user")

  if (medicalRecord) {
    // Check if the user is authorized to delete this record
    const isPatientUser = medicalRecord.patient.user.toString() === req.user._id.toString()
    const isUploader = medicalRecord.uploadedBy && medicalRecord.uploadedBy.toString() === req.user._id.toString()
    const isAdmin = req.user.role === "admin"

    if (isPatientUser || isUploader || isAdmin) {
      // Delete the file if it exists
      if (medicalRecord.fileUrl) {
        const filePath = path.join(__dirname, "..", medicalRecord.fileUrl)
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
        }
      }

      await medicalRecord.deleteOne()
      res.json({ message: "Medical record removed" })
    } else {
      res.status(401)
      throw new Error("Not authorized to delete this medical record")
    }
  } else {
    res.status(404)
    throw new Error("Medical record not found")
  }
})

// @desc    Download medical record file
// @route   GET /api/medical-records/download/:id
// @access  Private
const downloadMedicalRecord = asyncHandler(async (req, res) => {
  const medicalRecord = await MedicalRecord.findById(req.params.id).populate("patient", "user")

  if (medicalRecord) {
    // Check if the user is authorized to download this record
    const patient = await Patient.findById(medicalRecord.patient._id)
    const isDoctor = await Doctor.findOne({ user: req.user._id })
    const isPatientUser = patient.user.toString() === req.user._id.toString()
    const isAdmin = req.user.role === "admin"

    if (isPatientUser || isDoctor || isAdmin) {
      if (medicalRecord.fileUrl) {
        const filePath = path.join(__dirname, "..", medicalRecord.fileUrl)
        if (fs.existsSync(filePath)) {
          res.download(filePath)
        } else {
          res.status(404)
          throw new Error("File not found")
        }
      } else {
        res.status(404)
        throw new Error("No file associated with this record")
      }
    } else {
      res.status(401)
      throw new Error("Not authorized to download this medical record")
    }
  } else {
    res.status(404)
    throw new Error("Medical record not found")
  }
})

export {
  uploadMedicalRecord,
  getPatientMedicalRecords,
  getMedicalRecordById,
  deleteMedicalRecord,
  downloadMedicalRecord,
}
