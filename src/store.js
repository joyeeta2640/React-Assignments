import { configureStore } from "@reduxjs/toolkit";
import studentsReducer from "./studentsSlice";
import attendanceReducer from "./attendanceSlice";
import filtersReducer from "./filtersSlice";
import subjectsReducer from "./subjectsSlice";

const STORAGE_KEY = "attendease-redux-state";
let persisted;
try { persisted = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"); } catch { persisted = null; }

const loggerMiddleware = () => next => action => {
  console.log("[AttendEase action]", action.type, action.payload ?? "");
  return next(action);
};

export const store = configureStore({
  reducer: {
    students: studentsReducer,
    attendance: attendanceReducer,
    filters: filtersReducer,
    subjects: subjectsReducer
  },
  preloadedState: persisted || undefined,
  middleware: getDefaultMiddleware => getDefaultMiddleware().concat(loggerMiddleware)
});

store.subscribe(() => {
  const state = store.getState();
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    students: state.students,
    attendance: state.attendance,
    filters: state.filters,
    subjects: state.subjects
  }));
});