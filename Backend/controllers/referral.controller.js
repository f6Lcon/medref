import asyncHandler from "express-async-handler"
import Referral from "../models/referral.model.js"
import Doctor from "../models/doctor.model.js"
import Patient from "../models/patient.model.js"
import Hospital from "../models/hospital.model.js"
import Appointment from "../models/appointment.model.js"

// @desc    Create a new referral
// @route   POST /api/referrals
// @access  Private/Doctor
const createReferral = asyncHandler(async (req, res) => {
  const { patient, referredToDoctor, referredToHospital, reason, notes, urgency, medicalRecords } = req.body

  console.log("Creating referral with data:", req.body)

  // Get referring doctor ID from user
  const referringDoctor = await Doctor.findOne({ user: req.user._id })

  if (!referringDoctor) {
    res.status(404)
    throw new Error("Doctor profile not found")
  }

  // Check if patient exists
  const patientExists = await Patient.findById(patient)
  if (!patientExists) {
    res.status(404)
    throw new Error("Patient not found")
  }

  // Check if referred hospital exists
  const hospitalExists = await Hospital.findById(referredToHospital)
  if (!hospitalExists) {
    res.status(404)
    throw new Error("Referred hospital not found")
  }

  // Check if referred doctor exists (if provided)
  if (referredToDoctor) {
    const referredDoctor = await Doctor.findById(referredToDoctor)
    if (!referredDoctor) {
      res.status(404)
      throw new Error("Referred doctor not found")
    }
  }

  const referral = await Referral.create({
    patient,
    referringDoctor: referringDoctor._id,
    referredToDoctor,
    referredToHospital,
    reason,
    notes,
    urgency,
    medicalRecords,
  })

  if (referral) {
    // Populate the referral data before sending the response
    const populatedReferral = await Referral.findById(referral._id)
      .populate({
        path: "patient",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .populate({
        path: "referringDoctor",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .populate({
        path: "referredToDoctor",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .populate("referredToHospital")

    console.log("Referral created successfully:", populatedReferral)
    res.status(201).json(populatedReferral)
  } else {
    res.status(400)
    throw new Error("Invalid referral data")
  }
})

// @desc    Get all referrals for a patient
// @route   GET /api/referrals/patient
// @access  Private
const getPatientReferrals = asyncHandler(async (req, res) => {
  // Get patient ID from user
  const patient = await Patient.findOne({ user: req.user._id })

  if (!patient) {
    res.status(404)
    throw new Error("Patient profile not found")
  }

  console.log(`Fetching referrals for patient: ${patient._id}`)

  const referrals = await Referral.find({ patient: patient._id })
    .populate({
      path: "referringDoctor",
      populate: {
        path: "user",
        select: "name email",
      },
    })
    .populate({
      path: "referredToDoctor",
      populate: {
        path: "user",
        select: "name email",
      },
    })
    .populate("referredToHospital")
    .sort({ createdAt: -1 })

  console.log(`Found ${referrals.length} referrals for patient`)
  res.json(referrals)
})

// @desc    Get all referrals made by a doctor
// @route   GET /api/referrals/referring
// @access  Private/Doctor
const getReferringDoctorReferrals = asyncHandler(async (req, res) => {
  // Get doctor ID from user
  const doctor = await Doctor.findOne({ user: req.user._id })

  if (!doctor) {
    res.status(404)
    throw new Error("Doctor profile not found")
  }

  console.log(`Fetching referrals made by doctor: ${doctor._id}`)

  const referrals = await Referral.find({ referringDoctor: doctor._id })
    .populate({
      path: "patient",
      populate: {
        path: "user",
        select: "name email",
      },
    })
    .populate({
      path: "referredToDoctor",
      populate: {
        path: "user",
        select: "name email",
      },
    })
    .populate("referredToHospital")
    .sort({ createdAt: -1 })

  console.log(`Found ${referrals.length} referrals made by doctor`)
  res.json(referrals)
})

// @desc    Get all referrals to a doctor
// @route   GET /api/referrals/referred
// @access  Private/Doctor
const getReferredDoctorReferrals = asyncHandler(async (req, res) => {
  // Get doctor ID from user
  const doctor = await Doctor.findOne({ user: req.user._id })

  if (!doctor) {
    res.status(404)
    throw new Error("Doctor profile not found")
  }

  console.log(`Fetching referrals to doctor: ${doctor._id}`)

  const referrals = await Referral.find({ referredToDoctor: doctor._id })
    .populate({
      path: "patient",
      populate: {
        path: "user",
        select: "name email",
      },
    })
    .populate({
      path: "referringDoctor",
      populate: {
        path: "user",
        select: "name email",
      },
    })
    .populate("referredToHospital")
    .sort({ createdAt: -1 })

  console.log(`Found ${referrals.length} referrals to doctor`)
  res.json(referrals)
})

// @desc    Get all referrals (admin only)
// @route   GET /api/referrals/all
// @access  Private/Admin
const getAllReferrals = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin") {
    res.status(401)
    throw new Error("Not authorized to access all referrals")
  }

  console.log("Admin fetching all referrals")

  const referrals = await Referral.find({})
    .populate({
      path: "patient",
      populate: {
        path: "user",
        select: "name email",
      },
    })
    .populate({
      path: "referringDoctor",
      populate: {
        path: "user",
        select: "name email",
      },
    })
    .populate({
      path: "referredToDoctor",
      populate: {
        path: "user",
        select: "name email",
      },
    })
    .populate("referredToHospital")
    .sort({ createdAt: -1 })

  console.log(`Found ${referrals.length} total referrals`)
  res.json(referrals)
})

// @desc    Get referral by ID
// @route   GET /api/referrals/:id
// @access  Private
const getReferralById = asyncHandler(async (req, res) => {
  const referral = await Referral.findById(req.params.id)
    .populate({
      path: "patient",
      populate: {
        path: "user",
        select: "name email",
      },
    })
    .populate({
      path: "referringDoctor",
      populate: {
        path: "user",
        select: "name email",
      },
    })
    .populate({
      path: "referredToDoctor",
      populate: {
        path: "user",
        select: "name email",
      },
    })
    .populate("referredToHospital")

  if (referral) {
    // Check if the user is authorized to view this referral
    const patient = await Patient.findOne({ user: req.user._id })
    const doctor = await Doctor.findOne({ user: req.user._id })

    if (
      (patient && referral.patient._id.toString() === patient._id.toString()) ||
      (doctor &&
        (referral.referringDoctor?._id.toString() === doctor._id.toString() ||
          (referral.referredToDoctor && referral.referredToDoctor._id.toString() === doctor._id.toString()))) ||
      req.user.role === "admin"
    ) {
      res.json(referral)
    } else {
      res.status(401)
      throw new Error("Not authorized to view this referral")
    }
  } else {
    res.status(404)
    throw new Error("Referral not found")
  }
})

// @desc    Update referral status
// @route   PUT /api/referrals/:id/status
// @access  Private/Doctor
const updateReferralStatus = asyncHandler(async (req, res) => {
  const { status } = req.body

  console.log(`Updating referral ${req.params.id} status to ${status}`)

  const referral = await Referral.findById(req.params.id)

  if (referral) {
    // Check if the user is authorized to update this referral
    const doctor = await Doctor.findOne({ user: req.user._id })

    if (
      (doctor && referral.referredToDoctor && referral.referredToDoctor.toString() === doctor._id.toString()) ||
      (doctor && referral.referringDoctor.toString() === doctor._id.toString()) ||
      req.user.role === "admin"
    ) {
      referral.status = status
      const updatedReferral = await referral.save()

      // Populate the referral data before sending the response
      const populatedReferral = await Referral.findById(updatedReferral._id)
        .populate({
          path: "patient",
          populate: {
            path: "user",
            select: "name email",
          },
        })
        .populate({
          path: "referringDoctor",
          populate: {
            path: "user",
            select: "name email",
          },
        })
        .populate({
          path: "referredToDoctor",
          populate: {
            path: "user",
            select: "name email",
          },
        })
        .populate("referredToHospital")

      console.log("Referral status updated successfully:", populatedReferral)
      res.json(populatedReferral)
    } else {
      res.status(401)
      throw new Error("Not authorized to update this referral")
    }
  } else {
    res.status(404)
    throw new Error("Referral not found")
  }
})

// @desc    Create appointment from referral
// @route   POST /api/referrals/:id/appointment
// @access  Private/Doctor
const createAppointmentFromReferral = asyncHandler(async (req, res) => {
  const { date, time, duration, notes } = req.body

  const referral = await Referral.findById(req.params.id)

  if (referral) {
    // Check if the user is authorized to create an appointment from this referral
    const doctor = await Doctor.findOne({ user: req.user._id })

    if (
      (doctor && referral.referredToDoctor && referral.referredToDoctor.toString() === doctor._id.toString()) ||
      req.user.role === "admin"
    ) {
      // Create a new appointment
      const appointment = await Appointment.create({
        patient: referral.patient,
        doctor: referral.referredToDoctor,
        hospital: referral.referredToHospital,
        date,
        time,
        duration,
        type: "referral",
        reason: referral.reason,
        notes: notes || referral.notes,
        referral: referral._id,
      })

      if (appointment) {
        // Update referral to mark that an appointment has been created
        referral.appointmentCreated = true
        referral.status = "accepted"
        await referral.save()

        res.status(201).json(appointment)
      } else {
        res.status(400)
        throw new Error("Invalid appointment data")
      }
    } else {
      res.status(401)
      throw new Error("Not authorized to create an appointment from this referral")
    }
  } else {
    res.status(404)
    throw new Error("Referral not found")
  }
})

export {
  createReferral,
  getPatientReferrals,
  getReferringDoctorReferrals,
  getReferredDoctorReferrals,
  getAllReferrals,
  getReferralById,
  updateReferralStatus,
  createAppointmentFromReferral,
}
