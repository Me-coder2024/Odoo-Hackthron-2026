import { Router } from 'express';
import { body } from 'express-validator';
import * as expenseController from '../controllers/expense.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';

const router = Router();

router.use(authenticate);

router.get('/', expenseController.getAll);

router.post(
  '/',
  requireRole('FLEET_MANAGER', 'FINANCIAL_ANALYST', 'DISPATCHER'),
  [
    body('vehicle_id').isUUID().withMessage('Valid vehicle ID is required'),
    body('category').isIn(['TOLL', 'PARKING', 'REPAIR', 'OTHER']).withMessage('Invalid expense category'),
    body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
    body('expense_date').isISO8601().withMessage('Valid expense date is required'),
  ],
  validate,
  expenseController.create
);

router.delete(
  '/:id',
  requireRole('FLEET_MANAGER', 'FINANCIAL_ANALYST'),
  expenseController.remove
);

export default router;
