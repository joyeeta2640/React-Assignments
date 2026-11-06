import { createSelector } from "@reduxjs/toolkit";
import { studentSelectors } from "./studentsSlice";
import { attendanceSelectors } from "./attendanceSlice";

const selectAllStudents = studentSelectors.selectAll;
const selectAllAttendance = attendanceSelectors.selectAll;

export const selectFilteredStudents = createSelector(
  [selectAllStudents, state => state.filters],
  (students, filters) => students.filter(student => {
    const query = filters.search.trim().toLowerCase();
    return (!query || student.id.toLowerCase().includes(query) || student.name.toLowerCase().includes(query)) &&
      (filters.department === "All" || student.department === filters.department) &&
      (filters.semester === "All" || student.semester === filters.semester) &&
      (filters.section === "All" || student.section === filters.section);
  })
);

export const selectClassStudents = createSelector(
  [selectAllStudents, state => state.filters],
  (students, filters) => students.filter(student =>
    (filters.semester === "All" || student.semester === filters.semester) &&
    (filters.section === "All" || student.section === filters.section) &&
    (filters.department === "All" || student.department === filters.department)
  )
);

export const selectDailyAttendance = createSelector(
  [selectAllAttendance, state => state.filters],
  (records, filters) => records.filter(record =>
    record.date === filters.date &&
    (!filters.subjectId || record.subjectId === filters.subjectId)
  )
);

export const selectAttendanceSummary = createSelector(
  [selectAllStudents, selectAllAttendance, state => state.filters],
  (students, records, filters) => {
    const filteredRecords = records.filter(record =>
      (!filters.reportStudent || filters.reportStudent === "All" || record.studentId === filters.reportStudent) &&
      (!filters.reportSubject || filters.reportSubject === "All" || record.subjectId === filters.reportSubject) &&
      (!filters.fromDate || record.date >= filters.fromDate) &&
      (!filters.toDate || record.date <= filters.toDate) &&
      (filters.semester === "All" || students.find(s => s.id === record.studentId)?.semester === filters.semester)
    );
    const counts = { P: 0, A: 0, PL: 0, E: 0 };
    filteredRecords.forEach(record => { counts[record.status] = (counts[record.status] || 0) + 1; });
    const eligible = filteredRecords.filter(record => record.status === "P" || record.status === "A");
    const percentageByStudent = students.map(student => {
      const own = filteredRecords.filter(record => record.studentId === student.id);
      const considered = own.filter(record => record.status === "P" || record.status === "A");
      const present = considered.filter(record => record.status === "P").length;
      return {
        ...student,
        total: own.length,
        present,
        absent: considered.length - present,
        percentage: considered.length ? Math.round((present / considered.length) * 100) : 0
      };
    }).filter(item => item.total > 0);
    return {
      records: filteredRecords,
      counts,
      total: filteredRecords.length,
      present: counts.P,
      absent: counts.A,
      placed: counts.PL,
      engagement: counts.E,
      eligible: eligible.length,
      percentageByStudent
    };
  }
);

export const selectLowAttendanceStudents = createSelector(
  [selectAttendanceSummary, state => state.filters.threshold],
  (summary, threshold) => summary.percentageByStudent.filter(student => student.total > 0 && student.percentage < threshold)
);