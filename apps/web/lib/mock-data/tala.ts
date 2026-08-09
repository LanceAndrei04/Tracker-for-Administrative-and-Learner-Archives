export type Student = {
  id: string;
  name: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  suffix?: string;
  lrn: string;
  grade: string;
  section: string;
  status: "Active" | "Transferred";
  updatedAt: string;
  birthday: string;
  birthplace: string;
  address: string;
  contactNumber: string;
  guardian: string;
  remarks?: string;
  photoUrl?: string;
};

export type Teacher = {
  id: string;
  name: string;
  employeeNumber: string;
  designation: string;
  status: "Permanent" | "Contractual";
  updatedAt: string;
  contactNumber: string;
};

export const schoolYears = [
  { id: "sy-2026", label: "2026–2027", active: true },
  { id: "sy-2025", label: "2025–2026", active: false },
];

export const students: Student[] = [
  { id: "ana-santos", name: "Ana Santos", firstName: "Ana", middleName: "Marie", lastName: "Santos", lrn: "123457000001", grade: "Grade 6", section: "Rizal", status: "Active", updatedAt: "Today, 9:42 AM", birthday: "May 18, 2014", birthplace: "Quezon City", address: "18 Sampaguita Street, Quezon City", contactNumber: "0917 555 0182", guardian: "Maribel Santos", remarks: "Prefers guardian contact after 3 PM." },
  { id: "miguel-reyes", name: "Miguel Reyes", firstName: "Miguel", lastName: "Reyes", lrn: "123457000002", grade: "Grade 6", section: "Rizal", status: "Active", updatedAt: "Yesterday", birthday: "August 2, 2014", birthplace: "Manila", address: "41 Mabini Street, Quezon City", contactNumber: "0918 555 0174", guardian: "Joseph Reyes" },
  { id: "luis-cruz", name: "Luis Cruz", firstName: "Luis", lastName: "Cruz", lrn: "123457000003", grade: "Grade 5", section: "Mabini", status: "Active", updatedAt: "Aug 6", birthday: "January 13, 2015", birthplace: "Caloocan", address: "12 P. Tuazon Boulevard, Quezon City", contactNumber: "0920 555 0161", guardian: "Lea Cruz" },
  { id: "samira-tan", name: "Samira Tan", firstName: "Samira", lastName: "Tan", lrn: "123457000004", grade: "Grade 5", section: "Luna", status: "Active", updatedAt: "Aug 5", birthday: "November 27, 2015", birthplace: "Quezon City", address: "7 Aurora Boulevard, Quezon City", contactNumber: "0917 555 0146", guardian: "Noel Tan" },
  { id: "joseph-dela-cruz", name: "Joseph dela Cruz", firstName: "Joseph", lastName: "dela Cruz", lrn: "123457000005", grade: "Grade 4", section: "Bonifacio", status: "Active", updatedAt: "Aug 4", birthday: "March 8, 2016", birthplace: "Marikina", address: "63 Katipunan Avenue, Quezon City", contactNumber: "0919 555 0123", guardian: "Rosa dela Cruz" },
  { id: "bianca-lim", name: "Bianca Lim", firstName: "Bianca", lastName: "Lim", lrn: "123457000006", grade: "Grade 4", section: "Bonifacio", status: "Active", updatedAt: "Aug 2", birthday: "June 21, 2016", birthplace: "Manila", address: "29 West Avenue, Quezon City", contactNumber: "0917 555 0117", guardian: "Regina Lim" },
];

export const teachers: Teacher[] = [
  { id: "maria-cruz", name: "Maria Cruz", employeeNumber: "T-2020-014", designation: "Teacher III", status: "Permanent", updatedAt: "Today, 10:12 AM", contactNumber: "0917 555 0199" },
  { id: "josephine-ramos", name: "Josephine Ramos", employeeNumber: "T-2018-008", designation: "Master Teacher I", status: "Permanent", updatedAt: "Aug 7", contactNumber: "0918 555 0135" },
  { id: "Ernesto-garcia", name: "Ernesto Garcia", employeeNumber: "T-2024-021", designation: "Teacher I", status: "Contractual", updatedAt: "Aug 4", contactNumber: "0919 555 0171" },
];

export const files = [
  { id: "birth-cert", name: "Birth_Certificate.pdf", linkedTo: "Ana Santos", category: "Student document", schoolYear: "2026–2027", uploaded: "Today", size: "1.2 MB" },
  { id: "masterlist", name: "Grade6_Masterlist.xlsx", linkedTo: "School record", category: "School document", schoolYear: "2026–2027", uploaded: "Aug 7", size: "36 KB" },
  { id: "prc", name: "PRC_License.pdf", linkedTo: "Maria Cruz", category: "Teacher document", schoolYear: "2026–2027", uploaded: "Aug 4", size: "842 KB" },
];

export const activity = [
  { title: "7 Grade 6 students imported", when: "Today, 9:30 AM", kind: "Import" },
  { title: "Ana Santos’ contact number updated", when: "Today, 9:12 AM", kind: "Student" },
  { title: "Birth_Certificate.pdf uploaded", when: "Yesterday", kind: "File" },
  { title: "Teacher record created for Ernesto Garcia", when: "Aug 6", kind: "Teacher" },
];
