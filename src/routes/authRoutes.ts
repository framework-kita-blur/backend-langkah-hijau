import { Router } from 'express';
import { 
    registerHandler,
    loginHandler,
    getMeHandler,
    updatePasswordHandler 
} from '../controllers/authController';
import { verifyToken } from '../middlewares/authMiddleware';

const router = Router();

router.post('/register', registerHandler);
router.post('/login', loginHandler);
router.get('/me', getMeHandler);
router.put('/password', verifyToken, updatePasswordHandler);

export default router;