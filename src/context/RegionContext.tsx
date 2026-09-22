import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { RegionalMarket } from '../types';

export const SUPPORTED_REGIONS: RegionalMarket[] = [
  {
    countryCode: 'NG',
    countryName: 'Nigeria',
    currencyCode: 'NGN',
    currencySymbol: '₦',
    exchangeRateToNGN: 1.0,
    flag: '🇳🇬',
    cities: ['Lagos', 'Abuja', 'Port Harcourt', 'Ibadan', 'Kano', 'Enugu'],
  },
  {
    countryCode: 'GH',
    countryName: 'Ghana',
    currencyCode: 'GHS',
    currencySymbol: 'GH₵',
    exchangeRateToNGN: 0.0105,
    flag: '🇬🇭',
    cities: ['Accra', 'Kumasi', 'Tamale', 'Takoradi'],
  },
  {
    countryCode: 'KE',
    countryName: 'Kenya',
    currencyCode: 'KES',
    currencySymbol: 'KSh',
    exchangeRateToNGN: 0.088,
    flag: '🇰🇪',
    cities: ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru'],
  },
  {
    countryCode: 'ZA',
    countryName: 'South Africa',
    currencyCode: 'ZAR',
    currencySymbol: 'R',
    exchangeRateToNGN: 0.0125,
    flag: '🇿🇦',
    cities: ['Johannesburg', 'Cape Town', 'Durban', 'Pretoria'],
  },
  {
    countryCode: 'US',
    countryName: 'United States (USD)',
    currencyCode: 'USD',
    currencySymbol: '$',
    exchangeRateToNGN: 0.00067,
    flag: '🌐',
    cities: ['New York', 'California', 'Texas', 'Florida'],
  },
];

interface RegionContextType {
  currentRegion: RegionalMarket;
  setRegion: (countryCode: 'NG' | 'GH' | 'KE' | 'ZA' | 'US') => void;
  formatPrice: (price: number, sourceCurrency?: string) => string;
  convertPrice: (price: number, sourceCurrency?: string) => number;
}

const RegionContext = createContext<RegionContextType | undefined>(undefined);

export const RegionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentRegion, setCurrentRegion] = useState<RegionalMarket>(() => {
    const saved = localStorage.getItem('pricewise_region');
    if (saved) {
      const match = SUPPORTED_REGIONS.find(r => r.countryCode === saved);
      if (match) return match;
    }
    return SUPPORTED_REGIONS[0]; // default Nigeria
  });

  const setRegion = (countryCode: 'NG' | 'GH' | 'KE' | 'ZA' | 'US') => {
    const found = SUPPORTED_REGIONS.find(r => r.countryCode === countryCode);
    if (found) {
      setCurrentRegion(found);
      localStorage.setItem('pricewise_region', countryCode);
    }
  };

  /**
   * Converts a given price into current region's currency
   * If sourceCurrency is '$', standard USD base is used ($1 = 1500 NGN)
   */
  const convertPrice = (price: number, sourceCurrency: string = '₦'): number => {
    let priceInNGN = price;
    if (sourceCurrency === '$' || sourceCurrency === 'USD') {
      priceInNGN = price * 1500;
    } else if (sourceCurrency === 'GH₵' || sourceCurrency === 'GHS') {
      priceInNGN = price / 0.0105;
    } else if (sourceCurrency === 'KSh' || sourceCurrency === 'KES') {
      priceInNGN = price / 0.088;
    } else if (sourceCurrency === 'R' || sourceCurrency === 'ZAR') {
      priceInNGN = price / 0.0125;
    }

    if (currentRegion.currencyCode === 'NGN') {
      return Math.round(priceInNGN);
    }

    const converted = priceInNGN * currentRegion.exchangeRateToNGN;
    if (converted >= 100) return Math.round(converted);
    return Math.round(converted * 100) / 100;
  };

  const formatPrice = (price: number, sourceCurrency: string = '₦'): string => {
    const amount = convertPrice(price, sourceCurrency);
    if (currentRegion.currencySymbol === '₦') {
      return `₦${amount.toLocaleString()}`;
    }
    return `${currentRegion.currencySymbol}${amount.toLocaleString()}`;
  };

  return (
    <RegionContext.Provider value={{ currentRegion, setRegion, formatPrice, convertPrice }}>
      {children}
    </RegionContext.Provider>
  );
};

export const useRegion = () => {
  const context = useContext(RegionContext);
  if (!context) throw new Error('useRegion must be used within RegionProvider');
  return context;
};
