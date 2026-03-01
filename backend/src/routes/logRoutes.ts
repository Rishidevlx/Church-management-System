import { Router } from 'express';
import { getAllLogs, createLog } from '../controllers/logController';
import { authenticateToken, requireSuperAdmin } from '../middleware/authMiddleware';

const router = Router();

// Protect all log routes
router.use(authenticateToken);

// Only Super Admin can view all logs
router.get('/', requireSuperAdmin, getAllLogs);

// Any authenticated admin can create a log (from their actions)
router.post('/', createLog);

export default router;
