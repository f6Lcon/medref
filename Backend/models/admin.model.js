import mongoose from "mongoose"

const adminSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    department: {
      type: String,
      required: true,
    },
    permissions: {
      manageUsers: { type: Boolean, default: true },
      manageDoctors: { type: Boolean, default: true },
      managePatients: { type: Boolean, default: true },
      manageHospitals: { type: Boolean, default: true },
      manageAppointments: { type: Boolean, default: true },
      viewReports: { type: Boolean, default: true },
      systemSettings: { type: Boolean, default: false },
    },
    contactInfo: {
      email: { type: String },
      phone: { type: String },
    },
  },
  {
    timestamps: true,
  },
)

const Admin = mongoose.model("Admin", adminSchema)

export default Admin
