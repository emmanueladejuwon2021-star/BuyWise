import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, PriceAlert, ClickLog, UserPreferences, NotificationSettings } from '../types';

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
  addClickLog: (log: Omit<ClickLog, 'id' | 'timestamp'>) => void;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
}

const defaultPreferences: UserPreferences = {
  defaultCity: 'Lagos',
  defaultState: 'Lagos',
  currency: 'NGN',
  maxDeliveryDays: 7,
  preferredStores: [],
};

const defaultNotifications: NotificationSettings = {
  emailEnabled: true,
  emailFrequency: 'instant',
  smsEnabled: false,
  pushEnabled: true,
  priceDropAlerts: true,
  dealAlerts: true,
  backInStockAlerts: true,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const createUser = (name: string, email: string): User => ({
    id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2),
    name,
    email,
    avatar: '',
    watchlist: [],
    priceAlerts: [],
    clickHistory: [],
    preferences: defaultPreferences,
    notificationSettings: defaultNotifications,
    createdAt: new Date().toISOString(),
  });

  const login = (email: string, _password: string) => {
    setUser(createUser(email.split('@')[0], email));
  };

  const signup = (name: string, email: string, _password: string) => {
    setUser(createUser(name, email));
  };

  const logout = () => setUser(null);

  const addToWatchlist = (productId: string) => {
    if (user) setUser({ ...user, watchlist: [...user.watchlist, productId] });
  };

  const removeFromWatchlist = (productId: string) => {
    if (user) setUser({ ...user, watchlist: user.watchlist.filter(id => id !== productId) });
  };

  const isInWatchlist = (productId: string) => user?.watchlist.includes(productId) ?? false;

  const addPriceAlert = (alert: PriceAlert) => {
    if (user) setUser({ ...user, priceAlerts: [...user.priceAlerts, alert] });
  };

  const removePriceAlert = (alertId: string) => {
    if (user) setUser({ ...user, priceAlerts: user.priceAlerts.filter(a => a.id !== alertId) });
  };

  const addClickLog = (log: Omit<ClickLog, 'id' | 'timestamp'>) => {
    if (user) {
      const newLog: ClickLog = {
        ...log,
        id: Math.random().toString(36).slice(2),
        timestamp: new Date().toISOString(),
      };
      setUser({ ...user, clickHistory: [newLog, ...user.clickHistory].slice(0, 100) });
    }
  };

  const updatePreferences = (prefs: Partial<UserPreferences>) => {
    if (user) setUser({ ...user, preferences: { ...user.preferences, ...prefs } });
  };

  const updateNotificationSettings = (settings: Partial<NotificationSettings>) => {
    if (user) setUser({ ...user, notificationSettings: { ...user.notificationSettings, ...settings } });
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
      addClickLog,
      updatePreferences,
      updateNotificationSettings,
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
