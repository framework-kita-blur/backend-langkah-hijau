import { Router } from 'express';
import { getEmissionSummaryHandler } from '../controllers/dashboardController';
import { verifyToken, requireRole } from '../middlewares/authMiddleware';
import { Role } from '@prisma/client';

const router = Router();
router.get('/summary', verifyToken, requireRole([Role.Web]), getEmissionSummaryHandler);
export default router;