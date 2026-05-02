"use client";

import { createContext, useState, useEffect, useContext } from "react";
import Cookies from "js-cookie";

type Theme = "light" | "dark";
type ThemeContextType = {
    theme: Theme;
    setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({
    children,
    defaultTheme = 'light'
}: {
    children: React.ReactNode;
    defaultTheme?: Theme | any;
}) {
    // Use saved theme from cookies or fall back to provided default
    const [theme, setTheme] = useState<Theme>(() => {
        const savedTheme = Cookies.get('theme') as Theme;
        return savedTheme || defaultTheme;
    });

    const applyTheme = (themeValue: Theme) => {
        const html = document.documentElement;
        const isDark = themeValue === 'dark';

        // Add/remove classes
        html.classList.toggle('dark', isDark);
        html.classList.toggle('light', !isDark);

        // Set color scheme
        html.style.colorScheme = themeValue;

        // Set data attribute
        html.setAttribute('data-theme', themeValue);

        // Save to cookies
        Cookies.set('theme', themeValue, { expires: 365 });

        // Dynamically load Highcharts theme
        const existingLink = document.getElementById('highcharts-theme') as HTMLLinkElement | null;

        if (isDark) {
            if (!existingLink) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.id = 'highcharts-theme';
                link.href = '/highcharts/dark-unica.css';
                document.head.appendChild(link);
            }
        } else {
            if (existingLink) {
                existingLink.remove();
            }
        }

    };

    // Apply theme on initial render
    useEffect(() => {
        applyTheme(theme);
    }, [theme]);

    // Handler for theme changes
    const handleSetTheme = (newTheme: Theme) => {
        setTheme(newTheme);
        applyTheme(newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}
