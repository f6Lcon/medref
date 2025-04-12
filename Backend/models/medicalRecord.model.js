import mongoose from "mongoose"

const medicalRecordSchema = mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Patient",
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    fileUrl: {
      type: String,
    },
    fileType: {
      type: String,
    },
    fileSize: {
      type: Number,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    uploadDate: {
      type: Date,
      default: Date.now,
    },
    tags: [String],
  },
  {
    timestamps: true,
  },
)

const MedicalRecord = mongoose.model("MedicalRecord", medicalRecordSchema)

export default MedicalRecord
