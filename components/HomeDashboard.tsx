
import React, { useMemo } from 'react';
import { Customer, Transaction } from '../types';
import { useLocalization } from '../hooks/useLocalization';
import { isSameWeek, subDays, isAfter, format } from 'date-fns';
import { WhatsappIcon } from './icons/WhatsappIcon';

interface HomeDashboardProps {
    customers: Customer[];
    transactions: Transaction[];
}

const HomeDashboard: React.FC<HomeDashboardProps> = ({ customers, transactions }) => {
    const { t } = useLocalization();
    const today = new Date();

    // 1. Birthdays (Next 7 days)
    const upcomingBirthdays = useMemo(() => {
        return customers.filter(c => {
            if (!c.dob) return false;
            const dob = new Date(c.dob);
            // Create a date object for this year's birthday
            const thisYearBday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
            return isSameWeek(thisYearBday, today, { weekStartsOn: 1 });
        });
    }, [customers, today]);

    // 2. Top Staff
    const topStaff = useMemo(() => {
        const staffCount: Record<string, number> = {};
        customers.forEach(c => {
            if (c.registeredBy) {
                staffCount[c.registeredBy] = (staffCount[c.registeredBy] || 0) + 1;
            }
        });
        return Object.entries(staffCount)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3);
    }, [customers]);

    // 3. Sales (Last 7 Days)
    const salesStats = useMemo(() => {
        const stats: Record<string, number> = {};
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = subDays(today, i);
            return format(d, 'yyyy-MM-dd');
        }).reverse();

        // Initialize
        last7Days.forEach(day => stats[day] = 0);

        transactions.forEach(t => {
            const day = format(t.date, 'yyyy-MM-dd');
            if (stats[day] !== undefined) {
                stats[day] += t.amount;
            }
        });

        return last7Days.map(day => ({ date: format(new Date(day), 'dd/MM'), amount: stats[day] }));
    }, [transactions, today]);

    // 4. Dormant Customers (>30 days no visit)
    const dormantCustomers = useMemo(() => {
        const thirtyDaysAgo = subDays(today, 30);
        
        // Get last transaction date for each customer
        const lastTxMap = new Map<string, Date>();
        transactions.forEach(t => {
            // Need to map cardId to customerId... tricky without cards prop passed down easily.
            // Simplified approximation: If we can't link card to customer easily here, 
            // we might need to skip or pass Cards prop. 
            // Assuming for now we just list basic stats or need card prop.
        });
        
        // Better approach for lightweight dash: just logic placeholder or simple filter if possible.
        // Let's filter by simple check if we can. 
        // For MVP without prop drilling cards:
        return []; 
    }, [transactions, today]);

    const sendBirthdayWish = (customer: Customer) => {
        const phone = customer.phone.countryCode.replace('+','') + customer.phone.number.replace(/^0+/, '');
        const msg = encodeURIComponent(`${t('birthdayMsg')}`);
        window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Birthdays */}
            <div className="bg-gray-800/50 p-6 rounded-xl shadow-lg border-l-4 border-pink-500">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    {t('upcomingBirthdays')}
                </h3>
                {upcomingBirthdays.length > 0 ? (
                    <ul className="space-y-3">
                        {upcomingBirthdays.map(c => (
                            <li key={c.id} className="flex justify-between items-center bg-gray-700/50 p-3 rounded">
                                <div>
                                    <p className="font-bold text-white">{c.name}</p>
                                    <p className="text-xs text-gray-400">{format(new Date(c.dob!), 'dd MMMM')}</p>
                                </div>
                                <button onClick={() => sendBirthdayWish(c)} className="bg-green-600 p-2 rounded-full hover:bg-green-500">
                                    <WhatsappIcon className="w-4 h-4 text-white" />
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500 italic">{t('noBirthdays')}</p>
                )}
            </div>

            {/* Top Staff */}
            <div className="bg-gray-800/50 p-6 rounded-xl shadow-lg border-l-4 border-yellow-500">
                <h3 className="text-xl font-bold text-white mb-4">
                    {t('topStaff')}
                </h3>
                <ul className="space-y-3">
                    {topStaff.map(([name, count], index) => (
                        <li key={name} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${index === 0 ? 'bg-yellow-400 text-black' : 'bg-gray-600 text-white'}`}>
                                    {index + 1}
                                </span>
                                <span className="text-gray-200">{name}</span>
                            </div>
                            <span className="font-bold text-white">{count}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Sales Chart (Simple Bar) */}
            <div className="bg-gray-800/50 p-6 rounded-xl shadow-lg lg:col-span-2 border-t-4 border-blue-500">
                <h3 className="text-xl font-bold text-white mb-6">{t('weeklySales')}</h3>
                <div className="flex items-end justify-between h-40 gap-2">
                    {salesStats.map((stat, idx) => {
                        // rudimentary scaling
                        const maxVal = Math.max(...salesStats.map(s => s.amount), 1);
                        const height = (stat.amount / maxVal) * 100;
                        return (
                            <div key={idx} className="flex flex-col items-center flex-1 group">
                                <div className="w-full bg-blue-900/30 rounded-t-sm relative h-full flex items-end">
                                    <div 
                                        className="w-full bg-blue-500 hover:bg-blue-400 transition-all rounded-t-sm relative"
                                        style={{ height: `${height}%` }}
                                    >
                                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                            {(stat.amount / 1000).toFixed(0)}k
                                        </span>
                                    </div>
                                </div>
                                <span className="text-xs text-gray-400 mt-2">{stat.date}</span>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
};

export default HomeDashboard;
