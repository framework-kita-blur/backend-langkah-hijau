import { Router } from 'express';
import { getGeofencesHandler } from '../controllers/geofenceController';
import { verifyToken, requireRole } from '../middlewares/authMiddleware';
import { Role } from '@prisma/client';

const router = Router();

router.get('/', verifyToken, requireRole([Role.Mobile, Role.Web]), getGeofencesHandler);

export default router;