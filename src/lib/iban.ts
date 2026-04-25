export function compactIban(value: string) {
  return value.replace(/\s+/g, '').toUpperCase();
}

export function formatIban(value: string) {
  const compactValue = compactIban(value);

  if (!compactValue) {
    return '';
  }

  return compactValue.match(/.{1,4}/g)?.join(' ') || compactValue;
}
