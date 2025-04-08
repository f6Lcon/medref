import express from 'express';
import {
    createHospital,
    getHospitals,
    getHospitalById,
    updateHospital,
    deleteHospital,
} from '../controllers/hospitalController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .post(protect, authorize('admin'), createHospital)
    // Accessible to more roles for selection purposes
    .get(protect, authorize('admin', 'staff', 'doctor'), getHospitals);

router.route('/:id')
    // Accessible to more roles for selection purposes
    .get(protect, authorize('admin', 'staff', 'doctor'), getHospitalById)
    .put(protect, authorize('admin'), updateHospital)
    .delete(protect, authorize('admin'), deleteHospital);

export default router;