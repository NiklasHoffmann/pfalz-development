import { z } from 'zod';

const intakeAnswerFileSchema = z.object({
  fileAssetId: z.string().min(1),
  originalFilename: z.string().min(1),
  mimeType: z.string().min(1),
  size: z.number().min(0),
});

export const intakeAnswerSchema = z.object({
  questionId: z.string().min(1),
  questionKey: z.string().min(1),
  value: z.unknown(),
  displayValue: z.string().optional(),
  files: z.array(intakeAnswerFileSchema).optional(),
});

export const intakeDraftUpdateSchema = z.object({
  answers: z.array(intakeAnswerSchema).default([]),
  currentStep: z.string().optional(),
  progressPercent: z.number().min(0).max(100).optional(),
});

export type IntakeDraftUpdateInput = z.infer<typeof intakeDraftUpdateSchema>;
