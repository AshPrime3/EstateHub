import { Router } from 'express';
import * as ac from '../controllers/alerts.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/authorize';

const router = Router();
router.get('/', authenticate, authorize('PROPERTY_MANAGER'), ac.getAlerts);
router.get('/count', authenticate, authorize('PROPERTY_MANAGER'), ac.getAlertCount);
router.post('/:unitId/dismiss', authenticate, authorize('PROPERTY_MANAGER'), ac.dismissAlert);
export default router;
