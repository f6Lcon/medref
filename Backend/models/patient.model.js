import mongoose from "mongoose"

const patientSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    emergencyContact: {
      name: String,
      relationship: String,
      phoneNumber: String,
    },
    medicalHistory: [
      {
        condition: String,
        diagnosedDate: Date,
        notes: String,
      },
    ],
    allergies: [
      {
        type: String,
      },
    ],
    currentMedications: [
      {
        name: String,
        dosage: String,
        frequency: String,
      },
    ],
    insuranceDetails: {
      provider: String,
      policyNumber: String,
      expiryDate: Date,
    },
  },
  {
    timestamps: true,
  },
)

const Patient = mongoose.model("Patient", patientSchema)

export default Patient
