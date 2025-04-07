import mongoose from "mongoose"
const hospitalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  location: String,
  contact: String,
  specialization: [String], // optional field to specify services offered
}, { timestamps: true });

export const Hospital = mongoose.model('Hospital', hospitalSchema);
