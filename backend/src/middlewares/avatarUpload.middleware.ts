
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';
import { Request } from 'express';

const MAX_AVATAR_SIZE = 2 * 1024 * 1024;

const avatarDirectory = path.resolve(
  process.cwd(),
  'uploads',
  'avatars'
);

fs.mkdirSync(avatarDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, avatarDirectory);
  },

  filename: (_req, _file, callback) => {
    callback(null, `${randomUUID()}.upload`);
  },
});

const allowedMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  callback: multer.FileFilterCallback
) => {
  if (!allowedMimeTypes.has(file.mimetype)) {
    callback(
      new Error('Only JPG, PNG and WebP images are allowed')
    );
    return;
  }

  callback(null, true);
};

export const uploadSuperAdminAvatar = multer({
  storage,
  limits: {
    fileSize: MAX_AVATAR_SIZE,
    files: 1,
  },
  fileFilter,
}).single('avatar');

export { avatarDirectory, MAX_AVATAR_SIZE };
