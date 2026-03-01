import { Router } from 'express';
import { getAllMembers, createMember, updateMember, deleteMember } from '../controllers/memberController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Protect all member routes with JWT
router.use(authenticateToken);

router.get('/', getAllMembers);
router.post('/', createMember);
router.put('/:id', updateMember);
router.delete('/:id', deleteMember);

export default router;
