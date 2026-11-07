import { Router } from 'express';
import { 
    syncActivityBatchHandler,
    getUserActivitiesHandler,
    getActivitySummaryHandler 
} from '../controllers/activityController';
import { verifyToken, requireRole } from '../middlewares/authMiddleware';
import { Role } from '@prisma/client';

const router = Router();

router.post('/sync', verifyToken, requireRole([Role.Mobile]), syncActivityBatchHandler);

router.get('/', verifyToken, requireRole([Role.Mobile]), getUserActivitiesHandler);

router.get('/summary', verifyToken, requireRole([Role.Mobile]), getActivitySummaryHandler);

export default router;
