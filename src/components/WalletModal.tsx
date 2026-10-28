import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Account } from '../types/finance';
import { X, Trash2 } from 'lucide-react';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  editAccount?: Account | null;
}

const ACCOUNT_TYPES: { id: Account['type']; label: string }[] = [
  { id: 'bank', label: 'Bank Checking' },
  { id: 'cash', label: 'Cash Wallet' },
  { id: 'savings', label: 'Savings Account' },
  { id: 'credit', label: 'Credit Card' },
  { id: 'wallet', label: 'Digital Wallet / UPI' },
];

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#64748B'];

export const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose, editAccount }) => {
  const { addAccount, updateAccount, deleteAccount, settings } = useFinance();

  const [name, setName] = useState(editAccount ? editAccount.name : '');
  const [type, setType] = useState<Account['type']>(editAccount ? editAccount.type : 'bank');
  const [initialBalanceStr, setInitialBalanceStr] = useState(
    editAccount ? editAccount.initialBalance.toString() : '0'
  );
  const [accountNumber, setAccountNumber] = useState(editAccount?.accountNumber || '');
  const [color, setColor] = useState(editAccount ? editAccount.color : COLORS[0]);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter an account name');
      return;
    }

    const initBal = parseFloat(initialBalanceStr);
    if (isNaN(initBal)) {
      setError('Please enter a valid balance');
      return;
    }

    if (editAccount) {
      updateAccount(editAccount.id, {
        name: name.trim(),
        type,
        initialBalance: initBal,
        color,
        accountNumber: accountNumber.trim() || undefined,
      });
    } else {
      addAccount({
        name: name.trim(),
        type,
        initialBalance: initBal,
        color,
        accountNumber: accountNumber.trim() || undefined,
      });
    }

    onClose();
  };

  const handleDelete = () => {
    if (editAccount) {
      deleteAccount(editAccount.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {editAccount ? 'Edit Account' : 'Add New Account / Wallet'}
          </h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 rounded-xl text-rose-700 dark:text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Account Name
            </label>
            <input
              type="text"
              placeholder="e.g. Chase Freedom, Cash In Hand, Revolut"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-11 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Account Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as Account['type'])}
                className="w-full h-11 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden"
              >
                {ACCOUNT_TYPES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Initial Balance ({settings.currency.symbol})
              </label>
              <input
                type="number"
                step="any"
                value={initialBalanceStr}
                onChange={(e) => setInitialBalanceStr(e.target.value)}
                className="w-full h-11 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white tabular-nums focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Account Number / Card Last 4 (optional)
            </label>
            <input
              type="text"
              placeholder="e.g. •••• 5678"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="w-full h-11 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Color Tag
            </label>
            <div className="flex gap-2.5">
              {COLORS.map((c) => (
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

          <div className="pt-3 flex items-center gap-3">
            {editAccount && (
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
              className="flex-1 h-11 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-semibold text-xs tracking-wide transition-all shadow-md shadow-slate-900/10"
            >
              {editAccount ? 'Update Account' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
