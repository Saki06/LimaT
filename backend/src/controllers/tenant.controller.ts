import { Request, Response } from 'express';

export const listTenants = async (req: Request, res: Response): Promise<void> => {
  try {
    // Initial seeded tenant data matching mock data
    const tenants = [
      {
        id: 't-001',
        name: 'Apex Academy Global',
        slug: 'apex-academy',
        subdomain: 'apex',
        plan: 'ENTERPRISE',
        status: 'ACTIVE',
        studentsCount: 1420,
        teachersCount: 88,
        createdAt: '2026-01-15T08:00:00Z',
      },
      {
        id: 't-002',
        name: 'Springfield Science Institute',
        slug: 'springfield-science',
        subdomain: 'springfield',
        plan: 'PRO',
        status: 'ACTIVE',
        studentsCount: 640,
        teachersCount: 42,
        createdAt: '2026-02-10T10:30:00Z',
      },
    ];

    res.status(200).json({ success: true, data: tenants });
  } catch (error: any) {
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

    const newTenant = {
      id: 't-' + Date.now(),
      name,
      slug: subdomain.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      subdomain: subdomain.toLowerCase(),
      plan: plan || 'PRO',
      status: 'ACTIVE',
      studentsCount: 0,
      teachersCount: 1,
      adminEmail,
      adminName,
      createdAt: new Date().toISOString(),
    };

    res.status(201).json({ success: true, message: 'Tenant created successfully', data: newTenant });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};
