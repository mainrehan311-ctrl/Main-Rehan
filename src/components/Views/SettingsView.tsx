import React, { useState, useRef } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { CURRENCIES, exportTransactionsToCSV, formatCurrency, formatMonthYear, getCurrentDate } from '../../utils/formatters';
import {
  Globe,
  Sliders,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  Check,
  Moon,
  Sun,
  Printer,
  Shield,
  FileSpreadsheet,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    transactions,
    accounts,
    monthlyStats,
    selectedMonth,
    exportToJSON,
    importFromJSON,
    resetToSampleData,
    clearAllData,
  } = useFinance();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleCurrencyChange = (currencyCode: string) => {
    const found = CURRENCIES.find((c) => c.code === currencyCode);
    if (found) {
      updateSettings({ currency: found });
    }
  };

  const handleExportJSON = () => {
    const jsonStr = exportToJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `HisabPro_Backup_${getCurrentDate()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importFromJSON(content);
      if (success) {
        setImportStatus('Backup restored successfully!');
      } else {
        setImportStatus('Failed to parse JSON backup file. Please check file format.');
      }
      setTimeout(() => setImportStatus(null), 4000);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleExportAllCSV = () => {
    const accountMap: Record<string, string> = {};
    accounts.forEach((a) => {
      accountMap[a.id] = a.name;
    });
    exportTransactionsToCSV(transactions, accountMap, settings.currency.symbol);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8 max-w-4xl">
      {/* General Preferences */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Globe className="w-4 h-4 text-blue-500" />
          General Preferences & Currency
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Active Currency
            </label>
            <select
              value={settings.currency.code}
              onChange={(e) => handleCurrencyChange(e.target.value)}
              className="w-full h-11 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-hidden"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} ({c.symbol}) – {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              User / Profile Name
            </label>
            <input
              type="text"
              value={settings.userName}
              onChange={(e) => updateSettings({ userName: e.target.value })}
              className="w-full h-11 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden"
            />
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
          <div>
            <p className="text-xs font-semibold text-slate-900 dark:text-white">Dark Appearance</p>
            <p className="text-[11px] text-slate-500">Toggle dark theme for night viewing</p>
          </div>
          <button
            onClick={() => updateSettings({ darkMode: !settings.darkMode })}
            className={`w-12 h-7 flex items-center rounded-full p-1 transition-colors ${
              settings.darkMode ? 'bg-slate-900 dark:bg-white' : 'bg-slate-200'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full transition-transform flex items-center justify-center ${
                settings.darkMode
                  ? 'translate-x-5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white'
                  : 'translate-x-0 bg-white text-slate-600'
              }`}
            >
              {settings.darkMode ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />}
            </div>
          </button>
        </div>
      </div>

      {/* Printable Monthly Financial Statement Card */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Printer className="w-4 h-4 text-emerald-500" />
              Monthly Financial Statement
            </h3>
            <p className="text-xs text-slate-500">
              Clean overview for {formatMonthYear(selectedMonth)}
            </p>
          </div>
          <button
            onClick={handlePrint}
            className="h-9 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Print / Save PDF
          </button>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs space-y-2">
          <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
            <span className="text-slate-500">Statement Owner:</span>
            <span className="font-bold text-slate-900 dark:text-white">{settings.userName}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
            <span className="text-slate-500">Period:</span>
            <span className="font-semibold text-slate-900 dark:text-white">{formatMonthYear(selectedMonth)}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
            <span className="text-slate-500">Total Income:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {formatCurrency(monthlyStats.totalIncome, settings.currency)}
            </span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
            <span className="text-slate-500">Total Expenses:</span>
            <span className="font-bold text-rose-600 dark:text-rose-400 tabular-nums">
              {formatCurrency(monthlyStats.totalExpense, settings.currency)}
            </span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-500">Net Surplus / Savings:</span>
            <span className="font-extrabold text-slate-900 dark:text-white tabular-nums">
              {formatCurrency(monthlyStats.netSavings, settings.currency)} ({monthlyStats.savingsRate.toFixed(1)}%)
            </span>
          </div>
        </div>
      </div>

      {/* Data Backup & Migration */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-purple-500" />
          Data Backup, Export & Storage
        </h3>
        <p className="text-xs text-slate-500">
          All your financial data is safely stored in your browser's persistent storage. Export backups to prevent accidental loss or migrate devices.
        </p>

        {importStatus && (
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl text-blue-700 dark:text-blue-300 text-xs font-medium">
            {importStatus}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Export JSON */}
          <button
            onClick={handleExportJSON}
            className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col items-center justify-center text-center gap-1.5 transition-colors"
          >
            <Download className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            <span className="text-xs font-bold text-slate-900 dark:text-white">Export Backup JSON</span>
            <span className="text-[10px] text-slate-400">Complete dataset backup</span>
          </button>

          {/* Import JSON */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col items-center justify-center text-center gap-1.5 transition-colors"
          >
            <Upload className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            <span className="text-xs font-bold text-slate-900 dark:text-white">Restore from JSON</span>
            <span className="text-[10px] text-slate-400">Upload saved backup</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileImport}
            className="hidden"
          />

          {/* Export CSV */}
          <button
            onClick={handleExportAllCSV}
            className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col items-center justify-center text-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-bold text-slate-900 dark:text-white">Export Ledger to CSV</span>
            <span className="text-[10px] text-slate-400">Excel / Google Sheets</span>
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-rose-200/60 dark:border-rose-950/40 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400">
          Reset & Cleanup
        </h3>
        <p className="text-xs text-slate-500">
          Reset to default mock demonstration data or wipe clean for a fresh start.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          {/* Reset to Sample Data */}
          {showResetConfirm ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-rose-600 font-medium">Are you sure?</span>
              <button
                onClick={() => {
                  resetToSampleData();
                  setShowResetConfirm(false);
                }}
                className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700"
              >
                Yes, Reset Data
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset to Sample Data
            </button>
          )}

          {/* Clear All Data */}
          {showClearConfirm ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-rose-600 font-medium">Clear everything?</span>
              <button
                onClick={() => {
                  clearAllData();
                  setShowClearConfirm(false);
                }}
                className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700"
              >
                Yes, Clear
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="h-10 px-4 rounded-xl border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear All Transactions
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
