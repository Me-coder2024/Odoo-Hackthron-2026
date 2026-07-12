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
    body('license_number').matches(/^[A-Z]{2}-\d{2,4}-\d{4,8}$/i).withMessage('License number must be in standard format (e.g. DL-2020-001234)'),
    body('license_category').notEmpty().withMessage('License category is required'),
    body('license_expiry').isISO8601().withMessage('Valid license expiry date is required'),
    body('contact_number').matches(/^[0-9]{10}$/).withMessage('Phone number must be exactly 10 digits'),
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
