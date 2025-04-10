import mongoose from "mongoose"

const doctorSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    specialization: {
      type: String,
      required: true,
    },
    licenseNumber: {
      type: String,
      required: true,
      unique: true,
    },
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
    },
    education: [
      {
        degree: { type: String },
        institution: { type: String },
        year: { type: Number },
      },
    ],
    experience: [
      {
        position: { type: String },
        hospital: { type: String },
        from: { type: Date },
        to: { type: Date },
      },
    ],
    availability: [
      {
        day: {
          type: String,
          enum: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
        },
        startTime: { type: String },
        endTime: { type: String },
      },
    ],
    contactInfo: {
      email: { type: String },
      phone: { type: String },
    },
  },
  {
    timestamps: true,
  },
)

const Doctor = mongoose.model("Doctor", doctorSchema)

export default Doctor
