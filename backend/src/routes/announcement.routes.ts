import { Router } from 'express';
import {
  getAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  togglePinAnnouncement,
} from '../controllers/announcement.controller';
import { authenticateToken, optionalAuthenticateToken, requireRoles } from '../middlewares/auth.middleware';

const router = Router();

// Public / Authenticated read routes
router.get('/', optionalAuthenticateToken, getAnnouncements);
router.get('/:id', optionalAuthenticateToken, getAnnouncementById);

// Protected routes (Admin / Teacher / Super Admin only — VULN-03 fix)
router.post('/', authenticateToken, requireRoles('TEACHER', 'ADMIN', 'SUPER_ADMIN'), createAnnouncement);
router.put('/:id', authenticateToken, requireRoles('TEACHER', 'ADMIN', 'SUPER_ADMIN'), updateAnnouncement);
router.delete('/:id', authenticateToken, requireRoles('TEACHER', 'ADMIN', 'SUPER_ADMIN'), deleteAnnouncement);
router.patch('/:id/pin', authenticateToken, requireRoles('TEACHER', 'ADMIN', 'SUPER_ADMIN'), togglePinAnnouncement);

export default router;
