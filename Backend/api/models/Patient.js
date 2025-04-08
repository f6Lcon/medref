import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
   // ... (schema definition remains the same)
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    contact: {
        phone: String,
        email: String,
    },
    address: {
        street: String,
        city: String,
        state: String,
        zip: String,
    },
}, { timestamps: true });

const Patient = mongoose.model('Patient', patientSchema);
export default Patient;