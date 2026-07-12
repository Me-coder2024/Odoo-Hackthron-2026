import { Router } from 'express';
import { body } from 'express-validator';
import * as tripController from '../controllers/trip.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';

const router = Router();

router.use(authenticate);

router.get('/', tripController.getAll);
router.get('/:id', tripController.getById);

router.post(
  '/',
  requireRole('DISPATCHER', 'FLEET_MANAGER'),
  [
    body('source').notEmpty().withMessage('Source is required'),
    body('destination').notEmpty().withMessage('Destination is required'),
    body('vehicle_id').isUUID().withMessage('Valid vehicle ID is required'),
    body('driver_id').isUUID().withMessage('Valid driver ID is required'),
    body('cargo_weight').isFloat({ min: 0 }).withMessage('Cargo weight must be a positive number'),
    body('planned_distance').isFloat({ min: 0 }).withMessage('Planned distance must be a positive number'),
  ],
  validate,
  tripController.create
);

router.patch(
  '/:id',
  requireRole('DISPATCHER', 'FLEET_MANAGER'),
  tripController.update
);

// Dispatch — atomic transaction with all business rule validations
router.post(
  '/:id/dispatch',
  requireRole('DISPATCHER', 'FLEET_MANAGER'),
  tripController.dispatch
);

// Complete — record final metrics and release resources
router.post(
  '/:id/complete',
  requireRole('DISPATCHER', 'FLEET_MANAGER'),
  [
    body('final_odometer').isFloat({ min: 0 }).withMessage('Final odometer must be a positive number'),
    body('fuel_consumed').isFloat({ min: 0 }).withMessage('Fuel consumed must be a positive number'),
    body('actual_distance').isFloat({ min: 0 }).withMessage('Actual distance must be a positive number'),
    body('revenue').isFloat({ min: 0 }).withMessage('Revenue must be a positive number'),
  ],
  validate,
  tripController.complete
);

// Cancel — release resources
router.post(
  '/:id/cancel',
  requireRole('DISPATCHER', 'FLEET_MANAGER'),
  tripController.cancel
);

export default router;
