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
    const {
  name,
  subdomain,
  plan,
  adminEmail,
  adminName,
  contactPhone,
  monthlyFeeLkr,
  address,
  type,
  enabledFeatures,
} = req.body ?? {};

if (
  monthlyFeeLkr !== undefined &&
  monthlyFeeLkr !== null &&
  monthlyFeeLkr !== '' &&
  (
    typeof monthlyFeeLkr !== 'number' ||
    !Number.isFinite(monthlyFeeLkr) ||
    monthlyFeeLkr < 0
  )
) {
  res.status(400).json({
    success: false,
    message: 'Invalid monthly fee',
  });
  return;
}

    if (
  typeof name !== 'string' ||
  !name.trim() ||
  typeof subdomain !== 'string' ||
  !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(subdomain.trim().toLowerCase())
) {
  res.status(400).json({
    success: false,
    message: 'Valid tenant name and subdomain are required',
  });
  return;
}

if (
  plan !== undefined &&
  (
    typeof plan !== 'string' ||
    !['STARTER', 'PRO', 'ENTERPRISE'].includes(plan.toUpperCase())
  )
) {
  res.status(400).json({
    success: false,
    message: 'Invalid tenant plan',
  });
  return;
}

if (
  enabledFeatures !== undefined &&
  (
    enabledFeatures === null ||
    typeof enabledFeatures !== 'object' ||
    Array.isArray(enabledFeatures) ||
    Object.values(enabledFeatures).some(
      value => typeof value !== 'boolean'
    )
  )
) {
  res.status(400).json({
    success: false,
    message: 'Invalid enabledFeatures. Expected an object with boolean values.',
  });
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
        plan: plan === undefined ? 'PRO' : plan.toUpperCase(),
        settings: {
  adminEmail: adminEmail || '',
  adminName: adminName || '',
  contactPhone: contactPhone || '',
 monthlyFeeLkr: monthlyFeeLkr === undefined ||
               monthlyFeeLkr === null ||
               monthlyFeeLkr === ''
  ? 0
  : monthlyFeeLkr,
  address: address || '',
  type: type || 'individual_teacher',
  enabledFeatures: enabledFeatures || {},
},
      },
    });

    res.status(201).json({ success: true, message: 'Tenant created successfully', data: newTenant });
  } catch (error: any) {
    console.error('Error creating tenant:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const updateTenantFeatures = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id;

if (typeof id !== 'string' || !id.trim()) {
  res.status(400).json({
    success: false,
    message: 'Invalid tenant ID'
  });
  return;
}
    const { enabledFeatures } = req.body;

    if (
      !enabledFeatures ||
      typeof enabledFeatures !== 'object' ||
      Array.isArray(enabledFeatures) ||
      Object.values(enabledFeatures).some(value => typeof value !== 'boolean')
    ) {
      res.status(400).json({
        success: false,
        message: 'Valid enabledFeatures object is required'
      });
      return;
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id }
    });

    if (!tenant) {
      res.status(404).json({
        success: false,
        message: 'Tenant not found'
      });
      return;
    }

    const existingSettings =
      tenant.settings &&
      typeof tenant.settings === 'object' &&
      !Array.isArray(tenant.settings)
        ? tenant.settings
        : {};

    const updatedTenant = await prisma.tenant.update({
      where: { id },
      data: {
        settings: {
          ...existingSettings,
          enabledFeatures
        }
      }
    });

    res.status(200).json({
      success: true,
      message: 'Tenant features updated successfully',
      data: updatedTenant
    });
  } catch (error) {
    console.error('Error updating tenant features:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to update tenant features'
    });
  }
};

export const updateTenant = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id;

    if (typeof id !== 'string' || !id.trim()) {
      res.status(400).json({
        success: false,
        message: 'Invalid tenant ID'
      });
      return;
    }

    const {
  name,
  plan,
  adminEmail,
  adminName,
  contactPhone,
  monthlyFeeLkr,
  address,
  type,
  status,
  tagline,
} = req.body ?? {};

    const updates = {
  name,
  plan,
  adminEmail,
  adminName,
  contactPhone,
  monthlyFeeLkr,
  address,
  type,
  status,
  tagline,
};

    if (
      req.body === null ||
      typeof req.body !== 'object' ||
      Array.isArray(req.body) ||
      Object.keys(req.body).some(
        key => !Object.prototype.hasOwnProperty.call(updates, key)
      )
    ) {
      res.status(400).json({
        success: false,
        message: 'Invalid tenant update fields'
      });
      return;
    }

    if (
      name !== undefined &&
      (typeof name !== 'string' || !name.trim())
    ) {
      res.status(400).json({
        success: false,
        message: 'Valid tenant name is required'
      });
      return;
    }

    if (
      plan !== undefined &&
      (typeof plan !== 'string' ||
        !['STARTER', 'PRO', 'ENTERPRISE'].includes(plan.toUpperCase()))
    ) {
      res.status(400).json({
        success: false,
        message: 'Invalid tenant plan'
      });
      return;
    }

    if (
      [adminEmail, adminName, contactPhone, address, type].some(
        value => value !== undefined && typeof value !== 'string'
      )
    ) {
      res.status(400).json({
        success: false,
        message: 'Invalid tenant details'
      });
      return;
    }

    if (
      monthlyFeeLkr !== undefined &&
      (typeof monthlyFeeLkr !== 'number' ||
        !Number.isFinite(monthlyFeeLkr) ||
        monthlyFeeLkr < 0)
    ) {
      res.status(400).json({
        success: false,
        message: 'Invalid monthly fee'
      });
      return;
    }

    if (
  status !== undefined &&
  !["ACTIVE", "INACTIVE", "SUSPENDED", "TRIAL"].includes(status)
) {
  res.status(400).json({
    success: false,
    message: "Invalid tenant status",
  });
  return;
}

if (tagline !== undefined && typeof tagline !== "string") {
  res.status(400).json({
    success: false,
    message: "Invalid tenant tagline",
  });
  return;
}

    const tenant = await prisma.tenant.findUnique({
      where: { id }
    });

    if (!tenant) {
      res.status(404).json({
        success: false,
        message: 'Tenant not found'
      });
      return;
    }

    const existingSettings =
      tenant.settings &&
      typeof tenant.settings === 'object' &&
      !Array.isArray(tenant.settings)
        ? tenant.settings
        : {};

    const settingsUpdates = {
  ...(adminEmail !== undefined && { adminEmail }),
  ...(adminName !== undefined && { adminName }),
  ...(contactPhone !== undefined && { contactPhone }),
  ...(monthlyFeeLkr !== undefined && { monthlyFeeLkr }),
  ...(address !== undefined && { address }),
  ...(type !== undefined && { type }),
  ...(tagline !== undefined && { tagline }),
};

    const updatedTenant = await prisma.tenant.update({
  where: { id },
  data: {
    ...(name !== undefined && { name: name.trim() }),
    ...(plan !== undefined && { plan: plan.toUpperCase() }),
    ...(status !== undefined && { status }),
    settings: {
      ...existingSettings,
      ...settingsUpdates,
    },
  },
});

    res.status(200).json({
      success: true,
      message: 'Tenant updated successfully',
      data: updatedTenant
    });

  } catch (error) {
    console.error('Error updating tenant:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to update tenant'
    });
  }
};