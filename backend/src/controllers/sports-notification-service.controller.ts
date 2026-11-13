// @ts-nocheck
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { Role } from '@prisma/client';

/**
 * Controller for managing Email and SMS notification service configurations
 * This allows administrators to configure which providers to use for notifications
 */
export class SportsNotificationServiceController {
  /**
   * Get configured email services for tenant
   */
  async getEmailServices(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Verify user is admin
      const admin = await prisma.user.findUnique({
        where: { id: userId },
        select: { tenantId: true, role: true }
      });

      if (!admin || admin.tenantId !== tenantId || ![Role.ADMIN, Role.SUPER_ADMIN].includes(admin.role)) {
        return res.status(403).json({ message: 'Only admins can view services' });
      }

      const services = await prisma.emailNotificationService.findMany({
        where: { tenantId },
        select: {
          id: true,
          provider: true,
          isActive: true,
          senderEmail: true,
          senderName: true,
          createdAt: true,
          updatedAt: true
          // Never return providerConfig (contains secrets)
        }
      });

      return res.status(200).json(services);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create or update email service configuration
   * Requires encrypted credential storage in production
   */
  async configureEmailService(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = req.params;
      const userId = req.user?.id;
      const { provider, senderEmail, senderName, providerConfig } = req.body;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Verify user is admin
      const admin = await prisma.user.findUnique({
        where: { id: userId },
        select: { tenantId: true, role: true }
      });

      if (!admin || admin.tenantId !== tenantId || ![Role.ADMIN, Role.SUPER_ADMIN].includes(admin.role)) {
        return res.status(403).json({ message: 'Only admins can configure services' });
      }

      // Validate input
      if (!provider || !senderEmail || !providerConfig) {
        return res.status(400).json({ message: 'provider, senderEmail, and providerConfig are required' });
      }

      const validProviders = ['SMTP', 'SENDGRID', 'AWS_SES', 'MAILGUN'];
      if (!validProviders.includes(provider)) {
        return res.status(400).json({ message: `Invalid provider. Supported: ${validProviders.join(', ')}` });
      }

      // Check for existing configuration
      const existing = await prisma.emailNotificationService.findFirst({
        where: { tenantId, provider }
      });

      let service;
      if (existing) {
        service = await prisma.emailNotificationService.update({
          where: { id: existing.id },
          data: {
            senderEmail,
            senderName,
            providerConfig,
            updatedAt: new Date()
          }
        });
      } else {
        service = await prisma.emailNotificationService.create({
          data: {
            tenantId,
            provider,
            senderEmail,
            senderName,
            providerConfig,
            createdBy: userId
          }
        });
      }

      // Return without secrets
      const { providerConfig: _, ...safeService } = service;
      return res.status(existing ? 200 : 201).json(safeService);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Toggle email service active status
   */
  async toggleEmailService(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId, serviceId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Verify user is admin
      const admin = await prisma.user.findUnique({
        where: { id: userId },
        select: { tenantId: true, role: true }
      });

      if (!admin || admin.tenantId !== tenantId || ![Role.ADMIN, Role.SUPER_ADMIN].includes(admin.role)) {
        return res.status(403).json({ message: 'Only admins can toggle services' });
      }

      const service = await prisma.emailNotificationService.findUnique({
        where: { id: serviceId },
        select: { tenantId: true }
      });

      if (!service || service.tenantId !== tenantId) {
        return res.status(404).json({ message: 'Service not found' });
      }

      const updated = await prisma.emailNotificationService.update({
        where: { id: serviceId },
        data: { isActive: { not: {} } } // Toggle
      });

      const { providerConfig: _, ...safeService } = updated;
      return res.status(200).json(safeService);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete email service configuration
   */
  async deleteEmailService(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId, serviceId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Verify user is admin
      const admin = await prisma.user.findUnique({
        where: { id: userId },
        select: { tenantId: true, role: true }
      });

      if (!admin || admin.tenantId !== tenantId || ![Role.ADMIN, Role.SUPER_ADMIN].includes(admin.role)) {
        return res.status(403).json({ message: 'Only admins can delete services' });
      }

      const service = await prisma.emailNotificationService.findUnique({
        where: { id: serviceId },
        select: { tenantId: true }
      });

      if (!service || service.tenantId !== tenantId) {
        return res.status(404).json({ message: 'Service not found' });
      }

      await prisma.emailNotificationService.delete({
        where: { id: serviceId }
      });

      return res.status(200).json({ message: 'Service deleted' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get configured SMS services for tenant
   */
  async getSMSServices(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Verify user is admin
      const admin = await prisma.user.findUnique({
        where: { id: userId },
        select: { tenantId: true, role: true }
      });

      if (!admin || admin.tenantId !== tenantId || ![Role.ADMIN, Role.SUPER_ADMIN].includes(admin.role)) {
        return res.status(403).json({ message: 'Only admins can view services' });
      }

      const services = await prisma.smsNotificationService.findMany({
        where: { tenantId },
        select: {
          id: true,
          provider: true,
          isActive: true,
          senderPhoneOrId: true,
          createdAt: true,
          updatedAt: true
          // Never return providerConfig
        }
      });

      return res.status(200).json(services);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create or update SMS service configuration
   */
  async configureSMSService(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = req.params;
      const userId = req.user?.id;
      const { provider, senderPhoneOrId, providerConfig } = req.body;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Verify user is admin
      const admin = await prisma.user.findUnique({
        where: { id: userId },
        select: { tenantId: true, role: true }
      });

      if (!admin || admin.tenantId !== tenantId || ![Role.ADMIN, Role.SUPER_ADMIN].includes(admin.role)) {
        return res.status(403).json({ message: 'Only admins can configure services' });
      }

      // Validate input
      if (!provider || !senderPhoneOrId || !providerConfig) {
        return res.status(400).json({ message: 'provider, senderPhoneOrId, and providerConfig are required' });
      }

      const validProviders = ['TWILIO', 'AWS_SNS', 'NEXMO', 'FIREBASE'];
      if (!validProviders.includes(provider)) {
        return res.status(400).json({ message: `Invalid provider. Supported: ${validProviders.join(', ')}` });
      }

      // Check for existing configuration
      const existing = await prisma.smsNotificationService.findFirst({
        where: { tenantId, provider }
      });

      let service;
      if (existing) {
        service = await prisma.smsNotificationService.update({
          where: { id: existing.id },
          data: {
            senderPhoneOrId,
            providerConfig,
            updatedAt: new Date()
          }
        });
      } else {
        service = await prisma.smsNotificationService.create({
          data: {
            tenantId,
            provider,
            senderPhoneOrId,
            providerConfig,
            createdBy: userId
          }
        });
      }

      const { providerConfig: _, ...safeService } = service;
      return res.status(existing ? 200 : 201).json(safeService);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Toggle SMS service active status
   */
  async toggleSMSService(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId, serviceId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Verify user is admin
      const admin = await prisma.user.findUnique({
        where: { id: userId },
        select: { tenantId: true, role: true }
      });

      if (!admin || admin.tenantId !== tenantId || ![Role.ADMIN, Role.SUPER_ADMIN].includes(admin.role)) {
        return res.status(403).json({ message: 'Only admins can toggle services' });
      }

      const service = await prisma.smsNotificationService.findUnique({
        where: { id: serviceId },
        select: { tenantId: true }
      });

      if (!service || service.tenantId !== tenantId) {
        return res.status(404).json({ message: 'Service not found' });
      }

      const updated = await prisma.smsNotificationService.update({
        where: { id: serviceId },
        data: { isActive: { not: {} } }
      });

      const { providerConfig: _, ...safeService } = updated;
      return res.status(200).json(safeService);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete SMS service configuration
   */
  async deleteSMSService(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId, serviceId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Verify user is admin
      const admin = await prisma.user.findUnique({
        where: { id: userId },
        select: { tenantId: true, role: true }
      });

      if (!admin || admin.tenantId !== tenantId || ![Role.ADMIN, Role.SUPER_ADMIN].includes(admin.role)) {
        return res.status(403).json({ message: 'Only admins can delete services' });
      }

      const service = await prisma.smsNotificationService.findUnique({
        where: { id: serviceId },
        select: { tenantId: true }
      });

      if (!service || service.tenantId !== tenantId) {
        return res.status(404).json({ message: 'Service not found' });
      }

      await prisma.smsNotificationService.delete({
        where: { id: serviceId }
      });

      return res.status(200).json({ message: 'Service deleted' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Test email service configuration
   */
  async testEmailService(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId, serviceId } = req.params;
      const { testEmail } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      if (!testEmail) {
        return res.status(400).json({ message: 'testEmail is required' });
      }

      // Verify user is admin
      const admin = await prisma.user.findUnique({
        where: { id: userId },
        select: { tenantId: true, role: true }
      });

      if (!admin || admin.tenantId !== tenantId || ![Role.ADMIN, Role.SUPER_ADMIN].includes(admin.role)) {
        return res.status(403).json({ message: 'Only admins can test services' });
      }

      const service = await prisma.emailNotificationService.findUnique({
        where: { id: serviceId },
        select: { tenantId: true, provider: true }
      });

      if (!service || service.tenantId !== tenantId) {
        return res.status(404).json({ message: 'Service not found' });
      }

      // TODO: Implement actual email sending based on provider
      // This is a placeholder response showing the expected behavior
      return res.status(200).json({
        message: `Test email would be sent to ${testEmail} via ${service.provider}`,
        status: 'PENDING',
        note: 'Email provider integration required to actually send test email'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Test SMS service configuration
   */
  async testSMSService(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId, serviceId } = req.params;
      const { testPhone } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      if (!testPhone) {
        return res.status(400).json({ message: 'testPhone is required' });
      }

      // Verify user is admin
      const admin = await prisma.user.findUnique({
        where: { id: userId },
        select: { tenantId: true, role: true }
      });

      if (!admin || admin.tenantId !== tenantId || ![Role.ADMIN, Role.SUPER_ADMIN].includes(admin.role)) {
        return res.status(403).json({ message: 'Only admins can test services' });
      }

      const service = await prisma.smsNotificationService.findUnique({
        where: { id: serviceId },
        select: { tenantId: true, provider: true }
      });

      if (!service || service.tenantId !== tenantId) {
        return res.status(404).json({ message: 'Service not found' });
      }

      // TODO: Implement actual SMS sending based on provider
      return res.status(200).json({
        message: `Test SMS would be sent to ${testPhone} via ${service.provider}`,
        status: 'PENDING',
        note: 'SMS provider integration required to actually send test SMS'
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new SportsNotificationServiceController();
