import prisma from '../models/prisma';
import { ExpenseCategory } from '@prisma/client';
import { createAuditLog } from './audit.service';

interface CreateExpenseInput {
  vehicle_id: string;
  trip_id?: string;
  category: ExpenseCategory;
  description?: string;
  amount: number;
  expense_date: Date;
}

export async function getAllExpenses(filters?: { vehicle_id?: string; category?: ExpenseCategory }) {
  const where: Record<string, unknown> = {};
  if (filters?.vehicle_id) where.vehicle_id = filters.vehicle_id;
  if (filters?.category) where.category = filters.category;

  return prisma.expense.findMany({
    where,
    orderBy: { expense_date: 'desc' },
    include: {
      vehicle: { select: { id: true, name: true, registration_number: true } },
      trip: { select: { id: true, trip_number: true } },
      creator: { select: { username: true } },
    },
  });
}

export async function createExpense(input: CreateExpenseInput, userId: string) {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: input.vehicle_id } });
  if (!vehicle) throw new Error('Vehicle not found');

  const expense = await prisma.expense.create({
    data: {
      vehicle_id: input.vehicle_id,
      trip_id: input.trip_id || null,
      category: input.category,
      description: input.description,
      amount: input.amount,
      expense_date: input.expense_date,
      created_by: userId,
    },
    include: {
      vehicle: { select: { name: true, registration_number: true } },
      trip: { select: { trip_number: true } },
    },
  });

  await createAuditLog({
    userId,
    action: 'CREATE',
    entity: 'Expense',
    entityId: expense.id,
    newValue: expense,
  });

  return expense;
}

export async function deleteExpense(id: string, userId: string) {
  const existing = await prisma.expense.findUnique({ where: { id } });
  if (!existing) throw new Error('Expense not found');

  await prisma.expense.delete({ where: { id } });

  await createAuditLog({
    userId,
    action: 'DELETE',
    entity: 'Expense',
    entityId: id,
    oldValue: existing,
  });

  return existing;
}
