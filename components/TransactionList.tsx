
import React, { useState } from 'react';
import { Transaction, Card, Customer, CardType } from '../types';
import { useLocalization } from '../hooks/useLocalization';
import { formatDate } from '../utils/helpers';
import Modal from './common/Modal';
import { EditIcon } from './icons/EditIcon';
import { DeleteIcon } from './icons/DeleteIcon';

interface TransactionListProps {
  transactions: Transaction[];
  cards: Card[];
  customers: Customer[];
  loading: boolean;
  onUpdateTransaction: (transactionId: string, newAmount: number) => Promise<void>;
  onDeleteTransaction: (transactionId: string) => Promise<void>;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, cards, customers, loading, onUpdateTransaction, onDeleteTransaction }) => {
  const { t, language } = useLocalization();
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);
  const [editedAmount, setEditedAmount] = useState('');

  const getTransactionDetails = (tx: Transaction) => {
    const card = cards.find(c => c.id === tx.cardId);
    const customer = card ? customers.find(cust => cust.id === card.customerId) : undefined;
    return { card, customer };
  };

  const handleEditClick = (tx: Transaction) => {
    setEditingTransaction(tx);
    setEditedAmount(tx.amount.toString());
  };

  const handleDeleteClick = (tx: Transaction) => {
    setDeletingTransaction(tx);
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTransaction && editedAmount) {
      await onUpdateTransaction(editingTransaction.id, parseFloat(editedAmount));
      setEditingTransaction(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (deletingTransaction) {
      await onDeleteTransaction(deletingTransaction.id);
      setDeletingTransaction(null);
    }
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  }

  if (loading) {
    return <div className="text-center text-gray-400">Loading...</div>;
  }

  return (
    <>
      <div className="bg-gray-800/50 p-6 md:p-8 rounded-xl shadow-2xl shadow-black/20">
        <h2 className="text-3xl font-bold mb-6 text-yellow-400 border-b-2 border-yellow-400/30 pb-2">{t('transactionHistory')}</h2>
        {transactions.length === 0 ? (
          <p className="text-center text-gray-400">{t('noTransactions')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-xs text-gray-300 uppercase bg-gray-700/50">
                <tr>
                  <th className="px-4 py-3">{t('date')}</th>
                  <th className="px-4 py-3">{t('customer')}</th>
                  <th className="px-4 py-3">{t('cardType')}</th>
                  <th className="px-4 py-3">{t('cardId')}</th>
                  <th className="px-4 py-3 text-right">{t('amount')}</th>
                  <th className="px-4 py-3 text-center">{t('pointsEarned')}</th>
                  <th className="px-4 py-3 text-right">{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(tx => {
                  const { card, customer } = getTransactionDetails(tx);
                  return (
                    <tr key={tx.id} className="border-b border-gray-700 hover:bg-gray-700/30">
                      <td className="px-4 py-3 text-sm">{formatDate(tx.date, language)}</td>
                      <td className="px-4 py-3 font-medium text-white">{customer?.name || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm">
                        {card ? (
                           <span className={`px-2 py-1 text-xs font-bold tracking-wider rounded-full ${card.type === CardType.VIP ? 'bg-red-600 text-white' : 'bg-yellow-500 text-black'}`}>
                                {t(card.type.toLowerCase() as 'vip' | 'fidelity')}
                           </span>
                        ) : 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-gray-400 font-mono text-xs">{tx.cardId}</td>
                      <td className="px-4 py-3 text-right text-white">{formatCurrency(tx.amount)}</td>
                      <td className="px-4 py-3 text-center">
                        {card?.type === CardType.FIDELITY && tx.pointsEarned > 0 ? (
                          <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full">+{tx.pointsEarned}</span>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end items-center gap-4">
                            <button onClick={() => handleEditClick(tx)} className="text-blue-400 hover:text-blue-300 transition-colors" aria-label={t('editTransaction')}>
                                <EditIcon className="w-5 h-5" />
                            </button>
                            <button onClick={() => handleDeleteClick(tx)} className="text-red-500 hover:text-red-400 transition-colors" aria-label={t('deleteTransaction')}>
                                <DeleteIcon className="w-5 h-5" />
                            </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Transaction Modal */}
      <Modal
        isOpen={!!editingTransaction}
        onClose={() => setEditingTransaction(null)}
        title={t('editTransaction')}
      >
        <form onSubmit={handleUpdateSubmit}>
          <div className="mb-4">
            <label htmlFor="edit-amount" className="block text-sm font-medium text-gray-300 mb-1">{t('transactionAmount')}</label>
            <input 
              type="number" 
              id="edit-amount" 
              value={editedAmount} 
              onChange={e => setEditedAmount(e.target.value)} 
              required
              min="0"
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-red-500 focus:border-red-500"
            />
          </div>
          <div className="flex justify-end gap-4 mt-6">
            <button type="button" onClick={() => setEditingTransaction(null)} className="py-2 px-4 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-lg transition-colors">{t('cancel')}</button>
            <button type="submit" className="py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors">{t('saveChanges')}</button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingTransaction}
        onClose={() => setDeletingTransaction(null)}
        title={t('confirmDeletion')}
      >
        <div>
          <p className="text-gray-300 mb-6">{t('areYouSureDelete')}</p>
          <div className="flex justify-end gap-4">
            <button onClick={() => setDeletingTransaction(null)} className="py-2 px-4 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-lg transition-colors">{t('cancel')}</button>
            <button onClick={handleConfirmDelete} className="py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors">{t('delete')}</button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default TransactionList;
