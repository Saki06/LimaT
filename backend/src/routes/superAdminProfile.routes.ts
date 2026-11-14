
import { Router } from 'express';
import {
  getSuperAdminProfile,
  updateSuperAdminProfile,
} from '../controllers/superAdminProfile.controller';
import {
  authenticateToken,
  requireRoles,
} from '../middlewares/auth.middleware';
import {
  getTenantStatistics,
  getMonthlySaasMrr,
  getStudentStatistics,
} from '../controllers/superAdminStatistics.controller';

import { uploadSuperAdminAvatar } from '../middlewares/avatarUpload.middleware';
import {
  uploadSuperAdminAvatarController,
  getSuperAdminAvatarController,
  removeSuperAdminAvatarController,
} from '../controllers/superAdminAvatar.controller';
import multer from 'multer';

const router = Router();

router.use(authenticateToken);
router.use(requireRoles('SUPER_ADMIN'));

router.get('/profile', getSuperAdminProfile);
router.patch('/profile', updateSuperAdminProfile);
router.get('/statistics/tenants', getTenantStatistics);
router.get('/statistics/mrr', getMonthlySaasMrr);
router.get('/statistics/students', getStudentStatistics);


router.post(
  '/profile/avatar',
  (req, res, next) => {
    uploadSuperAdminAvatar(req, res, (error: unknown) => {
      if (error instanceof multer.MulterError) {
        res.status(400).json({
          success: false,
          message:
            error.code === 'LIMIT_FILE_SIZE'
              ? 'Profile picture must be 2 MB or smaller'
              : 'Invalid profile picture upload',
        });
        return;
      }

      if (error) {
        res.status(400).json({
          success: false,
          message: 'Invalid image. Only JPG, PNG and WebP are allowed.',
        });
        return;
      }

      next();
    });
  },
  uploadSuperAdminAvatarController
);

router.get(
  '/avatars/:filename',
  getSuperAdminAvatarController
);


router.delete(
  '/profile/avatar',
  removeSuperAdminAvatarController
);

export default router;
