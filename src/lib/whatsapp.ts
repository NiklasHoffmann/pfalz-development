export function toWhatsAppInternationalNumber(value: string): string {
  const digitsOnly = value.replace(/\D+/g, '');

  if (digitsOnly.startsWith('0')) {
    return `49${digitsOnly.slice(1)}`;
  }

  return digitsOnly;
}

export function buildWhatsAppHref(value: string, message: string): string {
  const normalizedNumber = toWhatsAppInternationalNumber(value);
  return `https://wa.me/${normalizedNumber}?text=${encodeURIComponent(message)}`;
}
