import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import * as analyticsService from '../services/analytics.service';
import { sendSuccess, sendError } from '../utils/response';

export async function getKPIs(_req: AuthenticatedRequest, res: Response) {
  try {
    const kpis = await analyticsService.getKPIs();
    sendSuccess(res, kpis);
  } catch (error) {
    sendError(res, 'Failed to fetch KPIs', 500);
  }
}

export async function getFleetUtilization(_req: AuthenticatedRequest, res: Response) {
  try {
    const data = await analyticsService.getFleetUtilization();
    sendSuccess(res, data);
  } catch (error) {
    sendError(res, 'Failed to fetch fleet utilization', 500);
  }
}

export async function getFuelEfficiency(_req: AuthenticatedRequest, res: Response) {
  try {
    const data = await analyticsService.getFuelEfficiency();
    sendSuccess(res, data);
  } catch (error) {
    sendError(res, 'Failed to fetch fuel efficiency', 500);
  }
}

export async function getOperationalCost(_req: AuthenticatedRequest, res: Response) {
  try {
    const data = await analyticsService.getOperationalCost();
    sendSuccess(res, data);
  } catch (error) {
    sendError(res, 'Failed to fetch operational cost', 500);
  }
}

export async function getVehicleROI(_req: AuthenticatedRequest, res: Response) {
  try {
    const data = await analyticsService.getVehicleROI();
    sendSuccess(res, data);
  } catch (error) {
    sendError(res, 'Failed to fetch vehicle ROI', 500);
  }
}

export async function exportCSV(req: AuthenticatedRequest, res: Response) {
  try {
    const type = req.query.type as string;
    if (!type) {
      sendError(res, 'Export type is required (vehicles, trips, fuel-logs, expenses)', 400);
      return;
    }

    const csv = await analyticsService.exportCSV(type);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${type}-export-${Date.now()}.csv`);
    res.send(csv);
  } catch (error) {
    sendError(res, error instanceof Error ? error.message : 'Failed to export CSV', 400);
  }
}
