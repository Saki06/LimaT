import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import apiRoutes from './routes';

const app = express();

// HTTP Security Headers & X-Powered-By removal (VULN-09 fix)
app.disable('x-powered-by');
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc:
          config.nodeEnv === 'production'
            ? ["'self'", config.frontendUrl, 'https:']
            : ["'self'", 'http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5000', 'https:'],
        frameAncestors: ["'self'"],
        objectSrc: ["'none'"],
      },
    },
    frameguard: { action: 'sameorigin' },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Security and CORS middleware (VULN-05 fix: explicit origin allowlist, never reflect untrusted origins)
const isProduction = config.nodeEnv === 'production';

const extraAllowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

// Reject wildcard and localhost in production CORS
if (isProduction) {
  if (extraAllowedOrigins.includes('*') || extraAllowedOrigins.includes("'*'")) {
    throw new Error(
      'FATAL CONFIGURATION ERROR: Wildcard origin ("*") is strictly prohibited in production CORS.'
    );
  }
  const hasLocalhost = extraAllowedOrigins.some(
    (origin) =>
      origin.includes('localhost') ||
      origin.includes('127.0.0.1') ||
      origin.includes('0.0.0.0') ||
      origin.includes('::1')
  );
  if (hasLocalhost) {
    throw new Error(
      'FATAL CONFIGURATION ERROR: Localhost origins are strictly prohibited in production CORS_ALLOWED_ORIGINS.'
    );
  }
}

// Preserve localhost origins only in local development / test environments
const localDevOrigins = isProduction
  ? []
  : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5000'];

const allowedOrigins = new Set(
  [
    config.frontendUrl,
    ...localDevOrigins,
    ...extraAllowedOrigins,
  ].filter(Boolean)
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser / server-to-server requests without Origin header, or explicitly allowlisted origins
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
  })
);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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

// Server start (skip app.listen on Vercel serverless)
if (!process.env.VERCEL) {
  app.listen(config.port, () => {
    console.log(`🚀 LMS Backend Server running on http://localhost:${config.port}`);
    console.log(`📊 Health check available at http://localhost:${config.port}/api/health`);
    console.log(`🔒 Environment: ${config.nodeEnv}`);
  });
}

export default app;
