import { Router } from 'express';
import * as dc from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/authorize';

const router = Router();
router.get('/', authenticate, authorize('PROPERTY_MANAGER'), dc.getDashboard);
export default router;
