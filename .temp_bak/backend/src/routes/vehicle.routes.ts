import { Router } from 'express';
import { body } from 'express-validator';
import * as vehicleController from '../controllers/vehicle.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';

const router = Router();

// All vehicle routes require authentication
router.use(authenticate);

router.get('/', vehicleController.getAll);
router.get('/available', vehicleController.getAvailable);
router.get('/:id', vehicleController.getById);

router.post(
  '/',
  requireRole('FLEET_MANAGER', 'DISPATCHER'),
  [
    body('registration_number').matches(/^[A-Z]{2}-\d{2}-[A-Z]{1,2}-\d{4}$/i).withMessage('Registration number must be in standard format (e.g. MH-01-AB-1234)'),
    body('name').notEmpty().withMessage('Vehicle name is required'),
    body('type').isIn(['VAN', 'TRUCK', 'BUS', 'OTHER']).withMessage('Invalid vehicle type'),
    body('max_load_capacity').isFloat({ min: 0 }).withMessage('Max load capacity must be a positive number'),
    body('acquisition_cost').isFloat({ min: 0 }).withMessage('Acquisition cost must be a positive number'),
  ],
  validate,
  vehicleController.create
);

router.patch(
  '/:id',
  requireRole('FLEET_MANAGER', 'DISPATCHER'),
  vehicleController.update
);

router.delete(
  '/:id',
  requireRole('FLEET_MANAGER'),
  vehicleController.remove
);

export default router;
