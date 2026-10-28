import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Account, SavingsGoal } from '../../types/finance';
import { formatCurrency } from '../../utils/formatters';
import { CategoryIcon } from '../CategoryIcon';
import { WalletModal } from '../WalletModal';
import { SavingsGoalModal } from '../SavingsGoalModal';
import {
  Wallet,
  Plus,
  Landmark,
  CreditCard,
  Banknote,
  PiggyBank,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  CheckCircle,
} from 'lucide-react';

export const WalletsView: React.FC = () => {
  const { accounts, accountBalances, savingsGoals, settings } = useFinance();

  // Modals state
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [activeGoal, setActiveGoal] = useState<SavingsGoal | null>(null);
  const [goalModalMode, setGoalModalMode] = useState<'create' | 'edit' | 'deposit' | 'withdraw'>('create');

  // Compute Total Net Worth
  const totalNetWorth = accounts.reduce((sum, acc) => {
    const bal = accountBalances[acc.id] ?? acc.initialBalance;
    return sum + bal;
  }, 0);

  // Compute Total Goals Target & Saved
  const totalGoalsTarget = savingsGoals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalGoalsSaved = savingsGoals.reduce((sum, g) => sum + g.savedAmount, 0);

  const handleEditAccount = (acc: Account) => {
    setEditingAccount(acc);
    setWalletModalOpen(true);
  };

  const handleAddAccount = () => {
    setEditingAccount(null);
    setWalletModalOpen(true);
  };

  const handleOpenGoal = (goal: SavingsGoal, mode: 'edit' | 'deposit' | 'withdraw') => {
    setActiveGoal(goal);
    setGoalModalMode(mode);
    setGoalModalOpen(true);
  };

  const handleAddGoal = () => {
    setActiveGoal(null);
    setGoalModalMode('create');
    setGoalModalOpen(true);
  };

  const getAccountTypeIcon = (type: Account['type']) => {
    switch (type) {
      case 'cash':
        return Banknote;
      case 'credit':
        return CreditCard;
      case 'savings':
        return PiggyBank;
      default:
        return Landmark;
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Net Worth Summary Hero */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-xl dark:border dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Total Net Liquid Balance
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight tabular-nums mt-0.5">
            {formatCurrency(totalNetWorth, settings.currency, false)}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Aggregated live balance across {accounts.length} active accounts
          </p>
        </div>

        <button
          onClick={handleAddAccount}
          className="h-10 px-4 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Add Account
        </button>
      </div>

      {/* Accounts & Wallets Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Accounts & Wallets
          </h3>
          <span className="text-xs text-slate-500">{accounts.length} Total</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {accounts.map((acc) => {
            const bal = accountBalances[acc.id] ?? acc.initialBalance;
            const Icon = getAccountTypeIcon(acc.type);
            const isNegative = bal < 0;

            return (
              <div
                key={acc.id}
                onClick={() => handleEditAccount(acc)}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0"
                      style={{ backgroundColor: acc.color }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {acc.name}
                      </h4>
                      <span className="text-[10px] text-slate-400 uppercase font-mono">
                        {acc.type} {acc.accountNumber && `· ${acc.accountNumber}`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-baseline justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] text-slate-500">Current Balance</span>
                  <span
                    className={`text-base font-bold tabular-nums ${
                      isNegative ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {formatCurrency(bal, settings.currency)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Savings Goals Section */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Savings Goals & Targets
            </h3>
            <p className="text-xs text-slate-500">
              Total Saved: {formatCurrency(totalGoalsSaved, settings.currency, false)} /{' '}
              {formatCurrency(totalGoalsTarget, settings.currency, false)}
            </p>
          </div>
          <button
            onClick={handleAddGoal}
            className="h-9 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-semibold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Goal
          </button>
        </div>

        {savingsGoals.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-slate-400 text-xs">
            No savings goals yet. Create one to stay motivated!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savingsGoals.map((goal) => {
              const progressPct =
                goal.targetAmount > 0 ? (goal.savedAmount / goal.targetAmount) * 100 : 0;
              const isCompleted = goal.savedAmount >= goal.targetAmount;
              const remaining = Math.max(0, goal.targetAmount - goal.savedAmount);

              return (
                <div
                  key={goal.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0"
                        style={{ backgroundColor: goal.color }}
                      >
                        <CategoryIcon iconName={goal.icon} className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          {goal.name}
                          {isCompleted && (
                            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                          )}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Target: {goal.targetDate}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenGoal(goal, 'edit')}
                      className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-medium"
                    >
                      Edit
                    </button>
                  </div>

                  {/* Amounts & Progress */}
                  <div>
                    <div className="flex justify-between items-baseline mb-1.5">
                      <span className="text-base font-extrabold text-slate-900 dark:text-white tabular-nums">
                        {formatCurrency(goal.savedAmount, settings.currency, false)}
                      </span>
                      <span className="text-xs text-slate-500 tabular-nums">
                        Goal: {formatCurrency(goal.targetAmount, settings.currency, false)} (
                        {progressPct.toFixed(0)}%)
                      </span>
                    </div>

                    <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        style={{
                          width: `${Math.min(progressPct, 100)}%`,
                          backgroundColor: goal.color,
                        }}
                        className="h-full rounded-full transition-all duration-300"
                      />
                    </div>

                    <div className="flex justify-between text-[11px] text-slate-400 mt-1.5">
                      <span>{isCompleted ? 'Goal Reached!' : `${formatCurrency(remaining, settings.currency, false)} to go`}</span>
                      {goal.notes && <span className="truncate max-w-[160px]">{goal.notes}</span>}
                    </div>
                  </div>

                  {/* Quick Action Buttons: Deposit / Withdraw */}
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => handleOpenGoal(goal, 'deposit')}
                      className="flex-1 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-semibold text-xs flex items-center justify-center gap-1 transition-colors"
                    >
                      <ArrowDownLeft className="w-3.5 h-3.5" />
                      Deposit
                    </button>
                    <button
                      onClick={() => handleOpenGoal(goal, 'withdraw')}
                      className="flex-1 h-9 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-xs flex items-center justify-center gap-1 transition-colors"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      Withdraw
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Account Modal */}
      <WalletModal
        isOpen={walletModalOpen}
        onClose={() => {
          setWalletModalOpen(false);
          setEditingAccount(null);
        }}
        editAccount={editingAccount}
      />

      {/* Savings Goal Modal */}
      <SavingsGoalModal
        isOpen={goalModalOpen}
        onClose={() => {
          setGoalModalOpen(false);
          setActiveGoal(null);
        }}
        goal={activeGoal}
        mode={goalModalMode}
      />
    </div>
  );
};
