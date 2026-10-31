import { Router } from 'express';
import { syncActivityHandler } from '../controllers/activityController';
import { verifyToken, requireRole } from '../middlewares/authMiddleware';
import { Role } from '@prisma/client';

const router = Router();
router.post('/sync', verifyToken, requireRole([Role.Mobile]), syncActivityHandler);
export default router;
