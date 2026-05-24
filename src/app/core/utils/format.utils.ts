export function formatCurrency(
  amount: number | string | null | undefined,
  currency: string = 'RM',
): string {
  if (amount === null || amount === undefined || amount === '') {
    return '';
  }

  const numericAmount = Number(amount);
  if (isNaN(numericAmount)) {
    return String(amount);
  }

  const formattedValue = numericAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `${currency} ${formattedValue}`;
}

export function formatPercentage(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  const numericValue = Number(value);
  if (isNaN(numericValue)) {
    return String(value);
  }

  const formattedValue = numericValue.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `${formattedValue}%`;
}
