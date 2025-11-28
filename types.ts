export enum CardType {
  VIP = 'VIP',
  FIDELITY = 'Fidelity',
}

export interface Customer {
  id: string;
  name: string;
  instagram: string;
  phone: {
    countryCode: string;
    number: string;
  };
  registeredBy?: string; // New field for staff name
  registeredAt: Date;
}

export interface Card {
  id: string;
  customerId: string;
  type: CardType;
  points: number; // Only for Fidelity cards
  createdAt: Date;
  expiresAt: Date;
}

export interface Transaction {
  id: string;
  cardId: string;
  amount: number;
  date: Date;
  pointsEarned: number;
}

export type NewCustomer = Omit<Customer, 'id' | 'registeredAt'>;
export type NewCard = Omit<Card, 'id' | 'createdAt' | 'expiresAt'>;
export type NewTransaction = Omit<Transaction, 'id' | 'date' | 'pointsEarned'>;