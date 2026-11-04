"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";
type ThemeContextType = { theme: Theme; setTheme: (theme: Theme) => void };

function applyTheme(theme: Theme) {
    const html = document.documentElement;
    html.classList.toggle("dark", theme === "dark");
    html.classList.toggle("light", theme !== "dark");
    html.style.colorScheme = theme;
    html.setAttribute("data-theme", theme);
    document.cookie = `theme=${theme}; path=/; max-age=31536000; samesite=lax`;
}

/**
 * The default still works without a provider (next-themes does the same): Next can render
 * a layout's client components outside the root providers while it recovers from an
 * error, and a theme toggle must never be what crashes that page.
 */
const ThemeContext = createContext<ThemeContextType>({
    theme: "light",
    setTheme: (theme) => applyTheme(theme),
});

/** The class on <html> is set before paint by THEME_INIT_SCRIPT (lib/theme.ts). */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
    // The server does not know the theme; read what the init script applied once mounted.
    const [theme, setThemeState] = useState<Theme>("light");

    useEffect(() => {
        setThemeState(document.documentElement.classList.contains("dark") ? "dark" : "light");
    }, []);

    const setTheme = useCallback((next: Theme) => {
        setThemeState(next);
        applyTheme(next);
    }, []);

    return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
    return useContext(ThemeContext);
}
