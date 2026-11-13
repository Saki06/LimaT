// @ts-nocheck
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { Role } from '@prisma/client';

/**
 * Sports Analytics Dashboard Controller
 * Provides real-time statistics and insights for sports administrators
 * All data from actual database records, no mock data
 */
export class SportsAnalyticsController {
  /**
   * Get dashboard summary statistics
   */
  async getDashboardSummary(req: Request, res: Response, next: NextFunction) {
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
        return res.status(403).json({ message: 'Only admins can view analytics' });
      }

      // Get total counts
      const [
        totalRegistrations,
        approvedPayments,
        pendingPayments,
        totalTournaments,
        totalFixtures,
        completedFixtures,
        activeTeams,
        totalAthletes
      ] = await Promise.all([
        prisma.sportsRegistration.count({ where: { tenantId } }),
        prisma.sportsRegistrationPayment.count({
          where: { tenantId, status: 'APPROVED' }
        }),
        prisma.sportsRegistrationPayment.count({
          where: { tenantId, status: 'PENDING' }
        }),
        prisma.sportsTournament.count({ where: { tenantId } }),
        prisma.sportsFixture.count({ where: { tenantId } }),
        prisma.sportsFixture.count({
          where: { tenantId, status: 'COMPLETED' }
        }),
        prisma.sportsTeam.count({ where: { tenantId } }),
        prisma.athleteProfile.count({ where: { tenantId } })
      ]);

      // Get payment statistics
      const paymentStats = await prisma.sportsRegistrationPayment.groupBy({
        by: ['status'],
        where: { tenantId },
        _count: {
          id: true
        }
      });

      const paymentBreakdown = paymentStats.reduce((acc: any, stat: any) => {
        acc[stat.status] = stat._count.id;
        return acc;
      }, {});

      // Get fixture status breakdown
      const fixtureStats = await prisma.sportsFixture.groupBy({
        by: ['status'],
        where: { tenantId },
        _count: {
          id: true
        }
      });

      const fixtureBreakdown = fixtureStats.reduce((acc: any, stat: any) => {
        acc[stat.status] = stat._count.id;
        return acc;
      }, {});

      return res.status(200).json({
        registrations: {
          total: totalRegistrations,
          paymentsApproved: approvedPayments,
          paymentsPending: pendingPayments,
          paymentBreakdown
        },
        tournaments: {
          total: totalTournaments
        },
        fixtures: {
          total: totalFixtures,
          completed: completedFixtures,
          statusBreakdown: fixtureBreakdown
        },
        teams: {
          active: activeTeams
        },
        athletes: {
          total: totalAthletes
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get registration analytics
   */
  async getRegistrationAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = req.params;
      const { startDate, endDate, sportEventId } = req.query;
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
        return res.status(403).json({ message: 'Forbidden' });
      }

      const where: any = { tenantId };

      if (startDate) {
        where.createdAt = { gte: new Date(startDate as string) };
      }

      if (endDate) {
        if (!where.createdAt) where.createdAt = {};
        where.createdAt.lte = new Date(endDate as string);
      }

      if (sportEventId) {
        where.sportEventId = sportEventId;
      }

      // Get registrations by sport
      const registrationsBySport = await prisma.sportsRegistration.groupBy({
        by: ['sportEventId'],
        where,
        _count: { id: true }
      });

      const sportDetails = await Promise.all(
        registrationsBySport.map(async (reg: any) => {
          const event = await prisma.sportsEvent.findUnique({
            where: { id: reg.sportEventId },
            select: { id: true, name: true, capacity: true }
          });
          return {
            eventId: event?.id,
            eventName: event?.name,
            registrations: reg._count.id,
            capacity: event?.capacity,
            capacityPercentage: event?.capacity ? Math.round((reg._count.id / event.capacity) * 100) : 0
          };
        })
      );

      // Get status breakdown
      const statusBreakdown = await prisma.sportsRegistration.groupBy({
        by: ['status'],
        where,
        _count: { id: true }
      });

      return res.status(200).json({
        totalRegistrations: registrationsBySport.reduce((sum, r) => sum + r._count.id, 0),
        bySport: sportDetails,
        byStatus: statusBreakdown.reduce((acc: any, s: any) => {
          acc[s.status] = s._count.id;
          return acc;
        }, {})
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get payment analytics
   */
  async getPaymentAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = req.params;
      const { startDate, endDate } = req.query;
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
        return res.status(403).json({ message: 'Forbidden' });
      }

      const where: any = { tenantId };

      if (startDate) {
        where.createdAt = { gte: new Date(startDate as string) };
      }

      if (endDate) {
        if (!where.createdAt) where.createdAt = {};
        where.createdAt.lte = new Date(endDate as string);
      }

      // Get status breakdown
      const statusBreakdown = await prisma.sportsRegistrationPayment.groupBy({
        by: ['status'],
        where,
        _count: { id: true }
      });

      // Get method breakdown
      const methodBreakdown = await prisma.sportsRegistrationPayment.groupBy({
        by: ['paymentMethod'],
        where,
        _count: { id: true }
      });

      // Get total by status
      const payments = await prisma.sportsRegistrationPayment.findMany({
        where,
        select: { id: true, amount: true, status: true }
      });

      const totalAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
      const approvedAmount = payments
        .filter(p => p.status === 'APPROVED')
        .reduce((sum, p) => sum + (p.amount || 0), 0);

      return res.status(200).json({
        total: payments.length,
        totalAmount,
        approvedAmount,
        byStatus: statusBreakdown.reduce((acc: any, s: any) => {
          acc[s.status] = s._count.id;
          return acc;
        }, {}),
        byMethod: methodBreakdown.reduce((acc: any, m: any) => {
          acc[m.paymentMethod] = m._count.id;
          return acc;
        }, {})
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get fixture/match analytics
   */
  async getFixtureAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = req.params;
      const { startDate, endDate, tournamentId } = req.query;
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
        return res.status(403).json({ message: 'Forbidden' });
      }

      const where: any = { tenantId };

      if (startDate) {
        where.scheduledDate = { gte: new Date(startDate as string) };
      }

      if (endDate) {
        if (!where.scheduledDate) where.scheduledDate = {};
        where.scheduledDate.lte = new Date(endDate as string);
      }

      if (tournamentId) {
        where.tournamentId = tournamentId;
      }

      // Get status breakdown
      const statusBreakdown = await prisma.sportsFixture.groupBy({
        by: ['status'],
        where,
        _count: { id: true }
      });

      // Get fixtures by tournament
      const fixturesByTournament = await prisma.sportsFixture.groupBy({
        by: ['tournamentId'],
        where,
        _count: { id: true }
      });

      const tournamentDetails = await Promise.all(
        fixturesByTournament.map(async (f: any) => {
          const tournament = await prisma.sportsTournament.findUnique({
            where: { id: f.tournamentId },
            select: { id: true, name: true }
          });
          return {
            tournamentId: tournament?.id,
            tournamentName: tournament?.name,
            fixtures: f._count.id
          };
        })
      );

      const totalFixtures = statusBreakdown.reduce((sum, s) => sum + s._count.id, 0);
      const completedFixtures = statusBreakdown.find((s: any) => s.status === 'COMPLETED')?._count.id || 0;

      return res.status(200).json({
        total: totalFixtures,
        completed: completedFixtures,
        completionRate: totalFixtures > 0 ? Math.round((completedFixtures / totalFixtures) * 100) : 0,
        byStatus: statusBreakdown.reduce((acc: any, s: any) => {
          acc[s.status] = s._count.id;
          return acc;
        }, {}),
        byTournament: tournamentDetails
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get team participation analytics
   */
  async getTeamAnalytics(req: Request, res: Response, next: NextFunction) {
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
        return res.status(403).json({ message: 'Forbidden' });
      }

      // Get team statistics
      const teams = await prisma.sportsTeam.findMany({
        where: { tenantId },
        select: {
          id: true,
          name: true,
          _count: {
            select: { members: true }
          }
        }
      });

      const teamStats = await Promise.all(
        teams.map(async (team: any) => {
          const members = await prisma.sportsTeamMember.count({
            where: { teamId: team.id }
          });
          const fixtures = await prisma.sportsFixture.count({
            where: {
              tenantId,
              OR: [
                { homeTeamId: team.id },
                { awayTeamId: team.id }
              ]
            }
          });
          const completedFixtures = await prisma.sportsFixture.count({
            where: {
              tenantId,
              status: 'COMPLETED',
              OR: [
                { homeTeamId: team.id },
                { awayTeamId: team.id }
              ]
            }
          });
          return {
            teamId: team.id,
            teamName: team.name,
            members,
            totalFixtures: fixtures,
            completedFixtures
          };
        })
      );

      const totalTeams = teams.length;
      const avgTeamSize = totalTeams > 0 ? Math.round(teamStats.reduce((sum, t) => sum + t.members, 0) / totalTeams) : 0;

      return res.status(200).json({
        total: totalTeams,
        averageTeamSize: avgTeamSize,
        teams: teamStats.sort((a, b) => b.members - a.members)
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get sport-wise performance analytics
   */
  async getSportAnalytics(req: Request, res: Response, next: NextFunction) {
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
        return res.status(403).json({ message: 'Forbidden' });
      }

      // Get sports events
      const events = await prisma.sportsEvent.findMany({
        where: { tenantId },
        select: {
          id: true,
          name: true,
          capacity: true,
          description: true
        }
      });

      const sportStats = await Promise.all(
        events.map(async (event: any) => {
          const registrations = await prisma.sportsRegistration.count({
            where: { sportEventId: event.id }
          });
          const approvedPayments = await prisma.sportsRegistrationPayment.count({
            where: {
              tenantId,
              status: 'APPROVED',
              registration: { sportEventId: event.id }
            }
          });
          const fixtures = await prisma.sportsFixture.count({
            where: { tenantId, sportEventId: event.id }
          });
          return {
            eventId: event.id,
            eventName: event.name,
            totalRegistrations: registrations,
            approvedParticipants: approvedPayments,
            capacity: event.capacity,
            utilizationPercentage: event.capacity ? Math.round((registrations / event.capacity) * 100) : 0,
            totalFixtures: fixtures
          };
        })
      );

      const mostPopular = sportStats.sort((a, b) => b.totalRegistrations - a.totalRegistrations)[0];
      const totalRegistrations = sportStats.reduce((sum, s) => sum + s.totalRegistrations, 0);

      return res.status(200).json({
        total: sportStats.length,
        totalRegistrations,
        mostPopular,
        sports: sportStats
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get tournament bracket analytics
   */
  async getTournamentAnalytics(req: Request, res: Response, next: NextFunction) {
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
        return res.status(403).json({ message: 'Forbidden' });
      }

      // Get tournaments
      const tournaments = await prisma.sportsTournament.findMany({
        where: { tenantId },
        select: {
          id: true,
          name: true,
          startDate: true,
          endDate: true,
          format: true,
          _count: {
            select: { teams: true, brackets: true }
          }
        }
      });

      const tournamentStats = await Promise.all(
        tournaments.map(async (tournament: any) => {
          const fixtures = await prisma.sportsFixture.count({
            where: { tournamentId: tournament.id }
          });
          const completedFixtures = await prisma.sportsFixture.count({
            where: {
              tournamentId: tournament.id,
              status: 'COMPLETED'
            }
          });
          return {
            tournamentId: tournament.id,
            tournamentName: tournament.name,
            format: tournament.format,
            startDate: tournament.startDate,
            endDate: tournament.endDate,
            participatingTeams: tournament._count.teams,
            brackets: tournament._count.brackets,
            fixtures,
            completedFixtures,
            progressPercentage: fixtures > 0 ? Math.round((completedFixtures / fixtures) * 100) : 0
          };
        })
      );

      return res.status(200).json({
        total: tournaments.length,
        tournaments: tournamentStats
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get date-wise analytics (trends over time)
   */
  async getDateWiseAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = req.params;
      const { startDate, endDate, metric = 'registrations' } = req.query;
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
        return res.status(403).json({ message: 'Forbidden' });
      }

      let data: any = [];

      if (metric === 'registrations') {
        // Group registrations by date
        const registrations = await prisma.sportsRegistration.groupBy({
          by: ['createdAt'],
          where: {
            tenantId,
            ...(startDate && { createdAt: { gte: new Date(startDate as string) } }),
            ...(endDate && { createdAt: { lte: new Date(endDate as string) } })
          },
          _count: { id: true }
        });

        data = registrations.map((r: any) => ({
          date: r.createdAt?.toISOString().split('T')[0],
          count: r._count.id
        }));
      } else if (metric === 'payments') {
        const payments = await prisma.sportsRegistrationPayment.groupBy({
          by: ['createdAt'],
          where: {
            tenantId,
            status: 'APPROVED',
            ...(startDate && { createdAt: { gte: new Date(startDate as string) } }),
            ...(endDate && { createdAt: { lte: new Date(endDate as string) } })
          },
          _count: { id: true }
        });

        data = payments.map((p: any) => ({
          date: p.createdAt?.toISOString().split('T')[0],
          count: p._count.id
        }));
      } else if (metric === 'fixtures') {
        const fixtures = await prisma.sportsFixture.groupBy({
          by: ['scheduledDate'],
          where: {
            tenantId,
            ...(startDate && { scheduledDate: { gte: new Date(startDate as string) } }),
            ...(endDate && { scheduledDate: { lte: new Date(endDate as string) } })
          },
          _count: { id: true }
        });

        data = fixtures.map((f: any) => ({
          date: f.scheduledDate?.toISOString().split('T')[0],
          count: f._count.id
        }));
      }

      // Sort by date
      data.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

      return res.status(200).json({
        metric,
        data
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new SportsAnalyticsController();
