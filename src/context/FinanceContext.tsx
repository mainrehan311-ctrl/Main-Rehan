import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  Account,
  Budget,
  Category,
  CategorySpend,
  FinancialStats,
  SavingsGoal,
  Transaction,
  UserSettings,
} from '../types/finance';
import { getCurrentDate, getCurrentMonth } from '../utils/formatters';
import {
  DEFAULT_ACCOUNTS,
  DEFAULT_CATEGORIES,
  DEFAULT_SAVINGS_GOALS,
  DEFAULT_SETTINGS,
  getSampleTransactions,
} from '../utils/initialData';

interface FinanceContextType {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  settings: UserSettings;
  selectedMonth: string; // YYYY-MM
  accountBalances: Record<string, number>;
  monthlyStats: FinancialStats;
  previousMonthStats: FinancialStats;
  categorySpending: CategorySpend[];
  dailySpending: { day: number; date: string; amount: number }[];
  setSelectedMonth: (month: string) => void;
  addTransaction: (data: Omit<Transaction, 'id'>) => string;
  updateTransaction: (id: string, data: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addAccount: (account: Omit<Account, 'id'>) => void;
  updateAccount: (id: string, data: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, data: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  updateBudget: (categoryId: string, amount: number) => void;
  updateOverallBudget: (amount: number) => void;
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'savedAmount'>) => void;
  updateSavingsGoal: (id: string, data: Partial<SavingsGoal>) => void;
  depositToGoal: (id: string, amount: number, fromAccountId: string) => void;
  withdrawFromGoal: (id: string, amount: number, toAccountId: string) => void;
  deleteSavingsGoal: (id: string) => void;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  resetToSampleData: () => void;
  clearAllData: () => void;
  importFromJSON: (jsonString: string) => boolean;
  exportToJSON: () => string;
}

const STORAGE_KEY = 'hisabpro_finance_data_v3';
const LEGACY_STORAGE_KEY = 'hisabpro_finance_data_v2';

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state with localStorage or defaults with migration support
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_tx`) || localStorage.getItem(`${LEGACY_STORAGE_KEY}_tx`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return getSampleTransactions();
    } catch {
      return getSampleTransactions();
    }
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_cat`) || localStorage.getItem(`${LEGACY_STORAGE_KEY}_cat`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return DEFAULT_CATEGORIES;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  });

  const [accounts, setAccounts] = useState<Account[]>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_acc`) || localStorage.getItem(`${LEGACY_STORAGE_KEY}_acc`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return DEFAULT_ACCOUNTS;
    } catch {
      return DEFAULT_ACCOUNTS;
    }
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_budgets`) || localStorage.getItem(`${LEGACY_STORAGE_KEY}_budgets`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_goals`) || localStorage.getItem(`${LEGACY_STORAGE_KEY}_goals`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return DEFAULT_SAVINGS_GOALS;
    } catch {
      return DEFAULT_SAVINGS_GOALS;
    }
  });

  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_settings`);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...DEFAULT_SETTINGS,
          ...parsed,
          currency: parsed.currency || DEFAULT_SETTINGS.currency,
        };
      }
      // Check legacy settings and ensure default currency is PKR
      const legacyStored = localStorage.getItem(`${LEGACY_STORAGE_KEY}_settings`);
      if (legacyStored) {
        const parsed = JSON.parse(legacyStored);
        return {
          ...DEFAULT_SETTINGS,
          ...parsed,
          currency: parsed.currency?.code === 'USD' ? DEFAULT_SETTINGS.currency : (parsed.currency || DEFAULT_SETTINGS.currency),
        };
      }
      return DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [selectedMonth, setSelectedMonth] = useState<string>(() => getCurrentMonth());

  // Save to localStorage on state changes with error safety
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_tx`, JSON.stringify(transactions));
      localStorage.setItem(`${STORAGE_KEY}_cat`, JSON.stringify(categories));
      localStorage.setItem(`${STORAGE_KEY}_acc`, JSON.stringify(accounts));
      localStorage.setItem(`${STORAGE_KEY}_budgets`, JSON.stringify(budgets));
      localStorage.setItem(`${STORAGE_KEY}_goals`, JSON.stringify(savingsGoals));
      localStorage.setItem(`${STORAGE_KEY}_settings`, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to sync HisabPro data to localStorage:', e);
    }
  }, [transactions, categories, accounts, budgets, savingsGoals, settings]);

  // Synchronize Dark Mode class on document root
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  // Calculate live account balances
  const accountBalances = useMemo(() => {
    const balances: Record<string, number> = {};
    accounts.forEach((acc) => {
      balances[acc.id] = acc.initialBalance;
    });

    transactions.forEach((tx) => {
      if (tx.type === 'income') {
        if (balances[tx.accountId] !== undefined) {
          balances[tx.accountId] += tx.amount;
        }
      } else if (tx.type === 'expense') {
        if (balances[tx.accountId] !== undefined) {
          balances[tx.accountId] -= tx.amount;
        }
      } else if (tx.type === 'transfer') {
        if (balances[tx.accountId] !== undefined) {
          balances[tx.accountId] -= tx.amount;
        }
        if (tx.toAccountId && balances[tx.toAccountId] !== undefined) {
          balances[tx.toAccountId] += tx.amount;
        }
      }
    });

    return balances;
  }, [accounts, transactions]);

  // Helper to compute stats for any month string (YYYY-MM)
  const computeStatsForMonth = (monthStr: string): FinancialStats => {
    const monthTx = transactions.filter((t) => t.date.startsWith(monthStr));

    let income = 0;
    let expense = 0;
    let largest: Transaction | null = null;

    monthTx.forEach((tx) => {
      if (tx.type === 'income') {
        income += tx.amount;
      } else if (tx.type === 'expense') {
        expense += tx.amount;
        if (!largest || tx.amount > largest.amount) {
          largest = tx;
        }
      }
    });

    const netSavings = income - expense;
    const overallBudget = settings.monthlyOverallBudget || 0;
    const remainingBudget = overallBudget - expense;
    const budgetUsagePercent = overallBudget > 0 ? (expense / overallBudget) * 100 : 0;
    const savingsRate = income > 0 ? Math.max(0, (netSavings / income) * 100) : 0;

    // Daily average based on days in month or current day if this month
    const [year, month] = monthStr.split('-').map(Number);
    const totalDays = new Date(year, month, 0).getDate();
    const isCurrent = monthStr === getCurrentMonth();
    const daysElapsed = isCurrent ? Math.min(new Date().getDate(), totalDays) : totalDays;
    const dailyAverageSpend = daysElapsed > 0 ? expense / daysElapsed : 0;

    return {
      totalIncome: income,
      totalExpense: expense,
      netSavings,
      remainingBudget,
      budgetUsagePercent,
      savingsRate,
      dailyAverageSpend,
      largestExpense: largest,
      transactionCount: monthTx.length,
    };
  };

  const monthlyStats = useMemo(() => computeStatsForMonth(selectedMonth), [transactions, selectedMonth, settings.monthlyOverallBudget]);

  // Previous month stats for comparative delta
  const previousMonthStats = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const prevDate = new Date(year, month - 2, 1);
    const pYear = prevDate.getFullYear();
    const pMonth = String(prevDate.getMonth() + 1).padStart(2, '0');
    return computeStatsForMonth(`${pYear}-${pMonth}`);
  }, [transactions, selectedMonth, settings.monthlyOverallBudget]);

  // Category spending breakdown for selectedMonth
  const categorySpending = useMemo(() => {
    const monthExpenses = transactions.filter(
      (t) => t.date.startsWith(selectedMonth) && t.type === 'expense'
    );
    const totalExpense = monthExpenses.reduce((sum, t) => sum + t.amount, 0);

    const spendMap: Record<string, { amount: number; count: number }> = {};
    monthExpenses.forEach((tx) => {
      const catKey = tx.category;
      if (!spendMap[catKey]) {
        spendMap[catKey] = { amount: 0, count: 0 };
      }
      spendMap[catKey].amount += tx.amount;
      spendMap[catKey].count += 1;
    });

    const result: CategorySpend[] = [];

    // Map through all categories
    categories.forEach((cat) => {
      const match = spendMap[cat.name];
      const amount = match ? match.amount : 0;
      const count = match ? match.count : 0;

      // Check for specific monthly budget override
      const budgetRecord = budgets.find(
        (b) => b.categoryId === cat.id && b.month === selectedMonth
      );
      const budgetLimit = budgetRecord ? budgetRecord.amount : cat.budgetLimit;

      if (cat.type === 'expense') {
        result.push({
          category: cat,
          amount,
          percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0,
          transactionCount: count,
          budget: budgetLimit,
        });
      }
    });

    // Also include any custom category names in transactions that might not match predefined
    Object.keys(spendMap).forEach((catName) => {
      if (!result.find((r) => r.category.name === catName)) {
        const amount = spendMap[catName].amount;
        result.push({
          category: {
            id: `custom_${catName}`,
            name: catName,
            icon: 'Tag',
            color: '#64748B',
            type: 'expense',
          },
          amount,
          percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0,
          transactionCount: spendMap[catName].count,
        });
      }
    });

    // Sort by highest amount spent
    return result.sort((a, b) => b.amount - a.amount);
  }, [transactions, categories, budgets, selectedMonth]);

  // Daily spending trend for selectedMonth
  const dailySpending = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const totalDays = new Date(year, month, 0).getDate();

    const dailyMap: Record<number, number> = {};
    for (let i = 1; i <= totalDays; i++) {
      dailyMap[i] = 0;
    }

    transactions
      .filter((t) => t.date.startsWith(selectedMonth) && t.type === 'expense')
      .forEach((t) => {
        const day = parseInt(t.date.split('-')[2], 10);
        if (dailyMap[day] !== undefined) {
          dailyMap[day] += t.amount;
        }
      });

    return Array.from({ length: totalDays }, (_, idx) => {
      const day = idx + 1;
      const dayStr = String(day).padStart(2, '0');
      return {
        day,
        date: `${selectedMonth}-${dayStr}`,
        amount: dailyMap[day] || 0,
      };
    });
  }, [transactions, selectedMonth]);

  // Actions
  const addTransaction = (data: Omit<Transaction, 'id'>): string => {
    const newId = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newTx: Transaction = {
      ...data,
      id: newId,
    };
    setTransactions((prev) => [newTx, ...prev]);
    return newId;
  };

  const updateTransaction = (id: string, data: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...data } : t))
    );
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const addAccount = (accountData: Omit<Account, 'id'>) => {
    const newId = `acc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newAccount: Account = { ...accountData, id: newId };
    setAccounts((prev) => [...prev, newAccount]);
  };

  const updateAccount = (id: string, data: Partial<Account>) => {
    setAccounts((prev) =>
      prev.map((acc) => (acc.id === id ? { ...acc, ...data } : acc))
    );
  };

  const deleteAccount = (id: string) => {
    setAccounts((prev) => prev.filter((acc) => acc.id !== id));
  };

  const addCategory = (categoryData: Omit<Category, 'id'>) => {
    const newId = `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setCategories((prev) => [...prev, { ...categoryData, id: newId }]);
  };

  const updateCategory = (id: string, data: Partial<Category>) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, ...data } : cat))
    );
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((cat) => cat.id !== id));
  };

  const updateBudget = (categoryId: string, amount: number) => {
    setBudgets((prev) => {
      const existingIdx = prev.findIndex(
        (b) => b.categoryId === categoryId && b.month === selectedMonth
      );
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = { ...copy[existingIdx], amount };
        return copy;
      } else {
        return [
          ...prev,
          {
            id: `b_${Date.now()}`,
            categoryId,
            month: selectedMonth,
            amount,
          },
        ];
      }
    });

    // Also update default limit on the category
    setCategories((prev) =>
      prev.map((c) => (c.id === categoryId ? { ...c, budgetLimit: amount } : c))
    );
  };

  const updateOverallBudget = (amount: number) => {
    setSettings((prev) => ({ ...prev, monthlyOverallBudget: amount }));
  };

  const addSavingsGoal = (goalData: Omit<SavingsGoal, 'id' | 'savedAmount'>) => {
    const newId = `goal_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newGoal: SavingsGoal = {
      ...goalData,
      id: newId,
      savedAmount: 0,
    };
    setSavingsGoals((prev) => [...prev, newGoal]);
  };

  const updateSavingsGoal = (id: string, data: Partial<SavingsGoal>) => {
    setSavingsGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...data } : g))
    );
  };

  const depositToGoal = (id: string, amount: number, fromAccountId: string) => {
    setSavingsGoals((prev) =>
      prev.map((g) =>
        g.id === id ? { ...g, savedAmount: g.savedAmount + amount } : g
      )
    );

    // Record as transfer transaction
    const goal = savingsGoals.find((g) => g.id === id);
    addTransaction({
      type: 'transfer',
      amount,
      category: 'Savings Goal Deposit',
      date: getCurrentDate(),
      time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      accountId: fromAccountId,
      note: `Deposit into ${goal?.name || 'Savings Goal'}`,
    });
  };

  const withdrawFromGoal = (id: string, amount: number, toAccountId: string) => {
    setSavingsGoals((prev) =>
      prev.map((g) =>
        g.id === id ? { ...g, savedAmount: Math.max(0, g.savedAmount - amount) } : g
      )
    );

    const goal = savingsGoals.find((g) => g.id === id);
    addTransaction({
      type: 'income',
      amount,
      category: 'Savings Goal Withdrawal',
      date: getCurrentDate(),
      time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      accountId: toAccountId,
      note: `Withdrawal from ${goal?.name || 'Savings Goal'}`,
    });
  };

  const deleteSavingsGoal = (id: string) => {
    setSavingsGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const resetToSampleData = () => {
    setTransactions(getSampleTransactions());
    setCategories(DEFAULT_CATEGORIES);
    setAccounts(DEFAULT_ACCOUNTS);
    setSavingsGoals(DEFAULT_SAVINGS_GOALS);
    setSettings(DEFAULT_SETTINGS);
    setBudgets([]);
    setSelectedMonth(getCurrentMonth());
  };

  const clearAllData = () => {
    setTransactions([]);
    setBudgets([]);
    setSavingsGoals([]);
  };

  const exportToJSON = (): string => {
    const payload = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      transactions,
      categories,
      accounts,
      budgets,
      savingsGoals,
      settings,
    };
    return JSON.stringify(payload, null, 2);
  };

  const importFromJSON = (jsonString: string): boolean => {
    try {
      if (!jsonString || typeof jsonString !== 'string') return false;
      const data = JSON.parse(jsonString);

      if (!data || typeof data !== 'object') return false;

      // Validate and sanitize transactions
      if (Array.isArray(data.transactions)) {
        const validTx = data.transactions.filter(
          (t: any) => t && typeof t.id === 'string' && typeof t.amount === 'number' && !isNaN(t.amount) && t.type && t.date
        );
        setTransactions(validTx);
      }

      // Validate categories
      if (Array.isArray(data.categories)) {
        const validCat = data.categories.filter((c: any) => c && typeof c.id === 'string' && c.name);
        if (validCat.length > 0) setCategories(validCat);
      }

      // Validate accounts
      if (Array.isArray(data.accounts)) {
        const validAcc = data.accounts.filter(
          (a: any) => a && typeof a.id === 'string' && typeof a.initialBalance === 'number'
        );
        if (validAcc.length > 0) setAccounts(validAcc);
      }

      // Validate budgets
      if (Array.isArray(data.budgets)) {
        setBudgets(data.budgets.filter((b: any) => b && typeof b.amount === 'number'));
      }

      // Validate savings goals
      if (Array.isArray(data.savingsGoals)) {
        setSavingsGoals(
          data.savingsGoals.filter(
            (g: any) => g && typeof g.id === 'string' && typeof g.targetAmount === 'number'
          )
        );
      }

      // Validate settings
      if (data.settings && typeof data.settings === 'object') {
        setSettings((prev) => ({
          ...prev,
          ...data.settings,
          currency: data.settings.currency || prev.currency,
        }));
      }

      return true;
    } catch (e) {
      console.error('Invalid JSON backup file format:', e);
      return false;
    }
  };

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        categories,
        accounts,
        budgets,
        savingsGoals,
        settings,
        selectedMonth,
        accountBalances,
        monthlyStats,
        previousMonthStats,
        categorySpending,
        dailySpending,
        setSelectedMonth,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addAccount,
        updateAccount,
        deleteAccount,
        addCategory,
        updateCategory,
        deleteCategory,
        updateBudget,
        updateOverallBudget,
        addSavingsGoal,
        updateSavingsGoal,
        depositToGoal,
        withdrawFromGoal,
        deleteSavingsGoal,
        updateSettings,
        resetToSampleData,
        clearAllData,
        importFromJSON,
        exportToJSON,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
