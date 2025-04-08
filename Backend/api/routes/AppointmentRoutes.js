import express from 'express';
import {
    createAppointment,
    getAppointments,
    getAppointmentById,
    updateAppointment,
} from '../controllers/appointmentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All appointment routes require login

router.route('/')
    .post(authorize('admin', 'staff'), createAppointment) // Decide who can book (maybe patient?)
    .get(authorize('admin', 'staff', 'doctor'), getAppointments); // Decide who can list

router.route('/:id')
    .get(authorize('admin', 'staff', 'doctor'), getAppointmentById) // Auth inside controller
    .put(authorize('admin', 'staff', 'doctor'), updateAppointment); // Auth inside controller (more granular needed)
    // Add specific DELETE or PUT /:id/cancel route if needed with specific permissions


export default router;