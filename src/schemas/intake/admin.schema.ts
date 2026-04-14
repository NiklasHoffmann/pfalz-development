import { z } from 'zod';
import {
  adminAuditActorTypes,
  intakeFormStatuses,
  intakeFormTypes,
  intakeSubmissionStatuses,
} from '@/types/intake';

export const intakeAdminBootstrapSchema = z.object({
  overwrite: z.boolean().optional(),
});

export const createIntakeFormSchema = z
  .object({
    templateSlug: z.string().min(1).optional(),
    duplicateFromFormId: z.string().min(1).optional(),
    title: z.string().min(3),
    slug: z
      .string()
      .min(3)
      .regex(/^[a-z0-9-]+$/),
    description: z.string().optional(),
    status: z.enum(intakeFormStatuses).optional(),
  })
  .refine((value) => Boolean(value.templateSlug || value.duplicateFromFormId), {
    message: 'templateSlug or duplicateFromFormId is required',
    path: ['templateSlug'],
  });

export const listIntakeFormsQuerySchema = z.object({
  status: z.enum(intakeFormStatuses).optional(),
  formType: z.enum(intakeFormTypes).optional(),
  search: z.string().optional(),
});

export const createIntakeAccessLinkSchema = z.object({
  formId: z.string().min(1),
  projectId: z.string().min(1),
  customerName: z.string().min(2),
  company: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  expiresAt: z.string().datetime().optional(),
  locale: z.enum(['de', 'en', 'pfl']).optional(),
});

export const listIntakeAccessLinksQuerySchema = z.object({
  formId: z.string().optional(),
  search: z.string().optional(),
  isActive: z.enum(['true', 'false']).optional(),
});

export const updateIntakeAccessLinkAdminSchema = z
  .object({
    isActive: z.boolean().optional(),
    regenerateToken: z.boolean().optional(),
  })
  .refine(
    (value) => value.isActive !== undefined || value.regenerateToken === true,
    {
      message: 'At least one access link field must be updated',
      path: ['isActive'],
    }
  );

export const listIntakeSubmissionsQuerySchema = z.object({
  status: z.enum(intakeSubmissionStatuses).optional(),
  formType: z.enum(intakeFormTypes).optional(),
  search: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export const listAdminAuditLogsQuerySchema = z.object({
  actorType: z.enum(adminAuditActorTypes).optional(),
  resourceType: z.string().min(1).optional(),
  method: z.enum(['POST', 'PATCH']).optional(),
  search: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
});

export const updateIntakeSubmissionAdminSchema = z
  .object({
    status: z.enum(intakeSubmissionStatuses).optional(),
    internalNotes: z.string().max(5000).optional().nullable(),
    assigneeUserId: z.string().min(1).optional().nullable(),
  })
  .refine(
    (value) =>
      value.status !== undefined ||
      value.internalNotes !== undefined ||
      value.assigneeUserId !== undefined,
    {
      message: 'At least one submission field must be updated',
      path: ['status'],
    }
  );
