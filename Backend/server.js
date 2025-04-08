// ... other imports
import connectDB from './config/db.js';
import { notFound, errorHandler } from './api/middleware/errorMiddleware.js';

// --- Import Routes ---
import authRoutes from './routes/authRoutes.js';
import patientRoutes from './routes/patientRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import referralRoutes from './routes/referralRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import hospitalRoutes from './routes/hospitalRoutes.js'; // <-- Add this import

// ... (dotenv.config(), connectDB(), app initialization, middleware) ...

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/hospitals', hospitalRoutes); // <-- Add this route

// ... (Health check, Error Handling, Server Start) ...