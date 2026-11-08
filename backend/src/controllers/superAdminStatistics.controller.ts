
import { Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export const getTenantStatistics = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const counts = await prisma.tenant.groupBy({
      by: ['status'],
      where: {
        deletedAt: null,
      },
      _count: {
        _all: true,
      },
    });

    const getCount = (status: string): number =>
      counts.find((item) => item.status === status)?._count._all ?? 0;

    const activeTenants = getCount('ACTIVE');
    const suspendedTenants = getCount('SUSPENDED');
    const inactiveTenants = getCount('INACTIVE');

    const totalTenants =
      activeTenants + suspendedTenants + inactiveTenants;

    res.status(200).json({
      success: true,
      data: {
        totalTenants,
        activeTenants,
        suspendedTenants,
        inactiveTenants,
      },
    });
  } catch (error) {
    console.error('Failed to fetch tenant statistics:', error);

    res.status(500).json({
      success: false,
      message: 'Unable to fetch tenant statistics',
    });
  }
};


export const getMonthlySaasMrr = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const now = new Date();

    const subscriptions = await prisma.tenantSubscription.findMany({
      where: {
        status: 'ACTIVE',
        currency: 'LKR',
        startDate: { lte: now },
        OR: [
          { endDate: null },
          { endDate: { gt: now } },
        ],
        billingCycle: {
          in: ['MONTHLY', 'QUARTERLY', 'YEARLY'],
        },
        tenant: {
          deletedAt: null,
          status: 'ACTIVE',
        },
      },
      select: {
        tenantId: true,
        amount: true,
        billingCycle: true,
      },
      orderBy: {
        tenantId: 'asc',
      },
    });

   const tenantIds = new Set<string>();
let monthlyMrr = new Prisma.Decimal(0);

for (const subscription of subscriptions) {
  if (tenantIds.has(subscription.tenantId)) {
    throw new Error(
      `Multiple active SaaS subscriptions for tenant ${subscription.tenantId}`
    );
  }

  tenantIds.add(subscription.tenantId);

  const amount = subscription.amount;

  switch (subscription.billingCycle) {
    case 'MONTHLY':
      monthlyMrr = monthlyMrr.plus(amount);
      break;

    case 'QUARTERLY':
      monthlyMrr = monthlyMrr.plus(amount.dividedBy(3));
      break;

    case 'YEARLY':
      monthlyMrr = monthlyMrr.plus(amount.dividedBy(12));
      break;
  }
}

    res.status(200).json({
      success: true,
      data: {
        monthlyMrr: monthlyMrr.toDecimalPlaces(2).toNumber(),
        currency: 'LKR',
        activeSubscriptions: subscriptions.length,
        calculatedAt: now.toISOString(),
      },
    });
  } catch (error) {
    console.error('Failed to calculate SaaS MRR:', error);

    res.status(500).json({
      success: false,
      message: 'Unable to calculate monthly SaaS MRR',
    });
  }
};


export const getStudentStatistics = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const totalStudents = await prisma.user.count({
      where: {
        role: 'STUDENT',
        tenantId: {
          not: null,
        },
        tenant: {
          is: {
            deletedAt: null,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: {
        totalStudents,
      },
    });
  } catch (error) {
    console.error('Failed to fetch student statistics:', error);

    res.status(500).json({
      success: false,
      message: 'Unable to fetch student statistics',
    });
  }
};
