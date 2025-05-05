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
      type: Number,
      required: true,
      default: 30, // Default duration in minutes
    },
    type: {
      type: String,
      required: true,
      enum: ["regular", "followup", "emergency", "referral"],
      default: "regular",
    },
    reason: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
    },
    status: {
      type: String,
      required: true,
      enum: ["scheduled", "completed", "cancelled", "rescheduled", "noshow"],
      default: "scheduled",
    },
    referral: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Referral",
    },
    completionDetails: {
      diagnosis: {
        type: String,
      },
      treatment: {
        type: String,
      },
      prescription: {
        type: String,
      },
      followUpNeeded: {
        type: Boolean,
        default: false,
      },
      followUpDate: {
        type: Date,
      },
      followUpNotes: {
        type: String,
      },
      additionalNotes: {
        type: String,
      },
      completedAt: {
        type: Date,
      },
    },
  },
  {
    timestamps: true,
  },
)

const Appointment = mongoose.model("Appointment", appointmentSchema)

export default Appointment
