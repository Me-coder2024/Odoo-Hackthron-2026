import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import * as expenseService from '../services/expense.service';
import { sendSuccess, sendCreated, sendError, sendNotFound } from '../utils/response';

export async function getAll(req: AuthenticatedRequest, res: Response) {
  try {
    const { vehicle_id, category } = req.query;
    const expenses = await expenseService.getAllExpenses({
      vehicle_id: vehicle_id as string,
      category: category as any,
    });
    sendSuccess(res, expenses);
  } catch (error) {
    sendError(res, 'Failed to fetch expenses', 500);
  }
}

export async function create(req: AuthenticatedRequest, res: Response) {
  try {
    const data = {
      ...req.body,
      expense_date: new Date(req.body.expense_date),
    };
    const expense = await expenseService.createExpense(data, req.user!.userId);
    sendCreated(res, expense, 'Expense created');
  } catch (error) {
    sendError(res, error instanceof Error ? error.message : 'Failed to create expense', 400);
  }
}

export async function remove(req: AuthenticatedRequest, res: Response) {
  try {
    const expense = await expenseService.deleteExpense(req.params.id as string, req.user!.userId);
    sendSuccess(res, expense, 'Expense deleted');
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      sendNotFound(res, 'Expense');
      return;
    }
    sendError(res, error instanceof Error ? error.message : 'Failed to delete expense', 400);
  }
}
