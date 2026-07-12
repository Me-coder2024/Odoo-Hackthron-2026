import { Router } from 'express';
import { body } from 'express-validator';
import * as maintenanceController from '../controllers/maintenance.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';

const router = Router();

router.use(authenticate);

router.get('/', maintenanceController.getAll);
router.get('/:id', maintenanceController.getById);

router.post(
  '/',
  requireRole('FLEET_MANAGER', 'SAFETY_OFFICER'),
  [
    body('vehicle_id').isUUID().withMessage('Valid vehicle ID is required'),
    body('service_type').notEmpty().withMessage('Service type is required'),
  ],
  validate,
  maintenanceController.create
);

router.patch(
  '/:id',
  requireRole('FLEET_MANAGER', 'SAFETY_OFFICER'),
  maintenanceController.update
);

router.post(
  '/:id/close',
  requireRole('FLEET_MANAGER', 'SAFETY_OFFICER'),
  maintenanceController.close
);

router.post(
  '/:id/items',
  requireRole('FLEET_MANAGER', 'SAFETY_OFFICER'),
  [
    body('description').notEmpty().withMessage('Item description is required'),
    body('cost').isFloat({ min: 0 }).withMessage('Cost must be a positive number'),
  ],
  validate,
  maintenanceController.addItem
);

export default router;
