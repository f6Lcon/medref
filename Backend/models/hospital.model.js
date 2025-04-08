import mongoose from "mongoose"

const hospitalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Hospital name is required"],
      trim: true,
    },
    address: {
      street: String,
      city: {
        type: String,
        required: [true, "City is required"],
      },
      state: {
        type: String,
        required: [true, "State is required"],
      },
      zipCode: String,
      country: {
        type: String,
        default: "United States",
      },
    },
    contactNumber: {
      type: String,
      required: [true, "Contact number is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ["public", "private", "community", "teaching", "specialty"],
      required: [true, "Hospital type is required"],
    },
    specialties: [
      {
        type: String,
        trim: true,
      },
    ],
    facilities: [
      {
        type: String,
        trim: true,
      },
    ],
    emergencyServices: {
      type: Boolean,
      default: false,
    },
    acceptingNewPatients: {
      type: Boolean,
      default: true,
    },
    insuranceAccepted: [
      {
        type: String,
        trim: true,
      },
    ],
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
)

// Index for efficient querying
hospitalSchema.index({ name: 1 })
hospitalSchema.index({ "address.city": 1, "address.state": 1 })
hospitalSchema.index({ specialties: 1 })

const Hospital = mongoose.model("Hospital", hospitalSchema)

export default Hospital
