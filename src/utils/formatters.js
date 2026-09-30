// Uzbek month and payment method formatters for UI and Receipts

export const MONTH_NAMES_UZ = {
  '01': 'Yanvar',
  '02': 'Fevral',
  '03': 'Mart',
  '04': 'Aprel',
  '05': 'May',
  '06': 'Iyun',
  '07': 'Iyul',
  '08': 'Avgust',
  '09': 'Sentabr',
  '10': 'Oktabr',
  '11': 'Noyabr',
  '12': 'Dekabr',
  '1': 'Yanvar',
  '2': 'Fevral',
  '3': 'Mart',
  '4': 'Aprel',
  '5': 'May',
  '6': 'Iyun',
  '7': 'Iyul',
  '8': 'Avgust',
  '9': 'Sentabr'
};

export const PAYMENT_METHOD_NAMES_UZ = {
  'CASH': 'Naqd pul',
  'CARD': 'Bank kartasi',
  'CLICK': 'Click',
  'PAYME': 'Payme',
  'UZUM': 'Uzum Bank',
  'BANK_TRANSFER': 'Bank o\'tkazmasi'
};

/**
 * Converts 'YYYY-MM' (e.g. '2026-09') to Uzbek text 'Sentabr, 2026'
 */
export function formatMonthUz(monthStr) {
  if (!monthStr) return '';
  const cleaned = String(monthStr).trim();
  const parts = cleaned.split('-');
  if (parts.length === 2) {
    const year = parts[0];
    const month = parts[1].padStart(2, '0');
    const monthName = MONTH_NAMES_UZ[month] || month;
    return `${monthName}, ${year}`;
  }
  return cleaned;
}

/**
 * Converts payment method code (e.g. 'CASH') to Uzbek text 'Naqd pul'
 */
export function formatPaymentMethodUz(method) {
  if (!method) return 'Naqd pul';
  const clean = String(method).trim().toUpperCase();
  return PAYMENT_METHOD_NAMES_UZ[clean] || clean;
}
