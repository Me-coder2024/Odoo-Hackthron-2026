import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import * as fuelService from '../services/fuel.service';
import { sendSuccess, sendCreated, sendError } from '../utils/response';

export async function getAll(req: AuthenticatedRequest, res: Response) {
  try {
    const { vehicle_id, trip_id } = req.query;
    const logs = await fuelService.getAllFuelLogs({
      vehicle_id: vehicle_id as string,
      trip_id: trip_id as string,
    });
    sendSuccess(res, logs);
  } catch (error) {
    sendError(res, 'Failed to fetch fuel logs', 500);
  }
}

export async function create(req: AuthenticatedRequest, res: Response) {
  try {
    const data = {
      ...req.body,
      log_date: new Date(req.body.log_date),
    };
    const log = await fuelService.createFuelLog(data, req.user!.userId);
    sendCreated(res, log, 'Fuel log created');
  } catch (error) {
    sendError(res, error instanceof Error ? error.message : 'Failed to create fuel log', 400);
  }
}
