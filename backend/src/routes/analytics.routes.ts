import { Router } from 'express';
import * as analyticsController from '../controllers/analytics.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/kpis', analyticsController.getKPIs);
router.get('/fleet-utilization', analyticsController.getFleetUtilization);
router.get('/fuel-efficiency', analyticsController.getFuelEfficiency);
router.get('/operational-cost', analyticsController.getOperationalCost);
router.get('/vehicle-roi', analyticsController.getVehicleROI);
router.get('/export-csv', analyticsController.exportCSV);

export default router;
