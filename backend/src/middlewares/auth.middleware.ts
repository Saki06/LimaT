import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { prisma } from '../config/prisma';

export interface AuthUserPayload {
  userId: string;
  email: string;
  role: 'STUDENT' | 'TEACHER' | 'PARENT' | 'ADMIN' | 'SUPER_ADMIN';
  tenantId: string | null;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUserPayload;
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.',
    });
    return;
  }

  try {
    const decoded = jwt.verify(
      token,
      config.jwtSecret
    ) as AuthUserPayload;

    if (!decoded.userId) {
      res.status(401).json({
        success: false,
        message: 'Invalid token payload.',
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        tenantId: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      res.status(403).json({
        success: false,
        message: 'Account is inactive or does not exist.',
      });
      return;
    }

    // Only global Super Admin can operate without a tenant
if (!user.tenantId && user.role !== 'SUPER_ADMIN') {
  res.status(403).json({
    success: false,
    message: 'Your account is not assigned to an organization.',
  });
  return;
}

    // Block access for users belonging to suspended or inactive tenants
if (user.tenantId) {
  const tenant = await prisma.tenant.findUnique({
    where: { id: user.tenantId },
    select: { status: true },
  });

  if (!tenant || tenant.status === 'SUSPENDED' || tenant.status === 'INACTIVE') {
    res.status(403).json({
      success: false,
      message: 'Your organization is currently inactive or suspended.',
    });
    return;
  }
}

    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(403).json({
        success: false,
        message: 'Invalid or expired token.',
      });
      return;
    }

    console.error('Authentication error:', error);

    res.status(500).json({
      success: false,
      message: 'Authentication service error.',
    });
  }
};

export const optionalAuthenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  if (!token) {
    next();
    return;
  }

  try {
    const decoded = jwt.verify(
      token,
      config.jwtSecret
    ) as AuthUserPayload;

    if (!decoded.userId) {
      next();
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        tenantId: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      next();
      return;
    }

    // Only global Super Admin can operate without a tenant
if (!user.tenantId && user.role !== 'SUPER_ADMIN') {
  res.status(403).json({
    success: false,
    message: 'Your account is not assigned to an organization.',
  });
  return;
}

    // Block suspended or inactive tenant users
if (user.tenantId) {
  const tenant = await prisma.tenant.findUnique({
    where: { id: user.tenantId },
    select: { status: true },
  });

  if (
    !tenant ||
    tenant.status === 'SUSPENDED' ||
    tenant.status === 'INACTIVE'
  ) {
    res.status(403).json({
      success: false,
      message: 'Your organization is currently inactive or suspended.',
    });
    return;
  }
}

    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };

    next();
  } catch (error) {
    // Invalid token: continue as guest.
    // Database errors: pass to Express error handler.
    if (error instanceof jwt.JsonWebTokenError) {
      next();
      return;
    }

    next(error);
  }
};

export const requireRoles = (...allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Forbidden: requires one of [${allowedRoles.join(', ')}] role`,
      });
      return;
    }

    next();
  };
};
