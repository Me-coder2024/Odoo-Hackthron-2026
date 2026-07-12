import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import * as vehicleService from '../services/vehicle.service';
import { sendSuccess, sendCreated, sendError, sendNotFound } from '../utils/response';

export async function getAll(req: AuthenticatedRequest, res: Response) {
  try {
    const { status, type, search } = req.query;
    const vehicles = await vehicleService.getAllVehicles({
      status: status as any,
      type: type as any,
      search: search as string,
    });
    sendSuccess(res, vehicles);
  } catch (error) {
    sendError(res, 'Failed to fetch vehicles', 500);
  }
}

export async function getAvailable(_req: AuthenticatedRequest, res: Response) {
  try {
    const vehicles = await vehicleService.getAvailableVehicles();
    sendSuccess(res, vehicles);
  } catch (error) {
    sendError(res, 'Failed to fetch available vehicles', 500);
  }
}

export async function getById(req: AuthenticatedRequest, res: Response) {
  try {
    const vehicle = await vehicleService.getVehicleById(req.params.id as string);
    if (!vehicle) {
      sendNotFound(res, 'Vehicle');
      return;
    }
    sendSuccess(res, vehicle);
  } catch (error) {
    sendError(res, 'Failed to fetch vehicle', 500);
  }
}

export async function create(req: AuthenticatedRequest, res: Response) {
  try {
    const vehicle = await vehicleService.createVehicle(req.body, req.user!.userId);
    sendCreated(res, vehicle, 'Vehicle created successfully');
  } catch (error) {
    if (error instanceof Error && error.message.includes('already exists')) {
      sendError(res, error.message, 409);
      return;
    }
    sendError(res, error instanceof Error ? error.message : 'Failed to create vehicle', 500);
  }
}

export async function update(req: AuthenticatedRequest, res: Response) {
  try {
    const vehicle = await vehicleService.updateVehicle(req.params.id as string, req.body, req.user!.userId);
    sendSuccess(res, vehicle, 'Vehicle updated successfully');
  } catch (error) {
    if (error instanceof Error && error.message === 'Vehicle not found') {
      sendNotFound(res, 'Vehicle');
      return;
    }
    sendError(res, error instanceof Error ? error.message : 'Failed to update vehicle', 500);
  }
}

export async function remove(req: AuthenticatedRequest, res: Response) {
  try {
    const vehicle = await vehicleService.deleteVehicle(req.params.id as string, req.user!.userId);
    sendSuccess(res, vehicle, 'Vehicle deleted successfully');
  } catch (error) {
    if (error instanceof Error && error.message === 'Vehicle not found') {
      sendNotFound(res, 'Vehicle');
      return;
    }
    sendError(res, error instanceof Error ? error.message : 'Failed to delete vehicle', 400);
  }
}
