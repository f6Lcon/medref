// models/Appointment.js
import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    doctor: { // Appointments are booked WITH a specific doctor
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true
    },
    appointmentDateTime: {
        type: Date,
        required: [true, 'Appointment date and time are required']
    },
    durationMinutes: {
        type: Number,
        default: 30
    },
    reason: { // Reason provided by patient during booking
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['Scheduled', 'Confirmed', 'CancelledByPatient', 'CancelledByClinic', 'Completed', 'No Show'],
        default: 'Scheduled',
    },
    notes: { // Post-appointment notes by doctor or staff
        type: String,
        trim: true
    },
    // Link back to a Referral IF this appointment resulted from one
    originatingReferral: { // Changed name for clarity
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Referral',
        required: false // Making it explicitly optional
    }
}, { timestamps: true });

// Optional: Indexing
appointmentSchema.index({ doctor: 1, appointmentDateTime: 1 });
appointmentSchema.index({ patient: 1, appointmentDateTime: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;