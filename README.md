# Assignment 13 – Student Attendance Management System

A React + Vite application using Redux Toolkit.

## Features
- Add, edit, delete, search and filter student records.
- Separate Redux slices for students, attendance, filters and subjects.
- Mark attendance as Present (P), Absent (A), Internship Placed (PL), or Official Engagement (E).
- Attendance upsert key is date + subject + student, preventing duplicate records.
- Attendance summary, individual percentages and configurable low-attendance threshold.
- Daily/monthly report views, charts and CSV export.
- `createAsyncThunk` simulated student fetch and attendance save with loading/success/failure states.
- Redux action logger middleware.
- localStorage state persistence.
- Memoized selectors and Vitest tests.

## Run locally
```bash
npm install
npm run dev
```
Open the local URL printed by Vite.

## Build and test
```bash
npm run build
npm test
```

## Notes
This is a frontend-only assignment demo. Student fetching and attendance saving use simulated async API calls. Replace those thunk bodies with real `fetch()` calls when a backend is available. Data is stored in the browser's localStorage.
# React Assignment Solutions (1–11)

This folder contains 11 independent Vite + React solutions based on the uploaded assignment PDF. Each folder is a separate app so that dependencies and routes for one assignment do not interfere with another.

## Run any assignment
1. Install Node.js (LTS).
2. Open a terminal inside the chosen `assignment-XX-*` folder.
3. Run:
   ```bash
   npm install
   npm run dev
   ```
4. Open the local URL shown by Vite.

Each assignment includes `package.json`, `index.html`, `src/main.jsx`, `src/App.jsx`, and `src/style.css`.

## API-based assignments
- Assignment 4 (Weather): create an API key at OpenWeatherMap and put it in `src/App.jsx` in `API_KEY`.
- Assignment 9 (Blog): run `npm run server` in a second terminal to start JSON Server on port 3001.
- Assignment 10 (Movies): get an OMDb API key and put it in `src/App.jsx` in `API_KEY`.

## Notes
- Assignment 6 and 7 use React Router and browser localStorage for demonstration-level route protection/authentication.
- Assignment 8 and 11 use Recharts.
- The JWT in Assignment 7 is simulated in localStorage, not a real secure authentication backend.
- These are educational implementations; do not use demo authentication or localStorage as production security.
