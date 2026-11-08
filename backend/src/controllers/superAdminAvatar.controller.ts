
import { Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { avatarDirectory } from '../middlewares/avatarUpload.middleware';
import { fromFile } from 'file-type';
import { promises as fs } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

const allowedFormats: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

const deleteFile = async (filePath: string): Promise<void> => {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      console.error('Avatar file cleanup failed:', error);
    }
  }
};

export const uploadSuperAdminAvatarController = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const uploadedFile = req.file;

  if (!uploadedFile) {
    res.status(400).json({
      success: false,
      message: 'Please upload an avatar image',
    });
    return;
  }

  let finalPath: string | null = null;

  try {
    const detectedType = await fromFile(uploadedFile.path);

    if (
      !detectedType ||
      !allowedFormats[detectedType.mime] ||
      detectedType.mime !== uploadedFile.mimetype
    ) {
      res.status(400).json({
        success: false,
        message: 'Invalid image format. Use JPG, PNG or WebP.',
      });
      return;
    }

    const userId = req.user!.userId;

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, avatarUrl: true },
    });

    if (!existingUser) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    const extension = allowedFormats[detectedType.mime];
    const filename = `${randomUUID()}.${extension}`;
    finalPath = path.join(avatarDirectory, filename);

    await fs.rename(uploadedFile.path, finalPath);

    const avatarUrl = `/api/super-admin/avatars/${filename}`;

    const updateResult = await prisma.user.updateMany({
  where: {
    id: userId,
    avatarUrl: existingUser.avatarUrl,
  },
  data: {
    avatarUrl,
  },
});

if (updateResult.count !== 1) {
  res.status(409).json({
    success: false,
    message: 'Profile picture was changed by another request. Please try again.',
  });
  return;
}

// Database update succeeded; retain the new avatar file.
finalPath = null;

    // Delete the previous locally stored avatar after successful update.
    const oldFilename = existingUser.avatarUrl?.split('/').pop();

    if (
      existingUser.avatarUrl?.startsWith('/api/super-admin/avatars/') &&
      oldFilename &&
      /^[a-f0-9-]+\.(jpg|png|webp)$/.test(oldFilename)
    ) {
      await deleteFile(path.join(avatarDirectory, oldFilename));
    }

    res.status(200).json({
      success: true,
      message: 'Profile picture uploaded successfully',
      data: { avatarUrl },
    });
 } catch (error) {
  console.error('Upload Super Admin Avatar Error:', error);

  res.status(500).json({
    success: false,
    message: 'Failed to upload profile picture',
  });
} finally {
  await deleteFile(uploadedFile.path);

  if (finalPath) {
    await deleteFile(finalPath);
  }
}
};

export const getSuperAdminAvatarController = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const filename = req.params.filename;

    if (
      typeof filename !== 'string' ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp)$/i.test(filename)
    ) {
      res.status(400).json({
        success: false,
        message: 'Invalid avatar filename',
      });
      return;
    }

    const avatarUrl = `/api/super-admin/avatars/${filename}`;

    const user = await prisma.user.findFirst({
      where: {
        id: req.user!.userId,
        role: 'SUPER_ADMIN',
        avatarUrl,
      },
      select: { id: true },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Profile picture not found',
      });
      return;
    }

    const filePath = path.join(avatarDirectory, filename);

    res.setHeader('Cache-Control', 'private, no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    res.sendFile(filePath, (error) => {
      if (error && !res.headersSent) {
        res.status(404).json({
          success: false,
          message: 'Profile picture file not found',
        });
      }
    });
  } catch (error) {
    console.error('Get Super Admin Avatar Error:', error);

    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch profile picture',
      });
    }
  }
};
