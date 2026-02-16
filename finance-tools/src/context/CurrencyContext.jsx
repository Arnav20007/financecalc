import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CURRENCIES = [
    { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee', locale: 'en-IN' },
    { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE' },
    { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', locale: 'en-CA' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', locale: 'en-AU' },
];

const CurrencyContext = createContext();

export function CurrencyProvider({ children }) {
    const [currencyCode, setCurrencyCode] = useState(() => {
        try {
            const saved = localStorage.getItem('fc-currency');
            if (saved && CURRENCIES.find(c => c.code === saved)) return saved;
        } catch { /* ignore */ }
        return 'USD';
    });

    useEffect(() => {
        localStorage.setItem('fc-currency', currencyCode);
    }, [currencyCode]);

    const currency = CURRENCIES.find(c => c.code === currencyCode) || CURRENCIES[0];

    const formatCurrency = useCallback((value) => {
        if (value === null || value === undefined || isNaN(value)) return `${currency.symbol}0`;
        return new Intl.NumberFormat(currency.locale, {
            style: 'currency',
            currency: currency.code,
            minimumFractionDigits: currency.code === 'JPY' ? 0 : 0,
            maximumFractionDigits: currency.code === 'JPY' ? 0 : 2,
        }).format(value);
    }, [currency]);

    return (
        <CurrencyContext.Provider value={{
            currency,
            currencyCode,
            setCurrencyCode,
            currencies: CURRENCIES,
            formatCurrency,
            symbol: currency.symbol,
        }}>
            {children}
        </CurrencyContext.Provider>
    );
}

export function useCurrency() {
    const ctx = useContext(CurrencyContext);
    if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
    return ctx;
}
