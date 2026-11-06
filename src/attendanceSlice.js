import { createSlice, createAsyncThunk, createEntityAdapter } from "@reduxjs/toolkit";

const attendanceAdapter = createEntityAdapter({
  selectId: record => `${record.date}_${record.subjectId}_${record.studentId}`
});

export const saveAttendance = createAsyncThunk("attendance/saveAttendance", async records => {
  // Simulated API save. This keeps the assignment runnable without a backend.
  await new Promise(resolve => setTimeout(resolve, 300));
  return records;
});

const attendanceSlice = createSlice({
  name: "attendance",
  initialState: attendanceAdapter.getInitialState({ status: "idle", error: null, lastSaved: null }),
  reducers: {
    upsertAttendance: attendanceAdapter.upsertOne,
    upsertManyAttendance: attendanceAdapter.upsertMany,
    deleteAttendance: attendanceAdapter.removeOne
  },
  extraReducers: builder => {
    builder
      .addCase(saveAttendance.pending, state => { state.status = "saving"; state.error = null; })
      .addCase(saveAttendance.fulfilled, (state, action) => {
        attendanceAdapter.upsertMany(state, action.payload);
        state.status = "saved";
        state.lastSaved = new Date().toISOString();
      })
      .addCase(saveAttendance.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  }
});

export const { upsertAttendance, upsertManyAttendance, deleteAttendance } = attendanceSlice.actions;
export const attendanceSelectors = attendanceAdapter.getSelectors(state => state.attendance);
export default attendanceSlice.reducer;