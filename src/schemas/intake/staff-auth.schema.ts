import { z } from 'zod';
import { intakeStaffRoles } from '@/types/intake';

export const staffLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(10),
});

export const bootstrapStaffUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(10),
  role: z.enum(intakeStaffRoles).default('admin'),
});

export const createStaffUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(10),
  role: z.enum(intakeStaffRoles).default('editor'),
  isActive: z.boolean().optional().default(true),
});

export const updateStaffUserSchema = z
  .object({
    name: z.string().min(2).optional(),
    password: z.string().min(10).optional(),
    role: z.enum(intakeStaffRoles).optional(),
    isActive: z.boolean().optional(),
  })
  .refine(
    (value) =>
      value.name !== undefined ||
      value.password !== undefined ||
      value.role !== undefined ||
      value.isActive !== undefined,
    {
      message: 'At least one staff user field must be updated',
      path: ['name'],
    }
  );
