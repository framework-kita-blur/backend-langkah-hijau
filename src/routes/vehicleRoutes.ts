import { Router } from 'express';
import {
    getVehiclesHandler,
    createVehicleHandler,
    updateVehicleHandler,
    deleteVehicleHandler
} from '../controllers/vehicleController';
import { verifyToken, requireRole } from '../middlewares/authMiddleware';
import { Role } from '@prisma/client';

const router = Router();

router.get('/', verifyToken, requireRole([Role.Mobile]), getVehiclesHandler);
router.post('/', verifyToken, requireRole([Role.Mobile]), createVehicleHandler);
router.put('/:id', verifyToken, requireRole([Role.Mobile]), updateVehicleHandler);
router.delete('/:id', verifyToken, requireRole([Role.Mobile]), deleteVehicleHandler);

export default router;