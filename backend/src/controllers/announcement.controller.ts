import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

/**
 * Helper to ensure initial realistic school announcements exist
 */
const ensureDefaultAnnouncements = async (tenantId: string) => {
  const count = await prisma.announcement.count({
    where: { tenantId },
  });

  if (count <= 1) {
    const defaults = [
      {
        title: 'Final Term Examination Timetable & Admission Card Release',
        content: 'Official timetable for the 2026 G.C.E. A/L and Term Examinations has been published. All eligible students must download and print their certified Examination Hall Tickets from the portal before November 10th.',
        targetRole: 'STUDENT' as const,
        isPinned: true,
      },
      {
        title: 'Special School Holiday Notice: National Cultural Festival',
        content: 'Please note that the institution and physical campus will remain closed on Friday for the National Cultural Holiday. Online study materials, recorded masterclasses, and past paper repository remain accessible 24/7.',
        targetRole: 'STUDENT' as const,
        isPinned: true,
      },
      {
        title: 'Annual Inter-House Athletic Meet & Track Squad Trials',
        content: 'Selection trials for the Senior Track & Field squad will take place this Saturday at the Sports Complex ground. Interested students must complete online registration via the My Sports portal tab.',
        targetRole: 'STUDENT' as const,
        isPinned: false,
      },
      {
        title: 'A/L Combined Mathematics & Physics Revision Masterclasses',
        content: 'Special evening live broadcast sessions covering high-weightage Mechanics and Electricity modules will be hosted by department chairs starting this Wednesday. Check Live Video Schedule for direct join links.',
        targetRole: 'STUDENT' as const,
        isPinned: false,
      },
      {
        title: 'Library Portal Update: 2020-2025 Past Papers Archive Added',
        content: 'Over 150 certified provincial and national past papers with marking schemes have been indexed in the Study Resource Library. Accessible for offline review by all enrolled students.',
        targetRole: 'STUDENT' as const,
        isPinned: false,
      },
    ];

    for (const item of defaults) {
      await prisma.announcement.create({
        data: {
          tenantId,
          title: item.title,
          content: item.content,
          targetRole: item.targetRole,
          isPinned: item.isPinned,
        },
      });
    }
  }
};

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

    // Get default or first tenant
    const tenant = await prisma.tenant.findFirst();
    const tenantId = tenant?.id || '';

    if (tenantId) {
      await ensureDefaultAnnouncements(tenantId);
    }

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
        authorName: "Principal's Office & Academic Directorate",
        authorRole: 'Administration',
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
        authorName: "Principal's Office & Academic Directorate",
        authorRole: 'Administration',
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

    const created = await prisma.announcement.create({
      data: {
        tenantId,
        title,
        content: message || content,
        targetRole,
        isPinned: pinned,
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
        authorName: req.user ? `${req.user.role} Office` : "Principal's Office",
        authorRole: req.user?.role || 'ADMIN',
        targetAudience: targetAudience || 'Platform-Wide (Everyone)',
        priority: pinned ? 'urgent' : 'normal',
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
    const { title, message, content, targetAudience, priority, isPinned } = req.body;

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
        ...(title ? { title } : {}),
        ...(message || content ? { content: message || content } : {}),
        targetRole,
        isPinned: pinned,
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
        authorName: "Principal's Office",
        authorRole: 'ADMIN',
        targetAudience: targetAudience || 'Platform-Wide (Everyone)',
        priority: updated.isPinned ? 'urgent' : 'normal',
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
