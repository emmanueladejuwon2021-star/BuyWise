import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, PriceAlert } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => void;
  signup: (name: string, email: string, password: string) => void;
  logout: () => void;
  addToWatchlist: (productId: string) => void;
  removeFromWatchlist: (productId: string) => void;
  addPriceAlert: (alert: PriceAlert) => void;
  removePriceAlert: (alertId: string) => void;
  isInWatchlist: (productId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, _password: string) => {
    setUser({
      id: '1',
      name: email.split('@')[0],
      email,
      avatar: '',
      watchlist: [],
      priceAlerts: [],
    });
  };

  const signup = (name: string, email: string, _password: string) => {
    setUser({
      id: '1',
      name,
      email,
      avatar: '',
      watchlist: [],
      priceAlerts: [],
    });
  };

  const logout = () => {
    setUser(null);
  };

  const addToWatchlist = (productId: string) => {
    if (user) {
      setUser({ ...user, watchlist: [...user.watchlist, productId] });
    }
  };

  const removeFromWatchlist = (productId: string) => {
    if (user) {
      setUser({ ...user, watchlist: user.watchlist.filter(id => id !== productId) });
    }
  };

  const isInWatchlist = (productId: string) => {
    return user?.watchlist.includes(productId) ?? false;
  };

  const addPriceAlert = (alert: PriceAlert) => {
    if (user) {
      setUser({ ...user, priceAlerts: [...user.priceAlerts, alert] });
    }
  };

  const removePriceAlert = (alertId: string) => {
    if (user) {
      setUser({ ...user, priceAlerts: user.priceAlerts.filter(a => a.id !== alertId) });
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      signup,
      logout,
      addToWatchlist,
      removeFromWatchlist,
      addPriceAlert,
      removePriceAlert,
      isInWatchlist,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
