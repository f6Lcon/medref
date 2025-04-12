import mongoose from "mongoose"

const otpSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    email: {
      type: String,
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 3600, // OTP expires after 1 hour
    },
  },
  {
    timestamps: true,
  },
)

const OTP = mongoose.model("OTP", otpSchema)

export default OTP
