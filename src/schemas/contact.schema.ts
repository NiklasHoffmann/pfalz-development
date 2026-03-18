import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  business: z
    .string()
    .trim()
    .max(80, 'Business must not exceed 80 characters')
    .optional()
    .or(z.literal('')),
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  phone: z
    .string()
    .trim()
    .max(30, 'Phone number must not exceed 30 characters')
    .optional()
    .or(z.literal('')),
  message: z.string().trim().min(20, 'Message must be at least 20 characters'),
  website: z.string().max(0).optional().or(z.literal('')),
});

export type ContactFormValues = z.infer<typeof contactSchema>;
