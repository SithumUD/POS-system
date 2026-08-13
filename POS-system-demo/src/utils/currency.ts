export function formatCurrency(value: number, withSymbol = true): string {
  const formatted = value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return withSymbol ? `Rs. ${formatted}` : formatted;
}

export function formatNumber(value: number): string {
  return value.toLocaleString('en-US');
}