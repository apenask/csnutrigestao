// src/types/auth.ts - CRIAR ESTE ARQUIVO NOVO

export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export type Theme = 'light' | 'dark';

// Interfaces adicionais para melhorias
export interface AuthUser extends User {
  emailConfirmed?: boolean;
  lastSignIn?: string;
}

export interface AuthError {
  message: string;
  code?: string;
}