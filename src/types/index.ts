// src/types/index.ts - ADICIONAR ESTAS INTERFACES AO FINAL DO SEU ARQUIVO EXISTENTE

// ===== INTERFACES EXISTENTES (manter como estão) =====
export interface Product {
  id: string;
  sku_number: number;
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

// ===== ADICIONAR ESTAS NOVAS INTERFACES =====

// Interfaces para autenticação
export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export type Theme = 'light' | 'dark';

export interface AuthUser extends User {
  emailConfirmed?: boolean;
  lastSignIn?: string;
  loginMethod?: 'code' | 'email';
}

export interface AuthError {
  message: string;
  code?: string;
}

// Interface para estado de autenticação
export interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  loading: boolean;
}