import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, formatTransactionDate } from '../../utils/formatters';
import { CategoryDonutChart } from '../Charts/CategoryDonutChart';
import { DailyTrendChart } from '../Charts/DailyTrendChart';
import { CategoryIcon } from '../CategoryIcon';
import { Transaction } from '../../types/finance';
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  Plus,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

interface DashboardViewProps {
  onOpenAddModal: () => void;
  onSelectTransaction: (tx: Transaction) => void;
  onNavigateTab: (tab: string) => void;
  onOpenBudgetModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenAddModal,
  onSelectTransaction,
  onNavigateTab,
  onOpenBudgetModal,
}) => {
  const {
    monthlyStats,
    previousMonthStats,
    transactions,
    selectedMonth,
    categorySpending,
    dailySpending,
    accounts,
    accountBalances,
    settings,
  } = useFinance();

  // Filter transactions for current selected month
  const monthTransactions = transactions.filter((t) => t.date.startsWith(selectedMonth));
  const recentTransactions = monthTransactions.slice(0, 6);

  // Compute delta percentages vs last month
  const calcDelta = (current: number, prev: number) => {
    if (prev === 0) return current > 0 ? '+100%' : '0%';
    const pct = ((current - prev) / prev) * 100;
    return `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`;
  };

  const incomeDelta = calcDelta(monthlyStats.totalIncome, previousMonthStats.totalIncome);
  const expenseDelta = calcDelta(monthlyStats.totalExpense, previousMonthStats.totalExpense);

  const budgetUsage = monthlyStats.budgetUsagePercent;
  const isOverBudget = monthlyStats.remainingBudget < 0;

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* 4 Primary Financial KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Income */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">Total Income</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tabular-nums tracking-tight">
            {formatCurrency(monthlyStats.totalIncome, settings.currency, false)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-500">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold tabular-nums">{incomeDelta}</span>
            <span aria-hidden="true">·</span>
            <span>vs last month</span>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">Total Spending</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <TrendingDown className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tabular-nums tracking-tight">
            {formatCurrency(monthlyStats.totalExpense, settings.currency, false)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-500">
            <span className="text-rose-600 dark:text-rose-400 font-semibold tabular-nums">{expenseDelta}</span>
            <span aria-hidden="true">·</span>
            <span>vs last month</span>
          </div>
        </div>

        {/* Net Savings */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">Net Savings</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <PiggyBank className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className={`text-xl sm:text-2xl font-bold tabular-nums tracking-tight ${
            monthlyStats.netSavings >= 0 ? 'text-slate-900 dark:text-white' : 'text-rose-600 dark:text-rose-400'
          }`}>
            {formatCurrency(monthlyStats.netSavings, settings.currency, false)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-500">
            <span className="font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
              {monthlyStats.savingsRate.toFixed(0)}%
            </span>
            <span aria-hidden="true">·</span>
            <span>savings rate</span>
          </div>
        </div>

        {/* Remaining Budget */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">Budget Left</span>
            <button
              onClick={onOpenBudgetModal}
              className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Adjust
            </button>
          </div>
          <div className={`text-xl sm:text-2xl font-bold tabular-nums tracking-tight ${
            isOverBudget ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'
          }`}>
            {formatCurrency(monthlyStats.remainingBudget, settings.currency, false)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-500">
            <span className="tabular-nums font-semibold">{budgetUsage.toFixed(0)}%</span>
            <span aria-hidden="true">·</span>
            <span>of {formatCurrency(settings.monthlyOverallBudget, settings.currency, false)}</span>
          </div>
        </div>
      </div>

      {/* Monthly Budget Progress Bar Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {isOverBudget ? (
              <AlertTriangle className="w-4 h-4 text-rose-500" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            )}
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              {isOverBudget ? 'Monthly Budget Exceeded' : 'Monthly Budget Utilization'}
            </span>
          </div>
          <span className="text-xs font-semibold tabular-nums text-slate-600 dark:text-slate-400">
            {formatCurrency(monthlyStats.totalExpense, settings.currency, false)} / {formatCurrency(settings.monthlyOverallBudget, settings.currency, false)}
          </span>
        </div>

        {/* Multi-tier progress bar */}
        <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            style={{ width: `${Math.min(budgetUsage, 100)}%` }}
            className={`h-full rounded-full transition-all duration-300 ${
              isOverBudget
                ? 'bg-rose-500'
                : budgetUsage > 85
                ? 'bg-amber-500'
                : 'bg-slate-900 dark:bg-emerald-500'
            }`}
          />
        </div>
        <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
          <span>Daily burn average: {formatCurrency(monthlyStats.dailyAverageSpend, settings.currency, false)}/day</span>
          <span>{isOverBudget ? `Over by ${formatCurrency(Math.abs(monthlyStats.remainingBudget), settings.currency, false)}` : `${formatCurrency(monthlyStats.remainingBudget, settings.currency, false)} left to spend`}</span>
        </div>
      </div>

      {/* 2-Column Split: Donut Spending Breakdown + Daily Spending Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Spending by Category Donut */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Category Distribution
            </h3>
            <button
              onClick={() => onNavigateTab('budgets')}
              className="text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1"
            >
              Detailed Budgets
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <CategoryDonutChart data={categorySpending} totalExpense={monthlyStats.totalExpense} />
        </div>

        {/* Daily Spending Trend */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Daily Expense Spikes
            </h3>
            <span className="text-[11px] text-slate-400">
              {monthlyStats.transactionCount} transactions logged
            </span>
          </div>
          <DailyTrendChart data={dailySpending} />
        </div>
      </div>

      {/* Account / Wallets Quick Glance */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Accounts & Wallets
          </h3>
          <button
            onClick={() => onNavigateTab('wallets')}
            className="text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1"
          >
            Manage Accounts
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {accounts.map((acc) => {
            const bal = accountBalances[acc.id] ?? acc.initialBalance;
            const isNegative = bal < 0;
            return (
              <div
                key={acc.id}
                onClick={() => onNavigateTab('wallets')}
                className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-medium text-slate-500 truncate max-w-[100px]">
                    {acc.name}
                  </span>
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: acc.color }}
                  />
                </div>
                <div className={`text-base font-bold tabular-nums tracking-tight ${
                  isNegative ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'
                }`}>
                  {formatCurrency(bal, settings.currency, false)}
                </div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono mt-0.5">
                  {acc.type}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Transactions List */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Recent Transactions
          </h3>
          <button
            onClick={() => onNavigateTab('ledger')}
            className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-1"
          >
            View All ({monthTransactions.length})
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No transactions found for this month. Tap + to record your first expense or income.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentTransactions.map((tx) => {
              const isExpense = tx.type === 'expense';
              const isIncome = tx.type === 'income';
              const account = accounts.find((a) => a.id === tx.accountId);

              return (
                <div
                  key={tx.id}
                  onClick={() => onSelectTransaction(tx)}
                  className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 rounded-xl px-2 -mx-2 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isExpense
                          ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
                          : isIncome
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                          : 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'
                      }`}
                    >
                      {isExpense && <ArrowDownLeft className="w-4 h-4" />}
                      {isIncome && <ArrowUpRight className="w-4 h-4" />}
                      {!isExpense && !isIncome && <ArrowLeftRight className="w-4 h-4" />}
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                        {tx.note || tx.category}
                      </p>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                        <span>{tx.category}</span>
                        <span aria-hidden="true">·</span>
                        <span>{account?.name || 'Account'}</span>
                        <span aria-hidden="true">·</span>
                        <span>{formatTransactionDate(tx.date)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`text-xs sm:text-sm font-bold tabular-nums ${
                        isExpense
                          ? 'text-rose-600 dark:text-rose-400'
                          : isIncome
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-blue-600 dark:text-blue-400'
                      }`}
                    >
                      {isExpense ? '-' : isIncome ? '+' : ''}
                      {formatCurrency(tx.amount, settings.currency)}
                    </span>
                    {tx.tag && (
                      <span className="block text-[10px] text-slate-400 truncate max-w-[90px]">
                        {tx.tag}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Action Button (FAB) for Mobile Quick Add */}
      <div className="fixed right-5 bottom-20 z-40 md:hidden">
        <button
          onClick={onOpenAddModal}
          className="w-14 h-14 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xl shadow-slate-900/30 flex items-center justify-center active:scale-95 transition-transform"
          aria-label="Add transaction"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
