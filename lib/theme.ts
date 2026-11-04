/**
 * Sets the `dark`/`light` class on <html> before the page paints, from the `theme` cookie.
 * Rendered in <head> by the root layout (a server component), so it lives here and not in
 * the "use client" ThemeProvider: a server component importing a non-component value from
 * a client module gets a reference, not the value.
 *
 * Doing it in the browser (not by reading the cookie on the server) keeps the public pages
 * static, and components style themselves with Tailwind's `dark:` variant so the server
 * HTML is the same for both themes.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var m=document.cookie.match(/(?:^|; )theme=(dark|light)/);var t=m?m[1]:"light";var d=document.documentElement;d.classList.remove("light","dark");d.classList.add(t);d.style.colorScheme=t;d.setAttribute("data-theme",t);}catch(e){}})();`;
