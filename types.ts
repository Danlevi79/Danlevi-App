
export interface Piece {
  id: string;
  name: string;
  category: string;
  photos: string[];
  yarnCost: number;
  accessoriesCost: number;
  otherCosts: number;
  timeHours: number;
  timeMinutes: number;
  stock: number;
  salePrice: number;
  createdAt: string;
}

export interface Sale {
  id:string;
  pieceId: string;
  pieceName: string;
  piecePhoto: string;
  quantity: number;
  salePrice: number; // Total sale price for this transaction
  baseCost: number; // Base cost PER UNIT at the time of sale
  profit: number; // Total profit for this transaction
  date: string; // ISO string
}

export interface OrderItem {
  pieceId: string;
  pieceName: string;
  piecePhoto: string;
  quantity: number;
  salePricePerUnit: number;
}

export interface Order {
  id: string;
  clientName: string;
  items: OrderItem[];
  createdAt: string;
  status: 'pending' | 'sent';
}

export interface Settings {
  atelierName: string;
  hourlyRate: number;
  profitMargin: number; // in percent, e.g., 100
}

export type Screen = 'pieces' | 'sales' | 'orders' | 'results' | 'settings';
