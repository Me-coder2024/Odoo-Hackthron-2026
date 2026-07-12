import { Router } from 'express';
import { body } from 'express-validator';
import * as fuelController from '../controllers/fuel.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';

const router = Router();

router.use(authenticate);

router.get('/', fuelController.getAll);

router.post(
  '/',
  requireRole('FLEET_MANAGER', 'DISPATCHER', 'FINANCIAL_ANALYST'),
  [
    body('vehicle_id').isUUID().withMessage('Valid vehicle ID is required'),
    body('liters').isFloat({ min: 0 }).withMessage('Liters must be a positive number'),
    body('cost_per_liter').isFloat({ min: 0 }).withMessage('Cost per liter must be a positive number'),
    body('total_cost').isFloat({ min: 0 }).withMessage('Total cost must be a positive number'),
    body('log_date').isISO8601().withMessage('Valid log date is required'),
    body('odometer_at_fill').isFloat({ min: 0 }).withMessage('Odometer reading must be a positive number'),
  ],
  validate,
  fuelController.create
);

export default router;
