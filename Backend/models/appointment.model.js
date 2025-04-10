import mongoose from "mongoose"

const appointmentSchema = mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Patient",
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Doctor",
    },
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Hospital",
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    duration: {
      type: Number, // in minutes
      default: 30,
    },
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled", "no-show"],
      default: "scheduled",
    },
    type: {
      type: String,
      enum: ["regular", "follow-up", "emergency", "referral"],
      default: "regular",
    },
    reason: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
    },
    referral: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Referral",
    },
  },
  {
    timestamps: true,
  },
)

const Appointment = mongoose.model("Appointment", appointmentSchema)

export default Appointment
