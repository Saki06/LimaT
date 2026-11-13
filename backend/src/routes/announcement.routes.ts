import { Router } from 'express';
import {
  getAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  togglePinAnnouncement,
} from '../controllers/announcement.controller';
import { authenticateToken, optionalAuthenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// Public / Authenticated read routes
router.get('/', optionalAuthenticateToken, getAnnouncements);
router.get('/:id', optionalAuthenticateToken, getAnnouncementById);

// Protected routes (Admin / Teacher / Directorate)
router.post('/', authenticateToken, createAnnouncement);
router.put('/:id', authenticateToken, updateAnnouncement);
router.delete('/:id', authenticateToken, deleteAnnouncement);
router.patch('/:id/pin', authenticateToken, togglePinAnnouncement);

export default router;
