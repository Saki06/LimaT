import { Router } from 'express';
import authRoutes from './auth.routes';
import tenantRoutes from './tenant.routes';
import sportsRoutes from './sports.routes';
import courseRoutes from './course.routes';
import packageRoutes from './package.routes';
import liveClassRoutes from './liveClass.routes';
import assignmentRoutes from './assignment.routes';
import resourceRoutes from './resource.routes';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'LMS Enterprise Backend API',
    version: '1.0.0',
  });
});

// Mounted sub-routes
router.use('/auth', authRoutes);
router.use('/tenants', tenantRoutes);
router.use('/sports', sportsRoutes);
router.use('/courses', courseRoutes);
router.use('/packages', packageRoutes);
router.use('/live-classes', liveClassRoutes);
router.use('/assignments', assignmentRoutes);
router.use('/resources', resourceRoutes);

export default router;
