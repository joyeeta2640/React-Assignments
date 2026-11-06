import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import { LayoutDashboard, Users, ClipboardCheck, ChartNoAxesCombined, BookOpen, Plus, Search, Download, Trash2, Pencil, CalendarDays, GraduationCap, LogOut, CheckCircle2, XCircle, BriefcaseBusiness, FileCheck2 } from "lucide-react";
import { fetchStudents, addStudent, updateStudent, deleteStudent, studentSelectors } from "./studentsSlice";
import { attendanceSelectors, saveAttendance, upsertAttendance } from "./attendanceSlice";
import { setFilter, setActiveTab } from "./filtersSlice";
import { selectFilteredStudents, selectClassStudents, selectDailyAttendance, selectAttendanceSummary, selectLowAttendanceStudents } from "./selectors";
import { addSubject } from "./subjectsSlice";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const navItems = [
  ["Dashboard", LayoutDashboard], ["Students", Users], ["Attendance", ClipboardCheck],
  ["Reports", ChartNoAxesCombined], ["Subjects", BookOpen]
];
const statusLabels = { P: "Present", A: "Absent", PL: "Internship Placed", E: "Official Engagement" };
const statusClass = { P: "present", A: "absent", PL: "placed", E: "engagement" };
const emptyStudent = { id: "", name: "", department: "Computer Science", semester: "5", section: "A", email: "" };

function App() {
  const dispatch = useDispatch();
  const activeTab = useSelector(state => state.filters.activeTab);
  const filters = useSelector(state => state.filters);
  const students = useSelector(studentSelectors.selectAll);
  const subjects = useSelector(state => state.subjects);
  const filteredStudents = useSelector(selectFilteredStudents);
  const classStudents = useSelector(selectClassStudents);
  const dailyRecords = useSelector(selectDailyAttendance);
  const summary = useSelector(selectAttendanceSummary);
  const lowAttendance = useSelector(selectLowAttendanceStudents);
  const attendance = useSelector(attendanceSelectors.selectAll);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [studentForm, setStudentForm] = useState(emptyStudent);
  const [subjectForm, setSubjectForm] = useState({ id: "", name: "", semester: "5", department: "Computer Science" });
  const [toast, setToast] = useState("");

  useEffect(() => { if (!students.length) dispatch(fetchStudents()); }, [dispatch]); // eslint-disable-line
  const set = (key, value) => dispatch(setFilter({ key, value }));
  const selectedSubject = subjects.find(subject => subject.id === filters.subjectId) || subjects[0];

  const counts = useMemo(() => {
    const todayRecords = attendance.filter(record => record.date === filters.date);
    return {
      total: students.length,
      present: todayRecords.filter(record => record.status === "P").length,
      absent: todayRecords.filter(record => record.status === "A").length,
      placed: todayRecords.filter(record => record.status === "PL").length,
      engagement: todayRecords.filter(record => record.status === "E").length
    };
  }, [attendance, filters.date, students.length]);

  function notify(message) { setToast(message); window.setTimeout(() => setToast(""), 2600); }
  function openAdd() { setEditing(null); setStudentForm(emptyStudent); setModal(true); }
  function openEdit(student) { setEditing(student.id); setStudentForm(student); setModal(true); }
  function saveStudent(event) {
    event.preventDefault();
    const record = { ...studentForm, id: studentForm.id.trim().toUpperCase(), name: studentForm.name.trim(), email: studentForm.email.trim() };
    if (!record.id || !record.name || !record.email) return notify("Please complete all required fields.");
    if (!editing && students.some(student => student.id === record.id)) return notify("Student ID already exists.");
    if (editing) dispatch(updateStudent({ id: editing, changes: record }));
    else dispatch(addStudent(record));
    setModal(false); notify(editing ? "Student updated." : "Student added.");
  }
  function markStudent(studentId, status) {
    if (!selectedSubject) return notify("Please add/select a subject first.");
    dispatch(upsertAttendance({
      studentId, subjectId: selectedSubject.id, date: filters.date,
      semester: filters.semester === "All" ? students.find(s => s.id === studentId)?.semester : filters.semester,
      section: students.find(s => s.id === studentId)?.section,
      status, updatedAt: new Date().toISOString()
    }));
  }
  function saveAll() {
    const records = classStudents.map(student => ({
      studentId: student.id, subjectId: selectedSubject?.id || "",
      date: filters.date, semester: student.semester, section: student.section,
      status: dailyRecords.find(record => record.studentId === student.id && record.subjectId === selectedSubject?.id)?.status || "A",
      updatedAt: new Date().toISOString()
    }));
    dispatch(saveAttendance(records)).unwrap().then(() => notify("Attendance saved successfully.")).catch(() => notify("Could not save attendance."));
  }
  function exportCSV() {
    const rows = [["Student ID", "Name", "Department", "Semester", "Section", "Subject", "Date", "Status"]];
    summary.records.forEach(record => {
      const student = students.find(item => item.id === record.studentId);
      const subject = subjects.find(item => item.id === record.subjectId);
      if (student) rows.push([student.id, student.name, student.department, student.semester, student.section, subject?.name || record.subjectId, record.date, statusLabels[record.status]]);
    });
    const csv = rows.map(row => row.map(value => `"${String(value ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a"); link.href = url; link.download = "attendance-report.csv"; link.click(); URL.revokeObjectURL(url);
  }
  const chartData = {
    labels: ["Present", "Absent", "Internship", "Engagement"],
    datasets: [{ data: [summary.counts.P, summary.counts.A, summary.counts.PL, summary.counts.E], backgroundColor: ["#16a085", "#ef6b73", "#8b7cf6", "#e7a23b"], borderWidth: 0 }]
  };
  const monthlyData = (() => {
    const byMonth = {};
    summary.records.forEach(record => {
      const month = record.date.slice(0, 7); byMonth[month] ||= { present: 0, absent: 0 };
      if (record.status === "P") byMonth[month].present++;
      if (record.status === "A") byMonth[month].absent++;
    });
    return { labels: Object.keys(byMonth).sort(), datasets: [
      { label: "Present", data: Object.keys(byMonth).sort().map(key => byMonth[key].present), backgroundColor: "#16a085", borderRadius: 6 },
      { label: "Absent", data: Object.keys(byMonth).sort().map(key => byMonth[key].absent), backgroundColor: "#ef6b73", borderRadius: 6 }
    ] };
  })();

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark">A</div><div><b>AttendEase</b><small>STUDENT PORTAL</small></div></div>
      <div className="nav-caption">WORKSPACE</div>
      <nav>{navItems.map(([label, Icon]) => <button key={label} className={`nav-link ${activeTab === label ? "active" : ""}`} onClick={() => dispatch(setActiveTab(label))}><Icon size={18}/>{label}</button>)}</nav>
      <div className="sidebar-bottom"><div className="help-card"><div className="help-icon"><GraduationCap size={19}/></div><b>Attendance made simple</b><p>Manage classes and keep track of every student's progress.</p></div><div className="profile"><div className="avatar">AD</div><div><b>Admin Dashboard</b><small>Administrator</small></div><LogOut size={17}/></div></div>
    </aside>
    <main className="main-area">
      <header className="topbar"><div><span className="breadcrumb">Workspace / </span><b>{activeTab}</b></div><div className="top-actions"><span className="today-pill"><CalendarDays size={15}/>{new Date().toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}</span><div className="avatar">AD</div></div></header>
      <div className="content">
        <div className="page-heading"><div><p className="eyebrow">OVERVIEW</p><h1>{activeTab === "Dashboard" ? "Good day, Administrator 👋" : activeTab}</h1><p className="muted">{activeTab === "Dashboard" ? "Here's what's happening with your students today." : `Manage your ${activeTab.toLowerCase()} and keep everything organized.`}</p></div>{activeTab === "Students" && <button className="primary-btn" onClick={openAdd}><Plus size={17}/> Add Student</button>}</div>
        {activeTab === "Dashboard" && <>
          <div className="stats-grid">
            <Stat icon={Users} label="Total Students" value={counts.total} tone="purple" note="Registered students"/>
            <Stat icon={CheckCircle2} label="Present Today" value={counts.present} tone="green" note="Marked present"/>
            <Stat icon={XCircle} label="Absent Today" value={counts.absent} tone="red" note="Marked absent"/>
            <Stat icon={BriefcaseBusiness} label="Internship Placed" value={counts.placed} tone="orange" note="Marked PL"/>
          </div>
          <div className="dashboard-grid">
            <section className="panel"><div className="panel-head"><div><h3>Attendance overview</h3><p className="muted">Status distribution for selected date</p></div><input className="date-input" type="date" value={filters.date} onChange={e=>set("date",e.target.value)}/></div><div className="chart-wrap"><div className="doughnut"><Doughnut data={chartData} options={{maintainAspectRatio:false,cutout:"72%",plugins:{legend:{display:false}}}}/><div className="chart-center"><b>{summary.total}</b><small>Records</small></div></div><div className="legend-list">{[["Present",summary.counts.P,"#16a085"],["Absent",summary.counts.A,"#ef6b73"],["Internship",summary.counts.PL,"#8b7cf6"],["Engagement",summary.counts.E,"#e7a23b"]].map(([label,value,color])=><div className="legend-row" key={label}><span><i style={{background:color}}/>{label}</span><b>{value}</b></div>)}</div></div></section>
            <section className="panel"><div className="panel-head"><div><h3>Attendance watchlist</h3><p className="muted">Students below your threshold</p></div><span className="alert-count">{lowAttendance.length} flagged</span></div><div className="threshold-control"><label>Alert threshold <b>{filters.threshold}%</b></label><input type="range" min="10" max="90" step="5" value={filters.threshold} onChange={e=>set("threshold",Number(e.target.value))}/></div>{lowAttendance.length ? <div className="watch-list">{lowAttendance.slice(0,4).map(student=><div className="watch-row" key={student.id}><div className="mini-avatar">{student.name.split(" ").map(n=>n[0]).join("").slice(0,2)}</div><div className="watch-name"><b>{student.name}</b><small>{student.id}</small></div><span className="percent-low">{student.percentage}%</span></div>)}</div> : <div className="empty-state compact">No students below {filters.threshold}% in the selected report range.</div>}</section>
          </div>
          <section className="panel"><div className="panel-head"><div><h3>Recent student records</h3><p className="muted">Your recently registered students</p></div><button className="text-btn" onClick={()=>dispatch(setActiveTab("Students"))}>View all students →</button></div><StudentTable students={students.slice(0,5)} onEdit={openEdit} onDelete={id=>{dispatch(deleteStudent(id));notify("Student deleted.");}} showActions={false}/></section>
        </>}
        {activeTab === "Students" && <section className="panel"><div className="toolbar"><div className="search-box"><Search size={17}/><input placeholder="Search by student ID or name..." value={filters.search} onChange={e=>set("search",e.target.value)}/></div><select value={filters.department} onChange={e=>set("department",e.target.value)}><option>All</option>{[...new Set(students.map(s=>s.department))].map(d=><option key={d}>{d}</option>)}</select><select value={filters.semester} onChange={e=>set("semester",e.target.value)}><option>All</option>{[...new Set(students.map(s=>s.semester))].sort().map(s=><option key={s}>{s}</option>)}</select><select value={filters.section} onChange={e=>set("section",e.target.value)}><option>All</option>{["A","B","C"].map(s=><option key={s}>{s}</option>)}</select></div><StudentTable students={filteredStudents} onEdit={openEdit} onDelete={id=>{dispatch(deleteStudent(id));notify("Student deleted.");}} showActions/><p className="table-foot">Showing {filteredStudents.length} of {students.length} students</p></section>}
        {activeTab === "Attendance" && <section className="panel"><div className="attendance-filters"><div><label>Attendance date</label><input type="date" value={filters.date} onChange={e=>set("date",e.target.value)}/></div><div><label>Subject</label><select value={filters.subjectId || subjects[0]?.id || ""} onChange={e=>set("subjectId",e.target.value)}>{subjects.map(subject=><option key={subject.id} value={subject.id}>{subject.name}</option>)}</select></div><div><label>Semester</label><select value={filters.semester} onChange={e=>set("semester",e.target.value)}><option>All</option>{["1","2","3","4","5","6","7","8"].map(s=><option key={s} value={s}>{s}</option>)}</select></div><div><label>Section</label><select value={filters.section} onChange={e=>set("section",e.target.value)}><option>All</option>{["A","B","C"].map(s=><option key={s}>{s}</option>)}</select></div></div><div className="attendance-summary"><span><b>{classStudents.length}</b> students in class</span><span><b>{dailyRecords.length}</b> marked in this subject/date</span><button className="primary-btn small" onClick={saveAll}>Save attendance</button></div><div className="attendance-list">{classStudents.map(student=>{const record=dailyRecords.find(item=>item.studentId===student.id && item.subjectId===selectedSubject?.id);return <div className="attendance-row" key={student.id}><div className="student-cell"><div className="mini-avatar">{student.name.split(" ").map(n=>n[0]).join("").slice(0,2)}</div><div><b>{student.name}</b><small>{student.id} · {student.section}</small></div></div><div className="status-options">{["P","A","PL","E"].map(status=><button key={status} title={statusLabels[status]} className={`status-btn ${statusClass[status]} ${record?.status===status?"selected":""}`} onClick={()=>markStudent(student.id,status)}>{status}</button>)}</div><span className={`status-label ${record ? statusClass[record.status] : ""}`}>{record ? statusLabels[record.status] : "Not marked"}</span></div>})}{!classStudents.length&&<div className="empty-state">No students match the selected class filters.</div>}</div><p className="hint">P = Present · A = Absent · PL = Internship Placed · E = Official Engagement. Selecting a status again updates the existing record instead of creating a duplicate.</p></section>}
        {activeTab === "Reports" && <><section className="panel"><div className="panel-head"><div><h3>Attendance reports</h3><p className="muted">Filter and export attendance records</p></div><button className="outline-btn" onClick={exportCSV}><Download size={16}/> Export CSV</button></div><div className="report-filters"><div><label>Student</label><select value={filters.reportStudent} onChange={e=>set("reportStudent",e.target.value)}><option>All</option>{students.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div><div><label>Subject</label><select value={filters.reportSubject} onChange={e=>set("reportSubject",e.target.value)}><option>All</option>{subjects.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div><div><label>From date</label><input type="date" value={filters.fromDate} onChange={e=>set("fromDate",e.target.value)}/></div><div><label>To date</label><input type="date" value={filters.toDate} onChange={e=>set("toDate",e.target.value)}/></div></div><div className="report-kpis"><MiniKpi label="Total records" value={summary.total}/><MiniKpi label="Present" value={summary.present}/><MiniKpi label="Absent" value={summary.absent}/><MiniKpi label="Other statuses" value={summary.placed+summary.engagement}/></div><div className="report-chart"><div><h3>Monthly attendance</h3><p className="muted">Present and absent records by month</p><Bar data={monthlyData} options={{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:"bottom"}},scales:{y:{beginAtZero:true,ticks:{precision:0}}}}}/></div><div><h3>Status breakdown</h3><p className="muted">Filtered attendance records</p><div className="report-donut"><Doughnut data={chartData} options={{maintainAspectRatio:false,plugins:{legend:{position:"bottom"}}}}/></div></div></div></section><section className="panel"><div className="panel-head"><div><h3>Individual attendance percentage</h3><p className="muted">Present ÷ (Present + Absent). PL and E are excluded.</p></div></div><div className="table-scroll"><table><thead><tr><th>Student</th><th>Department</th><th>Present</th><th>Absent</th><th>Total records</th><th>Percentage</th></tr></thead><tbody>{summary.percentageByStudent.map(student=><tr key={student.id}><td><b>{student.name}</b><small className="sub-cell">{student.id}</small></td><td>{student.department}</td><td>{student.present}</td><td>{student.absent}</td><td>{student.total}</td><td><div className="progress-cell"><div className="progress"><span style={{width:`${student.percentage}%`}}/></div><b className={student.percentage<filters.threshold?"percent-low":""}>{student.percentage}%</b></div></td></tr>)}</tbody></table></div></section></>}
        {activeTab === "Subjects" && <section className="panel"><div className="panel-head"><div><h3>Subjects</h3><p className="muted">Manage subjects available for attendance</p></div></div><form className="subject-form" onSubmit={event=>{event.preventDefault();if(!subjectForm.id||!subjectForm.name)return notify("Enter subject ID and name.");if(subjects.some(s=>s.id===subjectForm.id))return notify("Subject ID already exists.");dispatch(addSubject(subjectForm));setSubjectForm({id:"",name:"",semester:"5",department:"Computer Science"});notify("Subject added.");}}><input placeholder="Subject ID (e.g. SUB401)" value={subjectForm.id} onChange={e=>setSubjectForm({...subjectForm,id:e.target.value.toUpperCase()})}/><input placeholder="Subject name" value={subjectForm.name} onChange={e=>setSubjectForm({...subjectForm,name:e.target.value})}/><select value={subjectForm.semester} onChange={e=>setSubjectForm({...subjectForm,semester:e.target.value})}>{["1","2","3","4","5","6","7","8"].map(s=><option key={s} value={s}>Semester {s}</option>)}</select><select value={subjectForm.department} onChange={e=>setSubjectForm({...subjectForm,department:e.target.value})}>{["Computer Science","Information Technology","Electronics"].map(d=><option key={d}>{d}</option>)}</select><button className="primary-btn" type="submit"><Plus size={16}/> Add subject</button></form><div className="subject-grid">{subjects.map(subject=><div className="subject-card" key={subject.id}><div className="subject-icon"><BookOpen size={20}/></div><div><b>{subject.name}</b><small>{subject.id} · Semester {subject.semester}</small><small>{subject.department}</small></div></div>)}</div></section>}
      </div>
      <footer>© 2026 AttendEase · Student Attendance Management System</footer>
    </main>
    {modal && <div className="modal-backdrop" onClick={()=>setModal(false)}><form className="modal" onClick={e=>e.stopPropagation()} onSubmit={saveStudent}><div className="modal-head"><div><h2>{editing?"Edit student":"Add new student"}</h2><p className="muted">Enter the student's academic details.</p></div><button type="button" className="icon-btn" onClick={()=>setModal(false)}>×</button></div><div className="form-grid"><div><label>Student ID *</label><input required disabled={!!editing} value={studentForm.id} onChange={e=>setStudentForm({...studentForm,id:e.target.value})} placeholder="TIU009"/></div><div><label>Full name *</label><input required value={studentForm.name} onChange={e=>setStudentForm({...studentForm,name:e.target.value})} placeholder="Student name"/></div><div><label>Department</label><select value={studentForm.department} onChange={e=>setStudentForm({...studentForm,department:e.target.value})}>{["Computer Science","Information Technology","Electronics"].map(d=><option key={d}>{d}</option>)}</select></div><div><label>Semester</label><select value={studentForm.semester} onChange={e=>setStudentForm({...studentForm,semester:e.target.value})}>{["1","2","3","4","5","6","7","8"].map(s=><option key={s}>{s}</option>)}</select></div><div><label>Section</label><select value={studentForm.section} onChange={e=>setStudentForm({...studentForm,section:e.target.value})}>{["A","B","C"].map(s=><option key={s}>{s}</option>)}</select></div><div><label>Email *</label><input required type="email" value={studentForm.email} onChange={e=>setStudentForm({...studentForm,email:e.target.value})} placeholder="student@example.com"/></div></div><div className="modal-actions"><button type="button" className="outline-btn" onClick={()=>setModal(false)}>Cancel</button><button className="primary-btn" type="submit">{editing?"Save changes":"Add student"}</button></div></form></div>}
    {toast && <div className="toast">{toast}</div>}
  </div>;
}

function Stat({icon:Icon,label,value,tone,note}) { return <div className="stat-card"><div className={`stat-icon ${tone}`}><Icon size={19}/></div><p>{label}</p><h2>{value}</h2><small>{note}</small></div>; }
function MiniKpi({label,value}) { return <div className="mini-kpi"><small>{label}</small><b>{value}</b></div>; }
function StudentTable({students,onEdit,onDelete,showActions}) { return <div className="table-scroll"><table><thead><tr><th>Student</th><th>Department</th><th>Semester</th><th>Section</th><th>Email</th>{showActions&&<th>Actions</th>}</tr></thead><tbody>{students.map(student=><tr key={student.id}><td><div className="student-cell"><div className="mini-avatar">{student.name.split(" ").map(n=>n[0]).join("").slice(0,2)}</div><div><b>{student.name}</b><small>{student.id}</small></div></div></td><td>{student.department}</td><td>{student.semester}</td><td><span className="section-tag">{student.section}</span></td><td>{student.email}</td>{showActions&&<td><div className="action-buttons"><button className="icon-btn" title="Edit" onClick={()=>onEdit(student)}><Pencil size={15}/></button><button className="icon-btn danger" title="Delete" onClick={()=>onDelete(student.id)}><Trash2 size={15}/></button></div></td>}</tr>)}</tbody></table>{!students.length&&<div className="empty-state">No students found. Try changing your filters.</div>}</div>; }

export default App;