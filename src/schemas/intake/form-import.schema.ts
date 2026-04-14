import { z } from 'zod';
import {
  intakeFieldTypes,
  intakeFormStatuses,
  intakeFormTypes,
  intakeVisibilityOperators,
} from '@/types/intake';

const supportedLocales = ['de', 'en', 'pfl'] as const;

const importedIntakeFieldOptionSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
  description: z.string().min(1).optional(),
});

const importedIntakeVisibilityRuleSchema = z.object({
  sourceQuestionKey: z.string().min(1),
  operator: z.enum(intakeVisibilityOperators),
  value: z.unknown().optional(),
  values: z.array(z.unknown()).optional(),
});

const importedIntakeValidationRulesSchema = z.object({
  minLength: z.number().int().nonnegative().optional(),
  maxLength: z.number().int().positive().optional(),
  pattern: z.string().min(1).optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  allowedMimeTypes: z.array(z.string().min(1)).optional(),
  maxFileSize: z.number().int().positive().optional(),
  allowMultiple: z.boolean().optional(),
  minSelections: z.number().int().nonnegative().optional(),
  maxSelections: z.number().int().positive().optional(),
});

const importedIntakeQuestionSchema = z.object({
  id: z.string().min(1),
  key: z.string().min(1),
  fieldType: z.enum(intakeFieldTypes),
  label: z.string().min(1),
  helpText: z.string().min(1).optional(),
  placeholder: z.string().min(1).optional(),
  required: z.boolean(),
  options: z.array(importedIntakeFieldOptionSchema).optional(),
  order: z.number().int().nonnegative(),
  visibilityRules: z.array(importedIntakeVisibilityRuleSchema).optional(),
  validationRules: importedIntakeValidationRulesSchema.optional(),
  defaultValue: z.unknown().optional(),
});

const importedIntakeSectionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  order: z.number().int().nonnegative(),
  description: z.string().min(1).optional(),
  stepKey: z.string().min(1),
  questions: z.array(importedIntakeQuestionSchema).min(1),
});

const importedIntakeNotificationConfigSchema = z.object({
  internalRecipients: z.array(z.string().email()),
  internalSubject: z.string().min(1),
  internalTemplateKey: z.string().min(1),
  customerConfirmationEnabled: z.boolean(),
  customerSubject: z.string().min(1).optional(),
  customerTemplateKey: z.string().min(1).optional(),
});

export const importedIntakeFormSchema = z.object({
  title: z.string().min(3),
  slug: z
    .string()
    .min(3)
    .regex(/^[a-z0-9-]+$/),
  description: z.string().min(3).optional(),
  status: z.enum(intakeFormStatuses),
  version: z.number().int().min(1),
  formType: z.enum(intakeFormTypes),
  defaultLocale: z.enum(supportedLocales).optional(),
  notificationConfig: importedIntakeNotificationConfigSchema.optional(),
  sections: z.array(importedIntakeSectionSchema).min(1),
});

export const previewImportedIntakeFormSchema = z.object({
  action: z.literal('preview'),
  json: z.string().min(2),
});

export const importIntakeFormSchema = z.object({
  action: z.literal('import'),
  json: z.string().min(2),
  overwrite: z.boolean().optional(),
});

export type ImportedIntakeFormDocument = z.infer<
  typeof importedIntakeFormSchema
>;
