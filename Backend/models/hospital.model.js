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
      country: { type: String, default: "United States" },
    },
    contactInfo: {
      phone: { type: String, required: true },
      email: { type: String },
      website: { type: String },
    },
    departments: [{ type: String }],
    facilities: [{ type: String }],
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
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },
  },
  {
    timestamps: true,
  },
)

// Create a 2dsphere index on the location field for geospatial queries
hospitalSchema.index({ location: "2dsphere" })

const Hospital = mongoose.model("Hospital", hospitalSchema)

export default Hospital
