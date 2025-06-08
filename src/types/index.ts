export interface Product {
  id: string;
  sku_number: number; // <-- ADICIONE ESTA LINHA
  name: string;
  price: number;
  installmentPrice?: number;
  category: string;
  stock: number;
  image?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Sale {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  paymentMethod: 'cash' | 'card' | 'pix';
  cardType?: 'debit' | 'credit';
}

export interface CashFlow {
  id: string;
  date: string;
  description: string;
  type: 'income' | 'expense' | 'sale';
  amount: number;
}

export interface StoreConfig {
  name: string;
  logo?: string;
  theme: 'light' | 'dark';
}