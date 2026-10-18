import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

export const listTenants = async (req: Request, res: Response): Promise<void> => {
  try {
    const tenants = await prisma.tenant.findMany({
      include: {
        _count: {
          select: {
            users: true,
            courses: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ success: true, data: tenants });
  } catch (error: any) {
    console.error('Error listing tenants:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const createTenant = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, subdomain, plan, adminEmail, adminName } = req.body;

    if (!name || !subdomain) {
      res.status(400).json({ success: false, message: 'Tenant name and subdomain are required' });
      return;
    }

    const slug = subdomain.toLowerCase().replace(/[^a-z0-9]/g, '-');

    const existingTenant = await prisma.tenant.findUnique({
      where: { slug },
    });

    if (existingTenant) {
      res.status(409).json({ success: false, message: 'Tenant with this subdomain already exists' });
      return;
    }

    const newTenant = await prisma.tenant.create({
      data: {
        name,
        slug,
        domain: `${slug}.lms.edu`,
        plan: plan || 'PRO',
        settings: {
          adminEmail,
          adminName,
        },
      },
    });

    res.status(201).json({ success: true, message: 'Tenant created successfully', data: newTenant });
  } catch (error: any) {
    console.error('Error creating tenant:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};
