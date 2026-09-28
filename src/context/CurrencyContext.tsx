"use client";

import React, { createContext, useContext, useEffect, useState, useTransition } from "react";

export type SupportedCurrency = "NGN" | "USD";

interface CurrencyContextType {
  currency: SupportedCurrency;
  setCurrency: (c: SupportedCurrency) => void;
  rateNgnPerUsd: number;
  formatPrice: (amountInNgn: number, overrideCurrency?: SupportedCurrency) => string;
  convertPrice: (amountInNgn: number, targetCurrency?: SupportedCurrency) => number;
  isLoadingRate: boolean;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: "NGN",
  setCurrency: () => {},
  rateNgnPerUsd: 1350,
  formatPrice: (amount) => `₦${amount.toLocaleString()}`,
  convertPrice: (amount) => amount,
  isLoadingRate: false,
});

const CURRENCY_STORAGE_KEY = "vo_selected_currency_v1";
const DEFAULT_FALLBACK_RATE = 1350; // Fallback NGN per 1 USD

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<SupportedCurrency>("NGN");
  const [rateNgnPerUsd, setRateNgnPerUsd] = useState<number>(DEFAULT_FALLBACK_RATE);
  const [isLoadingRate, setIsLoadingRate] = useState<boolean>(true);
  const [, startTransition] = useTransition();

  // Detect location and load cached preference
  useEffect(() => {
    // 1. Check localStorage first
    try {
      const saved = localStorage.getItem(CURRENCY_STORAGE_KEY) as SupportedCurrency | null;
      if (saved && (saved === "NGN" || saved === "USD")) {
        setCurrencyState(saved);
      } else {
        // 2. Responsive with location of user (Nigeria -> NGN, international -> USD)
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
        const lang = typeof navigator !== "undefined" ? navigator.language : "";
        const isNigeria = tz.toLowerCase().includes("lagos") || lang.toLowerCase() === "en-ng";
        const detected: SupportedCurrency = isNigeria ? "NGN" : "USD";
        setCurrencyState(detected);
      }
    } catch {
      // Fallback
    }

    // 3. Fetch real-time exchange rates from Fawaz Ahmed Currency API
    // Repository: https://github.com/fawazahmed0/currency-api
    const fetchRates = async () => {
      setIsLoadingRate(true);
      const endpoints = [
        "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json",
        "https://latest.currency-api.pages.dev/v1/currencies/usd.json",
      ];

      for (const url of endpoints) {
        try {
          const res = await fetch(url, { cache: "force-cache", next: { revalidate: 3600 } } as RequestInit);
          if (res.ok) {
            const data = await res.json();
            if (data?.usd?.ngn && typeof data.usd.ngn === "number") {
              setRateNgnPerUsd(data.usd.ngn);
              setIsLoadingRate(false);
              return;
            }
          }
        } catch (err) {
          console.warn(`Failed to fetch exchange rate from ${url}`, err);
        }
      }
      setIsLoadingRate(false);
    };

    fetchRates();
  }, []);

  const setCurrency = (c: SupportedCurrency) => {
    startTransition(() => {
      setCurrencyState(c);
      try {
        localStorage.setItem(CURRENCY_STORAGE_KEY, c);
      } catch {
        // Storage might be disabled
      }
    });
  };

  /**
   * Convert an amount given in baseline NGN to the target currency
   */
  const convertPrice = (amountInNgn: number, targetCurrency: SupportedCurrency = currency): number => {
    if (targetCurrency === "NGN") {
      return amountInNgn;
    }
    const safeRate = rateNgnPerUsd > 0 ? rateNgnPerUsd : DEFAULT_FALLBACK_RATE;
    const inUsd = amountInNgn / safeRate;
    // Round to 2 decimal places
    return Math.round(inUsd * 100) / 100;
  };

  /**
   * Formats an amount given in baseline NGN with appropriate currency symbol
   */
  const formatPrice = (amountInNgn: number, overrideCurrency?: SupportedCurrency): string => {
    const activeCurr = overrideCurrency || currency;
    if (activeCurr === "USD") {
      const usdVal = convertPrice(amountInNgn, "USD");
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(usdVal);
    }

    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amountInNgn);
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        rateNgnPerUsd,
        formatPrice,
        convertPrice,
        isLoadingRate,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
