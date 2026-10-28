import { CurrencyConfig, Transaction } from '../types/finance';

export const PKR_CURRENCY: CurrencyConfig = {
  code: 'PKR',
  symbol: 'Rs ',
  name: 'Pakistani Rupee',
  position: 'prefix',
};

export const CURRENCIES: CurrencyConfig[] = [
  PKR_CURRENCY,
  { code: 'USD', symbol: '$', name: 'US Dollar', position: 'prefix' },
  { code: 'EUR', symbol: '€', name: 'Euro', position: 'prefix' },
  { code: 'GBP', symbol: '£', name: 'British Pound', position: 'prefix' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', position: 'prefix' },
  { code: 'AED', symbol: 'AED ', name: 'UAE Dirham', position: 'prefix' },
  { code: 'SAR', symbol: 'SAR ', name: 'Saudi Riyal', position: 'prefix' },
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka', position: 'prefix' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', position: 'prefix' },
  { code: 'AUD', symbol: 'AU$', name: 'Australian Dollar', position: 'prefix' },
];

export function formatCurrency(
  amount: number,
  currency: CurrencyConfig = CURRENCIES[0],
  includeDecimals: boolean = true
): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount) || 0;

  // Format with en-PK for PKR or en-US for others
  const locale = currency.code === 'PKR' ? 'en-PK' : 'en-US';

  const formattedNum = absAmount.toLocaleString(locale, {
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0,
  });

  const sign = isNegative ? '-' : '';

  if (currency.position === 'prefix') {
    return `${sign}${currency.symbol}${formattedNum}`;
  } else {
    return `${sign}${formattedNum} ${currency.symbol}`;
  }
}

export function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function getCurrentDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatMonthYear(monthStr: string): string {
  const [year, month] = monthStr.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function getPreviousMonth(monthStr: string): string {
  const [year, month] = monthStr.split('-').map(Number);
  const date = new Date(year, month - 2, 1);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export function getNextMonth(monthStr: string): string {
  const [year, month] = monthStr.split('-').map(Number);
  const date = new Date(year, month, 1);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export function formatTransactionDate(dateStr: string): string {
  const today = getCurrentDate();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

  if (dateStr === today) return 'Today';
  if (dateStr === yStr) return 'Yesterday';

  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });
}

export function getDaysInMonth(monthStr: string): number {
  const [year, month] = monthStr.split('-').map(Number);
  return new Date(year, month, 0).getDate();
}

export function exportTransactionsToCSV(
  transactions: Transaction[],
  accountMap: Record<string, string>,
  currencySymbol: string
): void {
  const headers = ['ID', 'Date', 'Type', 'Category', 'Account', 'Amount', 'Currency', 'Note', 'Merchant', 'Tag'];
  const rows = transactions.map((t) => [
    t.id,
    t.date,
    t.type,
    t.category,
    accountMap[t.accountId] || t.accountId,
    t.amount.toFixed(2),
    currencySymbol,
    `"${(t.note || '').replace(/"/g, '""')}"`,
    `"${(t.merchant || '').replace(/"/g, '""')}"`,
    t.tag || '',
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `HisabPro_Export_${getCurrentDate()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
