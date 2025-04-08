import mongoose from "mongoose"

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    referral: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Referral",
    },
    dateTime: {
      type: Date,
      required: [true, "Appointment date and time is required"],
    },
    duration: {
      type: Number,
      default: 30, // Duration in minutes
      min: 15,
    },
    status: {
      type: String,
      enum: ["scheduled", "confirmed", "completed", "cancelled", "no-show"],
      default: "scheduled",
    },
    type: {
      type: String,
      enum: ["in-person", "video", "phone"],
      default: "in-person",
    },
    reason: {
      type: String,
      required: [true, "Reason for appointment is required"],
    },
    notes: {
      type: String,
    },
    followUp: {
      required: Boolean,
      appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Appointment",
      },
    },
    cancelledBy: {
      type: String,
      enum: ["patient", "doctor", "admin"],
    },
    cancellationReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
)

// Index for efficient querying
appointmentSchema.index({ patient: 1, dateTime: 1 })
appointmentSchema.index({ doctor: 1, dateTime: 1 })
appointmentSchema.index({ status: 1 })

const Appointment = mongoose.model("Appointment", appointmentSchema)

export default Appointment
