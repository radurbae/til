'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type Theme = 'light' | 'dark';

interface AppSettingsContextValue {
    theme: Theme;
    toggleTheme: () => void;
}

const AppSettingsContext = createContext<AppSettingsContextValue | null>(null);

interface AppSettingsProviderProps {
    children: React.ReactNode;
}

function getPreferredTheme(): Theme {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export default function AppSettingsProvider({ children }: AppSettingsProviderProps) {
    const [theme, setTheme] = useState<Theme>('light');

    useEffect(() => {
        const storedTheme = window.localStorage.getItem('theme');

        if (storedTheme === 'light' || storedTheme === 'dark') {
            setTheme(storedTheme);
        } else {
            setTheme(getPreferredTheme());
        }
    }, []);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        document.documentElement.style.colorScheme = theme;
        window.localStorage.setItem('theme', theme);
    }, [theme]);

    const value = useMemo<AppSettingsContextValue>(() => {
        return {
            theme,
            toggleTheme: () => setTheme((current) => (current === 'light' ? 'dark' : 'light')),
        };
    }, [theme]);

    return (
        <AppSettingsContext.Provider value={value}>
            {children}
        </AppSettingsContext.Provider>
    );
}

export function useAppSettings() {
    const context = useContext(AppSettingsContext);
    if (!context) {
        throw new Error('useAppSettings must be used inside AppSettingsProvider');
    }
    return context;
}
