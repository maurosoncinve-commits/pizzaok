
import React, { useState, useMemo } from 'react';
import { Customer, Card } from '../types';
import { useLocalization } from '../hooks/useLocalization';
import { formatDate } from '../utils/helpers';
import CardView from './CardView';

interface CustomerListProps {
  customers: Customer[];
  cards: Card[];
  loading: boolean;
  onDeleteCard: (cardId: string) => void;
}

const CustomerList: React.FC<CustomerListProps> = ({ customers, cards, loading, onDeleteCard }) => {
  const { t, language } = useLocalization();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  const filteredCustomers = useMemo(() => {
    if (!searchTerm) return customers;
    return customers.filter(customer =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cards.some(card => card.customerId === customer.id && card.id.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [customers, cards, searchTerm]);

  if (loading) {
    return <div className="text-center text-gray-400">{t('generatingCard')}...</div>;
  }

  const toggleCustomerCards = (customerId: string) => {
    setSelectedCustomerId(prevId => (prevId === customerId ? null : customerId));
  };
  
  return (
    <div className="bg-gray-800/50 p-6 md:p-8 rounded-xl shadow-2xl shadow-black/20">
      <h2 className="text-3xl font-bold mb-6 text-yellow-400 border-b-2 border-yellow-400/30 pb-2">{t('customersAndCards')}</h2>
      <input
        type="text"
        placeholder={t('searchCustomer')}
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 mb-6 text-white focus:ring-red-500 focus:border-red-500"
      />
      {filteredCustomers.length === 0 ? (
        <p className="text-center text-gray-400">{t('noCustomers')}</p>
      ) : (
        <div className="space-y-4">
          {filteredCustomers.map(customer => {
            const customerCards = cards.filter(card => card.customerId === customer.id);
            return (
              <div key={customer.id} className="bg-gray-700/50 rounded-lg shadow-md overflow-hidden">
                <div className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center cursor-pointer hover:bg-gray-700/80 transition-colors" onClick={() => toggleCustomerCards(customer.id)}>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-xl font-semibold text-white">{customer.name}</h3>
                        {customer.registeredBy && (
                            <span className="bg-blue-900/50 text-blue-200 text-xs px-2 py-0.5 rounded border border-blue-800">
                                {t('registeredByLabel')}: {customer.registeredBy}
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-gray-400 mt-1">@{customer.instagram} &bull; {customer.phone.countryCode} {customer.phone.number}</p>
                    <p className="text-xs text-gray-500 mt-1">
                        {t('registeredOn')}: {formatDate(customer.registeredAt, language)}
                    </p>
                  </div>
                   <button className="mt-3 md:mt-0 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors text-sm">
                        {t('viewCards')} ({customerCards.length})
                   </button>
                </div>
                {selectedCustomerId === customer.id && (
                  <div className="p-4 border-t border-gray-600">
                    {customerCards.length > 0 ? (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {customerCards.map(card => (
                          <CardView key={card.id} card={card} customer={customer} onDelete={onDeleteCard} />
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-gray-400">{t('noCards')}</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomerList;
