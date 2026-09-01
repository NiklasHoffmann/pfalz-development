export interface InvoiceTotalsLineInput {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface InvoiceTotalsLine extends InvoiceTotalsLineInput {
  total: number;
}

export interface InvoiceTotals {
  lineItems: InvoiceTotalsLine[];
  subtotal: number;
  total: number;
}

/**
 * Pure invoice math. Kept free of database/server imports so it can run in the
 * browser (live editor preview) and on the server (persistence, PDF rendering).
 */
export function calculateInvoiceTotals(
  lineItems: InvoiceTotalsLineInput[]
): InvoiceTotals {
  const normalizedLineItems: InvoiceTotalsLine[] = lineItems.map((lineItem) => {
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
