import mongoose from "mongoose"

const hospitalSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    contactInfo: {
      email: { type: String, required: true },
      phone: { type: String, required: true },
      website: { type: String },
    },
    facilities: [String],
    departments: [String],
    accreditation: [String],
    operatingHours: {
      weekdays: {
        open: { type: String },
        close: { type: String },
      },
      weekends: {
        open: { type: String },
        close: { type: String },
      },
    },
  },
  {
    timestamps: true,
  },
)

const Hospital = mongoose.model("Hospital", hospitalSchema)

export default Hospital
