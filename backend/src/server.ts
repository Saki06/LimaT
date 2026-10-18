import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { config } from './config';
import apiRoutes from './routes';

const app = express();

// Security and CORS middleware
app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
  })
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root welcome
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Welcome to LMS Enterprise REST API',
    documentation: '/api/health',
    status: 'online',
  });
});

// API Routes
app.use('/api', apiRoutes);

// Centralized 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `API Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized Error Handling Middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: config.nodeEnv === 'development' ? err : undefined,
  });
});

// Server start
app.listen(config.port, () => {
  console.log(`🚀 LMS Backend Server running on http://localhost:${config.port}`);
  console.log(`📊 Health check available at http://localhost:${config.port}/api/health`);
  console.log(`🔒 Environment: ${config.nodeEnv}`);
});

export default app;
