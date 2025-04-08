// models/Referral.js
import mongoose from 'mongoose';

const referralSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    referringDoctor: { // Or potentially a generic User/Staff if non-doctors can refer
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor', // Change to 'User' if needed
        required: true
    },
    // --- Referral Destination ---
    referredHospital: { // Reference to the hospital
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hospital',
        required: [true, 'Referred hospital is required']
    },
    referredSpecialty: { // The specific specialty needed at the hospital
        type: String,
        required: [true, 'Referred specialty is required'],
        trim: true,
    },
    // --- Referral Details ---
    reason: {
        type: String,
        required: [true, 'Reason for referral is required'],
        trim: true,
    },
    notes: { // Additional clinical notes, urgency, etc.
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: [
            'Pending',      // Just created
            'SentToHospital',// Info digitally sent/faxed/etc.
            'ReceivedByPatient', // Patient acknowledged/has copy
            'BookingRequired', // Patient needs to book appointment
            'AppointmentScheduled', // An appointment related to this is booked
            'Completed',    // Visit happened, outcome recorded (maybe)
            'Cancelled'     // Referral cancelled before appointment
            // Add more statuses as your workflow demands
            ],
        default: 'Pending',
    },
    // --- Link to subsequent Appointment (optional) ---
    relatedAppointment: { // If an appointment is booked based on this referral
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
        required: false // An appointment might be booked *without* a preceding referral
    }

}, { timestamps: true });

// Optional: Indexing for performance on common lookups
referralSchema.index({ patient: 1, status: 1 });
referralSchema.index({ referredHospital: 1, referredSpecialty: 1, status: 1 });


const Referral = mongoose.model('Referral', referralSchema);
export default Referral;