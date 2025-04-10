import mongoose from "mongoose"

const referralSchema = mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Patient",
    },
    referringDoctor: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Doctor",
    },
    referredToDoctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
    },
    referredToHospital: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Hospital",
    },
    reason: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
    },
    urgency: {
      type: String,
      enum: ["low", "medium", "high", "emergency"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed"],
      default: "pending",
    },
    medicalRecords: [
      {
        title: { type: String },
        description: { type: String },
        fileUrl: { type: String },
        uploadDate: { type: Date, default: Date.now },
      },
    ],
    appointmentCreated: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

const Referral = mongoose.model("Referral", referralSchema)

export default Referral
