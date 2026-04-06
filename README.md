# ETHCHESS Telegram Mini App

Simple Telegram mini app for ETHCHESS Club Under 20's competition registration.

## Features

- Single-page mini app UI with:
  - Welcome header (`Welcome to ETHCHESS`)
  - Logo placeholder (replace later)
  - Main competition card
  - Two registration options: Individual and Team
- Bilingual form fields:
  - `Full name/ሙሉ ስም፡`
  - `Subcity/ክፍለ ከተማ የምትኖሩበት፡`
  - `Phone Number/ስልክ ቁጥር፡`
  - `Age/እድሜ፡`
- Form submissions to Formspree endpoint:
  - `https://formspree.io/f/xgopdvog`
  - Includes `registration_type` (`individual` or `team`)
- Telegram viewport handling:
  - expands on open
  - requests fullscreen on open
  - safe-area aware spacing
- Telegram Main Button integration:
  - context-aware text for active form
  - enabled only when form is valid
  - loader while submitting

## Scripts

- `npm run dev`
- `npm run dev:https`
- `npm run build`
- `npm run preview`
- `npm run deploy`

## GitHub Pages

This project is configured for repository:

- `https://github.com/nyeiyo/ETHCHESS-telegram-app`

Current deployment settings:

- `package.json` homepage: `https://nyeiyo.github.io/ETHCHESS-telegram-app`
- `vite.config.ts` base: `/ETHCHESS-telegram-app/`

If your username or repository changes, update both values.
