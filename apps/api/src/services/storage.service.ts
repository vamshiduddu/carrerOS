import * as fs from 'fs';
import * as path from 'path';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export async function uploadFile(
  file: { data: Buffer; name: string; mimetype: string },
  userId: string
): Promise<{ url: string; storageKey: string }> {
  const userDir = path.join(UPLOADS_DIR, userId);
  ensureDir(userDir);

  const timestamp = Date.now();
  const filename = `${timestamp}-${file.name}`;
  const filePath = path.join(userDir, filename);

  fs.writeFileSync(filePath, file.data);

  const storageKey = `${userId}/${filename}`;
  const url = `/uploads/${storageKey}`;

  return { url, storageKey };
}

export async function deleteFile(storageKey: string): Promise<void> {
  const filePath = path.join(UPLOADS_DIR, storageKey);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

export function getFileUrl(storageKey: string): string {
  return `/uploads/${storageKey}`;
}
