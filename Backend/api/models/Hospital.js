// models/Hospital.js
import mongoose from 'mongoose';

const hospitalSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Hospital name is required'],
        unique: true,
        trim: true,
    },
    address: { // Optional but useful
        street: String,
        city: String,
        state: String,
        zip: String,
    },
    contactPhone: {
        type: String,
    },
    // You could add a list of specialties available at the hospital
    // availableSpecialties: [String],
    active: { // To enable/disable a hospital for referrals
        type: Boolean,
        default: true,
    }
}, { timestamps: true });

const Hospital = mongoose.model('Hospital', hospitalSchema);
export default Hospital;