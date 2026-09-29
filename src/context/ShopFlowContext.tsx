import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Product } from '../types';
import { mongoAtlas } from '../services/mongodbAtlas';

const COMPARE_KEY = 'buywise_compare_ids';

interface ShopFlowContextType {
  compareIds: string[];
  addToCompare: (productId: string) => boolean;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  isInCompare: (productId: string) => boolean;
  catalogProducts: Product[];
  refreshCatalog: () => void;
}

const ShopFlowContext = createContext<ShopFlowContextType | undefined>(undefined);

export const ShopFlowProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [compareIds, setCompareIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(COMPARE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [catalogProducts, setCatalogProducts] = useState<Product[]>(() => mongoAtlas.getProductsSync());

  useEffect(() => {
    localStorage.setItem(COMPARE_KEY, JSON.stringify(compareIds));
  }, [compareIds]);

  const refreshCatalog = () => {
    setCatalogProducts(mongoAtlas.getProductsSync());
  };

  const addToCompare = (productId: string) => {
    if (!productId) return false;
    if (compareIds.includes(productId)) return true;
    if (compareIds.length >= 4) return false;
    setCompareIds(prev => [...prev, productId]);
    return true;
  };

  const removeFromCompare = (productId: string) => {
    setCompareIds(prev => prev.filter(id => id !== productId));
  };

  const clearCompare = () => setCompareIds([]);

  const isInCompare = (productId: string) => compareIds.includes(productId);

  return (
    <ShopFlowContext.Provider
      value={{
        compareIds,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
        catalogProducts,
        refreshCatalog,
      }}
    >
      {children}
    </ShopFlowContext.Provider>
  );
};

export const useShopFlow = () => {
  const ctx = useContext(ShopFlowContext);
  if (!ctx) {
    throw new Error('useShopFlow must be used inside ShopFlowProvider');
  }
  return ctx;
};
