// @ts-nocheck
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { Role } from '@prisma/client';

export class SportsNotificationController {
  /**
   * Get all notifications for the current user
   */
  async getUserNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = req.params;
      const userId = req.user?.id;
      const { read, type, limit = '20', offset = '0' } = req.query;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Verify user belongs to tenant
      const userTenant = await prisma.user.findUnique({
        where: { id: userId },
        select: { tenantId: true, role: true }
      });

      if (!userTenant || userTenant.tenantId !== tenantId) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      const where: any = {
        tenantId,
        recipientId: userId
      };

      if (read !== undefined) {
        where.read = read === 'true';
      }

      if (type) {
        where.type = type;
      }

      const notifications = await prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit as string),
        skip: parseInt(offset as string),
        select: {
          id: true,
          type: true,
          title: true,
          message: true,
          relatedEntityId: true,
          relatedEntityType: true,
          read: true,
          readAt: true,
          actionUrl: true,
          sentVia: true,
          createdAt: true
        }
      });

      const total = await prisma.notification.count({ where });

      return res.status(200).json({
        data: notifications,
        pagination: {
          total,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId, notificationId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const notification = await prisma.notification.findUnique({
        where: { id: notificationId },
        select: { tenantId: true, recipientId: true }
      });

      if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
      }

      if (notification.tenantId !== tenantId || notification.recipientId !== userId) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      const updated = await prisma.notification.update({
        where: { id: notificationId },
        data: {
          read: true,
          readAt: new Date()
        }
      });

      return res.status(200).json(updated);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark multiple notifications as read
   */
  async markMultipleAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = req.params;
      const userId = req.user?.id;
      const { notificationIds } = req.body;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
        return res.status(400).json({ message: 'notificationIds array required' });
      }

      // Verify all notifications belong to user and tenant
      const notifications = await prisma.notification.findMany({
        where: {
          id: { in: notificationIds },
          tenantId,
          recipientId: userId
        }
      });

      if (notifications.length !== notificationIds.length) {
        return res.status(403).json({ message: 'Some notifications are not accessible' });
      }

      const updated = await prisma.notification.updateMany({
        where: {
          id: { in: notificationIds }
        },
        data: {
          read: true,
          readAt: new Date()
        }
      });

      return res.status(200).json({
        message: `Marked ${updated.count} notifications as read`,
        count: updated.count
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId, notificationId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const notification = await prisma.notification.findUnique({
        where: { id: notificationId },
        select: { tenantId: true, recipientId: true }
      });

      if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
      }

      if (notification.tenantId !== tenantId || notification.recipientId !== userId) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      await prisma.notification.delete({
        where: { id: notificationId }
      });

      return res.status(200).json({ message: 'Notification deleted' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const userTenant = await prisma.user.findUnique({
        where: { id: userId },
        select: { tenantId: true }
      });

      if (!userTenant || userTenant.tenantId !== tenantId) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      const unreadCount = await prisma.notification.count({
        where: {
          tenantId,
          recipientId: userId,
          read: false
        }
      });

      return res.status(200).json({ unreadCount });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Create and send notification to user(s)
   */
  async sendNotification(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = req.params;
      const { recipientIds, type, title, message, relatedEntityId, relatedEntityType, actionUrl } = req.body;
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
        return res.status(403).json({ message: 'Only admins can send notifications' });
      }

      // Validate input
      if (!Array.isArray(recipientIds) || recipientIds.length === 0) {
        return res.status(400).json({ message: 'recipientIds array required' });
      }

      if (!type || !title || !message) {
        return res.status(400).json({ message: 'type, title, and message are required' });
      }

      // Verify recipients belong to tenant
      const recipients = await prisma.user.findMany({
        where: {
          id: { in: recipientIds },
          tenantId
        },
        select: { id: true }
      });

      if (recipients.length !== recipientIds.length) {
        return res.status(400).json({ message: 'Some recipients not found or do not belong to tenant' });
      }

      // Create notifications
      const notifications = await prisma.notification.createMany({
        data: recipientIds.map((recipientId: string) => ({
          tenantId,
          recipientId,
          type,
          title,
          message,
          relatedEntityId,
          relatedEntityType,
          actionUrl,
          sentVia: 'IN_APP'
        }))
      });

      return res.status(201).json({
        message: `Sent ${notifications.count} notifications`,
        count: notifications.count
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Send registration confirmation notification
   */
  async sendRegistrationConfirmation(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId, registrationId } = req.params;

      const registration = await prisma.sportsRegistration.findUnique({
        where: { id: registrationId },
        select: {
          id: true,
          userId: true,
          sportEventId: true,
          tenantId: true,
          user: { select: { firstName: true } },
          sportEvent: { select: { name: true } }
        }
      });

      if (!registration) {
        return res.status(404).json({ message: 'Registration not found' });
      }

      if (registration.tenantId !== tenantId) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      // Create notification
      const notification = await prisma.notification.create({
        data: {
          tenantId,
          recipientId: registration.userId,
          type: 'REGISTRATION_CONFIRMATION',
          title: 'Registration Confirmed',
          message: `Your registration for ${registration.sportEvent.name} has been confirmed`,
          relatedEntityId: registration.id,
          relatedEntityType: 'REGISTRATION',
          actionUrl: `/sports/registrations/${registration.id}`,
          sentVia: 'IN_APP'
        }
      });

      return res.status(201).json(notification);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Send payment status change notification
   */
  async sendPaymentStatusNotification(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId, paymentId } = req.params;

      const payment = await prisma.sportsRegistrationPayment.findUnique({
        where: { id: paymentId },
        select: {
          id: true,
          registrationId: true,
          status: true,
          tenantId: true,
          registration: {
            select: {
              userId: true,
              sportEvent: { select: { name: true } }
            }
          }
        }
      });

      if (!payment) {
        return res.status(404).json({ message: 'Payment not found' });
      }

      if (payment.tenantId !== tenantId) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      const statusMessages: any = {
        APPROVED: 'Your payment has been approved',
        REJECTED: 'Your payment has been rejected. Please try again',
        SUBMITTED: 'Your payment has been received and is under review'
      };

      const notification = await prisma.notification.create({
        data: {
          tenantId,
          recipientId: payment.registration.userId,
          type: 'PAYMENT_STATUS_CHANGE',
          title: `Payment ${payment.status}`,
          message: statusMessages[payment.status] || `Your payment status is ${payment.status}`,
          relatedEntityId: payment.id,
          relatedEntityType: 'PAYMENT',
          actionUrl: `/sports/payments/${payment.id}`,
          sentVia: 'IN_APP'
        }
      });

      return res.status(201).json(notification);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Send fixture schedule notification to team
   */
  async sendFixtureNotification(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId, fixtureId } = req.params;

      const fixture = await prisma.sportsFixture.findUnique({
        where: { id: fixtureId },
        select: {
          id: true,
          name: true,
          scheduledDate: true,
          homeTeamId: true,
          awayTeamId: true,
          tenantId: true,
          homeTeam: { select: { id: true } },
          awayTeam: { select: { id: true } }
        }
      });

      if (!fixture) {
        return res.status(404).json({ message: 'Fixture not found' });
      }

      if (fixture.tenantId !== tenantId) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      // Get team members for both teams
      const homeMembers = await prisma.sportsTeamMember.findMany({
        where: { teamId: fixture.homeTeamId },
        select: { userId: true }
      });

      const awayMembers = await prisma.sportsTeamMember.findMany({
        where: { teamId: fixture.awayTeamId },
        select: { userId: true }
      });

      const allMemberIds = [
        ...homeMembers.map((m: any) => m.userId),
        ...awayMembers.map((m: any) => m.userId)
      ];

      // Create notifications for all team members
      const notifications = await prisma.notification.createMany({
        data: allMemberIds.map((userId: string) => ({
          tenantId,
          recipientId: userId,
          type: 'FIXTURE_SCHEDULE',
          title: 'Match Scheduled',
          message: `${fixture.name} scheduled for ${fixture.scheduledDate}`,
          relatedEntityId: fixture.id,
          relatedEntityType: 'FIXTURE',
          actionUrl: `/sports/fixtures/${fixture.id}`,
          sentVia: 'IN_APP'
        }))
      });

      return res.status(201).json({
        message: `Sent ${notifications.count} fixture notifications`,
        count: notifications.count
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Send match result notification
   */
  async sendMatchResultNotification(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId, fixtureId } = req.params;

      const fixture = await prisma.sportsFixture.findUnique({
        where: { id: fixtureId },
        select: {
          id: true,
          name: true,
          homeTeamId: true,
          awayTeamId: true,
          homeTeamScore: true,
          awayTeamScore: true,
          status: true,
          tenantId: true
        }
      });

      if (!fixture) {
        return res.status(404).json({ message: 'Fixture not found' });
      }

      if (fixture.tenantId !== tenantId) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      // Get team members
      const homeMembers = await prisma.sportsTeamMember.findMany({
        where: { teamId: fixture.homeTeamId },
        select: { userId: true }
      });

      const awayMembers = await prisma.sportsTeamMember.findMany({
        where: { teamId: fixture.awayTeamId },
        select: { userId: true }
      });

      const allMemberIds = [
        ...homeMembers.map((m: any) => m.userId),
        ...awayMembers.map((m: any) => m.userId)
      ];

      // Create notifications
      const notifications = await prisma.notification.createMany({
        data: allMemberIds.map((userId: string) => ({
          tenantId,
          recipientId: userId,
          type: 'MATCH_RESULT',
          title: 'Match Completed',
          message: `${fixture.name}: ${fixture.homeTeamScore} - ${fixture.awayTeamScore}`,
          relatedEntityId: fixture.id,
          relatedEntityType: 'FIXTURE',
          actionUrl: `/sports/fixtures/${fixture.id}`,
          sentVia: 'IN_APP'
        }))
      });

      return res.status(201).json({
        message: `Sent ${notifications.count} match result notifications`,
        count: notifications.count
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new SportsNotificationController();
