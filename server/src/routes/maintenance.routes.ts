import { Router } from 'express';
import * as mc from '../controllers/maintenance.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/authorize';

const router = Router();

router.get('/contractors', authenticate, authorize('PROPERTY_MANAGER'), mc.getContractors);
router.get('/', authenticate, mc.list);
router.get('/:id', authenticate, mc.getById);
router.post('/', authenticate, mc.create);
router.patch('/:id', authenticate, mc.update);
router.post('/:id/status', authenticate, mc.updateStatus);
router.post('/:id/contractors', authenticate, authorize('PROPERTY_MANAGER'), mc.assignContractor);
router.delete('/:id/contractors/:contractorId', authenticate, authorize('PROPERTY_MANAGER'), mc.removeContractor);
router.post('/:id/notes', authenticate, mc.addNote);

export default router;
