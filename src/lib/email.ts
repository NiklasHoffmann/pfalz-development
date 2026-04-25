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

interface AdminPasswordResetMailPayload {
  toEmail: string;
  staffName?: string;
  resetUrl: string;
}

interface SendAdminPasswordResetMailResult {
  sent: boolean;
  reason: 'sent' | 'not-configured';
}

interface IntakeMailSummaryItem {
  label: string;
  value: string;
}

interface IntakeSubmissionMailPayload {
  formTitle: string;
  projectId: string;
  customerName: string;
  customerCompany?: string;
  customerEmail?: string;
  customerPhone?: string;
  summary: IntakeMailSummaryItem[];
  internalRecipients?: string[];
  internalSubject?: string;
  customerConfirmationEnabled?: boolean;
  customerSubject?: string;
}

interface SendIntakeMailResult {
  internal: 'sent' | 'not-configured' | 'no-recipient';
  customer: 'sent' | 'not-configured' | 'disabled' | 'no-recipient';
}

function hasSmtpConfig(): boolean {
  return Boolean(
    env.SMTP_HOST && env.SMTP_PORT && env.SMTP_USER && env.SMTP_PASS
  );
}

function isMailConfigured(): boolean {
  return Boolean(hasSmtpConfig() && env.CONTACT_TO_EMAIL);
}

function createMailTransport() {
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE ?? env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
}

function getFromAddress() {
  return env.CONTACT_FROM_EMAIL || env.SMTP_FROM_EMAIL || env.SMTP_USER;
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

  const transport = createMailTransport();

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
    from: getFromAddress(),
    to: env.CONTACT_TO_EMAIL,
    replyTo: payload.email,
    subject: `Neue Anfrage von ${payload.name}`,
    text: lines.join('\n'),
    html: `
      <div style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #1c1917;">
        <h2>Neue Anfrage über das Kontaktformular</h2>
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

export async function sendAdminPasswordResetMail(
  payload: AdminPasswordResetMailPayload
): Promise<SendAdminPasswordResetMailResult> {
  if (!hasSmtpConfig()) {
    return { sent: false, reason: 'not-configured' };
  }

  const transport = createMailTransport();
  const greetingName = payload.staffName?.trim() || 'Hallo';

  await transport.sendMail({
    from: getFromAddress(),
    to: payload.toEmail,
    subject: 'Admin-Passwort zurücksetzen',
    text: [
      `${greetingName},`,
      '',
      'für deinen Admin-Zugang wurde ein Link zum Zurücksetzen des Passworts angefordert.',
      'Wenn du das warst, öffne bitte diesen Link:',
      payload.resetUrl,
      '',
      'Der Link ist 60 Minuten gültig. Falls du die Anfrage nicht gestartet hast, kannst du diese E-Mail ignorieren.',
    ].join('\n'),
    html: `
      <div style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #1c1917;">
        <h2>Admin-Passwort zurücksetzen</h2>
        <p>Hallo ${escapeHtml(greetingName)},</p>
        <p>
          für deinen Admin-Zugang wurde ein Link zum Zurücksetzen des Passworts angefordert.
        </p>
        <p>
          <a href="${escapeHtml(payload.resetUrl)}" style="display: inline-block; padding: 10px 16px; border-radius: 999px; background: #1c1917; color: #ffffff; text-decoration: none; font-weight: 700;">Passwort zurücksetzen</a>
        </p>
        <p>Oder direkt diesen Link öffnen:</p>
        <p><a href="${escapeHtml(payload.resetUrl)}">${escapeHtml(payload.resetUrl)}</a></p>
        <p>Der Link ist 60 Minuten gültig. Falls du die Anfrage nicht gestartet hast, kannst du diese E-Mail ignorieren.</p>
      </div>
    `,
  });

  return { sent: true, reason: 'sent' };
}

export async function sendIntakeSubmissionMails(
  payload: IntakeSubmissionMailPayload
): Promise<SendIntakeMailResult> {
  if (!isMailConfigured()) {
    return {
      internal: 'not-configured',
      customer: 'not-configured',
    };
  }

  const transport = createMailTransport();
  const internalRecipients = payload.internalRecipients?.filter(Boolean) || [];
  const fallbackRecipient = env.CONTACT_TO_EMAIL?.trim();
  const resolvedInternalRecipients = internalRecipients.length
    ? internalRecipients
    : fallbackRecipient
      ? [fallbackRecipient]
      : [];
  const internalSubject =
    payload.internalSubject || `Neuer Kundenfragebogen: ${payload.formTitle}`;
  const summaryLines = payload.summary.length
    ? payload.summary.map((item) => `${item.label}: ${item.value}`)
    : ['Keine Antworten im Summary vorhanden.'];

  let internal: SendIntakeMailResult['internal'] = 'no-recipient';
  let customer: SendIntakeMailResult['customer'] =
    payload.customerConfirmationEnabled ? 'no-recipient' : 'disabled';

  if (resolvedInternalRecipients.length) {
    await transport.sendMail({
      from: getFromAddress(),
      to: resolvedInternalRecipients.join(', '),
      replyTo: payload.customerEmail || getFromAddress(),
      subject: internalSubject,
      text: [
        `Formular: ${payload.formTitle}`,
        `Projekt: ${payload.projectId}`,
        `Kunde: ${payload.customerName}`,
        `Firma: ${payload.customerCompany || '-'}`,
        `E-Mail: ${payload.customerEmail || '-'}`,
        `Telefon: ${payload.customerPhone || '-'}`,
        '',
        'Antworten:',
        ...summaryLines,
      ].join('\n'),
      html: `
        <div style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #1c1917;">
          <h2>Neuer Kundenfragebogen eingegangen</h2>
          <p><strong>Formular:</strong> ${escapeHtml(payload.formTitle)}</p>
          <p><strong>Projekt:</strong> ${escapeHtml(payload.projectId)}</p>
          <p><strong>Kunde:</strong> ${escapeHtml(payload.customerName)}</p>
          <p><strong>Firma:</strong> ${escapeHtml(payload.customerCompany || '-')}</p>
          <p><strong>E-Mail:</strong> ${escapeHtml(payload.customerEmail || '-')}</p>
          <p><strong>Telefon:</strong> ${escapeHtml(payload.customerPhone || '-')}</p>
          <h3>Antworten</h3>
          <ul>
            ${payload.summary
              .map(
                (item) =>
                  `<li><strong>${escapeHtml(item.label)}:</strong> ${escapeHtml(item.value || '-')}</li>`
              )
              .join('')}
          </ul>
        </div>
      `,
    });

    internal = 'sent';
  }

  if (payload.customerConfirmationEnabled && payload.customerEmail) {
    await transport.sendMail({
      from: getFromAddress(),
      to: payload.customerEmail,
      subject:
        payload.customerSubject ||
        `Bestätigung: ${payload.formTitle} wurde übermittelt`,
      text: [
        `Hallo ${payload.customerName},`,
        '',
        `dein Fragebogen "${payload.formTitle}" für das Projekt ${payload.projectId} wurde erfolgreich übermittelt.`,
        'Wir nutzen die Angaben jetzt für die interne Projektvorbereitung und melden uns mit den nächsten Schritten.',
      ].join('\n'),
      html: `
        <div style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #1c1917;">
          <h2>Dein Fragebogen wurde übermittelt</h2>
          <p>Hallo ${escapeHtml(payload.customerName)},</p>
          <p>
            dein Fragebogen <strong>${escapeHtml(payload.formTitle)}</strong> für das Projekt
            <strong>${escapeHtml(payload.projectId)}</strong> wurde erfolgreich übermittelt.
          </p>
          <p>
            Wir nutzen die Angaben jetzt für die interne Projektvorbereitung und melden uns mit den nächsten Schritten.
          </p>
        </div>
      `,
    });

    customer = 'sent';
  }

  return {
    internal,
    customer,
  };
}
