import mongoose from "mongoose"

const patientSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ["male", "female", "other"],
    },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    medicalHistory: {
      type: String,
    },
    allergies: [String],
    currentMedications: [String],
    insuranceInfo: {
      provider: { type: String },
      policyNumber: { type: String },
      groupNumber: { type: String },
    },
    emergencyContact: {
      name: { type: String },
      relationship: { type: String },
      phoneNumber: { type: String },
    },
  },
  {
    timestamps: true,
  },
)

const Patient = mongoose.model("Patient", patientSchema)

export default Patient
