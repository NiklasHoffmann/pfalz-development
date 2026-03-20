import { z } from 'zod';

export type ContactFormValues = {
  name: string;
  business?: string;
  email: string;
  phone?: string;
  message: string;
  website?: string;
};

export function createContactSchema(
  t: (key: string) => string
): z.ZodType<ContactFormValues> {
  return z.object({
    name: z.string().trim().min(2, t('validation.nameMin')),
    business: z
      .string()
      .trim()
      .max(80, t('validation.businessMax'))
      .optional()
      .or(z.literal('')),
    email: z
      .string()
      .trim()
      .min(1, t('validation.emailRequired'))
      .email(t('validation.emailInvalid')),
    phone: z
      .string()
      .trim()
      .max(30, t('validation.phoneMax'))
      .optional()
      .or(z.literal('')),
    message: z.string().trim().min(20, t('validation.messageMin')),
    website: z.string().max(0).optional().or(z.literal('')),
  });
}

const fallbackValidationMessages: Record<string, string> = {
  'validation.nameMin': 'Name must be at least 2 characters long.',
  'validation.businessMax':
    'Business or project must not exceed 80 characters.',
  'validation.emailRequired': 'Email is required.',
  'validation.emailInvalid': 'Please enter a valid email address.',
  'validation.phoneMax': 'Phone number must not exceed 30 characters.',
  'validation.messageMin': 'Message must be at least 20 characters long.',
};

export const contactSchema = createContactSchema(
  (key) => fallbackValidationMessages[key] ?? key
);
