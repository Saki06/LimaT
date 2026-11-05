
import { Response } from 'express';
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
