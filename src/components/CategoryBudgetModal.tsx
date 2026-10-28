import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';
import { X, Check } from 'lucide-react';

interface CategoryBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CategoryBudgetModal: React.FC<CategoryBudgetModalProps> = ({ isOpen, onClose }) => {
  const { categories, budgets, selectedMonth, updateBudget, updateOverallBudget, settings } = useFinance();

  const [overallLimitStr, setOverallLimitStr] = useState<string>(
    settings.monthlyOverallBudget.toString()
  );

  const [catBudgetMap, setCatBudgetMap] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    categories
      .filter((c) => c.type === 'expense')
      .forEach((c) => {
        const custom = budgets.find((b) => b.categoryId === c.id && b.month === selectedMonth);
        map[c.id] = (custom ? custom.amount : c.budgetLimit || 0).toString();
      });
    return map;
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    const overallVal = parseFloat(overallLimitStr) || 0;
    updateOverallBudget(overallVal);

    Object.entries(catBudgetMap).forEach(([catId, valStr]) => {
      const val = parseFloat(valStr) || 0;
      updateBudget(catId, val);
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  const handleCatChange = (catId: string, val: string) => {
    setCatBudgetMap((prev) => ({ ...prev, [catId]: val }));
  };

  const totalCatBudgets = Object.values(catBudgetMap).reduce(
    (sum, val) => sum + (parseFloat(val) || 0),
    0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Monthly Budget Planner
            </h2>
            <p className="text-xs text-slate-500">
              Set spending limits for your monthly budget
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSaveAll} className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {/* Overall Monthly Budget */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
            <label className="block text-xs font-semibold text-slate-900 dark:text-white mb-1">
              Overall Total Monthly Budget
            </label>
            <p className="text-[11px] text-slate-500 mb-3">
              Your hard ceiling target across all categories combined
            </p>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                {settings.currency.symbol}
              </span>
              <input
                type="number"
                step="any"
                value={overallLimitStr}
                onChange={(e) => setOverallLimitStr(e.target.value)}
                className="w-full h-11 pl-8 pr-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-hidden tabular-nums"
                placeholder="220000"
              />
            </div>
          </div>

          {/* Category Budgets list */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-900 dark:text-white">
                Category Limits
              </label>
              <span className="text-[11px] text-slate-500 tabular-nums">
                Sum of categories: {formatCurrency(totalCatBudgets, settings.currency, false)}
              </span>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {categories
                .filter((c) => c.type === 'expense')
                .map((cat) => {
                  return (
                    <div
                      key={cat.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${cat.color}20` }}
                        >
                          <CategoryIcon iconName={cat.icon} color={cat.color} className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {cat.name}
                        </span>
                      </div>

                      <div className="relative w-28 shrink-0">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                          {settings.currency.symbol}
                        </span>
                        <input
                          type="number"
                          step="any"
                          value={catBudgetMap[cat.id] ?? ''}
                          onChange={(e) => handleCatChange(cat.id, e.target.value)}
                          placeholder="0"
                          className="w-full h-9 pl-7 pr-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-900 dark:text-white text-right focus:outline-hidden tabular-nums"
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 h-11 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-slate-900/10"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-500" />
                  Saved!
                </>
              ) : (
                'Save Budgets'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
