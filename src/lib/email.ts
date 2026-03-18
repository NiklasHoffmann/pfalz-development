import nodemailer from 'nodemailer';
import { env } from './env';

interface ContactMailPayload {
  name: string;
  business?: string;
  email: string;
  phone?: string;
  message: string;
}

interface SendContactMailResult {
  sent: boolean;
  reason: 'sent' | 'not-configured';
}

function isMailConfigured(): boolean {
  return Boolean(
    env.SMTP_HOST &&
    env.SMTP_PORT &&
    env.SMTP_USER &&
    env.SMTP_PASS &&
    env.CONTACT_TO_EMAIL
  );
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export async function sendContactMail(
  payload: ContactMailPayload
): Promise<SendContactMailResult> {
  if (!isMailConfigured()) {
    return { sent: false, reason: 'not-configured' };
  }

  const transport = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE ?? env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });

  const lines = [
    `Name: ${payload.name}`,
    `Betrieb/Projekt: ${payload.business || '-'}`,
    `E-Mail: ${payload.email}`,
    `Telefon: ${payload.phone || '-'}`,
    '',
    'Nachricht:',
    payload.message,
  ];

  await transport.sendMail({
    from: env.CONTACT_FROM_EMAIL || env.SMTP_FROM_EMAIL || env.SMTP_USER,
    to: env.CONTACT_TO_EMAIL,
    replyTo: payload.email,
    subject: `Neue Anfrage von ${payload.name}`,
    text: lines.join('\n'),
    html: `
      <div style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #1c1917;">
        <h2>Neue Anfrage ueber das Kontaktformular</h2>
        <p><strong>Name:</strong> ${escapeHtml(payload.name)}</p>
        <p><strong>Betrieb/Projekt:</strong> ${escapeHtml(payload.business || '-')}</p>
        <p><strong>E-Mail:</strong> ${escapeHtml(payload.email)}</p>
        <p><strong>Telefon:</strong> ${escapeHtml(payload.phone || '-')}</p>
        <p><strong>Nachricht:</strong></p>
        <p>${escapeHtml(payload.message).replaceAll('\n', '<br />')}</p>
      </div>
    `,
  });

  return { sent: true, reason: 'sent' };
}
