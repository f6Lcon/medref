import mongoose from "mongoose"

const referralSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    referringDoctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    referredToHospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
    },
    specialtyRequired: {
      type: String,
      required: [true, "Specialty required for referral"],
    },
    reason: {
      type: String,
      required: [true, "Reason for referral is required"],
    },
    urgency: {
      type: String,
      enum: ["routine", "urgent", "emergency"],
      default: "routine",
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed", "cancelled"],
      default: "pending",
    },
    notes: {
      type: String,
    },
    medicalRecords: [
      {
        type: String, // URLs to medical records
      },
    ],
    appointmentCreated: {
      type: Boolean,
      default: false,
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
    },
    expiryDate: {
      type: Date,
    },
    preferredAppointmentDate: {
      type: Date,
    },
    insuranceInformation: {
      provider: String,
      policyNumber: String,
      groupNumber: String,
      verificationStatus: {
        type: String,
        enum: ["pending", "verified", "denied"],
        default: "pending",
      },
    },
  },
  {
    timestamps: true,
  },
)

// Index for efficient querying
referralSchema.index({ patient: 1 })
referralSchema.index({ referringDoctor: 1 })
referralSchema.index({ referredToHospital: 1 })
referralSchema.index({ status: 1 })
referralSchema.index({ specialtyRequired: 1 })

const Referral = mongoose.model("Referral", referralSchema)

export default Referral
