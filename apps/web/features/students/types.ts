export type Grade = { id: string; name: string; level: number };
export type SchoolYear = { id: string; label: string; isActive: boolean };
export type Section = { id: string; name: string; gradeId: string; schoolYearId: string; grade: Grade; schoolYear: SchoolYear };
export type Enrollment = { id: string; studentId: string; sectionId: string; schoolYearId: string; status: string; dateEnrolled?: string | null; createdAt: string; updatedAt: string; section: Section; schoolYear: SchoolYear };
export type Student = { id: string; lrn: string | null; firstName: string; middleName: string | null; lastName: string; suffix: string | null; birthday: string | null; birthplace: string | null; address: string | null; fatherName: string | null; motherName: string | null; guardianName: string | null; contactNumber: string | null; remarks: string | null; createdAt: string; updatedAt: string; enrollments: Enrollment[] };
export type StudentListResponse = { data: Student[]; meta: { page: number; limit: number; total: number; totalPages: number } };
export type StudentListQuery = { page: number; limit: number; search?: string; schoolYearId?: string; gradeId?: string; sectionId?: string };
