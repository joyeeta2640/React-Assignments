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
