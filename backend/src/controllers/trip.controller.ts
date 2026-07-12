import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import * as tripService from '../services/trip.service';
import { sendSuccess, sendCreated, sendError, sendNotFound } from '../utils/response';

export async function getAll(req: AuthenticatedRequest, res: Response) {
  try {
    const { status, search } = req.query;
    const trips = await tripService.getAllTrips({
      status: status as any,
      search: search as string,
    });
    sendSuccess(res, trips);
  } catch (error) {
    sendError(res, 'Failed to fetch trips', 500);
  }
}

export async function getById(req: AuthenticatedRequest, res: Response) {
  try {
    const trip = await tripService.getTripById(req.params.id as string);
    if (!trip) {
      sendNotFound(res, 'Trip');
      return;
    }
    sendSuccess(res, trip);
  } catch (error) {
    sendError(res, 'Failed to fetch trip', 500);
  }
}

export async function create(req: AuthenticatedRequest, res: Response) {
  try {
    const trip = await tripService.createTrip(req.body, req.user!.userId);
    sendCreated(res, trip, 'Trip created successfully');
  } catch (error) {
    sendError(res, error instanceof Error ? error.message : 'Failed to create trip', 400);
  }
}

export async function update(req: AuthenticatedRequest, res: Response) {
  try {
    const trip = await tripService.updateTrip(req.params.id as string, req.body, req.user!.userId);
    sendSuccess(res, trip, 'Trip updated successfully');
  } catch (error) {
    if (error instanceof Error && error.message === 'Trip not found') {
      sendNotFound(res, 'Trip');
      return;
    }
    sendError(res, error instanceof Error ? error.message : 'Failed to update trip', 400);
  }
}

export async function dispatch(req: AuthenticatedRequest, res: Response) {
  try {
    const trip = await tripService.dispatchTrip(req.params.id as string, req.user!.userId);
    sendSuccess(res, trip, 'Trip dispatched successfully');
  } catch (error) {
    sendError(res, error instanceof Error ? error.message : 'Failed to dispatch trip', 400);
  }
}

export async function complete(req: AuthenticatedRequest, res: Response) {
  try {
    const trip = await tripService.completeTrip(req.params.id as string, req.body, req.user!.userId);
    sendSuccess(res, trip, 'Trip completed successfully');
  } catch (error) {
    sendError(res, error instanceof Error ? error.message : 'Failed to complete trip', 400);
  }
}

export async function cancel(req: AuthenticatedRequest, res: Response) {
  try {
    const trip = await tripService.cancelTrip(req.params.id as string, req.user!.userId);
    sendSuccess(res, trip, 'Trip cancelled successfully');
  } catch (error) {
    sendError(res, error instanceof Error ? error.message : 'Failed to cancel trip', 400);
  }
}
