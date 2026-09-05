import { Router } from 'express';
import * as unitsController from '../controllers/units.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/authorize';

const router = Router();

router.get('/', authenticate, unitsController.list);
router.get('/:id', authenticate, unitsController.getById);
router.post('/', authenticate, authorize('PROPERTY_MANAGER'), unitsController.create);
router.patch('/:id', authenticate, authorize('PROPERTY_MANAGER'), unitsController.update);
router.post('/:id/archive', authenticate, authorize('PROPERTY_MANAGER'), unitsController.archive);
router.post('/:id/restore', authenticate, authorize('PROPERTY_MANAGER'), unitsController.restore);

export default router;
