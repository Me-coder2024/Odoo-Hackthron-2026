import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import * as driverService from '../services/driver.service';
import { sendSuccess, sendCreated, sendError, sendNotFound } from '../utils/response';

export async function getAll(req: AuthenticatedRequest, res: Response) {
  try {
    const { status, search } = req.query;
    const drivers = await driverService.getAllDrivers({
      status: status as any,
      search: search as string,
    });
    sendSuccess(res, drivers);
  } catch (error) {
    sendError(res, 'Failed to fetch drivers', 500);
  }
}

export async function getAvailable(_req: AuthenticatedRequest, res: Response) {
  try {
    const drivers = await driverService.getAvailableDrivers();
    sendSuccess(res, drivers);
  } catch (error) {
    sendError(res, 'Failed to fetch available drivers', 500);
  }
}

export async function getById(req: AuthenticatedRequest, res: Response) {
  try {
    const driver = await driverService.getDriverById(req.params.id as string);
    if (!driver) {
      sendNotFound(res, 'Driver');
      return;
    }
    sendSuccess(res, driver);
  } catch (error) {
    sendError(res, 'Failed to fetch driver', 500);
  }
}

export async function create(req: AuthenticatedRequest, res: Response) {
  try {
    const data = {
      ...req.body,
      license_expiry: new Date(req.body.license_expiry),
    };
    const driver = await driverService.createDriver(data, req.user!.userId);
    sendCreated(res, driver, 'Driver created successfully');
  } catch (error) {
    if (error instanceof Error && error.message.includes('already exists')) {
      sendError(res, error.message, 409);
      return;
    }
    sendError(res, error instanceof Error ? error.message : 'Failed to create driver', 500);
  }
}

export async function update(req: AuthenticatedRequest, res: Response) {
  try {
    const data = { ...req.body };
    if (data.license_expiry) data.license_expiry = new Date(data.license_expiry);

    const driver = await driverService.updateDriver(req.params.id as string, data, req.user!.userId);
    sendSuccess(res, driver, 'Driver updated successfully');
  } catch (error) {
    if (error instanceof Error && error.message === 'Driver not found') {
      sendNotFound(res, 'Driver');
      return;
    }
    sendError(res, error instanceof Error ? error.message : 'Failed to update driver', 500);
  }
}

export async function remove(req: AuthenticatedRequest, res: Response) {
  try {
    const driver = await driverService.deleteDriver(req.params.id as string, req.user!.userId);
    sendSuccess(res, driver, 'Driver deleted successfully');
  } catch (error) {
    if (error instanceof Error && error.message === 'Driver not found') {
      sendNotFound(res, 'Driver');
      return;
    }
    sendError(res, error instanceof Error ? error.message : 'Failed to delete driver', 400);
  }
}
