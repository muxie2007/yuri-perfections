# Muhsin Interiors — Next.js Website

Premium interior design website for Muhsin Interiors, Kampala Uganda.

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install framer-motion react-icons js-cookie @types/js-cookie
```

### 2. File Structure
Place files as follows in your Next.js project:

```
app/
├── layout.tsx          ← Root layout (provided)
├── page.tsx            ← Home page (provided)
├── globals.css         ← Global styles (provided)
providers/
├── ThemeProvider.tsx   ← Theme context (provided)
components/
├── Navbar.tsx
├── Hero.tsx
├── Features.tsx
├── About.tsx
├── Services.tsx
├── Projects.tsx
├── Testimonials.tsx
├── DiscountBanner.tsx
├── Contact.tsx
└── Footer.tsx
```

### 3. ThemeProvider in layout
The `ThemeProvider` is already integrated in `layout.tsx` — it reads the saved cookie server-side to avoid flash of wrong theme on first render.

## 🎨 Design System

| Token | Value | Usage |
|---|---|---|
| Brand Green | `#3d6b5e` | Primary (light mode) |
| Brand Gold | `#c8a97e` | Accents everywhere |
| Brand Dark | `#0e0e0e` | Background (dark mode) |
| Brand Light | `#f5f2ee` | Background (light mode) |
| Font Display | Playfair Display | Headings |
| Font Body | DM Sans | Body text |

## 📦 Key Packages Used
- **framer-motion** — Page animations, parallax, transitions
- **react-icons** — FI (Feather) icon set throughout  
- **js-cookie** — Persist theme preference across sessions
- **Tailwind v4** — Utility CSS (already included in Next.js)

## 🌙 Dark / Light Mode
Toggle button is in the Navbar. Theme persists via cookies. `useTheme()` hook is available globally.

## 📍 Location
Kampala, Uganda — represented in contact section and metadata.