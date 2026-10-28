export type TransactionType = 'expense' | 'income' | 'transfer';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  accountId: string; // Account/Wallet ID
  toAccountId?: string; // Used for transfer
  note: string;
  merchant?: string;
  tag?: string;
  receiptNote?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string; // Lucide icon identifier
  color: string; // Hex color code
  type: 'expense' | 'income';
  budgetLimit?: number;
}

export interface Account {
  id: string;
  name: string;
  type: 'cash' | 'bank' | 'savings' | 'credit' | 'wallet';
  initialBalance: number;
  color: string;
  accountNumber?: string;
}

export interface Budget {
  id: string;
  categoryId: string; // 'all' for overall budget or specific category id
  month: string; // YYYY-MM
  amount: number;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  targetDate: string; // YYYY-MM-DD
  color: string;
  icon: string;
  notes?: string;
}

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  position: 'prefix' | 'suffix';
}

export interface UserSettings {
  currency: CurrencyConfig;
  monthlyOverallBudget: number;
  userName: string;
  darkMode: boolean;
  autoCarryOver: boolean;
}

export interface FinancialStats {
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  remainingBudget: number;
  budgetUsagePercent: number;
  savingsRate: number; // percentage
  dailyAverageSpend: number;
  largestExpense: Transaction | null;
  transactionCount: number;
}

export interface CategorySpend {
  category: Category;
  amount: number;
  percentage: number;
  transactionCount: number;
  budget?: number;
}
