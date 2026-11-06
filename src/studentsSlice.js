import { createAsyncThunk, createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { initialStudents } from "./data";

const studentsAdapter = createEntityAdapter({ selectId: student => student.id });

export const fetchStudents = createAsyncThunk("students/fetchStudents", async () => {
  // Demo API simulation. Replace this promise with fetch("/api/students") when a backend exists.
  await new Promise(resolve => setTimeout(resolve, 350));
  return initialStudents;
});

const studentsSlice = createSlice({
  name: "students",
  initialState: studentsAdapter.getInitialState({ status: "idle", error: null }),
  reducers: {
    addStudent: studentsAdapter.addOne,
    updateStudent: studentsAdapter.updateOne,
    deleteStudent: studentsAdapter.removeOne
  },
  extraReducers: builder => {
    builder
      .addCase(fetchStudents.pending, state => { state.status = "loading"; state.error = null; })
      .addCase(fetchStudents.fulfilled, (state, action) => {
        state.status = "succeeded";
        studentsAdapter.setAll(state, action.payload);
      })
      .addCase(fetchStudents.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  }
});

export const { addStudent, updateStudent, deleteStudent } = studentsSlice.actions;
export const studentSelectors = studentsAdapter.getSelectors(state => state.students);
export default studentsSlice.reducer;