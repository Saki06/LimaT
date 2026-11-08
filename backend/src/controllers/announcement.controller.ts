import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';


/**
 * 1. Get All Announcements (Filtered by Role & Search)
 * GET /api/announcements
 */
export const getAnnouncements = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const search = req.query.search ? String(req.query.search).trim() : '';
    const priority = req.query.priority ? String(req.query.priority).trim().toLowerCase() : 'all';
    const audience = req.query.audience ? String(req.query.audience).trim().toLowerCase() : 'all';
    const role = req.query.role ? String(req.query.role).toUpperCase() : undefined;

    const authReq = req as AuthenticatedRequest;
    const requestedTenantId = req.query.tenantId ? String(req.query.tenantId).trim() : undefined;
    const userTenantId = authReq.user?.tenantId;
    const tenantId = requestedTenantId || userTenantId;

    const whereClause: any = {};
    if (tenantId) {
      whereClause.tenantId = tenantId;
    }

    // Role filtering: Students see STUDENT or null (platform-wide)
    if (role === 'STUDENT') {
      whereClause.OR = [
        { targetRole: 'STUDENT' },
        { targetRole: null },
      ];
    } else if (role && role !== 'ALL') {
      whereClause.OR = [
        { targetRole: role as any },
        { targetRole: null },
      ];
    }

    if (search) {
      whereClause.AND = [
        ...(whereClause.AND || []),
        {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { content: { contains: search, mode: 'insensitive' } },
          ],
        },
      ];
    }

    const records = await prisma.announcement.findMany({
      where: whereClause,
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    const formatted = records.map((a) => {
      let targetAudience = 'Platform-Wide (Everyone)';
      if (a.targetRole === 'STUDENT') targetAudience = 'Students & Subscribers';
      else if (a.targetRole === 'TEACHER') targetAudience = 'Tutors & Coaches';
      else if (a.targetRole === 'PARENT') targetAudience = 'Parents & Guardians';

      const priorityVal: 'normal' | 'high' | 'urgent' = a.isPinned ? 'urgent' : 'normal';

      return {
        id: a.id,
        title: a.title,
        message: a.content,
        publishedAt: a.createdAt.toISOString().split('T')[0],
        createdAt: a.createdAt.toISOString(),
        authorName: a.authorName || 'Tutor Desk',
        authorRole: a.authorRole || 'Tutor',
        targetAudience,
        targetRole: a.targetRole,
        priority: priorityVal,
        isPinned: a.isPinned,
      };
    });

    // Optional frontend priority/audience in-memory filter
    let result = formatted;
    if (priority !== 'all') {
      result = result.filter((item) => item.priority.toLowerCase() === priority);
    }
    if (audience !== 'all') {
      result = result.filter((item) => {
        const lower = item.targetAudience.toLowerCase();
        if (audience === 'students') return lower.includes('student') || lower.includes('everyone');
        if (audience === 'teachers') return lower.includes('tutor') || lower.includes('teacher') || lower.includes('everyone');
        return true;
      });
    }

    res.status(200).json({
      success: true,
      data: result,
      total: result.length,
    });
  } catch (error: any) {
    console.error('Error in getAnnouncements:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * 2. Get Single Announcement by ID
 * GET /api/announcements/:id
 */
export const getAnnouncementById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = String(req.params.id);
    const a = await prisma.announcement.findUnique({
      where: { id },
      include: { tenant: true },
    });

    if (!a) {
      res.status(404).json({ success: false, message: 'Announcement not found' });
      return;
    }

    let targetAudience = 'Platform-Wide (Everyone)';
    if (a.targetRole === 'STUDENT') targetAudience = 'Students & Subscribers';
    else if (a.targetRole === 'TEACHER') targetAudience = 'Tutors & Coaches';
    else if (a.targetRole === 'PARENT') targetAudience = 'Parents & Guardians';

    res.status(200).json({
      success: true,
      data: {
        id: a.id,
        title: a.title,
        message: a.content,
        publishedAt: a.createdAt.toISOString().split('T')[0],
        authorName: a.authorName || 'Tutor Desk',
        authorRole: a.authorRole || 'Tutor',
        targetAudience,
        targetRole: a.targetRole,
        priority: a.isPinned ? 'urgent' : 'normal',
        isPinned: a.isPinned,
      },
    });
  } catch (error: any) {
    console.error('Error in getAnnouncementById:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * 3. Create Announcement
 * POST /api/announcements
 */
export const createAnnouncement = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { title, message, content, targetAudience, priority, isPinned } = req.body;

    if (!title || (!message && !content)) {
      res.status(400).json({ success: false, message: 'Title and message are required' });
      return;
    }

    const tenant = await prisma.tenant.findFirst();
    const tenantId = req.user?.tenantId || tenant?.id;

    if (!tenantId) {
      res.status(400).json({ success: false, message: 'Tenant context required' });
      return;
    }

    let targetRole: any = null;
    const audienceStr = String(targetAudience || '').toLowerCase();
    if (audienceStr.includes('student')) targetRole = 'STUDENT';
    else if (audienceStr.includes('tutor') || audienceStr.includes('teacher')) targetRole = 'TEACHER';
    else if (audienceStr.includes('parent')) targetRole = 'PARENT';

    const pinned = Boolean(isPinned || priority === 'urgent');
    const userRole = req.user?.role || 'TEACHER';
    let authorName = req.body.authorName;
    if (!authorName && req.user?.userId) {
      const u = await prisma.user.findUnique({ where: { id: req.user.userId } });
      if (u) authorName = `${u.firstName || ''} ${u.lastName || ''}`.trim();
    }
    if (!authorName) authorName = 'Tutor';
    const authorRole = req.body.authorRole || (userRole === 'TEACHER' ? 'Tutor' : userRole);

    const created = await prisma.announcement.create({
      data: {
        tenantId,
        title,
        content: message || content,
        targetRole,
        isPinned: pinned,
        authorName,
        authorRole,
        priority: pinned ? 'urgent' : (priority || 'normal'),
        targetAudience: targetAudience || 'Platform-Wide (Everyone)',
      },
    });

    res.status(201).json({
      success: true,
      message: 'Announcement published successfully to Notice Board',
      data: {
        id: created.id,
        title: created.title,
        message: created.content,
        publishedAt: created.createdAt.toISOString().split('T')[0],
        authorName: created.authorName || authorName,
        authorRole: created.authorRole || authorRole,
        targetAudience: created.targetAudience || targetAudience || 'Platform-Wide (Everyone)',
        priority: created.priority || (pinned ? 'urgent' : 'normal'),
        isPinned: created.isPinned,
      },
    });
  } catch (error: any) {
    console.error('Error in createAnnouncement:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * 4. Update Announcement
 * PUT /api/announcements/:id
 */
export const updateAnnouncement = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const id = String(req.params.id);
    const { title, message, content, targetAudience, priority, isPinned, authorName, authorRole } = req.body;

    const existing = await prisma.announcement.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Announcement not found' });
      return;
    }

    let targetRole = existing.targetRole;
    if (targetAudience) {
      const audienceStr = String(targetAudience).toLowerCase();
      if (audienceStr.includes('student')) targetRole = 'STUDENT';
      else if (audienceStr.includes('tutor') || audienceStr.includes('teacher')) targetRole = 'TEACHER';
      else if (audienceStr.includes('parent')) targetRole = 'PARENT';
      else targetRole = null;
    }

    const pinned = isPinned !== undefined ? Boolean(isPinned) : (priority === 'urgent' ? true : existing.isPinned);

    const updated = await prisma.announcement.update({
      where: { id },
      data: {
        ...(title ? { title: title.trim() } : {}),
        ...(message || content ? { content: (message || content).trim() } : {}),
        ...(targetRole !== undefined ? { targetRole } : {}),
        ...(targetAudience ? { targetAudience } : {}),
        ...(priority ? { priority } : {}),
        ...(isPinned !== undefined ? { isPinned: pinned } : {}),
        ...(authorName ? { authorName } : {}),
        ...(authorRole ? { authorRole } : {}),
      },
    });

    res.status(200).json({
      success: true,
      message: 'Announcement updated successfully',
      data: {
        id: updated.id,
        title: updated.title,
        message: updated.content,
        publishedAt: updated.createdAt.toISOString().split('T')[0],
        authorName: updated.authorName || 'Tutor',
        authorRole: updated.authorRole || 'Tutor',
        targetAudience: updated.targetAudience || targetAudience || 'Platform-Wide (Everyone)',
        priority: updated.priority || (updated.isPinned ? 'urgent' : 'normal'),
        isPinned: updated.isPinned,
      },
    });
  } catch (error: any) {
    console.error('Error in updateAnnouncement:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * 5. Delete Announcement
 * DELETE /api/announcements/:id
 */
export const deleteAnnouncement = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const id = String(req.params.id);
    const existing = await prisma.announcement.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Announcement not found' });
      return;
    }

    await prisma.announcement.delete({ where: { id } });

    res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully from Notice Board',
    });
  } catch (error: any) {
    console.error('Error in deleteAnnouncement:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * 6. Toggle Pin Announcement
 * PATCH /api/announcements/:id/pin
 */
export const togglePinAnnouncement = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const id = String(req.params.id);
    const existing = await prisma.announcement.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Announcement not found' });
      return;
    }

    const updated = await prisma.announcement.update({
      where: { id },
      data: { isPinned: !existing.isPinned },
    });

    res.status(200).json({
      success: true,
      message: updated.isPinned ? 'Announcement pinned to top' : 'Announcement unpinned',
      data: updated,
    });
  } catch (error: any) {
    console.error('Error in togglePinAnnouncement:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};
