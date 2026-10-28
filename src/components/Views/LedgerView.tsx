import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Transaction } from '../../types/finance';
import { formatCurrency, formatTransactionDate, exportTransactionsToCSV } from '../../utils/formatters';
import { FilterDrawer, FilterState } from '../FilterDrawer';
import {
  Search,
  Filter,
  Download,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Plus,
  SlidersHorizontal,
  Calendar,
} from 'lucide-react';

interface LedgerViewProps {
  onOpenAddModal: () => void;
  onSelectTransaction: (tx: Transaction) => void;
}

const INITIAL_FILTERS: FilterState = {
  type: 'all',
  category: 'all',
  accountId: 'all',
  dateRange: 'this_month',
  startDate: '',
  endDate: '',
  minAmount: '',
  maxAmount: '',
  sortBy: 'date_desc',
};

export const LedgerView: React.FC<LedgerViewProps> = ({ onOpenAddModal, onSelectTransaction }) => {
  const { transactions, accounts, selectedMonth, settings } = useFinance();

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Compute active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.type !== 'all') count++;
    if (filters.category !== 'all') count++;
    if (filters.accountId !== 'all') count++;
    if (filters.dateRange !== 'this_month') count++;
    if (filters.minAmount) count++;
    if (filters.maxAmount) count++;
    return count;
  }, [filters]);

  // Account map for CSV export
  const accountMap = useMemo(() => {
    const map: Record<string, string> = {};
    accounts.forEach((a) => {
      map[a.id] = a.name;
    });
    return map;
  }, [accounts]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Search query (case insensitive across note, merchant, category, tag)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesNote = tx.note.toLowerCase().includes(q);
        const matchesMerchant = tx.merchant ? tx.merchant.toLowerCase().includes(q) : false;
        const matchesCategory = tx.category.toLowerCase().includes(q);
        const matchesTag = tx.tag ? tx.tag.toLowerCase().includes(q) : false;
        if (!matchesNote && !matchesMerchant && !matchesCategory && !matchesTag) {
          return false;
        }
      }

      // Type filter
      if (filters.type !== 'all' && tx.type !== filters.type) {
        return false;
      }

      // Category filter
      if (filters.category !== 'all' && tx.category !== filters.category) {
        return false;
      }

      // Account filter
      if (filters.accountId !== 'all') {
        if (tx.accountId !== filters.accountId && tx.toAccountId !== filters.accountId) {
          return false;
        }
      }

      // Date Range filter
      if (filters.dateRange === 'this_month') {
        if (!tx.date.startsWith(selectedMonth)) return false;
      } else if (filters.dateRange === 'today') {
        const today = new Date().toISOString().slice(0, 10);
        if (tx.date !== today) return false;
      } else if (filters.dateRange === 'custom') {
        if (filters.startDate && tx.date < filters.startDate) return false;
        if (filters.endDate && tx.date > filters.endDate) return false;
      }

      // Amount filter
      if (filters.minAmount) {
        const min = parseFloat(filters.minAmount);
        if (!isNaN(min) && tx.amount < min) return false;
      }
      if (filters.maxAmount) {
        const max = parseFloat(filters.maxAmount);
        if (!isNaN(max) && tx.amount > max) return false;
      }

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'date_desc') return b.date.localeCompare(a.date);
      if (filters.sortBy === 'date_asc') return a.date.localeCompare(b.date);
      if (filters.sortBy === 'amount_desc') return b.amount - a.amount;
      if (filters.sortBy === 'amount_asc') return a.amount - b.amount;
      return 0;
    });
  }, [transactions, searchQuery, filters, selectedMonth]);

  // Group filtered transactions by date
  const groupedByDate = useMemo(() => {
    const groups: { date: string; displayDate: string; items: Transaction[]; dayTotal: number }[] = [];
    const dateMap = new Map<string, Transaction[]>();

    filteredTransactions.forEach((tx) => {
      if (!dateMap.has(tx.date)) {
        dateMap.set(tx.date, []);
      }
      dateMap.get(tx.date)!.push(tx);
    });

    dateMap.forEach((items, dateStr) => {
      const dayTotal = items.reduce((sum, item) => {
        if (item.type === 'expense') return sum - item.amount;
        if (item.type === 'income') return sum + item.amount;
        return sum;
      }, 0);

      groups.push({
        date: dateStr,
        displayDate: formatTransactionDate(dateStr),
        items,
        dayTotal,
      });
    });

    return groups;
  }, [filteredTransactions]);

  const handleExportCSV = () => {
    exportTransactionsToCSV(filteredTransactions, accountMap, settings.currency.symbol);
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
    setSearchQuery('');
  };

  return (
    <div className="space-y-4 pb-20 md:pb-8">
      {/* Top Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by merchant, note, or tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-10 pr-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-slate-900 dark:focus:ring-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Filter button with count */}
          <button
            onClick={() => setIsFilterOpen(true)}
            className={`h-11 px-3.5 rounded-xl border flex items-center gap-2 text-xs font-semibold transition-all ${
              activeFilterCount > 0
                ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Export to CSV */}
          <button
            onClick={handleExportCSV}
            className="h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 text-xs font-semibold transition-colors shrink-0"
            title="Download CSV"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Type quick-switch tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl max-w-sm">
        {(['all', 'expense', 'income', 'transfer'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setFilters({ ...filters, type: t })}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
              filters.type === t
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Summary count info */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing {filteredTransactions.length} transaction
          {filteredTransactions.length === 1 ? '' : 's'}
        </span>
        {activeFilterCount > 0 && (
          <button
            onClick={handleResetFilters}
            className="text-blue-600 dark:text-blue-400 font-medium hover:underline text-[11px]"
          >
            Reset all filters
          </button>
        )}
      </div>

      {/* Grouped Ledger List */}
      {groupedByDate.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
            <Search className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
            No transactions match your search
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Try adjusting your search criteria or resetting filters.
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-4 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-200 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {groupedByDate.map((group) => (
            <div
              key={group.date}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs"
            >
              {/* Date Group Header */}
              <div className="px-4 py-2.5 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {group.displayDate}
                </span>
                <span
                  className={`text-xs font-semibold tabular-nums ${
                    group.dayTotal < 0
                      ? 'text-slate-600 dark:text-slate-400'
                      : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  Net: {formatCurrency(group.dayTotal, settings.currency)}
                </span>
              </div>

              {/* Transactions in this date */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {group.items.map((tx) => {
                  const isExpense = tx.type === 'expense';
                  const isIncome = tx.type === 'income';
                  const account = accounts.find((a) => a.id === tx.accountId);
                  const toAccount = tx.toAccountId
                    ? accounts.find((a) => a.id === tx.toAccountId)
                    : null;

                  return (
                    <div
                      key={tx.id}
                      onClick={() => onSelectTransaction(tx)}
                      className="px-4 py-3 flex items-center justify-between gap-3 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
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
                            {tx.merchant || tx.note || tx.category}
                          </p>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                            <span>{tx.category}</span>
                            <span aria-hidden="true">·</span>
                            <span>{account?.name || 'Account'}</span>
                            {toAccount && (
                              <>
                                <span aria-hidden="true">→</span>
                                <span>{toAccount.name}</span>
                              </>
                            )}
                            {tx.time && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="font-mono">{tx.time}</span>
                              </>
                            )}
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
                          <span className="block text-[10px] text-slate-400 truncate max-w-[100px]">
                            {tx.tag}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filter Drawer */}
      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onChange={setFilters}
        onReset={handleResetFilters}
      />
    </div>
  );
};
