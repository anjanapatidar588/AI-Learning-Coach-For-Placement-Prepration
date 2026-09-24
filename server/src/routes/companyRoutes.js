import express from 'express';
import { getCompanies, getCompanyDetail } from '../controllers/companyController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getCompanies);
router.get('/:companyId', getCompanyDetail);

export default router;
