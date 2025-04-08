import Appointment from "../models/appointment.model.js"
import Doctor from "../models/doctor.model.js"
import Referral from "../models/referral.model.js"
import { catchAsync } from "../utils/catchAsync.js"
import { AppError } from "../utils/appError.js"

// Create a new appointment
export const createAppointment = catchAsync(async (req, res, next) => {
  const { patient, doctor, dateTime, duration, type, reason, notes, referral } = req.body

  // Check if doctor exists
  const doctorExists = await Doctor.findById(doctor)
  if (!doctorExists) {
    return next(new AppError("Doctor not found", 404))
  }

  // Check if the doctor is available at the requested time
  const appointmentDate = new Date(dateTime)
  const day = appointmentDate.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase()

  // Find doctor's working hours for the day
  const workingHours = doctorExists.workingHours.find((wh) => wh.day === day)

  if (!workingHours || !workingHours.isAvailable) {
    return next(new AppError("Doctor is not available on this day", 400))
  }

  // Check if the time is within working hours
  const appointmentTime = appointmentDate.getHours() * 60 + appointmentDate.getMinutes()
  const [startHour, startMinute] = workingHours.startTime.split(":").map(Number)
  const [endHour, endMinute] = workingHours.endTime.split(":").map(Number)

  const startTime = startHour * 60 + startMinute
  const endTime = endHour * 60 + endMinute

  if (appointmentTime < startTime || appointmentTime + (duration || 30) > endTime) {
    return next(new AppError("Appointment time is outside doctor's working hours", 400))
  }

  // Check if doctor already has an appointment at the same time
  const overlappingAppointment = await Appointment.findOne({
    doctor,
    dateTime: {
      $lt: new Date(new Date(dateTime).getTime() + (duration || 30) * 60000),
      $gt: new Date(new Date(dateTime).getTime() - (duration || 30) * 60000),
    },
    status: { $in: ["scheduled", "confirmed"] },
  })

  if (overlappingAppointment) {
    return next(new AppError("Doctor already has an appointment at this time", 400))
  }

  // Create appointment
  const appointment = await Appointment.create({
    patient,
    doctor,
    dateTime,
    duration: duration || 30,
    type: type || "in-person",
    reason,
    notes,
    referral,
  })

  // If this appointment is from a referral, update the referral
  if (referral) {
    await Referral.findByIdAndUpdate(referral, {
      appointmentCreated: true,
      appointmentId: appointment._id,
      status: "accepted",
    })
  }

  res.status(201).json({
    status: "success",
    data: {
      appointment,
    },
  })
})

// Get all appointments
export const getAllAppointments = catchAsync(async (req, res, next) => {
  const { status, doctor, patient, startDate, endDate } = req.query

  // Build query
  const query = {}

  if (status) query.status = status
  if (doctor) query.doctor = doctor
  if (patient) query.patient = patient

  if (startDate || endDate) {
    query.dateTime = {}
    if (startDate) query.dateTime.$gte = new Date(startDate)
    if (endDate) query.dateTime.$lte = new Date(endDate)
  }

  // Execute query with pagination
  const page = Number.parseInt(req.query.page, 10) || 1
  const limit = Number.parseInt(req.query.limit, 10) || 10
  const skip = (page - 1) * limit

  const appointments = await Appointment.find(query)
    .populate("patient", "user")
    .populate("doctor", "user specialization")
    .populate("referral")
    .sort({ dateTime: 1 })
    .skip(skip)
    .limit(limit)

  const total = await Appointment.countDocuments(query)

  res.status(200).json({
    status: "success",
    results: appointments.length,
    total,
    pages: Math.ceil(total / limit),
    currentPage: page,
    data: {
      appointments,
    },
  })
})

// Get appointment by ID
export const getAppointmentById = catchAsync(async (req, res, next) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate({
      path: "patient",
      populate: {
        path: "user",
        select: "firstName lastName email phoneNumber",
      },
    })
    .populate({
      path: "doctor",
      populate: {
        path: "user",
        select: "firstName lastName email phoneNumber",
      },
    })
    .populate("referral")

  if (!appointment) {
    return next(new AppError("Appointment not found", 404))
  }

  res.status(200).json({
    status: "success",
    data: {
      appointment,
    },
  })
})

// Update appointment
export const updateAppointment = catchAsync(async (req, res, next) => {
  const { dateTime, duration, status, type, reason, notes } = req.body

  // Find appointment
  const appointment = await Appointment.findById(req.params.id)

  if (!appointment) {
    return next(new AppError("Appointment not found", 404))
  }

  const appointmentNotes = appointment.notes

  // If changing date/time, check doctor availability
  if (dateTime && dateTime !== appointment.dateTime.toISOString()) {
    const doctorExists = await Doctor.findById(appointment.doctor)

    // Check if the doctor is available at the new time
    const appointmentDate = new Date(dateTime)
    const day = appointmentDate.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase()

    // Find doctor's working hours for the day
    const workingHours = doctorExists.workingHours.find((wh) => wh.day === day)

    if (!workingHours || !workingHours.isAvailable) {
      return next(new AppError("Doctor is not available on this day", 400))
    }

    // Check if the time is within working hours
    const appointmentTime = appointmentDate.getHours() * 60 + appointmentDate.getMinutes()
    const [startHour, startMinute] = workingHours.startTime.split(":").map(Number)
    const [endHour, endMinute] = workingHours.endTime.split(":").map(Number)

    const startTime = startHour * 60 + startMinute
    const endTime = endHour * 60 + endMinute

    if (appointmentTime < startTime || appointmentTime + (duration || appointment.duration) > endTime) {
      return next(new AppError("Appointment time is outside doctor's working hours", 400))
    }

    // Check if doctor already has an appointment at the same time (excluding this one)
    const overlappingAppointment = await Appointment.findOne({
      _id: { $ne: req.params.id },
      doctor: appointment.doctor,
      dateTime: {
        $lt: new Date(new Date(dateTime).getTime() + (duration || appointment.duration) * 60000),
        $gt: new Date(new Date(dateTime).getTime() - (duration || appointment.duration) * 60000),
      },
      status: { $in: ["scheduled", "confirmed"] },
    })

    if (overlappingAppointment) {
      return next(new AppError("Doctor already has an appointment at this time", 400))
    }
  }

  // Update appointment
  const updatedAppointment = await Appointment.findByIdAndUpdate(
    req.params.id,
    {
      dateTime: dateTime || appointment.dateTime,
      duration: duration || appointment.duration,
      status: status || appointment.status,
      type: type || appointment.type,
      reason: reason || appointment.reason,
      notes: notes || appointmentNotes,
      updatedAt: Date.now(),
    },
    { new: true, runValidators: true },
  ).populate("patient doctor referral")

  res.status(200).json({
    status: "success",
    data: {
      appointment: updatedAppointment,
    },
  })
})

// Cancel appointment
export const cancelAppointment = catchAsync(async (req, res, next) => {
  const { cancelledBy, cancellationReason } = req.body

  if (!cancelledBy) {
    return next(new AppError("Please specify who is cancelling the appointment", 400))
  }

  const appointment = await Appointment.findByIdAndUpdate(
    req.params.id,
    {
      status: "cancelled",
      cancelledBy,
      cancellationReason,
      updatedAt: Date.now(),
    },
    { new: true, runValidators: true },
  )

  if (!appointment) {
    return next(new AppError("Appointment not found", 404))
  }

  // If this appointment was from a referral, update the referral
  if (appointment.referral) {
    await Referral.findByIdAndUpdate(appointment.referral, {
      appointmentCreated: false,
      status: "pending",
    })
  }

  res.status(200).json({
    status: "success",
    data: {
      appointment,
    },
  })
})

// Complete appointment
export const completeAppointment = catchAsync(async (req, res, next) => {
  const { notes, followUpRequired } = req.body

  const appointment = await Appointment.findById(req.params.id)

  if (!appointment) {
    return next(new AppError("Appointment not found", 404))
  }

  const updatedAppointment = await Appointment.findByIdAndUpdate(
    req.params.id,
    {
      status: "completed",
      notes: notes || appointment.notes,
      followUp: {
        required: followUpRequired || false,
      },
      updatedAt: Date.now(),
    },
    { new: true, runValidators: true },
  )

  // If this appointment was from a referral, update the referral
  if (appointment.referral) {
    await Referral.findByIdAndUpdate(appointment.referral, {
      status: "completed",
    })
  }

  res.status(200).json({
    status: "success",
    data: {
      appointment: updatedAppointment,
    },
  })
})
