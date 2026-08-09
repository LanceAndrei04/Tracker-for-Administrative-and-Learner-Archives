import { activity, files, schoolYears, students, teachers } from "@/lib/mock-data/tala";

// Temporary adapter: replace only this module with real authenticated API calls.
// UI components consume these functions and never import mock data directly.
export const talaApi = {
  getDashboard: async () => ({ students: 412, teachers: 28, sections: 16, files: 126, activity }),
  getStudents: async () => students,
  getStudent: async (id: string) => students.find((student) => student.id === id) ?? students[0],
  getTeachers: async () => teachers,
  getFiles: async () => files,
  getSchoolYears: async () => schoolYears,
};
