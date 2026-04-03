# Daily Drink Companion — Mobile App

React Native (Expo SDK 54) mobile app that helps users discover drinks they can make with ingredients they already have.

## Features

- **Ingredient-based Drink Finder** — select what you have, get matching drinks
- **Smart Matching** — shows match percentage, missing ingredients, "1 ingredient away" highlights
- **Email OTP Login** — passwordless authentication
- **Image Carousel** — swipe through multiple drink photos
- **Quick Filters** — "Under 2 min", "Max 3 ingredients"
- **Fuzzy Search** — search by drink name or ingredient aliases
- **Favorites** — save drinks locally with optimistic UI
- **Account Management** — edit name, phone, DOB, bio
- **Animated UI** — fade-in animations on cards, carousels, screens
- **Vibrant Design** — purple theme with coral accents, tinted sections

## Tech Stack

- **Framework**: React Native (Expo SDK 54)
- **Navigation**: React Navigation (bottom tabs + native stack)
- **Icons**: @expo/vector-icons (Ionicons)
- **Storage**: AsyncStorage (favorites, auth session)
- **Animations**: React Native built-in Animated API

## Screens

| Screen | Description |
|--------|-------------|
| **Login** | Email + OTP two-step auth with animations |
| **Home** | Purple header, search bar, featured card, horizontal carousels |
| **Finder** | Ingredient selection with collapsible groups, floating action button |
| **Favorites** | Saved drinks with empty state CTA |
| **Account** | Profile editing, preferences, logout |
| **Drink Detail** | Image carousel, meta cards, ingredients, step-by-step recipe |

## Design System

- **Primary**: `#6C3CE1` (vibrant purple)
- **Accent**: `#FF6B6B` (coral red)
- **Secondary**: Teal, Amber, Sky blue
- **Background**: `#F8F7FC` (light purple tint)

## Setup

1. Update API URL in `src/services/api.ts`:
```typescript
const API_BASE = "http://YOUR_IP:3000/api";
```

2. Install and run:
```bash
npm install
npx expo start
```

3. Scan QR code with **Expo Go** on your phone.

## Project Structure

```
src/
├── components/       # DrinkCard, DrinkCardSmall, FadeIn, ToggleSwitch, etc.
├── context/          # AppContext (favorites), AuthContext (user session)
├── screens/          # Login, Home, Finder, Favorites, Account, DrinkDetail
├── services/         # API client, favorites storage
├── utils/            # Data normalizer
├── types/            # TypeScript interfaces
└── theme.ts          # Color system
```

## Requires

- [DDC Server](https://github.com/Devraj5032/ddc-server) running on your network
- Expo Go app (Android/iOS) for testing
