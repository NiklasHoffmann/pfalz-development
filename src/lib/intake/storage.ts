import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { env } from '@/lib/env';
import { generateUniqueFilename, sanitizeFilename } from '@/lib/file-utils';

export function getIntakeUploadRoot(): string {
  return path.isAbsolute(env.INTAKE_UPLOAD_DIR)
    ? env.INTAKE_UPLOAD_DIR
    : path.join(process.cwd(), env.INTAKE_UPLOAD_DIR);
}

function getResolvedIntakeUploadRoot(): string {
  return path.resolve(getIntakeUploadRoot());
}

export function buildIntakeStoragePath({
  projectId,
  accessLinkId,
  submissionId,
  originalFilename,
}: {
  projectId: string;
  accessLinkId: string;
  submissionId: string;
  originalFilename: string;
}): string {
  const safeProjectId = sanitizeFilename(projectId || 'project');
  const safeAccessLinkId = sanitizeFilename(accessLinkId);
  const safeSubmissionId = sanitizeFilename(submissionId);
  const safeFilename = sanitizeFilename(
    generateUniqueFilename(originalFilename)
  );

  return path.join(
    safeProjectId,
    safeAccessLinkId,
    safeSubmissionId,
    safeFilename
  );
}

export function resolveIntakeStoragePath(storagePath: string): string {
  const resolvedRoot = getResolvedIntakeUploadRoot();
  const resolvedPath = path.resolve(resolvedRoot, storagePath);

  if (
    resolvedPath !== resolvedRoot &&
    !resolvedPath.startsWith(`${resolvedRoot}${path.sep}`)
  ) {
    throw new Error('Unsafe intake storage path');
  }

  return resolvedPath;
}

export async function ensureIntakeStoragePath(storagePath: string) {
  await mkdir(path.dirname(resolveIntakeStoragePath(storagePath)), {
    recursive: true,
  });
}

export async function writeIntakeStorageFile(
  storagePath: string,
  content: Buffer
) {
  await ensureIntakeStoragePath(storagePath);
  await writeFile(resolveIntakeStoragePath(storagePath), content, {
    flag: 'wx',
  });
}

export async function readIntakeStorageFile(storagePath: string) {
  return readFile(resolveIntakeStoragePath(storagePath));
}

export async function removeIntakeStorageFile(storagePath: string) {
  await rm(resolveIntakeStoragePath(storagePath), {
    force: true,
  });
}
