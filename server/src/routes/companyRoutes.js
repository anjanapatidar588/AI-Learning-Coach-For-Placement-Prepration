import express from 'express';
import { getCompanies, getCompanyDetail } from '../controllers/companyController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', authorize('student'), getCompanies);
router.get('/:companyId', authorize('student'), getCompanyDetail);

export default router;
