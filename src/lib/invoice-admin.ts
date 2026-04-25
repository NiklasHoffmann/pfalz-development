import type { Model } from 'mongoose';
import Invoice from '@/models/Invoice';
import InvoiceSettings from '@/models/InvoiceSettings';
import type { IInvoice, IInvoiceSettings } from '@/types/invoice';

const DEFAULT_YEAR = new Date().getFullYear();

export function normalizeInvoiceNoteText(value: string) {
  return value.replace(/gemaess/gi, 'gemäß');
}

export function getDefaultInvoiceSettingsPayload() {
  return {
    scope: 'default' as const,
    senderProfile: {
      company: 'pfalz-development.de',
      name: '',
      street: '',
      city: '',
      email: '',
      phone: '',
      taxNumber: '',
    },
    paymentProfile: {
      payee: '',
      iban: '',
      bic: '',
      bank: '',
    },
    defaultNote:
      'Als Kleinunternehmer wird gemäß § 19 UStG keine Umsatzsteuer berechnet und ausgewiesen.',
    numbering: {
      year: DEFAULT_YEAR,
      nextSequence: 111,
      startSequence: 111,
      padding: 3,
    },
  };
}

export async function getOrCreateInvoiceSettings() {
  const defaults = getDefaultInvoiceSettingsPayload();

  const settings = await InvoiceSettings.findOneAndUpdate(
    { scope: 'default' },
    { $setOnInsert: defaults },
    {
      new: true,
      upsert: true,
    }
  ).exec();

  if (!settings) {
    throw new Error('Invoice settings could not be loaded');
  }

  const normalizedDefaultNote = normalizeInvoiceNoteText(settings.defaultNote);

  if (normalizedDefaultNote !== settings.defaultNote) {
    settings.defaultNote = normalizedDefaultNote;
    await settings.save();
  }

  return settings;
}

export function formatInvoiceNumber(
  settings: IInvoiceSettings,
  sequence?: number
) {
  const year = settings.numbering.year;
  const resolvedSequence = sequence ?? settings.numbering.nextSequence;
  return `${year}-${String(resolvedSequence).padStart(settings.numbering.padding, '0')}`;
}

export async function getNextInvoiceNumberPreview() {
  const settings = await getOrCreateInvoiceSettings();
  return formatInvoiceNumber(settings);
}

export async function reserveNextInvoiceNumber() {
  let settings = await getOrCreateInvoiceSettings();
  const currentYear = new Date().getFullYear();

  if (settings.numbering.year !== currentYear) {
    const rolledSettings = await InvoiceSettings.findOneAndUpdate(
      { scope: 'default' },
      {
        $set: {
          'numbering.year': currentYear,
          'numbering.nextSequence': settings.numbering.startSequence,
        },
      },
      { new: true }
    ).exec();

    if (!rolledSettings) {
      throw new Error(
        'Invoice settings could not be rolled to the current year'
      );
    }

    settings = rolledSettings;
  }

  const updated = await InvoiceSettings.findOneAndUpdate(
    { scope: 'default' },
    { $inc: { 'numbering.nextSequence': 1 } },
    { new: true }
  ).exec();

  if (!updated) {
    throw new Error('Invoice settings could not be incremented');
  }

  return formatInvoiceNumber(updated, updated.numbering.nextSequence - 1);
}

export async function syncInvoiceNumbering(invoiceNumber: string) {
  const match = invoiceNumber.trim().match(/^(\d{4})-(\d+)$/);

  if (!match) {
    return;
  }

  const [, yearText, sequenceText] = match;
  const year = Number(yearText);
  const sequence = Number(sequenceText);

  if (!Number.isFinite(year) || !Number.isFinite(sequence)) {
    return;
  }

  const settings = await getOrCreateInvoiceSettings();
  const nextSequence = sequence + 1;
  const shouldUpdateYear = year > settings.numbering.year;
  const shouldUpdateSameYear =
    year === settings.numbering.year &&
    nextSequence > settings.numbering.nextSequence;

  if (!shouldUpdateYear && !shouldUpdateSameYear) {
    return;
  }

  await InvoiceSettings.findOneAndUpdate(
    { scope: 'default' },
    {
      $set: {
        'numbering.year': year,
        'numbering.nextSequence': nextSequence,
      },
    }
  ).exec();
}

export function normalizeInvoiceDates(
  invoiceDate: string,
  dueDate?: string | null
) {
  return {
    invoiceDate: new Date(invoiceDate),
    dueDate: dueDate ? new Date(dueDate) : null,
  };
}

export function calculateInvoiceTotals(
  lineItems: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
  }>
) {
  const normalizedLineItems = lineItems.map((lineItem) => {
    const quantity = Number(lineItem.quantity) || 0;
    const unitPrice = Number(lineItem.unitPrice) || 0;
    const total = Number((quantity * unitPrice).toFixed(2));

    return {
      ...lineItem,
      quantity,
      unitPrice,
      total,
    };
  });

  const subtotal = Number(
    normalizedLineItems
      .reduce((sum, lineItem) => sum + lineItem.total, 0)
      .toFixed(2)
  );

  return {
    lineItems: normalizedLineItems,
    subtotal,
    total: subtotal,
  };
}

export async function ensureUniqueInvoiceNumber(
  invoiceNumber: string,
  excludeInvoiceId?: string,
  invoiceModel: Model<IInvoice> = Invoice
) {
  const existingInvoice = await invoiceModel
    .findOne({
      invoiceNumber,
      ...(excludeInvoiceId ? { _id: { $ne: excludeInvoiceId } } : {}),
    })
    .select('_id')
    .exec();

  return !existingInvoice;
}
