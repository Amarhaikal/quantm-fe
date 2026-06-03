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

export function getAvatarInitials(
  shortname: string | null | undefined,
  fullname: string | null | undefined,
): string {
  const nameToUse = (shortname && shortname.trim()) || (fullname && fullname.trim()) || '';
  if (!nameToUse) return '';
  const words = nameToUse.split(/\s+/);
  const skipWords = new Set(['bin', 'binti', 'al', 'ap', 'bte', 'bt', 'a/l', 'a/p']);
  const filtered = words.filter((word) => {
    const clean = word.toLowerCase().replace(/[^a-z0-9/]/g, '');
    return !skipWords.has(clean) && !skipWords.has(word.toLowerCase());
  });

  if (filtered.length === 0) return '';
  if (filtered.length === 1) {
    return filtered[0].substring(0, 2).toUpperCase();
  }
  return (filtered[0].charAt(0) + filtered[1].charAt(0)).toUpperCase();
}

export function getAvatarGenderClass(genderCode: string | null | undefined): string {
  if (genderCode === 'M') {
    return 'bg-blue-100! text-blue-600!';
  }
  if (genderCode === 'F') {
    return 'bg-pink-100! text-pink-600!';
  }
  return 'bg-indigo-100! text-indigo-600!';
}

