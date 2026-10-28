import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Transaction, TransactionType } from '../types/finance';
import { getCurrentDate } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';
import { X, Trash2, Calendar, CreditCard, Tag, FileText, Store } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  editTransaction?: Transaction | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  editTransaction,
}) => {
  const { categories, accounts, addTransaction, updateTransaction, deleteTransaction, settings } = useFinance();

  const [type, setType] = useState<TransactionType>('expense');
  const [amountStr, setAmountStr] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [accountId, setAccountId] = useState<string>('');
  const [toAccountId, setToAccountId] = useState<string>('');
  const [date, setDate] = useState<string>(getCurrentDate());
  const [time, setTime] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [merchant, setMerchant] = useState<string>('');
  const [tag, setTag] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Synchronize when opening or switching edit transaction
  useEffect(() => {
    if (editTransaction) {
      setType(editTransaction.type);
      setAmountStr(editTransaction.amount.toString());
      const matchedCat = categories.find((c) => c.name === editTransaction.category);
      setCategoryId(matchedCat ? matchedCat.id : categories[0]?.id || '');
      setAccountId(editTransaction.accountId);
      setToAccountId(editTransaction.toAccountId || '');
      setDate(editTransaction.date);
      setTime(editTransaction.time || '');
      setNote(editTransaction.note || '');
      setMerchant(editTransaction.merchant || '');
      setTag(editTransaction.tag || '');
    } else {
      setType('expense');
      setAmountStr('');
      const defaultExpenseCat = categories.find((c) => c.type === 'expense');
      setCategoryId(defaultExpenseCat ? defaultExpenseCat.id : categories[0]?.id || '');
      setAccountId(accounts[0]?.id || '');
      setToAccountId(accounts[1]?.id || '');
      setDate(getCurrentDate());
      const now = new Date();
      setTime(
        `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      );
      setNote('');
      setMerchant('');
      setTag('');
    }
    setError('');
  }, [editTransaction, isOpen, categories, accounts]);

  // Adjust category selection when type switches
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType !== 'transfer') {
      const match = categories.find((c) => c.type === newType);
      if (match) setCategoryId(match.id);
    }
  };

  if (!isOpen) return null;

  const filteredCategories = categories.filter((c) => c.type === type);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amountStr);

    if (!parsedAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }

    if (!accountId) {
      setError('Please select an account');
      return;
    }

    if (type === 'transfer' && (!toAccountId || toAccountId === accountId)) {
      setError('Please choose a different destination account for transfer');
      return;
    }

    let categoryName = 'General';
    if (type === 'transfer') {
      categoryName = 'Account Transfer';
    } else {
      const selectedCat = categories.find((c) => c.id === categoryId);
      if (selectedCat) categoryName = selectedCat.name;
    }

    if (editTransaction) {
      updateTransaction(editTransaction.id, {
        type,
        amount: parsedAmount,
        category: categoryName,
        accountId,
        toAccountId: type === 'transfer' ? toAccountId : undefined,
        date,
        time,
        note: note.trim() || merchant.trim() || categoryName,
        merchant: merchant.trim(),
        tag: tag.trim(),
      });
    } else {
      addTransaction({
        type,
        amount: parsedAmount,
        category: categoryName,
        accountId,
        toAccountId: type === 'transfer' ? toAccountId : undefined,
        date,
        time,
        note: note.trim() || merchant.trim() || categoryName,
        merchant: merchant.trim(),
        tag: tag.trim(),
      });
    }

    onClose();
  };

  const handleDelete = () => {
    if (editTransaction) {
      deleteTransaction(editTransaction.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] sm:max-h-[85vh] animate-in fade-in slide-in-from-bottom-6 duration-200">
        
        {/* Mobile handle indicator */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center">
          <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full" />
        </div>

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {editTransaction ? 'Edit Transaction' : 'Add Transaction'}
          </h2>
          <button
            onClick={onClose}
            type="button"
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 rounded-xl text-rose-700 dark:text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Type Segmented Tabs */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                type === 'expense'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Income
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('transfer')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                type === 'transfer'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Transfer
            </button>
          </div>

          {/* Big Amount Input */}
          <div className="flex flex-col items-center justify-center py-2 bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
            <label className="text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Amount ({settings.currency.symbol})
            </label>
            <div className="flex items-center justify-center gap-1 w-full">
              <span className="text-2xl font-bold text-slate-400 dark:text-slate-500">
                {settings.currency.symbol}
              </span>
              <input
                type="number"
                step="any"
                inputMode="decimal"
                autoFocus
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                placeholder="0.00"
                className="text-3xl font-extrabold text-center bg-transparent border-none text-slate-900 dark:text-white focus:outline-hidden tabular-nums w-48 tracking-tight"
              />
            </div>
          </div>

          {/* Category Picker (if not transfer) */}
          {type !== 'transfer' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Category
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-40 overflow-y-auto p-1">
                {filteredCategories.map((cat) => {
                  const isSelected = categoryId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategoryId(cat.id)}
                      className={`flex flex-col items-center p-2 rounded-xl text-center transition-all border ${
                        isSelected
                          ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center mb-1 text-white"
                        style={{ backgroundColor: isSelected ? undefined : cat.color }}
                      >
                        <CategoryIcon iconName={cat.icon} className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-[11px] font-medium truncate w-full">
                        {cat.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Accounts selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                {type === 'transfer' ? 'From Account' : 'Account / Payment'}
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full h-11 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.type.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            {type === 'transfer' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                  To Destination Account
                </label>
                <select
                  value={toAccountId}
                  onChange={(e) => setToAccountId(e.target.value)}
                  className="w-full h-11 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                >
                  {accounts
                    .filter((a) => a.id !== accountId)
                    .map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name}
                      </option>
                    ))}
                </select>
              </div>
            )}
          </div>

          {/* Date & Time with quick chips */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Date & Time
              </label>
              <div className="flex gap-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => setDate(getCurrentDate())}
                  className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const y = new Date();
                    y.setDate(y.getDate() - 1);
                    setDate(
                      `${y.getFullYear()}-${String(y.getMonth() + 1).padStart(2, '0')}-${String(y.getDate()).padStart(2, '0')}`
                    );
                  }}
                  className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900"
                >
                  Yesterday
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-11 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden"
              />
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full h-11 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>
          </div>

          {/* Merchant & Note */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-slate-400" />
                Merchant / Payee
              </label>
              <input
                type="text"
                placeholder="e.g. Trader Joe's, Netflix, Shell"
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                className="w-full h-11 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                Tag (optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Essential, Vacation, Office"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="w-full h-11 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Note / Description
            </label>
            <input
              type="text"
              placeholder="e.g. Weekly family groceries, dinner with clients"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full h-11 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center gap-3">
            {editTransaction && (
              <button
                type="button"
                onClick={handleDelete}
                className="h-12 px-4 rounded-xl border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center justify-center transition-colors shrink-0"
                title="Delete transaction"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              type="submit"
              className="flex-1 h-12 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-semibold text-xs tracking-wide transition-all shadow-md shadow-slate-900/10 flex items-center justify-center"
            >
              {editTransaction ? 'Save Changes' : 'Record Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
