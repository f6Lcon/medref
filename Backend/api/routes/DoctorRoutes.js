import express from 'express';
import {
    getDoctors,
    getDoctorById,
    addDoctorAffiliation,
    removeDoctorAffiliation,
} from '../controllers/doctorController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public access likely needed to find doctors for booking
router.route('/').get(getDoctors);
router.route('/:id').get(getDoctorById);

// Affiliation management requires login and specific roles
router.route('/:id/affiliations')
    .post(protect, authorize('admin', 'doctor'), addDoctorAffiliation); // Admin or the doctor can add

// Need hospital ID in the route to identify which affiliation to remove
router.route('/:id/affiliations/:affiliationHospitalId')
     .delete(protect, authorize('admin', 'doctor'), removeDoctorAffiliation); // Admin or the doctor can remove


export default router;