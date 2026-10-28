import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatMonthYear, getNextMonth, getPreviousMonth, getCurrentMonth } from '../utils/formatters';
import { ChevronLeft, ChevronRight, Plus, Moon, Sun, Calendar } from 'lucide-react';

interface HeaderProps {
  onOpenAddModal: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAddModal, activeTab, setActiveTab }) => {
  const { selectedMonth, setSelectedMonth, settings, updateSettings } = useFinance();

  const handlePrevMonth = () => {
    setSelectedMonth(getPreviousMonth(selectedMonth));
  };

  const handleNextMonth = () => {
    setSelectedMonth(getNextMonth(selectedMonth));
  };

  const handleResetToCurrentMonth = () => {
    setSelectedMonth(getCurrentMonth());
  };

  const toggleTheme = () => {
    updateSettings({ darkMode: !settings.darkMode });
  };

  const isCurrentMonth = selectedMonth === getCurrentMonth();

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        
        {/* Zone 1: Single text element Brand wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-slate-900 font-extrabold text-sm shadow-xs">
            H
          </div>
          <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
            HisabPro
          </span>
        </div>

        {/* Zone 2: Month Navigation Switcher */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={handlePrevMonth}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white select-none">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="whitespace-nowrap">{formatMonthYear(selectedMonth)}</span>
          </div>

          <button
            onClick={handleNextMonth}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {!isCurrentMonth && (
            <button
              onClick={handleResetToCurrentMonth}
              className="hidden sm:inline-flex text-[11px] font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 px-2 py-1 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700"
            >
              Current
            </button>
          )}
        </div>

        {/* Zone 3: Desktop Nav Links + Theme Switcher + Primary Add Button */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 mr-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
            {[
              { id: 'dashboard', label: 'Dashboard' },
              { id: 'ledger', label: 'Ledger' },
              { id: 'budgets', label: 'Budgets' },
              { id: 'wallets', label: 'Accounts' },
              { id: 'settings', label: 'Settings' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800'
                    : 'hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={settings.darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {settings.darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={onOpenAddModal}
            className="h-9 px-3 sm:px-4 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Transaction</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>

      </div>
    </header>
  );
};
