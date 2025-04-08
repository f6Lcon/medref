// models/Doctor.js
import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
    user: { // Link to the User model for login etc.
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    specialty: {
        type: String,
        required: true,
        trim: true,
    },
    qualifications: [String],
    // --- Hospital Affiliations --- crucial change
    affiliations: [{
        hospital: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Hospital',
            required: true
        },
        // You could add details specific to their role at THIS hospital
        // e.g., department, office number, specific clinic hours at this location
        department: String,
        // isAcceptingReferralsAtThisHospital: Boolean
    }],
    primaryClinicAddress: { // Doctor might still have a primary private practice
       type: String // Or use address sub-document like in Patient/Hospital
    },
    // Add other fields like availability schedule, contact info etc.
}, { timestamps: true });

// Index for finding doctors by specialty and hospital
doctorSchema.index({ specialty: 1, "affiliations.hospital": 1 });

const Doctor = mongoose.model('Doctor', doctorSchema);
export default Doctor;