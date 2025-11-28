
import React, { useState } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { CardType, NewCustomer } from '../types';
import { COUNTRY_CODES } from '../constants';

interface CustomerFormProps {
    onRegister: (customer: NewCustomer, cardType: CardType) => void;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ onRegister }) => {
    const { t } = useLocalization();
    const [name, setName] = useState('');
    const [operatorName, setOperatorName] = useState('');
    const [instagram, setInstagram] = useState('');
    const [countryCode, setCountryCode] = useState('+62');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [cardType, setCardType] = useState<CardType>(CardType.FIDELITY);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newCustomer: NewCustomer = {
            name,
            instagram: instagram.startsWith('@') ? instagram.substring(1) : instagram,
            phone: {
                countryCode,
                number: phoneNumber,
            },
            registeredBy: operatorName,
        };
        onRegister(newCustomer, cardType);
        // Reset form
        setName('');
        setOperatorName('');
        setInstagram('');
        setPhoneNumber('');
        setCardType(CardType.FIDELITY);
    };
    
    return (
        <div className="bg-gray-800/50 p-6 md:p-8 rounded-xl shadow-2xl shadow-black/20 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-yellow-400 border-b-2 border-yellow-400/30 pb-2">{t('registerCustomer')}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="operator" className="block text-sm font-medium text-blue-300 mb-1">{t('operatorName')}</label>
                    <input type="text" id="operator" value={operatorName} onChange={e => setOperatorName(e.target.value)} required placeholder="Who is registering?" className="w-full bg-gray-700 border border-blue-500/50 rounded-md px-3 py-2 text-white focus:ring-blue-500 focus:border-blue-500"/>
                </div>

                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">{t('fullName')}</label>
                    <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-red-500 focus:border-red-500"/>
                </div>
                <div>
                    <label htmlFor="instagram" className="block text-sm font-medium text-gray-300 mb-1">{t('instagramHandle')}</label>
                    <input type="text" id="instagram" value={instagram} onChange={e => setInstagram(e.target.value)} required placeholder="username" className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-red-500 focus:border-red-500"/>
                </div>
                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">{t('phoneNumber')}</label>
                    <div className="flex">
                        <select value={countryCode} onChange={e => setCountryCode(e.target.value)} className="bg-gray-700 border border-gray-600 rounded-l-md px-3 py-2 text-white focus:ring-red-500 focus:border-red-500">
                            {COUNTRY_CODES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
                        </select>
                        <input type="tel" id="phone" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} required className="w-full bg-gray-700 border border-gray-600 rounded-r-md px-3 py-2 text-white focus:ring-red-500 focus:border-red-500"/>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">{t('cardType')}</label>
                    <div className="flex gap-4">
                        <button type="button" onClick={() => setCardType(CardType.FIDELITY)} className={`flex-1 py-3 px-4 rounded-md text-sm font-semibold transition-all ${cardType === CardType.FIDELITY ? 'bg-yellow-500 text-black shadow-lg scale-105' : 'bg-gray-700 text-white hover:bg-gray-600'}`}>{t('fidelity')}</button>
                        <button type="button" onClick={() => setCardType(CardType.VIP)} className={`flex-1 py-3 px-4 rounded-md text-sm font-semibold transition-all ${cardType === CardType.VIP ? 'bg-red-600 text-white shadow-lg scale-105' : 'bg-gray-700 text-white hover:bg-gray-600'}`}>{t('vip')}</button>
                    </div>
                </div>
                <div className="pt-4">
                    <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-md hover:shadow-lg">{t('register')}</button>
                </div>
            </form>
        </div>
    );
};

export default CustomerForm;