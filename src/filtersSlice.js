import { createSlice } from "@reduxjs/toolkit";
import { today } from "./data";

const filtersSlice = createSlice({
  name: "filters",
  initialState: {
    search: "", department: "All", semester: "All", section: "All",
    date: today, subjectId: "", reportStudent: "All", reportSubject: "All",
    fromDate: "", toDate: "", threshold: 45, activeTab: "Dashboard"
  },
  reducers: {
    setFilter: (state, action) => { state[action.payload.key] = action.payload.value; },
    setActiveTab: (state, action) => { state.activeTab = action.payload; },
    resetFilters: state => {
      state.search = ""; state.department = "All"; state.semester = "All"; state.section = "All";
    }
  }
});

export const { setFilter, setActiveTab, resetFilters } = filtersSlice.actions;
export default filtersSlice.reducer;