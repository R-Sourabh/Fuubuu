# Fuubuu - Live Football Tracker & Analytics Platform

Fuubuu is a full-stack football (soccer) mobile application and backend service built to provide real-time football scores, detailed match statistics, league standings, head-to-head comparisons, team rosters, manager information, and transfer history.

---

## 🏗️ Project Architecture

The repository is organized as a monorepo containing two main modules:

```text
fuubuu/
├── backend/    # Node.js + Express + TypeScript proxy server for API-Sports
└── mobile/     # React Native (Expo) cross-platform mobile application
```

---

## ⚙️ Backend Implementation (`/backend`)

The backend acts as a secure API Gateway and Proxy for the external **API-Sports (API-Football v3)** API. It prevents exposing secret API keys on the mobile device while providing clean, formatted endpoints for the app.

### Key Backend Components

1. **API Gateway Service (`src/services/footballApi.ts`)**
   - Handles standard HTTP GET requests to `https://v3.football.api-sports.io`.
   - Injects the secret `x-apisports-key` header.
   - Sanitizes query parameters and handles API error responses gracefully.

2. **API Routes (`src/routes/`)**
   - **`/api/competitions`**:
     - Fetch active leagues & tournaments.
     - Fetch league standings table for specific seasons.
     - Fetch top scorers for a competition.
   - **`/api/matches`**:
     - Fetch live, upcoming, and past fixtures by date or league.
     - Fetch comprehensive match details (scores, status, venue, referees).
     - Fetch Head-to-Head (H2H) records between two teams.
     - Fetch starting line-ups, substitutions, and tactics/formations.
     - Fetch minute-by-minute match timeline events (goals, cards, VAR checks).
   - **`/api/teams`**:
     - Fetch detailed team profiles.
     - Fetch full squad rosters with player stats.
     - Fetch manager and coaching staff details.
     - Fetch recent transfer history (transfers in & out).

3. **Error Handling Middleware (`src/middleware/errorHandler.ts`)**
   - Intercepts all unhandled backend errors and returns uniform JSON error payloads.

---

## 📱 Mobile Client Implementation (`/mobile`)

The mobile app is built with **React Native (Expo)** and **TypeScript**, using a dark theme designed for modern sports applications.

### 1. Navigation Architecture (`src/navigation/`)
- **`AppNavigator`**: Primary Stack Navigator for root routing (Auth flow, Match details, Team details, Competition details).
- **`TabNavigator`**: 4-Tab Bottom Navigation for quick navigation:
  - **Home** (`HomeScreen`): Daily highlights, live match overview, and quick updates.
  - **Matches** (`MatchesScreen`): Date-filtered fixture browser with status indicators.
  - **Competitions** (`CompetitionsScreen`): List of top football leagues worldwide.
  - **Favorites** (`FavoritesScreen`): User's bookmarked teams and competitions.

### 2. Primary Screens (`src/screens/`)
- **`HomeScreen`**: Features live score feeds, top league shortcuts, and quick match summaries.
- **`MatchesScreen`**: Allows users to filter matches by date picker and competition.
- **`MatchDetailScreen`**: Detailed view with multi-tab layout:
  - **Overview**: Goals, key events, and referee info.
  - **Lineups**: Pitch visualization of formations, starting XI, and bench.
  - **Timeline**: Chronological breakdown of cards, goals, and subs.
  - **H2H**: Historical head-to-head records between competing clubs.
- **`CompetitionDetailScreen`**: Detailed view of a league showing:
  - **Standings Table**: Points, matches played, goal differences.
  - **Top Scorers**: Top goal scorers with goal count and assist stats.
  - **Fixtures**: Schedule of games in the competition.
- **`TeamDetailScreen`**: Comprehensive club profile featuring:
  - **Squad Roster**: Filtered list of goalkeepers, defenders, midfielders, and forwards.
  - **Coaches/Manager**: Current manager details and coaching staff.
  - **Transfers**: In/out transfer activity in recent windows.
- **`FavoritesScreen`**: Quick access to bookmarked teams and leagues saved in local state.
- **`LoginScreen`**: User login and registration powered by Supabase Auth.

### 3. Data Management & Offline Support (`src/hooks/` & `src/store/`)
- **TanStack React Query (`@tanstack/react-query`)**: Handles asynchronous data fetching, caching, automatic refetching on window focus, and background sync.
- **Offline Storage (`@tanstack/react-query-persist-client` + `AsyncStorage`)**: Persists API responses locally so users can browse previously fetched matches and standings even without an active internet connection.
- **Offline Detector (`src/components/common/OfflineBanner.tsx`)**: Listens to network state using `@react-native-community/netinfo` and displays an offline banner when connection drops.
- **Zustand State Stores (`src/store/`)**:
  - `authStore`: Manages user authentication session & tokens.
  - `favoritesStore`: Manages user's favorited teams and leagues with local persistence.
  - `settingsStore`: Manages app settings (notifications, themes).

### 4. Push Notifications (`src/services/notificationService.ts`)
- Configured using `expo-notifications` for match alerts and score updates.

---

## 🚀 Environment & Setup Instructions

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create `.env` file (refer to `.env.example`):
   ```env
   PORT=5000
   API_FOOTBALL_KEY=your_api_sports_key_here
   ```
4. Start development server:
   ```bash
   npm run dev
   ```

### Mobile App Setup

1. Navigate to mobile directory:
   ```bash
   cd mobile
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create `.env` file (refer to `.env.example`):
   ```env
   EXPO_PUBLIC_API_BASE_URL=http://localhost:5000/api
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Start Expo development server:
   ```bash
   npm start
   ```

---

## 🛠️ Summary of Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Mobile App** | React Native, Expo (SDK 54), TypeScript |
| **Mobile Navigation** | React Navigation (Native Stack & Bottom Tabs) |
| **Mobile State & Cache** | TanStack Query v5, Zustand, AsyncStorage |
| **Authentication** | Supabase Auth (`@supabase/supabase-js`) |
| **Backend Server** | Node.js, Express.js, TypeScript |
| **External Sports API** | API-Sports (API-Football v3) |
