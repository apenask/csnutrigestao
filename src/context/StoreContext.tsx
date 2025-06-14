// src/context/StoreContext.tsx - VERSÃO FINAL SEM WARNINGS

/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Product, Sale, CashFlow, StoreConfig, CartItem } from '../types';
import { supabase } from '../services/supabaseClient';

// --- INTERFACES E TIPOS ---
interface StoreState {
  products: Product[];
  sales: Sale[];
  cashFlow: CashFlow[];
  cart: CartItem[];
  config: StoreConfig;
  loading: boolean;
}

type StoreAction =
  | { type: 'SET_DATA'; payload: Partial<Omit<StoreState, 'cart' | 'loading'>> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'UPDATE_PRODUCT'; payload: Product }
  | { type: 'DELETE_PRODUCT'; payload: string }
  | { type: 'ADD_SALE'; payload: Sale }
  | { type: 'DELETE_SALE'; payload: string }
  | { type: 'ADD_CASH_FLOW'; payload: CashFlow }
  | { type: 'DELETE_CASH_FLOW'; payload: string }
  | { type: 'UPDATE_CONFIG'; payload: Partial<StoreConfig> }
  | { type: 'ADD_TO_CART'; payload: Product }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_CART_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' };

interface StoreContextType {
  state: StoreState;
  dispatch: React.Dispatch<StoreAction>;
  addProduct: (productData: Omit<Product, 'id' | 'sku_number'>, imageFile?: File | null) => Promise<void>;
  updateProduct: (productData: Product, imageFile?: File | null) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  addSale: (saleData: Omit<Sale, 'id' | 'date'>) => Promise<void>;
  deleteSale: (saleId: string) => Promise<void>;
  addCashFlow: (cashFlowData: Omit<CashFlow, 'id' | 'date'>) => Promise<void>;
  deleteCashFlow: (cashFlowId: string) => Promise<void>;
  updateConfig: (config: Partial<StoreConfig>) => void;
}

const initialState: StoreState = {
  products: [],
  sales: [],
  cashFlow: [],
  cart: [],
  config: { name: 'CS Nutri', theme: 'light', logo: '' },
  loading: true,
};

const StoreContext = createContext<StoreContextType | null>(null);

function storeReducer(state: StoreState, action: StoreAction): StoreState {
  switch (action.type) {
    case 'SET_DATA':
      return { ...state, ...action.payload, loading: false };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'ADD_PRODUCT':
      return { ...state, products: [action.payload, ...state.products] };
    case 'UPDATE_PRODUCT':
      return { ...state, products: state.products.map(p => p.id === action.payload.id ? action.payload : p) };
    case 'DELETE_PRODUCT':
      return { ...state, products: state.products.filter(p => p.id !== action.payload) };
    case 'ADD_SALE': {
      const saleFlow: CashFlow = {
        id: `flow-${action.payload.id}`,
        date: action.payload.date,
        description: `Venda #${action.payload.id.slice(-6)}`,
        type: 'sale',
        amount: action.payload.total,
      };
      return { ...state, sales: [action.payload, ...state.sales], cashFlow: [saleFlow, ...state.cashFlow] };
    }
    case 'DELETE_SALE': {
      const saleIdToDelete = action.payload;
      const cashFlowIdToDelete = `flow-${saleIdToDelete}`;
      return { 
        ...state, 
        sales: state.sales.filter(s => s.id !== saleIdToDelete), 
        cashFlow: state.cashFlow.filter(f => f.id !== cashFlowIdToDelete) 
      };
    }
    case 'ADD_CASH_FLOW':
      return { ...state, cashFlow: [action.payload, ...state.cashFlow] };
    case 'DELETE_CASH_FLOW':
      return { ...state, cashFlow: state.cashFlow.filter(f => f.id !== action.payload) };
    case 'UPDATE_CONFIG':
      return { ...state, config: { ...state.config, ...action.payload } };
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
      return { ...state, cart: [...state.cart, { product: action.payload, quantity: 1 }] };
    }
    case 'REMOVE_FROM_CART':
      return { ...state, cart: state.cart.filter(item => item.product.id !== action.payload) };
    case 'UPDATE_CART_QUANTITY': {
      return {
        ...state,
        cart: state.cart.map(item =>
          item.product.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ).filter(item => item.quantity > 0)
      };
    }
    case 'CLEAR_CART':
      return { ...state, cart: [] };
    default:
      return state;
  }
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(storeReducer, initialState);

  useEffect(() => {
    const loadInitialData = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const [productsRes, salesRes, cashFlowRes] = await Promise.all([
          supabase.from('products').select('*').order('created_at', { ascending: false }),
          supabase.from('sales').select('*, sale_items(*)').order('date', { ascending: false }),
          supabase.from('cash_flow').select('*').order('date', { ascending: false }),
        ]);

        if (productsRes.error) throw productsRes.error;
        if (salesRes.error) throw salesRes.error;
        if (cashFlowRes.error) throw cashFlowRes.error;
        
        const savedConfig = localStorage.getItem('csNutriConfig');
        const config = savedConfig ? JSON.parse(savedConfig) : initialState.config;

        dispatch({
          type: 'SET_DATA',
          payload: {
            products: productsRes.data || [],
            sales: salesRes.data || [],
            cashFlow: cashFlowRes.data || [],
            config
          }
        });
      } catch (error) {
        console.error("Erro ao buscar dados do Supabase:", error);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    localStorage.setItem('csNutriConfig', JSON.stringify(state.config));
    document.documentElement.className = state.config.theme;
  }, [state.config]);
  
  const addProduct = async (productData: Omit<Product, 'id' | 'sku_number'>, imageFile?: File | null) => {
    let finalImageUrl = productData.image || '';
    if (imageFile) {
      const fileName = `${Date.now()}_${imageFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage.from('product-images').upload(fileName, imageFile);
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(uploadData.path);
      finalImageUrl = urlData.publicUrl;
    }
    
    const { installmentPrice, ...rest } = productData;
    const productToInsert = { ...rest, installment_price: installmentPrice, image_url: finalImageUrl };
    delete (productToInsert as any).image;

    const { data: newProduct, error } = await supabase.from('products').insert(productToInsert).select().single();
    if (error) throw error;
    dispatch({ type: 'ADD_PRODUCT', payload: newProduct });
  };

  const updateProduct = async (productData: Product, imageFile?: File | null) => {
    let finalImageUrl = productData.image || '';
    if (imageFile) {
        const fileName = `${Date.now()}_${imageFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage.from('product-images').upload(fileName, imageFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(uploadData.path);
        finalImageUrl = urlData.publicUrl;
    }

    const { id, installmentPrice, ...restOfData } = productData;
    const productToUpdate = { ...restOfData, installment_price: installmentPrice, image_url: finalImageUrl };
    delete (productToUpdate as any).image;
    
    const { data: updatedProduct, error } = await supabase.from('products').update(productToUpdate).eq('id', id).select().single();
    if (error) throw error;
    dispatch({ type: 'UPDATE_PRODUCT', payload: updatedProduct });
  };
  
  const deleteProduct = async (productId: string) => {
    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (error) throw error;
    dispatch({ type: 'DELETE_PRODUCT', payload: productId });
  };
  
  const addSale = async (saleData: Omit<Sale, 'id'| 'date'>) => {
    const { items, ...saleDetails } = saleData;
    const saleToInsert = { ...saleDetails, date: new Date().toISOString(), id: Date.now().toString() };

    const { data: newSale, error } = await supabase.from('sales').insert(saleToInsert).select().single();
    if (error) throw error;

    const saleItemsToInsert = items.map(item => ({
      sale_id: newSale.id,
      product_id: item.product.id,
      quantity: item.quantity,
      price_at_time_of_sale: item.product.price,
    }));

    const { error: itemsError } = await supabase.from('sale_items').insert(saleItemsToInsert);
    if (itemsError) throw itemsError;

    dispatch({ type: 'ADD_SALE', payload: newSale });
  };
  
  const deleteSale = async (saleId: string) => {
    const { error } = await supabase.from('sales').delete().eq('id', saleId);
    if (error) throw error;
    dispatch({ type: 'DELETE_SALE', payload: saleId });
  };

  const addCashFlow = async (cashFlowData: Omit<CashFlow, 'id' | 'date'>) => {
    const entryToInsert = { ...cashFlowData, id: Date.now().toString(), date: new Date().toISOString() };
    const { data: newEntry, error } = await supabase.from('cash_flow').insert(entryToInsert).select().single();
    if (error) throw error;
    dispatch({ type: 'ADD_CASH_FLOW', payload: newEntry });
  };

  const deleteCashFlow = async (cashFlowId: string) => {
    const { error } = await supabase.from('cash_flow').delete().eq('id', cashFlowId);
    if (error) throw error;
    dispatch({ type: 'DELETE_CASH_FLOW', payload: cashFlowId });
  };

  const updateConfig = (config: Partial<StoreConfig>) => {
    dispatch({ type: 'UPDATE_CONFIG', payload: config });
  };

  const contextValue: StoreContextType = {
    state, dispatch, addProduct, updateProduct, deleteProduct,
    addSale, deleteSale, addCashFlow, deleteCashFlow, updateConfig
  };

  return (
    <StoreContext.Provider value={contextValue}>
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