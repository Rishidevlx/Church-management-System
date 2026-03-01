import { Router } from 'express';
import { createAdmin, getAllAdmins, updateAdminStatus, updateAdmin, deleteAdmin } from '../controllers/adminController';
import { authenticateToken, requireSuperAdmin } from '../middleware/authMiddleware';

const router = Router();

// Only Super Admin can create or update admins
router.post('/create', authenticateToken, requireSuperAdmin, createAdmin);
router.put('/:id/status', authenticateToken, requireSuperAdmin, updateAdminStatus);
router.put('/:id', authenticateToken, requireSuperAdmin, updateAdmin);
router.delete('/:id', authenticateToken, requireSuperAdmin, deleteAdmin);

// Any authenticated user might need to see the list (or restrict to Super Admin if preferred)
// Here, we restrict to Super Admin for viewing all admins
router.get('/', authenticateToken, requireSuperAdmin, getAllAdmins);

export default router;
