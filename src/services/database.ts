// src/services/database.ts - COM ESLINT DESABILITADO PARA EVITAR WARNINGS

/* eslint-disable @typescript-eslint/no-explicit-any */

import { supabase } from './supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import { Product, Sale, CashFlow, CartItem } from '../types';

// Função para converter snake_case para camelCase
export const toCamelCase = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => toCamelCase(item));
  }
  
  const converted: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    converted[camelKey] = toCamelCase(value);
  }
  return converted;
};

// Função para converter camelCase para snake_case
export const toSnakeCase = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => toSnakeCase(item));
  }
  
  const converted: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    converted[snakeKey] = toSnakeCase(value);
  }
  return converted;
};

// Operações melhoradas para Produtos
export const enhancedProductOperations = {
  // Função para gerar UUID único
  generateUniqueId(): string {
    return uuidv4();
  },

  // Upload de imagem com auto-exclusão da anterior
  async uploadImage(file: File, productId: string, oldImageUrl?: string): Promise<string> {
    try {
      // Deletar imagem antiga se existir
      if (oldImageUrl) {
        await this.deleteImage(oldImageUrl);
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${productId}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      throw new Error('Falha ao fazer upload da imagem');
    }
  },

  // Deletar imagem do storage
  async deleteImage(imageUrl: string): Promise<void> {
    try {
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `products/${fileName}`;

      const { error } = await supabase.storage
        .from('product-images')
        .remove([filePath]);

      if (error) console.warn('Aviso ao deletar imagem:', error);
    } catch (error) {
      console.warn('Aviso ao deletar imagem:', error);
      // Não lançar erro para não interromper outras operações
    }
  },

  // Criar produto com UUID
  async createWithUUID(productData: Omit<Product, 'id' | 'sku_number'>, imageFile?: File): Promise<Product> {
    try {
      const productId = this.generateUniqueId();
      
      let imageUrl = '';
      if (imageFile) {
        imageUrl = await this.uploadImage(imageFile, productId);
      }

      const productToInsert = {
        id: productId,
        sku_number: Date.now(), // Gerar número único
        name: productData.name,
        price: productData.price,
        installment_price: productData.installmentPrice,
        category: productData.category,
        stock: productData.stock,
        image_url: imageUrl,
      };

      const { data: newProduct, error } = await supabase
        .from('products')
        .insert(productToInsert)
        .select()
        .single();

      if (error) throw error;
      
      // Converter para formato do frontend
      return {
        id: newProduct.id,
        sku_number: newProduct.sku_number,
        name: newProduct.name,
        price: newProduct.price,
        installmentPrice: newProduct.installment_price,
        category: newProduct.category,
        stock: newProduct.stock,
        image: newProduct.image_url,
      };
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      throw new Error('Falha ao criar produto');
    }
  },

  // Atualizar produto com gerenciamento de imagem
  async updateWithImage(productData: Product, imageFile?: File): Promise<Product> {
    try {
      let finalImageUrl = productData.image || '';
      
      if (imageFile) {
        // Buscar URL da imagem atual para deletar
        const { data: currentProduct } = await supabase
          .from('products')
          .select('image_url')
          .eq('id', productData.id)
          .single();

        finalImageUrl = await this.uploadImage(
          imageFile, 
          productData.id, 
          currentProduct?.image_url
        );
      }

      const productToUpdate = {
        name: productData.name,
        price: productData.price,
        installment_price: productData.installmentPrice,
        category: productData.category,
        stock: productData.stock,
        image_url: finalImageUrl
      };

      const { data: updatedProduct, error } = await supabase
        .from('products')
        .update(productToUpdate)
        .eq('id', productData.id)
        .select()
        .single();

      if (error) throw error;
      
      // Converter para formato do frontend
      return {
        id: updatedProduct.id,
        sku_number: updatedProduct.sku_number,
        name: updatedProduct.name,
        price: updatedProduct.price,
        installmentPrice: updatedProduct.installment_price,
        category: updatedProduct.category,
        stock: updatedProduct.stock,
        image: updatedProduct.image_url,
      };
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      throw new Error('Falha ao atualizar produto');
    }
  },

  // Deletar produto com limpeza de imagem
  async deleteWithCleanup(productId: string): Promise<void> {
    try {
      // Buscar dados do produto para deletar imagem
      const { data: product } = await supabase
        .from('products')
        .select('image_url')
        .eq('id', productId)
        .single();

      // Deletar produto
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      // Deletar imagem se existir
      if (product?.image_url) {
        await this.deleteImage(product.image_url);
      }
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
      throw new Error('Falha ao deletar produto');
    }
  },

  // Atualizar estoque
  async updateStock(productId: string, quantityChange: number): Promise<void> {
    try {
      const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('stock')
        .eq('id', productId)
        .single();

      if (fetchError) throw fetchError;

      const newStock = (product.stock || 0) + quantityChange;
      if (newStock < 0) {
        throw new Error('Estoque insuficiente');
      }

      const { error: updateError } = await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', productId);

      if (updateError) throw updateError;
    } catch (error) {
      console.error('Erro ao atualizar estoque:', error);
      throw error;
    }
  }
};

// Operações melhoradas para Vendas
export const enhancedSaleOperations = {
  // Criar venda com UUID e controle de estoque
  async createWithStockControl(saleData: Omit<Sale, 'id' | 'date'>): Promise<Sale> {
    try {
      const saleId = uuidv4();
      
      // Verificar estoque antes de finalizar
      for (const item of saleData.items) {
        const { data: product, error } = await supabase
          .from('products')
          .select('stock')
          .eq('id', item.product.id)
          .single();

        if (error) throw error;
        
        if ((product.stock || 0) < item.quantity) {
          throw new Error(`Estoque insuficiente para ${item.product.name}`);
        }
      }

      // Criar venda
      const saleToInsert = {
        id: saleId,
        date: new Date().toISOString(),
        total: saleData.total,
        payment_method: saleData.paymentMethod,
        card_type: saleData.cardType,
      };

      const { data: newSale, error: saleError } = await supabase
        .from('sales')
        .insert(saleToInsert)
        .select()
        .single();

      if (saleError) throw saleError;

      // Atualizar estoque dos produtos vendidos
      for (const item of saleData.items) {
        await enhancedProductOperations.updateStock(item.product.id, -item.quantity);
      }

      // Inserir itens da venda
      const saleItemsToInsert = saleData.items.map((item: CartItem) => ({
        sale_id: saleId,
        product_id: item.product.id,
        quantity: item.quantity,
        price_at_time_of_sale: item.product.price,
      }));

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItemsToInsert);

      if (itemsError) throw itemsError;

      // Retornar venda no formato do frontend
      return {
        id: newSale.id,
        date: newSale.date,
        items: saleData.items,
        total: newSale.total,
        paymentMethod: newSale.payment_method,
        cardType: newSale.card_type,
      };
    } catch (error) {
      console.error('Erro ao criar venda:', error);
      throw error;
    }
  },

  // Deletar venda com reversão de estoque
  async deleteWithStockReversion(saleId: string): Promise<void> {
    try {
      // Buscar itens da venda para reverter estoque
      const { data: saleItems, error: itemsError } = await supabase
        .from('sale_items')
        .select('product_id, quantity')
        .eq('sale_id', saleId);

      if (itemsError) throw itemsError;

      // Deletar itens da venda primeiro
      const { error: deleteItemsError } = await supabase
        .from('sale_items')
        .delete()
        .eq('sale_id', saleId);

      if (deleteItemsError) throw deleteItemsError;

      // Deletar venda
      const { error: deleteSaleError } = await supabase
        .from('sales')
        .delete()
        .eq('id', saleId);

      if (deleteSaleError) throw deleteSaleError;

      // Reverter estoque
      for (const item of saleItems || []) {
        await enhancedProductOperations.updateStock(item.product_id, item.quantity);
      }
    } catch (error) {
      console.error('Erro ao deletar venda:', error);
      throw new Error('Falha ao deletar venda');
    }
  }
};

// Operações melhoradas para Fluxo de Caixa
export const enhancedCashFlowOperations = {
  // Criar entrada com UUID
  async createWithUUID(cashFlowData: Omit<CashFlow, 'id' | 'date'>): Promise<CashFlow> {
    try {
      const entryToInsert = {
        id: uuidv4(),
        date: new Date().toISOString(),
        description: cashFlowData.description,
        type: cashFlowData.type,
        amount: cashFlowData.amount,
      };

      const { data: newEntry, error } = await supabase
        .from('cash_flow')
        .insert(entryToInsert)
        .select()
        .single();

      if (error) throw error;
      
      return {
        id: newEntry.id,
        date: newEntry.date,
        description: newEntry.description,
        type: newEntry.type,
        amount: newEntry.amount,
      };
    } catch (error) {
      console.error('Erro ao criar entrada de fluxo de caixa:', error);
      throw new Error('Falha ao criar entrada de fluxo de caixa');
    }
  },

  // Deletar entrada
  async deleteEntry(cashFlowId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('cash_flow')
        .delete()
        .eq('id', cashFlowId);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao deletar entrada de fluxo de caixa:', error);
      throw new Error('Falha ao deletar entrada de fluxo de caixa');
    }
  }
};

// Exportar todas as operações melhoradas
export const enhancedOperations = {
  products: enhancedProductOperations,
  sales: enhancedSaleOperations,
  cashFlow: enhancedCashFlowOperations,
};