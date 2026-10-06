import React, { createContext, useContext, useState, useEffect } from "react";

export const CURRENCIES = {
  LKR: { code: "LKR", label: "LKR (Rs.)", symbol: "Rs. ", flag: "🇱🇰", rate: 1 },
  USD: { code: "USD", label: "USD ($)", symbol: "$", flag: "🇺🇸", rate: 305 },
  EUR: { code: "EUR", label: "EUR (€)", symbol: "€", flag: "🇪🇺", rate: 330 },
  GBP: { code: "GBP", label: "GBP (£)", symbol: "£", flag: "🇬🇧", rate: 385 },
};

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => {
    try {
      return localStorage.getItem("yamu_currency") || "LKR";
    } catch {
      return "LKR";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("yamu_currency", currency);
    } catch (_) {}
  }, [currency]);

  const activeCurrency = CURRENCIES[currency] || CURRENCIES.LKR;

  const formatPrice = (lkrAmount) => {
    const amount = Number(lkrAmount) || 0;
    if (activeCurrency.code === "LKR") {
      return `LKR ${amount.toLocaleString("en-LK")}`;
    }
    const converted = amount / activeCurrency.rate;
    const formatted = converted < 10 ? converted.toFixed(1) : Math.round(converted).toLocaleString();
    return `${activeCurrency.symbol}${formatted} ${activeCurrency.code}`;
  };

  const formatRawPrice = (lkrAmount) => {
    const amount = Number(lkrAmount) || 0;
    if (activeCurrency.code === "LKR") {
      return `LKR ${amount.toLocaleString("en-LK")}`;
    }
    const converted = amount / activeCurrency.rate;
    const formatted = converted < 10 ? converted.toFixed(1) : Math.round(converted).toLocaleString();
    return `${activeCurrency.symbol}${formatted}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        activeCurrency,
        currencies: CURRENCIES,
        formatPrice,
        formatRawPrice,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    return {
      currency: "LKR",
      setCurrency: () => {},
      activeCurrency: CURRENCIES.LKR,
      currencies: CURRENCIES,
      formatPrice: (amt) => `LKR ${(Number(amt) || 0).toLocaleString("en-LK")}`,
      formatRawPrice: (amt) => `LKR ${(Number(amt) || 0).toLocaleString("en-LK")}`,
    };
  }
  return context;
};
