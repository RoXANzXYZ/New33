# BurkaOS - Hypertrophy Training App

## Original Problem Statement
Build a local-first, offline-capable PWA called "BurkaOS" — a hypertrophy training app based on Sebastian Burka's coaching philosophy.

## Core Requirements
- Parse Burka PDF training guides for all program content
- Program Library, Active Workout Logging, Exercise Library
- AI Coach (Gemini 3 Flash), Analytics & PRs
- Dark mode, minimal, fast, premium blue-themed UI
- Offline-first (postponed by user)

## What's Been Implemented

### Core Features
- **Program Library**: 4 programs (Bro Split 2.0, Original Bro Split, Upper/Lower, Push/Pull/Legs)
- **Active Workout Screen**: Full logging with exercise pills, weight/reps input, +/-5 buttons, rest timer, previous performance display
- **Exercise Library**: Searchable with YouTube links
- **AI Coach**: Gemini 3 Flash integration with chat history
- **Analytics & PRs**: Workout data visualization

### Recent Fixes (Mar 1, 2026)
- **PanResponder crash fixed**: Bounded swipe gesture to actual exercise count
- **"QUICK" labels removed**: Cleaned up workout day cards
- **Core exercises removed from regular workouts**: Abs moved to dedicated Extras tab, programs reseeded clean
- **Train tab refresh**: Now uses `useFocusEffect` to refresh on every tab visit after completing workouts
- **Program-specific warm-ups from Burka's PDFs**:
  - Bro Split 2.0: Upper body (7 exercises) + Lower body (8 exercises) — verbatim from pages 14-15
  - Upper/Lower: Upper day (5 exercises) + Lower day (3 exercises) — verbatim from the Upper/Lower PDF
  - Original Bro Split & LPPA: Fall back to Bro Split 2.0 warm-ups (no specific warm-ups in their PDFs)
  - Generic demonstration YouTube videos for each exercise (proper tutorials, not random clips)
  - Burka's instruction note from PDF displayed at top of warm-up screen
- **Superset Timer** (from Burka's PDFs):
  - Exercises tagged with superset_group: Bro Split 2.0 Day 5 (Pullovers + Reverse Curls), Day 3 (Calf Raise + Tibia Raises)
  - Golden border + swap icon connector between superset pills
  - "SUPERSET" badge on exercise card
  - 15s transition countdown after logging a set → auto-navigates to partner exercise
  - "GO NOW" skip button for immediate navigation
- **Extras Tab**: Full Ab Circuit (3 exercises) + Calf Protocol (2 exercises) with:
  - Weekly completion tracking (2x/week abs, 3x/week calves)
  - Progress badges showing done/target
  - Completion logging to backend
- **Smart reminder**: Non-annoying "EXTRAS THIS WEEK" nudge on home screen showing remaining abs/calf sessions

### Other Features
- Exercise alternatives with swap UI
- Barbell plate calculator
- Warm-up/stretches screen with feeder sets guide
- Weekly progress ring on home screen
- Muscle recovery status indicators
- Workout completion summary with volume comparison
- Coach history screen
- Reset app functionality

## Architecture
- **Backend**: FastAPI + MongoDB (server.py)
- **Frontend**: React Native / Expo Router
- **AI**: Gemini 3 Flash via emergentintegrations

## Key API Endpoints
- Programs: GET /api/programs, /api/programs/{id}, /api/programs/active/current
- Workouts: POST /api/workouts/start, /api/complete_workout/{id}, GET /api/workouts/active
- Extras: GET /api/extras/status, POST /api/extras/log
- Warmups: GET /api/warmup/{muscle_groups}
- Analytics: GET /api/analytics, /api/weekly-progress
- Coach: POST /api/coach
- Other: GET /api/muscle-recovery, /api/exercise-alternatives/{name}

## Prioritized Backlog

### P0 (Critical)
- None currently

### P1 (High)
- Verify swipe gestures between exercises work properly
- Quick mode functionality (backend endpoint exists, UI button removed — consider adding back as a subtle option)

### P2 (Medium)
- Enhance Analytics & PRs with more charts
- Implement Backup/Restore
- Break down active-workout.tsx into smaller components

### P3 (Low / Future)
- Offline-First/PWA capabilities (postponed by user)
- Export workout data
