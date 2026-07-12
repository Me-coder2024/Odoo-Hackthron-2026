import { Router } from 'express';
import { body } from 'express-validator';
import * as driverController from '../controllers/driver.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';

const router = Router();

router.use(authenticate);

router.get('/', driverController.getAll);
router.get('/available', driverController.getAvailable);
router.get('/:id', driverController.getById);

router.post(
  '/',
  requireRole('FLEET_MANAGER', 'SAFETY_OFFICER'),
  [
    body('name').notEmpty().withMessage('Driver name is required'),
    body('license_number').notEmpty().withMessage('License number is required'),
    body('license_category').notEmpty().withMessage('License category is required'),
    body('license_expiry').isISO8601().withMessage('Valid license expiry date is required'),
  ],
  validate,
  driverController.create
);

router.patch(
  '/:id',
  requireRole('FLEET_MANAGER', 'SAFETY_OFFICER'),
  driverController.update
);

router.delete(
  '/:id',
  requireRole('FLEET_MANAGER', 'SAFETY_OFFICER'),
  driverController.remove
);

export default router;
