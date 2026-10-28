import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, formatMonthYear, getPreviousMonth } from '../../utils/formatters';
import { CategoryIcon } from '../CategoryIcon';
import {
  PieChart,
  Sliders,
  AlertCircle,
  TrendingDown,
  TrendingUp,
  Award,
  Sparkles,
  Zap,
} from 'lucide-react';

interface BudgetsViewProps {
  onOpenBudgetModal: () => void;
}

export const BudgetsView: React.FC<BudgetsViewProps> = ({ onOpenBudgetModal }) => {
  const {
    monthlyStats,
    previousMonthStats,
    categorySpending,
    selectedMonth,
    settings,
  } = useFinance();

  const prevMonthStr = getPreviousMonth(selectedMonth);

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Overall Budget Hero Card */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-xl dark:bg-slate-900 dark:border dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Monthly Budget Ceiling
            </span>
            <h2 className="text-2xl font-bold tracking-tight">
              {formatMonthYear(selectedMonth)}
            </h2>
          </div>
          <button
            onClick={onOpenBudgetModal}
            className="h-9 px-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors border border-white/10"
          >
            <Sliders className="w-3.5 h-3.5" />
            Set Limits
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 py-3 border-y border-white/10">
          <div>
            <span className="text-[11px] text-slate-400 block">Total Budget</span>
            <span className="text-base sm:text-lg font-bold tabular-nums">
              {formatCurrency(settings.monthlyOverallBudget, settings.currency, false)}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block">Total Spent</span>
            <span className="text-base sm:text-lg font-bold tabular-nums text-rose-400">
              {formatCurrency(monthlyStats.totalExpense, settings.currency, false)}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block">Remaining</span>
            <span
              className={`text-base sm:text-lg font-bold tabular-nums ${
                monthlyStats.remainingBudget < 0 ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {formatCurrency(monthlyStats.remainingBudget, settings.currency, false)}
            </span>
          </div>
        </div>

        {/* Big Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs mb-1.5 text-slate-300">
            <span>Utilization Rate</span>
            <span className="font-bold tabular-nums">
              {monthlyStats.budgetUsagePercent.toFixed(1)}%
            </span>
          </div>
          <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
            <div
              style={{ width: `${Math.min(monthlyStats.budgetUsagePercent, 100)}%` }}
              className={`h-full rounded-full transition-all duration-300 ${
                monthlyStats.budgetUsagePercent > 100
                  ? 'bg-rose-500'
                  : monthlyStats.budgetUsagePercent > 85
                  ? 'bg-amber-400'
                  : 'bg-emerald-400'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Spending Insights Banner Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <Zap className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-medium">Daily Burn Rate</span>
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">
            {formatCurrency(monthlyStats.dailyAverageSpend, settings.currency, false)}
            <span className="text-xs font-normal text-slate-400"> / day</span>
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <Award className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-medium">Savings Pace</span>
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">
            {monthlyStats.savingsRate.toFixed(1)}%
            <span className="text-xs font-normal text-slate-400"> of monthly income</span>
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <TrendingDown className="w-4 h-4 text-rose-500" />
            <span className="text-xs font-medium">Largest Outflow</span>
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white tabular-nums truncate">
            {monthlyStats.largestExpense
              ? formatCurrency(monthlyStats.largestExpense.amount, settings.currency, false)
              : formatCurrency(0, settings.currency, false)}
            <span className="text-xs font-normal text-slate-400">
              {' '}
              ({monthlyStats.largestExpense?.merchant || monthlyStats.largestExpense?.category || 'None'})
            </span>
          </p>
        </div>
      </div>

      {/* Category Budgets Breakdown */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Category Budgets & Progress
            </h3>
            <p className="text-xs text-slate-500">
              Live tracking against your assigned category limits
            </p>
          </div>
          <button
            onClick={onOpenBudgetModal}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Adjust Limits
          </button>
        </div>

        <div className="space-y-4">
          {categorySpending.map((item) => {
            const budgetLimit = item.budget || 0;
            const hasBudget = budgetLimit > 0;
            const usagePercent = hasBudget ? (item.amount / budgetLimit) * 100 : 0;
            const isExceeded = hasBudget && item.amount > budgetLimit;
            const remaining = hasBudget ? budgetLimit - item.amount : 0;

            return (
              <div
                key={item.category.id}
                className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${item.category.color}20` }}
                    >
                      <CategoryIcon iconName={item.category.icon} color={item.category.color} className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate block">
                        {item.category.name}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {item.transactionCount} transactions · {item.percentage.toFixed(0)}% of expenses
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-slate-900 dark:text-white tabular-nums block">
                      {formatCurrency(item.amount, settings.currency, false)}
                    </span>
                    <span className="text-[11px] text-slate-400 tabular-nums">
                      {hasBudget ? `of ${formatCurrency(budgetLimit, settings.currency, false)}` : 'No limit set'}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                {hasBudget ? (
                  <div>
                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${Math.min(usagePercent, 100)}%` }}
                        className={`h-full rounded-full transition-all ${
                          isExceeded
                            ? 'bg-rose-500'
                            : usagePercent > 80
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] mt-1 text-slate-500">
                      <span>{usagePercent.toFixed(0)}% consumed</span>
                      <span className={isExceeded ? 'text-rose-500 font-semibold' : ''}>
                        {isExceeded
                          ? `Over budget by ${formatCurrency(Math.abs(remaining), settings.currency, false)}`
                          : `${formatCurrency(remaining, settings.currency, false)} remaining`}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-400">
                    <button
                      onClick={onOpenBudgetModal}
                      className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
                    >
                      + Set budget limit for {item.category.name}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Month Comparison Card */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
          Monthly Pace Comparison
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          {formatMonthYear(selectedMonth)} vs {formatMonthYear(prevMonthStr)}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-medium text-slate-500 block mb-1">Income</span>
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                {formatCurrency(monthlyStats.totalIncome, settings.currency, false)}
              </span>
              <span className="text-xs text-slate-400 tabular-nums">
                Prev: {formatCurrency(previousMonthStats.totalIncome, settings.currency, false)}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-medium text-slate-500 block mb-1">Expenses</span>
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                {formatCurrency(monthlyStats.totalExpense, settings.currency, false)}
              </span>
              <span className="text-xs text-slate-400 tabular-nums">
                Prev: {formatCurrency(previousMonthStats.totalExpense, settings.currency, false)}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-medium text-slate-500 block mb-1">Net Savings</span>
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                {formatCurrency(monthlyStats.netSavings, settings.currency, false)}
              </span>
              <span className="text-xs text-slate-400 tabular-nums">
                Prev: {formatCurrency(previousMonthStats.netSavings, settings.currency, false)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
