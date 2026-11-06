import { createSlice } from "@reduxjs/toolkit";
import { initialSubjects } from "./data";

const subjectsSlice = createSlice({
  name: "subjects",
  initialState: initialSubjects,
  reducers: {
    addSubject: (state, action) => { state.push(action.payload); },
    updateSubject: (state, action) => {
      const index = state.findIndex(subject => subject.id === action.payload.id);
      if (index !== -1) state[index] = action.payload;
    },
    deleteSubject: (state, action) => state.filter(subject => subject.id !== action.payload)
  }
});

export const { addSubject, updateSubject, deleteSubject } = subjectsSlice.actions;
export default subjectsSlice.reducer;