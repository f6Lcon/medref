// routes/hospitalRoutes.js
import express from 'express';
import {
  createHospital,
  getHospitals,
  updateHospital,
  deleteHospital,
} from '../controllers/HospitalController.js';

const router = express.Router();

router.post('/create-hospital', createHospital);
router.get('/get-hospitals', getHospitals);
router.put('/update-hospital/:id', updateHospital);
router.post('/delete-hospital', deleteHospital);

export default router;
