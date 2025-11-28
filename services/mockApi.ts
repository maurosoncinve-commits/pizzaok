
import { Customer, Card, Transaction, NewCustomer, CardType, NewTransaction } from '../types';
import { generateUniqueId } from '../utils/helpers';
import { FIDELITY_POINTS_THRESHOLD } from '../constants';

// Use idb-keyval library loaded from CDN for robust client-side storage
declare const idbKeyval: any;

const DB_KEY = 'pizzangooo_db_indexeddb';
const SYNC_URL_KEY = 'pizzangooo_sync_url';
// The user provided Google Apps Script Web App URL - Pre-configured
const DEFAULT_SYNC_URL = 'https://script.google.com/macros/s/AKfycbxRV76ze66aXFLhIyhi3lkEWGISWQvIhu1Gbuzpo_oulxc-iYT0Nuq_p_Hcfuzmlfl6/exec';

interface Database {
    customers: Customer[];
    cards: Card[];
    transactions: Transaction[];
}

// Default state is now empty, with no seed data.
const getInitialState = (): Database => ({
    customers: [],
    cards: [],
    transactions: [],
});

const _getDatabase = async (): Promise<Database> => {
    let db = await idbKeyval.get(DB_KEY);
    if (!db) {
        console.log("No database found, seeding initial data.");
        db = getInitialState();
        await idbKeyval.set(DB_KEY, db);
    }
    
    // Re-hydrate dates after fetching from DB, as they are stored as strings
    db.customers = db.customers.map((c: any) => ({ 
        ...c, 
        registeredAt: new Date(c.registeredAt),
        dob: c.dob ? new Date(c.dob) : undefined 
    }));
    db.cards = db.cards.map((c: any) => ({ ...c, createdAt: new Date(c.createdAt), expiresAt: new Date(c.expiresAt) }));
    db.transactions = db.transactions.map((t: any) => ({ ...t, date: new Date(t.date) }));

    return db;
};

const _saveDatabase = async (db: Database) => {
    await idbKeyval.set(DB_KEY, db);
    
    // Attempt background sync if URL is configured
    const syncUrl = api.getSyncUrl();
    if (syncUrl) {
        // Fire and forget upload (or handle in a sync manager)
        _uploadToCloud(syncUrl, db).catch(console.error);
    }
};

const _uploadToCloud = async (url: string, db: Database) => {
    try {
        await fetch(url, {
            method: 'POST',
            mode: 'no-cors', // Google Apps Script typically needs no-cors for simple POSTs or proper CORS headers
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(db)
        });
        console.log("Uploaded to cloud");
    } catch (e) {
        console.error("Cloud upload failed", e);
        throw e;
    }
}

export const api = {
    getSyncUrl: () => {
        const stored = localStorage.getItem(SYNC_URL_KEY);
        // If no setting is saved (null), use the default hardcoded URL.
        // If user explicitly cleared it (empty string), it remains disabled.
        if (stored === null) {
            return DEFAULT_SYNC_URL;
        }
        return stored;
    },

    setSyncUrl: (url: string) => {
        localStorage.setItem(SYNC_URL_KEY, url);
    },

    syncWithCloud: async (): Promise<boolean> => {
        const url = api.getSyncUrl();
        if (!url) return false;

        try {
            const response = await fetch(url);
            const data = await response.json();
            
            if (data && Array.isArray(data.customers)) {
                 // Valid DB found, overwrite local
                 const db: Database = {
                    customers: data.customers.map((c: any) => ({ 
                        ...c, 
                        registeredAt: new Date(c.registeredAt),
                        dob: c.dob ? new Date(c.dob) : undefined
                    })),
                    cards: data.cards.map((c: any) => ({ ...c, createdAt: new Date(c.createdAt), expiresAt: new Date(c.expiresAt) })),
                    transactions: data.transactions.map((t: any) => ({ ...t, date: new Date(t.date) }))
                };
                await idbKeyval.set(DB_KEY, db);
                return true;
            }
        } catch (e) {
            console.error("Sync fetch failed", e);
            throw e;
        }
        return false;
    },

    getCustomers: async (): Promise<Customer[]> => {
        const db = await _getDatabase();
        return [...db.customers];
    },
    getCards: async (): Promise<Card[]> => {
        const db = await _getDatabase();
        return [...db.cards];
    },
    getTransactions: async (): Promise<Transaction[]> => {
        const db = await _getDatabase();
        return [...db.transactions];
    },

    getCustomerById: async (id: string): Promise<Customer | undefined> => {
        const db = await _getDatabase();
        return db.customers.find(c => c.id === id);
    },

    getCardsByCustomerId: async (customerId: string): Promise<Card[]> => {
        const db = await _getDatabase();
        return db.cards.filter(c => c.customerId === customerId);
    },

    getCardById: async (cardId: string): Promise<Card | undefined> => {
        const db = await _getDatabase();
        return db.cards.find(c => c.id === cardId);
    },

    addCustomer: async (newCustomer: NewCustomer, cardType: CardType): Promise<{ customer: Customer, card: Card }> => {
        const db = await _getDatabase();
        const customer: Customer = {
            ...newCustomer,
            id: generateUniqueId('CUST'),
            registeredAt: new Date(),
        };
        db.customers.unshift(customer);

        const expiresAt = new Date(new Date().setFullYear(new Date().getFullYear() + 1));
        const card: Card = {
            id: generateUniqueId(cardType.toUpperCase().substring(0,3) + '-'),
            customerId: customer.id,
            type: cardType,
            points: 0,
            createdAt: new Date(),
            expiresAt,
        };
        db.cards.unshift(card);
        await _saveDatabase(db);

        return { customer, card };
    },

    updateCustomerFee: async (customerId: string, isPaid: boolean): Promise<Customer> => {
        const db = await _getDatabase();
        const customerIndex = db.customers.findIndex(c => c.id === customerId);
        if (customerIndex === -1) throw new Error('Customer not found');

        db.customers[customerIndex].entryFeePaid = isPaid;
        await _saveDatabase(db);
        return db.customers[customerIndex];
    },

    deleteCustomer: async (customerId: string): Promise<string> => {
        const db = await _getDatabase();
        const customerIndex = db.customers.findIndex(c => c.id === customerId);
        if (customerIndex === -1) throw new Error('Customer not found');

        // Delete Customer
        db.customers.splice(customerIndex, 1);

        // Delete associated cards
        const customerCards = db.cards.filter(c => c.customerId === customerId);
        const cardIdsToDelete = customerCards.map(c => c.id);
        db.cards = db.cards.filter(c => c.customerId !== customerId);

        // Delete associated transactions
        db.transactions = db.transactions.filter(t => !cardIdsToDelete.includes(t.cardId));

        await _saveDatabase(db);
        return customerId;
    },
    
    deleteCard: async (cardId: string): Promise<{ deletedCardId: string, deletedTransactionIds: string[] }> => {
        const db = await _getDatabase();
        const cardIndex = db.cards.findIndex(c => c.id === cardId);
        if (cardIndex === -1) throw new Error('Card not found');
    
        db.cards.splice(cardIndex, 1);
    
        const deletedTransactionIds: string[] = [];
        db.transactions = db.transactions.filter(t => {
            if (t.cardId === cardId) {
                deletedTransactionIds.push(t.id);
                return false;
            }
            return true;
        });
    
        await _saveDatabase(db);
        return { deletedCardId: cardId, deletedTransactionIds };
    },

    addTransaction: async (newTransaction: NewTransaction): Promise<{ transaction: Transaction, updatedCard?: Card }> => {
        const db = await _getDatabase();
        const card = db.cards.find(c => c.id === newTransaction.cardId);
        if (!card) throw new Error('Card not found');
        
        let pointsEarned = 0;
        let updatedCard: Card | undefined = undefined;
    
        if (card.type === CardType.FIDELITY && newTransaction.amount >= FIDELITY_POINTS_THRESHOLD) {
            pointsEarned = 1;
            card.points += 1;
            updatedCard = { ...card };
        }
    
        const transaction: Transaction = {
            ...newTransaction,
            id: generateUniqueId('TXN'),
            date: new Date(),
            pointsEarned,
        };
        db.transactions.unshift(transaction);
        await _saveDatabase(db);
        return { transaction, updatedCard };
    },

    updateTransaction: async (transactionId: string, newAmount: number): Promise<{ transaction: Transaction, updatedCard?: Card }> => {
        const db = await _getDatabase();
        const transactionIndex = db.transactions.findIndex(t => t.id === transactionId);
        if (transactionIndex === -1) throw new Error('Transaction not found');
    
        const originalTransaction = { ...db.transactions[transactionIndex] };
        const card = db.cards.find(c => c.id === originalTransaction.cardId);
        let updatedCard: Card | undefined = undefined;
    
        if (card && card.type === CardType.FIDELITY) {
            card.points -= originalTransaction.pointsEarned;
            const newPointsEarned = newAmount >= FIDELITY_POINTS_THRESHOLD ? 1 : 0;
            card.points += newPointsEarned;
            if (card.points < 0) card.points = 0;
            
            db.transactions[transactionIndex].pointsEarned = newPointsEarned;
            updatedCard = { ...card };
        }
        
        db.transactions[transactionIndex].amount = newAmount;
        db.transactions[transactionIndex].date = new Date(); 
    
        await _saveDatabase(db);
        const transaction = { ...db.transactions[transactionIndex] };
        return { transaction, updatedCard };
    },
    
    deleteTransaction: async (transactionId: string): Promise<{ deletedTransactionId: string, updatedCard?: Card }> => {
        const db = await _getDatabase();
        const transactionIndex = db.transactions.findIndex(t => t.id === transactionId);
        if (transactionIndex === -1) throw new Error('Transaction not found');
    
        const transactionToDelete = db.transactions[transactionIndex];
        const card = db.cards.find(c => c.id === transactionToDelete.cardId);
        let updatedCard: Card | undefined = undefined;
    
        if (card && card.type === CardType.FIDELITY) {
            card.points -= transactionToDelete.pointsEarned;
            if (card.points < 0) card.points = 0;
            updatedCard = { ...card };
        }
    
        db.transactions.splice(transactionIndex, 1);
        await _saveDatabase(db);
        return { deletedTransactionId: transactionId, updatedCard };
    },

    exportData: async (format: 'json' | 'csv'): Promise<string> => {
        const { customers, cards, transactions } = await _getDatabase();
        const dataToExport = { customers, cards, transactions };

        if (format === 'json') {
            return JSON.stringify(dataToExport, null, 2);
        }

        if (format === 'csv') {
            const customerHeader = 'customerId,name,instagram,phone,registeredAt,registeredBy,dob,entryFeePaid\n';
            const customerRows = customers.map(c => `${c.id},${c.name},${c.instagram},"${c.phone.countryCode} ${c.phone.number}",${c.registeredAt.toISOString()},${c.registeredBy || ''},${c.dob ? c.dob.toISOString() : ''},${c.entryFeePaid}`).join('\n');

            const cardHeader = '\n\ncardId,customerId,type,points,createdAt\n';
            const cardRows = cards.map(c => `${c.id},${c.customerId},${c.type},${c.points},${c.createdAt.toISOString()}`).join('\n');
            
            const transactionHeader = '\n\ntransactionId,cardId,amount,date,pointsEarned\n';
            const transactionRows = transactions.map(t => `${t.id},${t.cardId},${t.amount},${t.date.toISOString()},${t.pointsEarned}`).join('\n');
            
            return (customerHeader + customerRows + cardHeader + cardRows + transactionHeader + transactionRows);
        }

        throw new Error('Invalid format');
    },

    importData: async (jsonString: string): Promise<void> => {
        try {
            const data = JSON.parse(jsonString);
            
            // Basic validation
            if (!Array.isArray(data.customers) || !Array.isArray(data.cards) || !Array.isArray(data.transactions)) {
                throw new Error('Invalid data format');
            }
            
            // Re-hydrate dates needed before saving to properly store them as Date objects 
            const db: Database = {
                customers: data.customers.map((c: any) => ({ 
                    ...c, 
                    registeredAt: new Date(c.registeredAt),
                    dob: c.dob ? new Date(c.dob) : undefined
                })),
                cards: data.cards.map((c: any) => ({ ...c, createdAt: new Date(c.createdAt), expiresAt: new Date(c.expiresAt) })),
                transactions: data.transactions.map((t: any) => ({ ...t, date: new Date(t.date) }))
            };

            await _saveDatabase(db);
        } catch (e) {
            console.error("Import error:", e);
            throw new Error('Import failed');
        }
    }
};
