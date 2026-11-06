import { describe, it, expect } from "vitest";
import studentsReducer, { addStudent } from "./studentsSlice";
import { selectAttendanceSummary } from "./selectors";

describe("students reducer", () => {
  it("adds a student", () => {
    const initial = { ids: [], entities: {}, status: "idle", error: null };
    const next = studentsReducer(initial, addStudent({ id: "T1", name: "Test Student" }));
    expect(next.entities.T1.name).toBe("Test Student");
  });
});

describe("attendance calculations", () => {
  it("calculates present and absent counts and percentage", () => {
    const state = {
      students: { ids: ["T1"], entities: { T1: { id: "T1", name: "Test", department: "CS", semester: "5", section: "A" } } },
      attendance: { ids: ["r1", "r2"], entities: {
        r1: { studentId: "T1", subjectId: "S1", date: "2026-01-01", status: "P" },
        r2: { studentId: "T1", subjectId: "S1", date: "2026-01-02", status: "A" }
      } },
      filters: { reportStudent: "All", reportSubject: "All", fromDate: "", toDate: "", semester: "All", threshold: 45 }
    };
    const summary = selectAttendanceSummary(state);
    expect(summary.present).toBe(1);
    expect(summary.absent).toBe(1);
    expect(summary.percentageByStudent[0].percentage).toBe(50);
  });
});