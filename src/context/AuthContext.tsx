import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, PriceAlert, ClickLog, UserPreferences, NotificationSettings, UserRole } from '../types';
import { recordPlatformRevenue, registerMerchantKYC } from '../services/adminPlatform';
import { mongoAtlas } from '../services/mongodbAtlas';

export const ADMIN_EMAILS = [
  'emmanueladejuwon2021@gmail.com',
  'emmanueladejuwon2022@gmail.com',
  'emmanueladejuwon@gmail.com',
];

export const isPlatformOwnerEmail = (email: string): boolean => {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return ADMIN_EMAILS.includes(clean);
};

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  role: UserRole;
  isAdminAuthenticated: boolean;
  isOwner: boolean;
  login: (email: string, password?: string, role?: UserRole, storeName?: string) => void;
  signup: (name: string, email: string, password?: string, role?: UserRole, storeName?: string) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  registerSellerStore: (storeData: { businessName: string; logoUrl?: string; description?: string }) => void;
  adminLogin: (passkey: string) => boolean;
  adminLogout: () => void;
  addToWatchlist: (productId: string) => void;
  removeFromWatchlist: (productId: string) => void;
  addPriceAlert: (alert: PriceAlert) => void;
  removePriceAlert: (alertId: string) => void;
  isInWatchlist: (productId: string) => boolean;
  addClickLog: (log: Omit<ClickLog, 'id' | 'timestamp'>) => void;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
  upgradeMembership: (tier: 'vip' | 'pro', durationMonths?: number) => void;
  toggleAdFreeMode: () => void;
  claimReferralReward: (amount: number) => void;
  requestPayout: (bank: string, accountNumber: string, amount: number) => Promise<boolean>;
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
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('pricewise_user');
    if (saved) {
      try {
        const parsed: User = JSON.parse(saved);
        return parsed;
      } catch {
        return null;
      }
    }
    return null;
  });

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('pricewise_admin_auth') === 'true';
  });

  const saveUser = (newUser: User | null) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem('pricewise_user', JSON.stringify(newUser));
    } else {
      localStorage.removeItem('pricewise_user');
    }
  };

  const createUser = (name: string, email: string, role: UserRole = 'buyer', storeName?: string): User => {
    const cleanHandle = name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8) || 'user';
    const isOwner = isPlatformOwnerEmail(email);
    const finalRole: UserRole = role;
    const finalName = name || (isOwner ? 'Emmanuel Adejuwon' : 'Shopper');
    const isSeller = finalRole === 'seller' || !!storeName;

    return {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2),
      name: finalName,
      email: email.trim().toLowerCase(),
      avatar: '',
      role: isSeller ? 'seller' : finalRole,
      storeId: isSeller ? `store_${Math.random().toString(36).slice(2, 8)}` : undefined,
      storeName: storeName || (isSeller ? `${finalName}'s Store` : undefined),
      storeDetails: isSeller ? {
        businessName: storeName || `${finalName}'s Store`,
        isVerified: true,
        membershipLevel: 'premium',
      } : undefined,
      watchlist: [],
      priceAlerts: [],
      clickHistory: [],
      preferences: defaultPreferences,
      notificationSettings: defaultNotifications,
      createdAt: new Date().toISOString(),
      membershipTier: 'free',
      referralCode: `PW-${cleanHandle.toUpperCase()}${Math.floor(100 + Math.random() * 900)}`,
      referralBalance: 0,
      totalReferred: 0,
      adFreeMode: false,
    };
  };

  const login = (email: string, _password?: string, role: UserRole = 'buyer', storeName?: string) => {
    const resolvedName = email.split('@')[0];
    const newUser = createUser(resolvedName, email, role, storeName);
    saveUser(newUser);
  };

  const signup = (name: string, email: string, _password?: string, role: UserRole = 'buyer', storeName?: string) => {
    const newUser = createUser(name, email, role, storeName);
    saveUser(newUser);
  };

  const logout = () => {
    saveUser(null);
    setIsAdminAuthenticated(false);
    sessionStorage.removeItem('pricewise_admin_auth');
    localStorage.removeItem('pricewise_admin_auth');
  };

  const switchRole = (newRole: UserRole) => {
    if (user) {
      saveUser({
        ...user,
        role: newRole,
        storeName: newRole === 'seller' && !user.storeName ? `${user.name}'s Verified Store` : user.storeName,
      });
    }
  };

  const registerSellerStore = (storeData: { businessName: string; logoUrl?: string; description?: string }) => {
    if (user) {
      registerMerchantKYC({
        storeName: storeData.businessName,
        ownerEmail: user.email,
      });
      saveUser({
        ...user,
        role: 'seller',
        storeId: user.storeId || `store_${Math.random().toString(36).slice(2, 8)}`,
        storeName: storeData.businessName,
        storeDetails: {
          businessName: storeData.businessName,
          logoUrl: storeData.logoUrl,
          isVerified: true,
          membershipLevel: 'premium',
        }
      });
    }
  };

  const adminLogin = (passkey: string): boolean => {
    const validKeys = ['admin2026', 'pw-admin-master', 'pricewise2026', 'dev-admin', 'emmanuel'];
    if (validKeys.includes(passkey.trim().toLowerCase())) {
      setIsAdminAuthenticated(true);
      sessionStorage.setItem('pricewise_admin_auth', 'true');
      localStorage.setItem('pricewise_admin_auth', 'true');
      return true;
    }
    return false;
  };

  const adminLogout = () => {
    setIsAdminAuthenticated(false);
    sessionStorage.removeItem('pricewise_admin_auth');
    localStorage.removeItem('pricewise_admin_auth');
  };

  const isOwner = isPlatformOwnerEmail(user?.email || '');
  const currentRole: UserRole = user?.role || 'buyer';

  const addToWatchlist = (productId: string) => {
    if (user) saveUser({ ...user, watchlist: [...user.watchlist, productId] });
  };

  const removeFromWatchlist = (productId: string) => {
    if (user) saveUser({ ...user, watchlist: user.watchlist.filter(id => id !== productId) });
  };

  const isInWatchlist = (productId: string) => user?.watchlist.includes(productId) ?? false;

  const addPriceAlert = (alert: PriceAlert) => {
    if (user) {
      saveUser({ ...user, priceAlerts: [...user.priceAlerts, alert] });
      mongoAtlas.insertPriceAlert(alert);
    }
  };

  const removePriceAlert = (alertId: string) => {
    if (user) {
      saveUser({ ...user, priceAlerts: user.priceAlerts.filter(a => a.id !== alertId) });
      mongoAtlas.deletePriceAlert(alertId);
    }
  };

  const addClickLog = (log: Omit<ClickLog, 'id' | 'timestamp'>) => {
    if (user) {
      const newLog: ClickLog = {
        ...log,
        id: Math.random().toString(36).slice(2),
        timestamp: new Date().toISOString(),
      };
      saveUser({ ...user, clickHistory: [newLog, ...user.clickHistory].slice(0, 100) });
    }

    // Record into MongoDB Atlas and platform financial ledger
    mongoAtlas.insertClickLog(log);
    const estimatedCommission = Math.max(150, Math.round(log.price * 0.035));
    recordPlatformRevenue(
      estimatedCommission,
      'affiliate_commission',
      log.storeName,
      `Outbound click referral: ${log.productName} (Est. Price: ₦${log.price.toLocaleString()})`
    );
  };

  const updatePreferences = (prefs: Partial<UserPreferences>) => {
    if (user) saveUser({ ...user, preferences: { ...user.preferences, ...prefs } });
  };

  const updateNotificationSettings = (settings: Partial<NotificationSettings>) => {
    if (user) saveUser({ ...user, notificationSettings: { ...user.notificationSettings, ...settings } });
  };

  const upgradeMembership = (tier: 'vip' | 'pro', durationMonths: number = 1) => {
    if (!user) return;
    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + durationMonths);
    saveUser({
      ...user,
      membershipTier: tier,
      membershipExpiresAt: expiry.toISOString(),
      adFreeMode: true,
    });

    const fee = tier === 'vip' ? 3500 * durationMonths : 1500 * durationMonths;
    recordPlatformRevenue(
      fee,
      'membership_fee',
      'Shopper Plan Subscription',
      `Shopper ${user.name} upgraded to ${tier.toUpperCase()} (${durationMonths} month plan)`
    );
  };

  const toggleAdFreeMode = () => {
    if (user) {
      saveUser({ ...user, adFreeMode: !user.adFreeMode });
    }
  };

  const claimReferralReward = (amount: number) => {
    if (user) {
      saveUser({
        ...user,
        referralBalance: (user.referralBalance || 0) + amount,
        totalReferred: (user.totalReferred || 0) + 1,
      });
    }
  };

  const requestPayout = async (bank: string, accountNumber: string, amount: number): Promise<boolean> => {
    if (!user || (user.referralBalance || 0) < amount) return false;
    await new Promise(resolve => setTimeout(resolve, 800));
    saveUser({
      ...user,
      referralBalance: (user.referralBalance || 0) - amount,
    });
    return true;
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      role: currentRole,
      isAdminAuthenticated,
      isOwner,
      login,
      signup,
      logout,
      switchRole,
      registerSellerStore,
      adminLogin,
      adminLogout,
      addToWatchlist,
      removeFromWatchlist,
      addPriceAlert,
      removePriceAlert,
      isInWatchlist,
      addClickLog,
      updatePreferences,
      updateNotificationSettings,
      upgradeMembership,
      toggleAdFreeMode,
      claimReferralReward,
      requestPayout,
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
