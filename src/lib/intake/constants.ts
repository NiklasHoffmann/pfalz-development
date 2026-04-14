import { FILE_UPLOAD } from '@/lib/constants';

export const INTAKE_INTERNAL_PREFIXES = [
  '/fragebogen',
  '/projekt',
  '/projekt-link',
  '/admin',
];
export const INTAKE_SESSION_COOKIE_NAME = 'intake_access';
export const ADMIN_SESSION_COOKIE_NAME = 'staff_admin';
export const INTAKE_DEV_SESSION_SECRET =
  'development-only-intake-session-secret-change-me';
export const INTAKE_DEV_SHARE_LINK_SECRET =
  'development-only-intake-share-link-secret-change-me';
export const ADMIN_DEV_SESSION_SECRET =
  'development-only-admin-session-secret-change-me';
export const INTAKE_DEFAULT_UPLOAD_TYPES = [
  ...FILE_UPLOAD.ALLOWED_IMAGE_TYPES,
  ...FILE_UPLOAD.ALLOWED_DOCUMENT_TYPES,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
];
export const INTAKE_DEFAULT_MAX_UPLOAD_SIZE = 10 * 1024 * 1024;
export const INTAKE_PRIVACY_VERSION = '2026-04-13';
