import asyncHandler from "express-async-handler"
import Appointment from "../models/appointment.model.js"
import Doctor from "../models/doctor.model.js"
import Patient from "../models/patient.model.js"
import Hospital from "../models/hospital.model.js"
import Referral from "../models/referral.model.js"
import sendEmail from "../utils/sendEmail.js"
import { format } from "date-fns" // We'll use date-fns for formatting dates

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

// @desc    Create a new appointment from a referral
// @route   POST /api/appointments/from-referral
// @access  Private/Doctor
const createAppointmentFromReferral = asyncHandler(async (req, res) => {
  const { referralId, date, time, duration, notes } = req.body

  // Find the referral
  const referral = await Referral.findById(referralId)
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
        select: "name email specialization",
      },
    })
    .populate("referredToHospital")

  if (!referral) {
    res.status(404)
    throw new Error("Referral not found")
  }

  // Check if the doctor is authorized to create this appointment
  const doctor = await Doctor.findOne({ user: req.user._id }).populate("user", "name email")

  if (!doctor) {
    res.status(404)
    throw new Error("Doctor profile not found")
  }

  // Check if the doctor is the referred doctor
  if (referral.referredToDoctor && referral.referredToDoctor._id.toString() !== doctor._id.toString()) {
    res.status(401)
    throw new Error("Not authorized to create appointment for this referral")
  }

  // Check if an appointment already exists for this referral
  const existingAppointment = await Appointment.findOne({ referral: referralId })
  if (existingAppointment) {
    res.status(400)
    throw new Error("An appointment already exists for this referral")
  }

  // Create the appointment
  const appointment = await Appointment.create({
    patient: referral.patient._id,
    doctor: doctor._id,
    hospital: referral.referredToHospital._id,
    date,
    time,
    duration,
    type: "referral", // Changed from "Referral Appointment" to "referral" to match the enum
    reason: referral.reason,
    notes,
    referral: referralId,
    status: "scheduled",
  })

  if (appointment) {
    // Update the referral status
    referral.appointmentCreated = true
    referral.status = "accepted"
    await referral.save()

    // Send email notification to the patient
    try {
      const formattedDate = format(new Date(date), "MMMM do, yyyy")

      // Make sure we have the patient's email
      if (referral.patient && referral.patient.user && referral.patient.user.email) {
        const patientEmail = referral.patient.user.email
        const patientName = referral.patient.user.name
        const doctorName = doctor.user.name
        const doctorSpecialization = doctor.specialization
        const hospitalName = referral.referredToHospital.name
        const hospitalAddress = referral.referredToHospital.address

        const emailSubject = "Your Referral Has Been Accepted - Appointment Scheduled"

        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <h2 style="color: #4a5568; text-align: center;">Appointment Confirmation</h2>
            <p>Dear ${patientName},</p>
            <p>We are pleased to inform you that your referral has been accepted by Dr. ${doctorName}, ${doctorSpecialization}.</p>
            <p>An appointment has been scheduled for you:</p>
            <div style="background-color: #f7fafc; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <p><strong>Date:</strong> ${formattedDate}</p>
              <p><strong>Time:</strong> ${time}</p>
              <p><strong>Duration:</strong> ${duration} minutes</p>
              <p><strong>Doctor:</strong> Dr. ${doctorName}, ${doctorSpecialization}</p>
              <p><strong>Hospital:</strong> ${hospitalName}</p>
              <p><strong>Address:</strong> ${hospitalAddress}</p>
              <p><strong>Reason:</strong> ${referral.reason}</p>
              ${notes ? `<p><strong>Additional Notes:</strong> ${notes}</p>` : ""}
            </div>
            <p>Please arrive 15 minutes before your scheduled appointment time. If you need to reschedule or cancel, please contact us at least 24 hours in advance.</p>
            <p>For any questions or concerns, please don't hesitate to contact us.</p>
            <p>Best regards,</p>
            <p>Medical Referral System Team</p>
          </div>
        `

        await sendEmail({
          email: patientEmail,
          subject: emailSubject,
          html: emailHtml,
        })

        console.log(`Appointment confirmation email sent to ${patientEmail}`)
      } else {
        console.error("Patient email not found, could not send notification")
      }
    } catch (error) {
      console.error("Error sending appointment notification email:", error)
      // Don't throw an error here, as the appointment was created successfully
      // We just couldn't send the email notification
    }

    res.status(201).json(appointment)
  } else {
    res.status(400)
    throw new Error("Invalid appointment data")
  }
})

// @desc    Complete an appointment and send summary email to patient
// @route   PUT /api/appointments/:id/complete
// @access  Private/Doctor
const completeAppointment = asyncHandler(async (req, res) => {
  const { diagnosis, treatment, prescription, followUpNeeded, followUpDate, followUpNotes, additionalNotes } = req.body

  // Find the appointment with all necessary populated fields
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

  if (!appointment) {
    res.status(404)
    throw new Error("Appointment not found")
  }

  // Check if the user is authorized to complete this appointment
  const doctor = await Doctor.findOne({ user: req.user._id })

  if (!doctor) {
    res.status(404)
    throw new Error("Doctor profile not found")
  }

  if (appointment.doctor._id.toString() !== doctor._id.toString() && req.user.role !== "admin") {
    res.status(401)
    throw new Error("Not authorized to complete this appointment")
  }

  // Check if the appointment is already completed
  if (appointment.status === "completed") {
    res.status(400)
    throw new Error("This appointment is already marked as completed")
  }

  // Update the appointment status and add completion details
  appointment.status = "completed"
  appointment.completionDetails = {
    diagnosis,
    treatment,
    prescription,
    followUpNeeded: followUpNeeded || false,
    followUpDate: followUpNeeded ? followUpDate : null,
    followUpNotes: followUpNeeded ? followUpNotes : null,
    additionalNotes,
    completedAt: new Date(),
  }

  const updatedAppointment = await appointment.save()

  // Send email notification to the patient with appointment summary
  try {
    // Make sure we have the patient's email
    if (appointment.patient && appointment.patient.user && appointment.patient.user.email) {
      const patientEmail = appointment.patient.user.email
      const patientName = appointment.patient.user.name
      const doctorName = appointment.doctor.user.name
      const doctorSpecialization = appointment.doctor.specialization || "Specialist"
      const hospitalName = appointment.hospital.name
      const appointmentDate = format(new Date(appointment.date), "MMMM do, yyyy")

      const emailSubject = "Your Appointment Summary"

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #4a5568; text-align: center;">Appointment Summary</h2>
          <p>Dear ${patientName},</p>
          <p>Thank you for visiting Dr. ${doctorName} at ${hospitalName} on ${appointmentDate}.</p>
          
          <div style="background-color: #f7fafc; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <h3 style="color: #4a5568; margin-top: 0;">Appointment Details</h3>
            <p><strong>Date:</strong> ${appointmentDate}</p>
            <p><strong>Doctor:</strong> Dr. ${doctorName}, ${doctorSpecialization}</p>
            <p><strong>Hospital:</strong> ${hospitalName}</p>
            <p><strong>Reason for Visit:</strong> ${appointment.reason}</p>
          </div>
          
          <div style="background-color: #f7fafc; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <h3 style="color: #4a5568; margin-top: 0;">Medical Summary</h3>
            <p><strong>Diagnosis:</strong> ${diagnosis}</p>
            <p><strong>Treatment Plan:</strong> ${treatment}</p>
            ${prescription ? `<p><strong>Prescription:</strong> ${prescription}</p>` : ""}
            ${additionalNotes ? `<p><strong>Additional Notes:</strong> ${additionalNotes}</p>` : ""}
          </div>
          
          ${
            followUpNeeded
              ? `
            <div style="background-color: #f7fafc; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <h3 style="color: #4a5568; margin-top: 0;">Follow-Up Information</h3>
              <p>A follow-up appointment is recommended.</p>
              ${followUpDate ? `<p><strong>Suggested Date:</strong> ${format(new Date(followUpDate), "MMMM do, yyyy")}</p>` : ""}
              ${followUpNotes ? `<p><strong>Follow-Up Notes:</strong> ${followUpNotes}</p>` : ""}
              <p>Please contact our office to schedule your follow-up appointment.</p>
            </div>
            `
              : ""
          }
          
          <p>If you have any questions about your diagnosis, treatment plan, or need to schedule a follow-up appointment, please don't hesitate to contact us.</p>
          <p>Best regards,</p>
          <p>Dr. ${doctorName}<br>${hospitalName} Medical Team</p>
        </div>
      `

      await sendEmail({
        email: patientEmail,
        subject: emailSubject,
        html: emailHtml,
      })

      console.log(`Appointment summary email sent to ${patientEmail}`)
    } else {
      console.error("Patient email not found, could not send appointment summary")
    }
  } catch (error) {
    console.error("Error sending appointment summary email:", error)
    // Don't throw an error here, as the appointment was updated successfully
    // We just couldn't send the email notification
  }

  res.json(updatedAppointment)
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
  createAppointmentFromReferral,
  completeAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  getAllAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  cancelAppointment,
}
