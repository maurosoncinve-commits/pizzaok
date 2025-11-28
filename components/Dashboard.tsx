
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import Header from './Header';
import CustomerForm from './CustomerForm';
import { Customer, Card, Transaction, CardType, NewCustomer, NewTransaction } from '../types';
import { api } from '../services/mockApi';
import CustomerList from './CustomerList';
import TransactionList from './TransactionList';
import TransactionForm from './TransactionForm';
import HelpModal from './HelpModal';
import SettingsModal from './SettingsModal';
import InstallModal from './InstallModal';

type View = 'register' | 'customers' | 'transactions' | 'backup';

const Dashboard: React.FC = () => {
  const { t } = useLocalization();
  // Changed default view to 'register' as requested
  const [view, setView] = useState<View>('register');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState('');
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error' | undefined>(undefined);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
        const [custData, cardData, txData] = await Promise.all([
            api.getCustomers(),
            api.getCards(),
            api.getTransactions(),
        ]);
        setCustomers(custData);
        setCards(cardData);
        setTransactions(txData.sort((a,b) => b.date.getTime() - a.date.getTime()));
    } catch (error) {
        console.error("Failed to fetch data:", error);
    } finally {
        setLoading(false);
    }
  }, []);

  const runSync = useCallback(async () => {
      if (!api.getSyncUrl()) return;
      
      setSyncStatus('syncing');
      try {
          const success = await api.syncWithCloud();
          if (success) {
            await fetchData();
            setSyncStatus('synced');
            showNotification(t('dataSynced'));
          } else {
              setSyncStatus('error');
          }
      } catch (e) {
          setSyncStatus('error');
          showNotification(t('syncFailed'));
      }
  }, [fetchData, t]);

  useEffect(() => {
    fetchData();
    // Initial sync check
    if (api.getSyncUrl()) {
        runSync();
    }
  }, [fetchData, runSync]);

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 3000);
  };
  
  const handleRegisterCustomer = async (customer: NewCustomer, cardType: CardType) => {
    setSyncStatus('syncing');
    await api.addCustomer(customer, cardType);
    setSyncStatus('synced'); // Optimistic
    showNotification(t('customerRegistered'));
    fetchData();
    setView('customers');
  };

  const handleDeleteCard = async (cardId: string) => {
    setSyncStatus('syncing');
    const { deletedCardId, deletedTransactionIds } = await api.deleteCard(cardId);
    setSyncStatus('synced');
    setCards(prev => prev.filter(c => c.id !== deletedCardId));
    setTransactions(prev => prev.filter(t => !deletedTransactionIds.includes(t.id)));
    showNotification(t('cardDeleted'));
  };

  const handleAddTransaction = async (transaction: NewTransaction) => {
    setSyncStatus('syncing');
    const { transaction: newTransaction, updatedCard } = await api.addTransaction(transaction);
    setSyncStatus('synced');
    setTransactions(prev => [newTransaction, ...prev].sort((a,b) => b.date.getTime() - a.date.getTime()));
    if (updatedCard) {
        setCards(prev => prev.map(c => c.id === updatedCard.id ? updatedCard : c));
    }
    showNotification(t('transactionAdded'));
    setView('transactions');
  };
  
  const handleUpdateTransaction = async (transactionId: string, newAmount: number) => {
    setSyncStatus('syncing');
    const { transaction: updatedTransaction, updatedCard } = await api.updateTransaction(transactionId, newAmount);
    setSyncStatus('synced');
    setTransactions(prev => prev.map(t => t.id === transactionId ? updatedTransaction : t).sort((a,b) => b.date.getTime() - a.date.getTime()));
    if (updatedCard) {
        setCards(prev => prev.map(c => c.id === updatedCard.id ? updatedCard : c));
    }
    showNotification(t('transactionUpdated'));
  };
  
  const handleDeleteTransaction = async (transactionId: string) => {
    setSyncStatus('syncing');
    const { deletedTransactionId, updatedCard } = await api.deleteTransaction(transactionId);
    setSyncStatus('synced');
    setTransactions(prev => prev.filter(t => t.id !== deletedTransactionId));
    if (updatedCard) {
        setCards(prev => prev.map(c => c.id === updatedCard.id ? updatedCard : c));
    }
    showNotification(t('transactionDeleted'));
  };
  
  const handleExport = async (format: 'json' | 'csv') => {
      const data = await api.exportData(format);
      const blob = new Blob([data], { type: format === 'json' ? 'application/json' : 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pizzangooo_backup_${new Date().toISOString()}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showNotification(t('dataExported'));
  }

  const handleImportClick = () => {
    if (window.confirm(t('importWarning'))) {
        fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
        const content = e.target?.result;
        if (typeof content === 'string') {
            try {
                await api.importData(content);
                showNotification(t('importSuccess'));
                fetchData(); // Reload data from DB
            } catch (err) {
                console.error(err);
                alert(t('importError'));
            }
        }
    };
    reader.readAsText(file);
    // Reset input so same file can be selected again if needed
    event.target.value = '';
  };

  const renderView = () => {
    switch (view) {
      case 'register':
        return <CustomerForm onRegister={handleRegisterCustomer} />;
      case 'customers':
        return <CustomerList customers={customers} cards={cards} loading={loading} onDeleteCard={handleDeleteCard} />;
      case 'transactions':
        return (
          <div>
            <TransactionForm cards={cards} customers={customers} onAddTransaction={handleAddTransaction} />
            <TransactionList 
              transactions={transactions} 
              cards={cards} 
              customers={customers} 
              loading={loading} 
              onUpdateTransaction={handleUpdateTransaction}
              onDeleteTransaction={handleDeleteTransaction}
            />
          </div>
        );
      case 'backup':
          return (
            <div className="bg-gray-800/50 p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-6 text-gold-400">{t('backupExport')}</h2>
                <div className="space-y-6">
                    <div>
                         <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-white">Google Sync</h3>
                            <button onClick={runSync} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm transition-colors">{t('syncNow')}</button>
                         </div>
                         <p className="text-gray-400 text-sm mb-4">
                            {api.getSyncUrl() ? 
                                <span className="text-green-400">Connected to Google Drive</span> : 
                                <span className="text-red-400">Not connected. Use Settings to configure.</span>
                            }
                         </p>
                    </div>

                    <div className="pt-6 border-t border-gray-700">
                        <h3 className="text-xl font-bold text-white mb-4">{t('manualBackup')}</h3>
                        <p className="text-gray-400 mb-2">Export data to save a backup or transfer to another device.</p>
                        <div className="flex gap-4">
                            <button onClick={() => handleExport('json')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors">{t('exportAsJSON')}</button>
                            <button onClick={() => handleExport('csv')} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors">{t('exportAsCSV')}</button>
                        </div>
                    </div>
                    
                    <div className="pt-6 border-t border-gray-700">
                        <p className="text-gray-400 mb-2">Restore data from a JSON backup file.</p>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            accept=".json" 
                            className="hidden" 
                        />
                        <button onClick={handleImportClick} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors">
                            {t('importData')}
                        </button>
                    </div>
                </div>
            </div>
          )
      default:
        return <CustomerList customers={customers} cards={cards} loading={loading} onDeleteCard={handleDeleteCard} />;
    }
  };
  
  const NavButton: React.FC<{
    targetView: View;
    children: React.ReactNode;
  }> = ({ targetView, children }) => (
    <button
      onClick={() => setView(targetView)}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
        view === targetView
          ? 'bg-red-600 text-white shadow-md'
          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
      }`}
    >
      {children}
    </button>
  );

  return (
    <>
      <Header 
        onHelpClick={() => setIsHelpOpen(true)} 
        onSettingsClick={() => setIsSettingsOpen(true)}
        onInstallClick={() => setIsInstallModalOpen(true)}
        syncStatus={syncStatus}
        showNotification={showNotification}
      />
      <main className="container mx-auto p-4 md:p-8 pb-20">
        <div className="mb-8 p-2 bg-gray-800/60 rounded-lg shadow-md flex flex-wrap gap-2 justify-center">
            <NavButton targetView="register">{t('registerCustomer')}</NavButton>
            <NavButton targetView="customers">{t('customersAndCards')}</NavButton>
            <NavButton targetView="transactions">{t('transactions')}</NavButton>
            <NavButton targetView="backup">{t('backupExport')}</NavButton>
        </div>
        
        {notification && (
            <div className="fixed top-24 right-8 bg-green-500 text-white py-2 px-4 rounded-lg shadow-lg animate-fade-in-out z-50">
                {notification}
            </div>
        )}

        {renderView()}
      </main>

      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        onSave={() => runSync()}
      />
      <InstallModal isOpen={isInstallModalOpen} onClose={() => setIsInstallModalOpen(false)} />

      <style>{`
        .animate-fade-in-out {
            animation: fadeInOut 3s forwards;
        }
        @keyframes fadeInOut {
            0% { opacity: 0; transform: translateY(-20px); }
            10% { opacity: 1; transform: translateY(0); }
            90% { opacity: 1; transform: translateY(0); }
            100% { opacity: 0; transform: translateY(-20px); }
        }
      `}</style>
    </>
  );
};

export default Dashboard;
