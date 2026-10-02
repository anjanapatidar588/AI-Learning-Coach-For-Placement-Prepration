import express from 'express';
import { getCompanies, getCompanyDetail } from '../controllers/companyController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('student', 'admin'));

router.get('/', getCompanies);
router.get('/:companyId', getCompanyDetail);

export default router;

