import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

/**
 * Helper to ensure a TeacherProfile exists for a user
 */
const getOrCreateTeacherProfile = async (userId: string) => {
  let profile = await prisma.teacherProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    const employeeNo = `TUTOR-${userId.substring(0, 8).toUpperCase()}`;
    profile = await prisma.teacherProfile.create({
      data: {
        userId,
        employeeNo,
        specialization: 'General Tutor',
      },
    });
  }

  return profile;
};

/**
 * Helper to ensure a StudentProfile exists for a user
 */
const getStudentProfile = async (userId: string) => {
  return prisma.studentProfile.findUnique({
    where: { userId },
    include: {
      packageSubscriptions: {
        where: { status: 'ACTIVE' },
        include: {
          package: true,
        },
      },
    },
  });
};

/**
 * 1. Create a New Library Resource (Past Paper, Tute, Book)
 * POST /api/resources
 * Restricted to: TEACHER, ADMIN, SUPER_ADMIN
 */
export const createResource = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;

if (!user) {
  res.status(401).json({ success: false, message: 'Unauthorized' });
  return;
}

if (!user.tenantId) {
  res.status(403).json({
    success: false,
    message: 'A tenant is required to create resources.',
  });
  return;
}

const {
  title,
  description,
      resourceType = 'PAST_PAPER',
      subject,
      topic,
      category,
      year,
      medium,
      examType,
      paperPart,
      fileUrl,
      fileName,
      fileSize,
      fileType = 'pdf',
      coverImage,
      hasMarkingScheme = false,
      markingSchemeUrl,
      markingSchemeNotes,
      timeAllowedMinutes = 180,
      visibility = 'PUBLIC',
      packageId,
      status = 'published',
      allowDownload = true,
    } = req.body;

    if (!title || !title.trim()) {
      res.status(400).json({ success: false, message: 'Resource title is required' });
      return;
    }

    if (!subject || !subject.trim()) {
      res.status(400).json({ success: false, message: 'Subject is required' });
      return;
    }

    const teacher = await getOrCreateTeacherProfile(user.userId);

    // Validate packageId if provided
    let finalPackageId: string | null = null;
    if (packageId) {
      const pkg = await prisma.package.findUnique({ where: { id: packageId } });
      if (pkg) finalPackageId = pkg.id;
    }

    // Map resourceType string to enum
    let resolvedType: any = 'PAST_PAPER';
    const typeUpper = (resourceType || '').toUpperCase();
    if (typeUpper === 'TUTE') resolvedType = 'TUTE';
    else if (typeUpper === 'BOOK') resolvedType = 'BOOK';

    // Map visibility string to enum
    const resolvedVisibility: any =
      visibility?.toUpperCase() === 'SUBSCRIBERS_ONLY' || visibility?.toUpperCase() === 'PRIVATE'
        ? 'SUBSCRIBERS_ONLY'
        : 'PUBLIC';

    const resource = await prisma.libraryResource.create({
      data: {
        tenantId: user.tenantId,
        teacherId: teacher.id,
        packageId: finalPackageId,
        title: title.trim(),
        description: description?.trim() || null,
        resourceType: resolvedType,
        subject: subject.trim(),
        topic: topic?.trim() || null,
        category: category?.trim() || (resolvedType === 'PAST_PAPER' ? 'Past Papers & Model Exams' : 'General Material'),
        year: year ? parseInt(year, 10) : null,
        medium: medium || 'Tamil',
        examType: examType || 'G.C.E. A/L',
        paperPart: paperPart || 'Part I & II (Combined)',
        fileUrl: fileUrl || null,
        fileName: fileName || `${title.replace(/\s+/g, '_')}.pdf`,
        fileSize: fileSize || '2.4 MB',
        fileType: fileType || 'pdf',
        coverImage: coverImage || null,
        hasMarkingScheme: Boolean(hasMarkingScheme),
        markingSchemeUrl: markingSchemeUrl || null,
        markingSchemeNotes: markingSchemeNotes || null,
        timeAllowedMinutes: timeAllowedMinutes ? parseInt(timeAllowedMinutes, 10) : 180,
        visibility: resolvedVisibility,
        status: status === 'draft' ? 'draft' : 'published',
        allowDownload: allowDownload !== undefined ? Boolean(allowDownload) : true,
      },
      include: {
        teacher: {
          include: {
            user: {
              select: { firstName: true, lastName: true, avatarUrl: true, email: true },
            },
          },
        },
        package: {
          select: { id: true, title: true, price: true },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Library resource uploaded successfully',
      data: resource,
    });
  } catch (error: any) {
    console.error('Error creating resource:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * 2. Get All Library Resources (with Public & Subscribers-Only access control)
 * GET /api/resources
 */
export const getResources = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    const { resourceType, subject, year, medium, examType, search, mine } = req.query;

    const whereClause: any = {};

    // Temporary protection until public tenant scoping is implemented
if (!user) {
  res.status(401).json({
    success: false,
    message: 'Authentication required to list resources.',
  });
  return;
}

if (user && user.role !== 'SUPER_ADMIN') {
  if (!user.tenantId) {
    res.status(403).json({
      success: false,
      message: 'Tenant access is required.',
    });
    return;
  }

  whereClause.tenantId = user.tenantId;
}

    if (resourceType && typeof resourceType === 'string') {
      const typeUpper = resourceType.toUpperCase();
      if (['PAST_PAPER', 'TUTE', 'BOOK'].includes(typeUpper)) {
        whereClause.resourceType = typeUpper;
      }
    }

    if (subject && typeof subject === 'string' && subject !== 'all') {
      whereClause.subject = { contains: subject, mode: 'insensitive' };
    }

    if (year && typeof year === 'string' && year !== 'all') {
      whereClause.year = parseInt(year, 10);
    }

    if (medium && typeof medium === 'string' && medium !== 'all') {
      whereClause.medium = { contains: medium, mode: 'insensitive' };
    }

    if (examType && typeof examType === 'string' && examType !== 'all') {
      whereClause.examType = { contains: examType, mode: 'insensitive' };
    }

    if (search && typeof search === 'string') {
  whereClause.AND = [
    {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { topic: { contains: search, mode: 'insensitive' } },
      ],
    },
  ];
}

    // Role-based visibility and access logic
    let teacherProfile: any = null;
    let studentProfile: any = null;

    if (user) {
      if (user.role === 'TEACHER') {
        teacherProfile = await prisma.teacherProfile.findUnique({
          where: { userId: user.userId },
        });

        if (mine === 'true' && teacherProfile) {
          // Tutor specifically viewing ONLY their own uploaded items in their workspace desk
          whereClause.teacherId = teacherProfile.id;
        } else {
  // Teachers can see public resources and their own uploads
  whereClause.OR = teacherProfile
    ? [
        { visibility: 'PUBLIC', status: 'published' },
        { teacherId: teacherProfile.id },
      ]
    : [
        { visibility: 'PUBLIC', status: 'published' },
      ];
}
      } else if (user.role === 'STUDENT') {
        studentProfile = await getStudentProfile(user.userId);
        // Only show published resources to students
        whereClause.status = 'published';
      }
    } else {
      // Unauthenticated / Public view: only show published PUBLIC items
      whereClause.visibility = 'PUBLIC';
      whereClause.status = 'published';
    }

    const resources = await prisma.libraryResource.findMany({
      where: whereClause,
      include: {
        teacher: {
          include: {
            user: {
              select: { firstName: true, lastName: true, avatarUrl: true },
            },
          },
        },
        package: {
          select: { id: true, title: true, price: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Determine lock status for each resource for the current viewer
    const formatted = resources.map((r) => {
      const isOwner = teacherProfile && r.teacherId === teacherProfile.id;
      const isAdmin = user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN');

      let isLocked = false;

      if (r.visibility === 'SUBSCRIBERS_ONLY') {
        if (isOwner || isAdmin) {
          isLocked = false;
        } else if (studentProfile) {
          // Check if student has active subscription for this resource's package or tutor
          const hasActiveSub = studentProfile.packageSubscriptions?.some((sub: any) => {
            if (r.packageId && sub.packageId === r.packageId) return true;
            if (sub.package?.teacherId === r.teacherId) return true;
            return false;
          });
          isLocked = !hasActiveSub;
        } else {
          // Not subscribed or unauthenticated
          isLocked = true;
        }
      }

      return {
        id: r.id,
        title: r.title,
        description: r.description || '',
        resourceType: r.resourceType.toLowerCase(),
        subject: r.subject,
        topic: r.topic || undefined,
        category: r.category || 'General',
        year: r.year || undefined,
        medium: r.medium || undefined,
        examType: r.examType || undefined,
        paperPart: r.paperPart || undefined,
        fileUrl: isLocked ? null : r.fileUrl,
        fileName: r.fileName || 'Resource.pdf',
        fileSize: r.fileSize || '2.0 MB',
        fileType: r.fileType || 'pdf',
        coverImage: r.coverImage || undefined,
        hasMarkingScheme: r.hasMarkingScheme,
        markingSchemeUrl: isLocked ? null : r.markingSchemeUrl,
        markingSchemeNotes: isLocked ? null : r.markingSchemeNotes,
        timeAllowedMinutes: r.timeAllowedMinutes || 180,
        visibility: r.visibility.toLowerCase(), // 'public' | 'subscribers_only'
        status: r.status,
        allowDownload: r.allowDownload,
        viewsCount: r.viewsCount,
        downloadsCount: r.downloadsCount,
        author: r.teacher?.user ? `${r.teacher.user.firstName} ${r.teacher.user.lastName}` : 'Tutor',
        authorAvatar: r.teacher?.user?.avatarUrl || undefined,
        teacherId: r.teacherId,
        packageId: r.packageId,
        packageName: r.package?.title || undefined,
        packagePrice: r.package?.price || undefined,
        isLocked,
        isOwner: Boolean(isOwner),
        createdAt: r.createdAt.toISOString(),
      };
    });

    res.status(200).json({ success: true, data: formatted });
  } catch (error: any) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * 3. Get Single Resource by ID
 * GET /api/resources/:id
 */
export const getResourceById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const user = req.user;

    const resource = await prisma.libraryResource.findUnique({
      where: { id },
      include: {
        teacher: {
          include: {
            user: {
              select: { firstName: true, lastName: true, avatarUrl: true },
            },
          },
        },
        package: true,
      },
    });

    if (!resource) {
      res.status(404).json({ success: false, message: 'Resource not found' });
      return;
    }

    // Prevent access to resources from another tenant
if (
  user?.role !== 'SUPER_ADMIN' &&
  user?.tenantId &&
  resource.tenantId !== user.tenantId
) {
  res.status(404).json({
    success: false,
    message: 'Resource not found',
  });
  return;
}

// Guests must not access resources without tenant context.
// Public access will require an explicitly validated tenant scope.
if (!user) {
  res.status(401).json({
    success: false,
    message: 'Authentication required to view this resource.',
  });
  return;
}

// Only the resource owner, tenant admin, or super admin
// may view unpublished resources.
if (resource.status !== 'published') {
  const isSuperAdmin = user.role === 'SUPER_ADMIN';
  const isTenantAdmin = user.role === 'ADMIN';

  let isOwner = false;

  if (user.role === 'TEACHER') {
    const teacher = await prisma.teacherProfile.findUnique({
      where: { userId: user.userId },
      select: { id: true },
    });

    isOwner = teacher?.id === resource.teacherId;
  }

  if (!isSuperAdmin && !isTenantAdmin && !isOwner) {
    res.status(404).json({
      success: false,
      message: 'Resource not found',
    });
    return;
  }
}

    let isLocked = false;
    let isOwner = false;

    if (user) {
      if (user.role === 'TEACHER') {
        const teacher = await prisma.teacherProfile.findUnique({ where: { userId: user.userId } });
        isOwner = teacher?.id === resource.teacherId;
      }

      if (
  resource.visibility === 'SUBSCRIBERS_ONLY' &&
  !isOwner &&
  user.role !== 'ADMIN' &&
  user.role !== 'SUPER_ADMIN'
) {
        const student = await getStudentProfile(user.userId);
        const hasSub = student?.packageSubscriptions?.some((sub: any) => {
          if (resource.packageId && sub.packageId === resource.packageId) return true;
          if (sub.package?.teacherId === resource.teacherId) return true;
          return false;
        });
        isLocked = !hasSub;
      }
    } else if (resource.visibility === 'SUBSCRIBERS_ONLY') {
      isLocked = true;
    }

    res.status(200).json({
      success: true,
      data: {
        ...resource,
        fileUrl: isLocked ? null : resource.fileUrl,
        markingSchemeUrl: isLocked ? null : resource.markingSchemeUrl,
        markingSchemeNotes: isLocked ? null : resource.markingSchemeNotes,
        isLocked,
        isOwner,
      },
    });
  } catch (error: any) {
    console.error('Error fetching resource by id:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * 4. Update Resource
 * PUT /api/resources/:id
 * Restricted to: TEACHER (owner), ADMIN, SUPER_ADMIN
 */
export const updateResource = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const id = req.params.id as string;
    const existing = await prisma.libraryResource.findUnique({ where: { id } });

    if (!existing) {
      res.status(404).json({ success: false, message: 'Resource not found' });
      return;
    }

    // Prevent cross-tenant resource updates
if (
  user.role !== 'SUPER_ADMIN' &&
  (!user.tenantId || existing.tenantId !== user.tenantId)
) {
  res.status(403).json({
    success: false,
    message: 'Forbidden: Resource does not belong to your tenant.',
  });
  return;
}

    // Check ownership if teacher
    if (user.role === 'TEACHER') {
      const teacher = await prisma.teacherProfile.findUnique({ where: { userId: user.userId } });
      if (!teacher || teacher.id !== existing.teacherId) {
        res.status(403).json({ success: false, message: 'Forbidden: You can only edit your own uploads' });
        return;
      }
    }

    const {
      title,
      description,
      resourceType,
      subject,
      topic,
      category,
      year,
      medium,
      examType,
      paperPart,
      fileUrl,
      fileName,
      fileSize,
      coverImage,
      hasMarkingScheme,
      markingSchemeUrl,
      markingSchemeNotes,
      timeAllowedMinutes,
      visibility,
      packageId,
      status,
      allowDownload,
    } = req.body;

    let resolvedVisibility: any = existing.visibility;
    if (visibility !== undefined) {
      resolvedVisibility =
        visibility?.toUpperCase() === 'SUBSCRIBERS_ONLY' || visibility?.toUpperCase() === 'PRIVATE'
          ? 'SUBSCRIBERS_ONLY'
          : 'PUBLIC';
    }

    const updated = await prisma.libraryResource.update({
      where: { id },
      data: {
        title: title !== undefined ? title.trim() : existing.title,
        description: description !== undefined ? description?.trim() : existing.description,
        resourceType: resourceType ? (resourceType.toUpperCase() as any) : existing.resourceType,
        subject: subject !== undefined ? subject.trim() : existing.subject,
        topic: topic !== undefined ? topic?.trim() : existing.topic,
        category: category !== undefined ? category?.trim() : existing.category,
        year: year !== undefined ? (year ? parseInt(year, 10) : null) : existing.year,
        medium: medium !== undefined ? medium : existing.medium,
        examType: examType !== undefined ? examType : existing.examType,
        paperPart: paperPart !== undefined ? paperPart : existing.paperPart,
        fileUrl: fileUrl !== undefined ? fileUrl : existing.fileUrl,
        fileName: fileName !== undefined ? fileName : existing.fileName,
        fileSize: fileSize !== undefined ? fileSize : existing.fileSize,
        coverImage: coverImage !== undefined ? coverImage : existing.coverImage,
        hasMarkingScheme: hasMarkingScheme !== undefined ? Boolean(hasMarkingScheme) : existing.hasMarkingScheme,
        markingSchemeUrl: markingSchemeUrl !== undefined ? markingSchemeUrl : existing.markingSchemeUrl,
        markingSchemeNotes: markingSchemeNotes !== undefined ? markingSchemeNotes : existing.markingSchemeNotes,
        timeAllowedMinutes:
          timeAllowedMinutes !== undefined ? parseInt(timeAllowedMinutes, 10) : existing.timeAllowedMinutes,
        visibility: resolvedVisibility,
        packageId: packageId !== undefined ? packageId : existing.packageId,
        status: status !== undefined ? status : existing.status,
        allowDownload: allowDownload !== undefined ? Boolean(allowDownload) : existing.allowDownload,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Resource updated successfully',
      data: updated,
    });
  } catch (error: any) {
    console.error('Error updating resource:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * 5. Delete Resource
 * DELETE /api/resources/:id
 * Restricted to: TEACHER (owner), ADMIN, SUPER_ADMIN
 */
export const deleteResource = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const id = req.params.id as string;
    const existing = await prisma.libraryResource.findUnique({ where: { id } });

    if (!existing) {
      res.status(404).json({ success: false, message: 'Resource not found' });
      return;
    }

    // Prevent cross-tenant resource deletion
if (
  user.role !== 'SUPER_ADMIN' &&
  (!user.tenantId || existing.tenantId !== user.tenantId)
) {
  res.status(403).json({
    success: false,
    message: 'Forbidden: Resource does not belong to your tenant.',
  });
  return;
}

    if (user.role === 'TEACHER') {
      const teacher = await prisma.teacherProfile.findUnique({ where: { userId: user.userId } });
      if (!teacher || teacher.id !== existing.teacherId) {
        res.status(403).json({ success: false, message: 'Forbidden: You can only delete your own uploads' });
        return;
      }
    }

    await prisma.libraryResource.delete({ where: { id } });

    res.status(200).json({
      success: true,
      message: 'Resource deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting resource:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * 6. Record Resource View
 * POST /api/resources/:id/view
 */
export const recordResourceView = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    await prisma.libraryResource.update({
      where: { id },
      data: { viewsCount: { increment: 1 } },
    });
    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * 7. Record Resource Download
 * POST /api/resources/:id/download
 */
export const recordResourceDownload = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    await prisma.libraryResource.update({
      where: { id },
      data: { downloadsCount: { increment: 1 } },
    });
    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};
