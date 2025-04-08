import Referral from "../models/referral.model.js"
import Doctor from "../models/doctor.model.js"
import Patient from "../models/patient.model.js"
import Hospital from "../models/hospital.model.js"
import { catchAsync } from "../utils/catchAsync.js"
import { AppError } from "../utils/appError.js"

// Create a new referral to hospital
export const createReferral = catchAsync(async (req, res, next) => {
  const {
    patient,
    referringDoctor,
    referredToHospital,
    specialtyRequired,
    reason,
    urgency,
    notes,
    medicalRecords,
    preferredAppointmentDate,
    insuranceInformation,
  } = req.body

  // Check if patient exists
  const patientExists = await Patient.findById(patient)
  if (!patientExists) {
    return next(new AppError("Patient not found", 404))
  }

  // Check if referring doctor exists
  const referringDoctorExists = await Doctor.findById(referringDoctor)
  if (!referringDoctorExists) {
    return next(new AppError("Referring doctor not found", 404))
  }

  // Check if hospital exists
  const hospitalExists = await Hospital.findById(referredToHospital)
  if (!hospitalExists) {
    return next(new AppError("Hospital not found", 404))
  }

  // Check if hospital has the required specialty
  if (specialtyRequired && !hospitalExists.specialties.includes(specialtyRequired)) {
    return next(new AppError("Hospital does not offer the required specialty", 400))
  }

  // Check if hospital is accepting new patients
  if (!hospitalExists.acceptingNewPatients) {
    return next(new AppError("Hospital is not accepting new patients at this time", 400))
  }

  // Set expiry date (e.g., 30 days from now)
  const expiryDate = new Date()
  expiryDate.setDate(expiryDate.getDate() + 30)

  // Create referral
  const referral = await Referral.create({
    patient,
    referringDoctor,
    referredToHospital,
    specialtyRequired,
    reason,
    urgency: urgency || "routine",
    notes,
    medicalRecords,
    expiryDate,
    preferredAppointmentDate: preferredAppointmentDate || undefined,
    insuranceInformation: insuranceInformation || undefined,
  })

  res.status(201).json({
    status: "success",
    data: {
      referral,
    },
  })
})

// Get all referrals
export const getAllReferrals = catchAsync(async (req, res, next) => {
  const { status, patient, referringDoctor, referredToHospital, specialtyRequired } = req.query

  // Build query
  const query = {}

  if (status) query.status = status
  if (patient) query.patient = patient
  if (referringDoctor) query.referringDoctor = referringDoctor
  if (referredToHospital) query.referredToHospital = referredToHospital
  if (specialtyRequired) query.specialtyRequired = specialtyRequired

  // Execute query with pagination
  const page = Number.parseInt(req.query.page, 10) || 1
  const limit = Number.parseInt(req.query.limit, 10) || 10
  const skip = (page - 1) * limit

  const referrals = await Referral.find(query)
    .populate({
      path: "patient",
      populate: {
        path: "user",
        select: "firstName lastName email",
      },
    })
    .populate({
      path: "referringDoctor",
      populate: {
        path: "user",
        select: "firstName lastName email",
      },
    })
    .populate("referredToHospital")
    .populate("appointmentId")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)

  const total = await Referral.countDocuments(query)

  res.status(200).json({
    status: "success",
    results: referrals.length,
    total,
    pages: Math.ceil(total / limit),
    currentPage: page,
    data: {
      referrals,
    },
  })
})

// Get referral by ID
export const getReferralById = catchAsync(async (req, res, next) => {
  const referral = await Referral.findById(req.params.id)
    .populate({
      path: "patient",
      populate: {
        path: "user",
        select: "firstName lastName email phoneNumber",
      },
    })
    .populate({
      path: "referringDoctor",
      populate: {
        path: "user",
        select: "firstName lastName email phoneNumber",
      },
    })
    .populate("referredToHospital")
    .populate("appointmentId")

  if (!referral) {
    return next(new AppError("Referral not found", 404))
  }

  res.status(200).json({
    status: "success",
    data: {
      referral,
    },
  })
})

// Update referral
export const updateReferral = catchAsync(async (req, res, next) => {
  const {
    specialtyRequired,
    reason,
    urgency,
    notes,
    medicalRecords,
    status,
    preferredAppointmentDate,
    insuranceInformation,
  } = req.body

  const referral = await Referral.findByIdAndUpdate(
    req.params.id,
    {
      specialtyRequired: specialtyRequired || undefined,
      reason: reason || undefined,
      urgency: urgency || undefined,
      notes: notes || undefined,
      medicalRecords: medicalRecords || undefined,
      status: status || undefined,
      preferredAppointmentDate: preferredAppointmentDate || undefined,
      insuranceInformation: insuranceInformation || undefined,
      updatedAt: Date.now(),
    },
    { new: true, runValidators: true },
  ).populate("patient referringDoctor referredToHospital appointmentId")

  if (!referral) {
    return next(new AppError("Referral not found", 404))
  }

  res.status(200).json({
    status: "success",
    data: {
      referral,
    },
  })
})

// Accept referral by hospital
export const acceptReferral = catchAsync(async (req, res, next) => {
  const { appointmentDate, notes } = req.body

  const referralDoc = await Referral.findById(req.params.id)

  if (!referralDoc) {
    return next(new AppError("Referral not found", 404))
  }

  const referral = await Referral.findByIdAndUpdate(
    req.params.id,
    {
      status: "accepted",
      notes: notes || referralDoc?.notes,
      updatedAt: Date.now(),
    },
    { new: true, runValidators: true },
  )

  if (!referral) {
    return next(new AppError("Referral not found", 404))
  }

  res.status(200).json({
    status: "success",
    data: {
      referral,
    },
  })
})

// Reject referral by hospital
export const rejectReferral = catchAsync(async (req, res, next) => {
  const { reason } = req.body

  const referralDoc = await Referral.findById(req.params.id)

  if (!referralDoc) {
    return next(new AppError("Referral not found", 404))
  }

  const referral = await Referral.findByIdAndUpdate(
    req.params.id,
    {
      status: "rejected",
      notes: reason || "No reason provided",
      updatedAt: Date.now(),
    },
    { new: true, runValidators: true },
  )

  if (!referral) {
    return next(new AppError("Referral not found", 404))
  }

  res.status(200).json({
    status: "success",
    data: {
      referral,
    },
  })
})

// Complete referral
export const completeReferral = catchAsync(async (req, res, next) => {
  const { treatmentSummary } = req.body

  const referralDoc = await Referral.findById(req.params.id)

  if (!referralDoc) {
    return next(new AppError("Referral not found", 404))
  }

  const referral = await Referral.findByIdAndUpdate(
    req.params.id,
    {
      status: "completed",
      notes: treatmentSummary || referralDoc?.notes,
      updatedAt: Date.now(),
    },
    { new: true, runValidators: true },
  )

  if (!referral) {
    return next(new AppError("Referral not found", 404))
  }

  res.status(200).json({
    status: "success",
    data: {
      referral,
    },
  })
})

// Get referrals by patient
export const getReferralsByPatient = catchAsync(async (req, res, next) => {
  const { patientId } = req.params

  const referrals = await Referral.find({ patient: patientId })
    .populate("referringDoctor")
    .populate("referredToHospital")
    .populate("appointmentId")
    .sort({ createdAt: -1 })

  res.status(200).json({
    status: "success",
    results: referrals.length,
    data: {
      referrals,
    },
  })
})

// Get referrals by hospital
export const getReferralsByHospital = catchAsync(async (req, res, next) => {
  const { hospitalId } = req.params

  const referrals = await Referral.find({ referredToHospital: hospitalId })
    .populate({
      path: "patient",
      populate: {
        path: "user",
        select: "firstName lastName email",
      },
    })
    .populate({
      path: "referringDoctor",
      populate: {
        path: "user",
        select: "firstName lastName",
      },
    })
    .sort({ createdAt: -1 })

  res.status(200).json({
    status: "success",
    results: referrals.length,
    data: {
      referrals,
    },
  })
})

// Verify insurance for referral
export const verifyInsurance = catchAsync(async (req, res, next) => {
  const { verificationStatus, notes } = req.body

  if (!["verified", "denied", "pending"].includes(verificationStatus)) {
    return next(new AppError("Invalid verification status", 400))
  }

  const referral = await Referral.findById(req.params.id)

  if (!referral) {
    return next(new AppError("Referral not found", 404))
  }

  // Update insurance verification status
  referral.insuranceInformation.verificationStatus = verificationStatus
  if (notes) {
    referral.notes = referral.notes
      ? `${referral.notes}\n\nInsurance verification: ${notes}`
      : `Insurance verification: ${notes}`
  }

  await referral.save()

  res.status(200).json({
    status: "success",
    data: {
      referral,
    },
  })
})
