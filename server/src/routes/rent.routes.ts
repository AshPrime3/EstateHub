import { Router } from 'express';
import * as rentController from '../controllers/rent.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/authorize';

const router = Router();

router.get('/', authenticate, authorize('PROPERTY_MANAGER'), rentController.getRentStatus);
router.post('/', authenticate, authorize('PROPERTY_MANAGER'), rentController.recordPayment);
router.post('/bulk', authenticate, authorize('PROPERTY_MANAGER'), rentController.bulkRecord);
router.get('/export', authenticate, authorize('PROPERTY_MANAGER'), rentController.exportCSV);

export default router;
