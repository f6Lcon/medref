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

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "../uploads")
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// @desc    Upload a medical record
// @route   POST /api/medical-records/upload
// @access  Private
const uploadMedicalRecord = asyncHandler(async (req, res) => {
  const { title, description, patientId, tags } = req.body
  const file = req.file

  if (!file) {
    res.status(400)
    throw new Error("Please upload a file")
  }

  // Check if patient exists
  const patient = await Patient.findById(patientId)
  if (!patient) {
    res.status(404)
    throw new Error("Patient not found")
  }

  // Check if user is authorized to upload for this patient
  const isDoctor = await Doctor.findOne({ user: req.user._id })
  const isPatientUser = patient.user.toString() === req.user._id.toString()

  if (!isDoctor && !isPatientUser && req.user.role !== "admin") {
    res.status(401)
    throw new Error("Not authorized to upload medical records for this patient")
  }

  // Create the medical record
  const medicalRecord = await MedicalRecord.create({
    patient: patientId,
    title,
    description,
    fileUrl: `/uploads/${file.filename}`,
    fileType: file.mimetype,
    fileSize: file.size,
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
  const patientId = req.params.patientId

  // Check if patient exists
  const patient = await Patient.findById(patientId)
  if (!patient) {
    res.status(404)
    throw new Error("Patient not found")
  }

  // Check if user is authorized to view this patient's records
  const isDoctor = await Doctor.findOne({ user: req.user._id })
  const isPatientUser = patient.user.toString() === req.user._id.toString()

  if (!isDoctor && !isPatientUser && req.user.role !== "admin") {
    res.status(401)
    throw new Error("Not authorized to view medical records for this patient")
  }

  const medicalRecords = await MedicalRecord.find({ patient: patientId })
    .populate("uploadedBy", "name email")
    .sort({ uploadDate: -1 })

  res.json(medicalRecords)
})

// @desc    Get a medical record by ID
// @route   GET /api/medical-records/:id
// @access  Private
const getMedicalRecordById = asyncHandler(async (req, res) => {
  const medicalRecord = await MedicalRecord.findById(req.params.id).populate("uploadedBy", "name email")

  if (medicalRecord) {
    // Check if user is authorized to view this record
    const patient = await Patient.findById(medicalRecord.patient)
    const isDoctor = await Doctor.findOne({ user: req.user._id })
    const isPatientUser = patient.user.toString() === req.user._id.toString()

    if (!isDoctor && !isPatientUser && req.user.role !== "admin") {
      res.status(401)
      throw new Error("Not authorized to view this medical record")
    }

    res.json(medicalRecord)
  } else {
    res.status(404)
    throw new Error("Medical record not found")
  }
})

// @desc    Download a medical record
// @route   GET /api/medical-records/download/:id
// @access  Private
const downloadMedicalRecord = asyncHandler(async (req, res) => {
  const medicalRecord = await MedicalRecord.findById(req.params.id)

  if (medicalRecord) {
    // Check if user is authorized to download this record
    const patient = await Patient.findById(medicalRecord.patient)
    const isDoctor = await Doctor.findOne({ user: req.user._id })
    const isPatientUser = patient.user.toString() === req.user._id.toString()

    if (!isDoctor && !isPatientUser && req.user.role !== "admin") {
      res.status(401)
      throw new Error("Not authorized to download this medical record")
    }

    const filePath = path.join(__dirname, "..", medicalRecord.fileUrl)

    // Check if file exists
    if (fs.existsSync(filePath)) {
      res.download(filePath)
    } else {
      res.status(404)
      throw new Error("File not found")
    }
  } else {
    res.status(404)
    throw new Error("Medical record not found")
  }
})

// @desc    Delete a medical record
// @route   DELETE /api/medical-records/:id
// @access  Private
const deleteMedicalRecord = asyncHandler(async (req, res) => {
  const medicalRecord = await MedicalRecord.findById(req.params.id)

  if (medicalRecord) {
    // Check if user is authorized to delete this record
    const patient = await Patient.findById(medicalRecord.patient)
    const isPatientUser = patient.user.toString() === req.user._id.toString()
    const isUploader = medicalRecord.uploadedBy.toString() === req.user._id.toString()

    if (!isPatientUser && !isUploader && req.user.role !== "admin") {
      res.status(401)
      throw new Error("Not authorized to delete this medical record")
    }

    // Delete the file
    const filePath = path.join(__dirname, "..", medicalRecord.fileUrl)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }

    // Delete the record
    await medicalRecord.deleteOne()
    res.json({ message: "Medical record removed" })
  } else {
    res.status(404)
    throw new Error("Medical record not found")
  }
})

export {
  uploadMedicalRecord,
  getPatientMedicalRecords,
  getMedicalRecordById,
  downloadMedicalRecord,
  deleteMedicalRecord,
}
