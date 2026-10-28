/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { App as CapApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { FinanceProvider } from './context/FinanceContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { DashboardView } from './components/Views/DashboardView';
import { LedgerView } from './components/Views/LedgerView';
import { BudgetsView } from './components/Views/BudgetsView';
import { WalletsView } from './components/Views/WalletsView';
import { SettingsView } from './components/Views/SettingsView';
import { TransactionModal } from './components/TransactionModal';
import { CategoryBudgetModal } from './components/CategoryBudgetModal';
import { Transaction } from './types/finance';

function MainApp() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);

  // Android hardware back button & native status bar handling
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
      StatusBar.setBackgroundColor({ color: '#0f172a' }).catch(() => {});

      const listenerPromise = CapApp.addListener('backButton', () => {
        if (isAddModalOpen) {
          setIsAddModalOpen(false);
          setEditingTransaction(null);
        } else if (isBudgetModalOpen) {
          setIsBudgetModalOpen(false);
        } else if (activeTab !== 'dashboard') {
          setActiveTab('dashboard');
        } else {
          CapApp.exitApp();
        }
      });

      return () => {
        listenerPromise.then((handle) => handle.remove()).catch(() => {});
      };
    }
  }, [isAddModalOpen, isBudgetModalOpen, activeTab]);

  const handleOpenAddModal = () => {
    setEditingTransaction(null);
    setIsAddModalOpen(true);
  };

  const handleSelectTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsAddModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors selection:bg-slate-900 selection:text-white dark:selection:bg-white dark:selection:text-slate-900">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={handleOpenAddModal}
      />

      {/* Main View Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-5 pb-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            onOpenAddModal={handleOpenAddModal}
            onSelectTransaction={handleSelectTransaction}
            onNavigateTab={setActiveTab}
            onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
          />
        )}

        {activeTab === 'ledger' && (
          <LedgerView
            onOpenAddModal={handleOpenAddModal}
            onSelectTransaction={handleSelectTransaction}
          />
        )}

        {activeTab === 'budgets' && (
          <BudgetsView
            onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
          />
        )}

        {activeTab === 'wallets' && <WalletsView />}

        {activeTab === 'settings' && <SettingsView />}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={handleOpenAddModal}
      />

      {/* Transaction Add / Edit Bottom Sheet Modal */}
      <TransactionModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTransaction(null);
        }}
        editTransaction={editingTransaction}
      />

      {/* Monthly Budget Settings Modal */}
      <CategoryBudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <FinanceProvider>
      <MainApp />
    </FinanceProvider>
  );
}
