import type { BaseDocument } from '@/types/database';

export const intakeFormStatuses = ['draft', 'active', 'inactive'] as const;
export const intakeFormTypes = [
  'relaunch',
  'branding',
  'seo-content',
  'technical',
  'custom',
] as const;
export const intakeFieldTypes = [
  'text',
  'textarea',
  'email',
  'phone',
  'url',
  'company',
  'contactPerson',
  'budget',
  'dropdown',
  'radio',
  'checkbox-group',
  'yes-no',
  'date',
  'file',
  'rating',
  'priority',
  'heading',
  'notice',
  'consent',
] as const;
export const intakeVisibilityOperators = [
  'eq',
  'neq',
  'in',
  'contains',
  'gt',
  'lt',
  'isTrue',
] as const;
export const intakeSubmissionStatuses = [
  'begonnen',
  'teilweise_ausgefüllt',
  'vollständig_eingereicht',
  'intern_geprüft',
  'rückfrage_offen',
  'abgeschlossen',
] as const;
export const intakeStaffRoles = ['admin', 'editor'] as const;
export const intakeUploadOwners = ['customer', 'staff'] as const;
export const intakeUploadScanStatuses = [
  'pending',
  'clean',
  'blocked',
] as const;
export const adminAuditActorTypes = [
  'staff-user',
  'api-key',
  'system',
] as const;

export type IntakeFormStatus = (typeof intakeFormStatuses)[number];
export type IntakeFormType = (typeof intakeFormTypes)[number];
export type IntakeFieldType = (typeof intakeFieldTypes)[number];
export type IntakeVisibilityOperator =
  (typeof intakeVisibilityOperators)[number];
export type IntakeSubmissionStatus = (typeof intakeSubmissionStatuses)[number];
export type IntakeStaffRole = (typeof intakeStaffRoles)[number];
export type IntakeUploadOwner = (typeof intakeUploadOwners)[number];
export type IntakeUploadScanStatus = (typeof intakeUploadScanStatuses)[number];
export type AdminAuditActorType = (typeof adminAuditActorTypes)[number];

export interface IntakeFieldOption {
  label: string;
  value: string;
  description?: string;
}

export interface IntakeVisibilityRule {
  sourceQuestionKey: string;
  operator: IntakeVisibilityOperator;
  value?: unknown;
  values?: unknown[];
}

export interface IntakeValidationRules {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  min?: number;
  max?: number;
  allowedMimeTypes?: string[];
  maxFileSize?: number;
  allowMultiple?: boolean;
  minSelections?: number;
  maxSelections?: number;
}

export interface IntakeQuestionDefinition {
  id: string;
  key: string;
  fieldType: IntakeFieldType;
  label: string;
  helpText?: string;
  placeholder?: string;
  required: boolean;
  options?: IntakeFieldOption[];
  order: number;
  visibilityRules?: IntakeVisibilityRule[];
  validationRules?: IntakeValidationRules;
  defaultValue?: unknown;
}

export interface IntakeSectionDefinition {
  id: string;
  title: string;
  order: number;
  description?: string;
  stepKey: string;
  questions: IntakeQuestionDefinition[];
}

export interface IntakeNotificationConfig {
  internalRecipients: string[];
  internalSubject: string;
  internalTemplateKey: string;
  customerConfirmationEnabled: boolean;
  customerSubject?: string;
  customerTemplateKey?: string;
}

export interface IntakeFormSnapshot {
  title: string;
  slug: string;
  description?: string;
  formType: IntakeFormType;
  version: number;
  sections: IntakeSectionDefinition[];
  notificationConfig?: IntakeNotificationConfig;
}

export interface IntakeAnswerFileReference {
  fileAssetId: string;
  originalFilename: string;
  mimeType: string;
  size: number;
}

export interface IntakeAnswer {
  questionId: string;
  questionKey: string;
  value: unknown;
  displayValue?: string;
  files?: IntakeAnswerFileReference[];
}

export interface IntakeCustomerSnapshot {
  name: string;
  company?: string;
  email?: string;
  phone?: string;
}

export interface IntakeConsentRecord {
  accepted: boolean;
  acceptedAt?: Date;
  privacyVersion?: string;
  ipHash?: string;
  userAgent?: string;
}

export interface IIntakeForm extends BaseDocument {
  title: string;
  slug: string;
  description?: string;
  status: IntakeFormStatus;
  version: number;
  formType: IntakeFormType;
  defaultLocale?: string;
  sections: IntakeSectionDefinition[];
  notificationConfig?: IntakeNotificationConfig;
}

export interface IIntakeAccessLink extends BaseDocument {
  formId: string;
  formVersion: number;
  formSnapshot: IntakeFormSnapshot;
  locale?: string;
  projectId: string;
  customerName: string;
  company?: string;
  email?: string;
  phone?: string;
  tokenHash: string;
  tokenPreview: string;
  isActive: boolean;
  expiresAt?: Date | null;
  lastOpenedAt?: Date | null;
  createdBy?: string;
}

export interface IIntakeSubmission extends BaseDocument {
  formId: string;
  formVersion: number;
  accessLinkId: string;
  projectId: string;
  customerSnapshot: IntakeCustomerSnapshot;
  status: IntakeSubmissionStatus;
  currentStep?: string;
  progressPercent: number;
  answers: IntakeAnswer[];
  internalNotes?: string;
  assigneeUserId?: string;
  consent?: IntakeConsentRecord;
  lastSavedAt?: Date;
  submittedAt?: Date | null;
}

export interface IIntakeFileAsset extends BaseDocument {
  submissionId: string;
  accessLinkId: string;
  questionKey: string;
  storagePath: string;
  originalFilename: string;
  mimeType: string;
  size: number;
  uploadedAt: Date;
  uploadedBy: IntakeUploadOwner;
  scanStatus?: IntakeUploadScanStatus;
}

export interface IStaffUser extends BaseDocument {
  name: string;
  email: string;
  passwordHash: string;
  role: IntakeStaffRole;
  isActive: boolean;
  lastLoginAt?: Date | null;
}

export interface IAdminAuditLog extends BaseDocument {
  action: string;
  resourceType: string;
  resourceId?: string;
  actorType: AdminAuditActorType;
  actorUserId?: string;
  actorEmail?: string;
  actorRole?: IntakeStaffRole;
  requestPath: string;
  method: string;
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

export interface IntakeSessionPayload {
  accessLinkId: string;
  submissionId: string;
  formSlug: string;
  locale: string;
  issuedAt: number;
}

export interface IntakeTemplateDefinition {
  title: string;
  slug: string;
  description?: string;
  status: IntakeFormStatus;
  version: number;
  formType: IntakeFormType;
  defaultLocale?: string;
  sections: IntakeSectionDefinition[];
  notificationConfig?: IntakeNotificationConfig;
}

export interface AdminSessionPayload {
  staffUserId: string;
  role: IntakeStaffRole;
  issuedAt: number;
}
