import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import * as maintenanceService from '../services/maintenance.service';
import { sendSuccess, sendCreated, sendError, sendNotFound } from '../utils/response';

export async function getAll(req: AuthenticatedRequest, res: Response) {
  try {
    const { status, vehicle_id } = req.query;
    const logs = await maintenanceService.getAllMaintenance({
      status: status as any,
      vehicle_id: vehicle_id as string,
    });
    sendSuccess(res, logs);
  } catch (error) {
    sendError(res, 'Failed to fetch maintenance logs', 500);
  }
}

export async function getById(req: AuthenticatedRequest, res: Response) {
  try {
    const log = await maintenanceService.getMaintenanceById(req.params.id as string);
    if (!log) {
      sendNotFound(res, 'Maintenance log');
      return;
    }
    sendSuccess(res, log);
  } catch (error) {
    sendError(res, 'Failed to fetch maintenance log', 500);
  }
}

export async function create(req: AuthenticatedRequest, res: Response) {
  try {
    const log = await maintenanceService.createMaintenance(req.body, req.user!.userId);
    sendCreated(res, log, 'Maintenance log created. Vehicle moved to IN_SHOP.');
  } catch (error) {
    sendError(res, error instanceof Error ? error.message : 'Failed to create maintenance log', 400);
  }
}

export async function update(req: AuthenticatedRequest, res: Response) {
  try {
    const log = await maintenanceService.updateMaintenance(req.params.id as string, req.body, req.user!.userId);
    sendSuccess(res, log, 'Maintenance log updated');
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      sendNotFound(res, 'Maintenance log');
      return;
    }
    sendError(res, error instanceof Error ? error.message : 'Failed to update maintenance log', 400);
  }
}

export async function close(req: AuthenticatedRequest, res: Response) {
  try {
    const log = await maintenanceService.closeMaintenance(req.params.id as string, req.user!.userId);
    sendSuccess(res, log, 'Maintenance closed. Vehicle restored to AVAILABLE.');
  } catch (error) {
    sendError(res, error instanceof Error ? error.message : 'Failed to close maintenance', 400);
  }
}

export async function addItem(req: AuthenticatedRequest, res: Response) {
  try {
    const item = await maintenanceService.addMaintenanceItem(req.params.id as string, req.body, req.user!.userId);
    sendCreated(res, item, 'Maintenance item added');
  } catch (error) {
    sendError(res, error instanceof Error ? error.message : 'Failed to add maintenance item', 400);
  }
}
