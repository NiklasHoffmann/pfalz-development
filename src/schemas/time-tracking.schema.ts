import { z } from 'zod';

const trimmedString = z.string().trim();

export const timeProjectUpsertSchema = z.object({
  name: trimmedString.min(1, 'Name ist erforderlich'),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Ungültige Farbe')
    .default('#6366f1'),
  description: trimmedString.default(''),
  isActive: z.boolean().default(true),
});

export const timeActivityTypeUpsertSchema = z.object({
  name: trimmedString.min(1, 'Name ist erforderlich'),
  description: trimmedString.default(''),
  isActive: z.boolean().default(true),
});

export const timeEntryUpsertSchema = z.object({
  projectId: trimmedString.nullable().optional(),
  activityTypeId: trimmedString.nullable().optional(),
  date: trimmedString.min(1, 'Datum ist erforderlich'),
  startTime: trimmedString.nullable().optional(),
  endTime: trimmedString.nullable().optional(),
  durationMinutes: z.number().min(0).default(0),
  description: trimmedString.default(''),
  isRunning: z.boolean().default(false),
  isBillable: z.boolean().default(true),
});

export const timeEntryStartTimerSchema = z.object({
  projectId: trimmedString.nullable().optional(),
  activityTypeId: trimmedString.nullable().optional(),
  description: trimmedString.default(''),
  isBillable: z.boolean().default(true),
});

export type TimeProjectUpsertInput = z.infer<typeof timeProjectUpsertSchema>;
export type TimeActivityTypeUpsertInput = z.infer<
  typeof timeActivityTypeUpsertSchema
>;
export type TimeEntryUpsertInput = z.infer<typeof timeEntryUpsertSchema>;
export type TimeEntryStartTimerInput = z.infer<
  typeof timeEntryStartTimerSchema
>;
