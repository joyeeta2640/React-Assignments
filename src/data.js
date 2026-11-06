export const initialStudents = [
  { id: "TIU001", name: "Aarav Sharma", department: "Computer Science", semester: "5", section: "A", email: "aarav@example.com" },
  { id: "TIU002", name: "Ananya Das", department: "Computer Science", semester: "5", section: "A", email: "ananya@example.com" },
  { id: "TIU003", name: "Rohan Ghosh", department: "Information Technology", semester: "5", section: "A", email: "rohan@example.com" },
  { id: "TIU004", name: "Priya Sen", department: "Computer Science", semester: "5", section: "B", email: "priya@example.com" },
  { id: "TIU005", name: "Ishaan Roy", department: "Information Technology", semester: "3", section: "A", email: "ishaan@example.com" },
  { id: "TIU006", name: "Meera Paul", department: "Electronics", semester: "3", section: "B", email: "meera@example.com" },
  { id: "TIU007", name: "Kabir Mukherjee", department: "Computer Science", semester: "5", section: "A", email: "kabir@example.com" },
  { id: "TIU008", name: "Diya Banerjee", department: "Electronics", semester: "5", section: "B", email: "diya@example.com" }
];

export const initialSubjects = [
  { id: "SUB101", name: "Data Structures", semester: "5", department: "Computer Science" },
  { id: "SUB102", name: "Database Management", semester: "5", department: "Computer Science" },
  { id: "SUB103", name: "Web Technology", semester: "5", department: "Computer Science" },
  { id: "SUB201", name: "Computer Networks", semester: "3", department: "Information Technology" },
  { id: "SUB301", name: "Digital Electronics", semester: "5", department: "Electronics" }
];

export const today = new Date().toISOString().slice(0, 10);