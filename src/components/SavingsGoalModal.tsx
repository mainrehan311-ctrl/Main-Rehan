import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { SavingsGoal } from '../types/finance';
import { CategoryIcon } from './CategoryIcon';
import { X, Trash2 } from 'lucide-react';

interface SavingsGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal?: SavingsGoal | null;
  mode?: 'create' | 'edit' | 'deposit' | 'withdraw';
}

const ICONS = ['ShieldCheck', 'Plane', 'Laptop', 'Car', 'Home', 'GraduationCap', 'Heart', 'Sparkles'];
const GOAL_COLORS = ['#3B82F6', '#10B981', '#EC4899', '#F59E0B', '#8B5CF6', '#06B6D4'];

export const SavingsGoalModal: React.FC<SavingsGoalModalProps> = ({
  isOpen,
  onClose,
  goal,
  mode = 'create',
}) => {
  const { addSavingsGoal, updateSavingsGoal, deleteSavingsGoal, depositToGoal, withdrawFromGoal, accounts, settings } = useFinance();

  const [name, setName] = useState(goal?.name || '');
  const [targetAmountStr, setTargetAmountStr] = useState(goal ? goal.targetAmount.toString() : '');
  const [targetDate, setTargetDate] = useState(goal?.targetDate || '');
  const [color, setColor] = useState(goal?.color || GOAL_COLORS[0]);
  const [icon, setIcon] = useState(goal?.icon || ICONS[0]);
  const [notes, setNotes] = useState(goal?.notes || '');

  // For deposit/withdraw
  const [actionAmountStr, setActionAmountStr] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id || '');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleDepositWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal) return;

    const amount = parseFloat(actionAmountStr);
    if (!amount || isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!selectedAccountId) {
      setError('Please select an account');
      return;
    }

    if (mode === 'deposit') {
      depositToGoal(goal.id, amount, selectedAccountId);
    } else if (mode === 'withdraw') {
      if (amount > goal.savedAmount) {
        setError('Withdrawal amount exceeds saved balance');
        return;
      }
      withdrawFromGoal(goal.id, amount, selectedAccountId);
    }

    onClose();
  };

  const handleCreateOrUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a goal title');
      return;
    }

    const targetAmount = parseFloat(targetAmountStr);
    if (!targetAmount || isNaN(targetAmount) || targetAmount <= 0) {
      setError('Please enter a valid target amount');
      return;
    }

    if (!targetDate) {
      setError('Please select a target date');
      return;
    }

    if (goal && mode === 'edit') {
      updateSavingsGoal(goal.id, {
        name: name.trim(),
        targetAmount,
        targetDate,
        color,
        icon,
        notes: notes.trim(),
      });
    } else {
      addSavingsGoal({
        name: name.trim(),
        targetAmount,
        targetDate,
        color,
        icon,
        notes: notes.trim(),
      });
    }

    onClose();
  };

  const handleDelete = () => {
    if (goal) {
      deleteSavingsGoal(goal.id);
      onClose();
    }
  };

  // Render Deposit / Withdraw View
  if (mode === 'deposit' || mode === 'withdraw') {
    const isDeposit = mode === 'deposit';
    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
        <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {isDeposit ? 'Deposit to Goal' : 'Withdraw from Goal'}
            </h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-slate-500 mt-2">
            Target Goal: <span className="font-semibold text-slate-800 dark:text-slate-200">{goal?.name}</span>
          </p>

          <form onSubmit={handleDepositWithdraw} className="mt-4 space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 rounded-xl text-rose-700 dark:text-rose-300 text-xs font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Amount ({settings.currency.symbol})
              </label>
              <input
                type="number"
                step="any"
                autoFocus
                placeholder="0.00"
                value={actionAmountStr}
                onChange={(e) => setActionAmountStr(e.target.value)}
                className="w-full h-12 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-base font-bold text-slate-900 dark:text-white tabular-nums focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {isDeposit ? 'Transfer from Account' : 'Transfer to Account'}
              </label>
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="w-full h-11 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 h-11 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`flex-1 h-11 rounded-xl font-semibold text-xs text-white transition-all shadow-md ${
                  isDeposit ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900'
                }`}
              >
                {isDeposit ? 'Confirm Deposit' : 'Confirm Withdrawal'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Render Create / Edit Goal View
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {goal ? 'Edit Savings Goal' : 'New Savings Goal'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleCreateOrUpdate} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 rounded-xl text-rose-700 dark:text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Goal Name / Target
            </label>
            <input
              type="text"
              placeholder="e.g. Dream Vacation, House Down Payment"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-11 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Target Amount ({settings.currency.symbol})
              </label>
              <input
                type="number"
                step="any"
                placeholder="5000"
                value={targetAmountStr}
                onChange={(e) => setTargetAmountStr(e.target.value)}
                className="w-full h-11 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white tabular-nums focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Target Date
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full h-11 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Icon
            </label>
            <div className="grid grid-cols-4 gap-2">
              {ICONS.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  className={`p-2.5 rounded-xl flex items-center justify-center border transition-all ${
                    icon === ic
                      ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <CategoryIcon iconName={ic} className="w-5 h-5" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Theme Color
            </label>
            <div className="flex gap-2">
              {GOAL_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    color === c ? 'scale-125 ring-2 ring-slate-900 dark:ring-white ring-offset-2' : ''
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Notes (optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Set aside Rs 15,000 every month"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden resize-none"
            />
          </div>

          <div className="pt-2 flex items-center gap-3">
            {goal && (
              <button
                type="button"
                onClick={handleDelete}
                className="h-11 px-3.5 rounded-xl border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              className="flex-1 h-11 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-semibold text-xs tracking-wide transition-all shadow-md"
            >
              {goal ? 'Update Goal' : 'Save Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
