import { Router } from 'express';
import authRoutes from './auth.routes';
import tenantRoutes from './tenant.routes';
import sportsRoutes from './sports.routes';

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

export default router;
