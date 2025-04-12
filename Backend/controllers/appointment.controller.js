import asyncHandler from "express-async-handler"
import Appointment from "../models/appointment.model.js"
import Doctor from "../models/doctor.model.js"
import Patient from "../models/patient.model.js"
import Hospital from "../models/hospital.model.js"
import Referral from "../models/referral.model.js"

// @desc    Create a new appointment
// @route   POST /api/appointments
// @access  Private
const createAppointment = asyncHandler(async (req, res) => {
  const { doctor, hospital, date, time, duration, type, reason, notes, referral } = req.body

  // Get patient ID from user
  const patient = await Patient.findOne({ user: req.user._id })

  if (!patient) {
    res.status(404)
    throw new Error("Patient profile not found")
  }

  // Check if doctor exists
  const doctorExists = await Doctor.findById(doctor)
  if (!doctorExists) {
    res.status(404)
    throw new Error("Doctor not found")
  }

  // Check if hospital exists
  const hospitalExists = await Hospital.findById(hospital)
  if (!hospitalExists) {
    res.status(404)
    throw new Error("Hospital not found")
  }

  // Check if the doctor is available at the requested time
  // This would require more complex logic in a real application
  // For now, we'll just create the appointment

  const appointment = await Appointment.create({
    patient: patient._id,
    doctor,
    hospital,
    date,
    time,
    duration,
    type,
    reason,
    notes,
    referral,
  })

  if (appointment) {
    // If this appointment is from a referral, update the referral status
    if (referral) {
      const referralDoc = await Referral.findById(referral)
      if (referralDoc) {
        referralDoc.appointmentCreated = true
        referralDoc.status = "accepted"
        await referralDoc.save()
      }
    }

    res.status(201).json(appointment)
  } else {
    res.status(400)
    throw new Error("Invalid appointment data")
  }
})

// @desc    Get all appointments for a patient
// @route   GET /api/appointments/patient
// @access  Private
const getPatientAppointments = asyncHandler(async (req, res) => {
  // Get patient ID from user
  const patient = await Patient.findOne({ user: req.user._id })

  if (!patient) {
    res.status(404)
    throw new Error("Patient profile not found")
  }

  const appointments = await Appointment.find({ patient: patient._id })
    .populate("doctor", "user specialization")
    .populate({
      path: "doctor",
      populate: {
        path: "user",
        select: "name email",
      },
    })
    .populate("hospital", "name address")
    .populate("referral")
    .sort({ date: 1 })

  res.json(appointments)
})

// @desc    Get all appointments for a doctor
// @route   GET /api/appointments/doctor
// @access  Private/Doctor
const getDoctorAppointments = asyncHandler(async (req, res) => {
  // Get doctor ID from user
  const doctor = await Doctor.findOne({ user: req.user._id })

  if (!doctor) {
    res.status(404)
    throw new Error("Doctor profile not found")
  }

  const appointments = await Appointment.find({ doctor: doctor._id })
    .populate({
      path: "patient",
      populate: {
        path: "user",
        select: "name email",
      },
    })
    .populate("hospital", "name address")
    .populate("referral")
    .sort({ date: 1 })

  res.json(appointments)
})

// @desc    Get all appointments (admin only)
// @route   GET /api/appointments/all
// @access  Private/Admin
const getAllAppointments = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin") {
    res.status(401)
    throw new Error("Not authorized to access all appointments")
  }

  const appointments = await Appointment.find({})
    .populate({
      path: "patient",
      populate: {
        path: "user",
        select: "name email",
      },
    })
    .populate({
      path: "doctor",
      populate: {
        path: "user",
        select: "name email",
      },
    })
    .populate("hospital", "name address")
    .populate("referral")
    .sort({ date: -1 })

  res.json(appointments)
})

// @desc    Get appointment by ID
// @route   GET /api/appointments/:id
// @access  Private
const getAppointmentById = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate({
      path: "patient",
      populate: {
        path: "user",
        select: "name email",
      },
    })
    .populate({
      path: "doctor",
      populate: {
        path: "user",
        select: "name email",
      },
    })
    .populate("hospital", "name address")
    .populate("referral")

  if (appointment) {
    // Check if the user is authorized to view this appointment
    const patient = await Patient.findOne({ user: req.user._id })
    const doctor = await Doctor.findOne({ user: req.user._id })

    if (
      (patient && appointment.patient._id.toString() === patient._id.toString()) ||
      (doctor && appointment.doctor._id.toString() === doctor._id.toString()) ||
      req.user.role === "admin"
    ) {
      res.json(appointment)
    } else {
      res.status(401)
      throw new Error("Not authorized to view this appointment")
    }
  } else {
    res.status(404)
    throw new Error("Appointment not found")
  }
})

// @desc    Update appointment status
// @route   PUT /api/appointments/:id/status
// @access  Private
const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { status } = req.body

  const appointment = await Appointment.findById(req.params.id)

  if (appointment) {
    // Check if the user is authorized to update this appointment
    const doctor = await Doctor.findOne({ user: req.user._id })

    if ((doctor && appointment.doctor.toString() === doctor._id.toString()) || req.user.role === "admin") {
      appointment.status = status
      const updatedAppointment = await appointment.save()
      res.json(updatedAppointment)
    } else {
      res.status(401)
      throw new Error("Not authorized to update this appointment")
    }
  } else {
    res.status(404)
    throw new Error("Appointment not found")
  }
})

// @desc    Cancel appointment
// @route   PUT /api/appointments/:id/cancel
// @access  Private
const cancelAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id)

  if (appointment) {
    // Check if the appointment is in the future
    const appointmentDate = new Date(`${appointment.date}T${appointment.time}`)
    if (appointmentDate < new Date()) {
      res.status(400)
      throw new Error("Cannot cancel past appointments")
    }

    // Check if the user is authorized to cancel this appointment
    const patient = await Patient.findOne({ user: req.user._id })
    const doctor = await Doctor.findOne({ user: req.user._id })

    if (
      (patient && appointment.patient.toString() === patient._id.toString()) ||
      (doctor && appointment.doctor.toString() === doctor._id.toString()) ||
      req.user.role === "admin"
    ) {
      appointment.status = "cancelled"
      const updatedAppointment = await appointment.save()
      res.json(updatedAppointment)
    } else {
      res.status(401)
      throw new Error("Not authorized to cancel this appointment")
    }
  } else {
    res.status(404)
    throw new Error("Appointment not found")
  }
})

export {
  createAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  getAllAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  cancelAppointment,
}
