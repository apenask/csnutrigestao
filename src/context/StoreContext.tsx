import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Product, Sale, CashFlow, StoreConfig, CartItem } from '../types';
import { mockProducts } from '../data/mockData';

interface StoreState {
  products: Product[];
  sales: Sale[];
  cashFlow: CashFlow[];
  cart: CartItem[];
  config: StoreConfig;
}

type StoreAction =
  | { type: 'ADD_TO_CART'; payload: Product }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_CART_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'ADD_SALE'; payload: Sale }
  | { type: 'ADD_CASH_FLOW'; payload: CashFlow }
  | { type: 'DELETE_CASH_FLOW'; payload: string }
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'UPDATE_PRODUCT'; payload: Product }
  | { type: 'DELETE_PRODUCT'; payload: string }
  | { type: 'UPDATE_CONFIG'; payload: Partial<StoreConfig> }
  | { type: 'LOAD_DATA'; payload: StoreState };

const initialState: StoreState = {
  products: mockProducts,
  sales: [],
  cashFlow: [],
  cart: [],
  config: {
    name: 'CS Nutri',
    theme: 'light'
  }
};

const StoreContext = createContext<{
  state: StoreState;
  dispatch: React.Dispatch<StoreAction>;
} | null>(null);

function storeReducer(state: StoreState, action: StoreAction): StoreState {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const existingItem = state.cart.find(item => item.product.id === action.payload.id);
      if (existingItem) {
        return {
          ...state,
          cart: state.cart.map(item =>
            item.product.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        };
      }
      return {
        ...state,
        cart: [...state.cart, { product: action.payload, quantity: 1 }]
      };
    }
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        cart: state.cart.filter(item => item.product.id !== action.payload)
      };
    case 'UPDATE_CART_QUANTITY':
      return {
        ...state,
        cart: state.cart.map(item =>
          item.product.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      };
    case 'CLEAR_CART':
      return {
        ...state,
        cart: []
      };
    case 'ADD_SALE': {
      const saleFlow: CashFlow = {
        id: `flow-${action.payload.id}`,
        date: action.payload.date,
        description: `Venda #${action.payload.id}`,
        type: 'sale',
        amount: action.payload.total
      };
      return {
        ...state,
        sales: [action.payload, ...state.sales],
        cashFlow: [saleFlow, ...state.cashFlow]
      };
    }
    case 'ADD_CASH_FLOW':
      return {
        ...state,
        cashFlow: [action.payload, ...state.cashFlow]
      };
    case 'DELETE_CASH_FLOW':
      return {
        ...state,
        cashFlow: state.cashFlow.filter(flow => flow.id !== action.payload)
      };
    case 'ADD_PRODUCT':
      return {
        ...state,
        products: [...state.products, action.payload]
      };
    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map(product =>
          product.id === action.payload.id ? action.payload : product
        )
      };
    case 'DELETE_PRODUCT':
      return {
        ...state,
        products: state.products.filter(product => product.id !== action.payload)
      };
    case 'UPDATE_CONFIG':
      return {
        ...state,
        config: { ...state.config, ...action.payload }
      };
    case 'LOAD_DATA':
      return action.payload;
    default:
      return state;
  }
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(storeReducer, initialState);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('csNutriData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        dispatch({ type: 'LOAD_DATA', payload: { ...initialState, ...parsedData } });
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    const dataToSave = {
      products: state.products,
      sales: state.sales,
      cashFlow: state.cashFlow,
      config: state.config
    };
    localStorage.setItem('csNutriData', JSON.stringify(dataToSave));
  }, [state.products, state.sales, state.cashFlow, state.config]);

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.config.theme);
  }, [state.config.theme]);

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}