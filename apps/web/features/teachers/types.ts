export type TeacherStationStatus = "OWN_STATION" | "REASSIGNED" | "BORROWED" | "CLUSTERED";

export type TeacherDirectoryRecord = {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  suffix: string | null;
  employeeNumber: string;
  designation: string;
  stationStatus: TeacherStationStatus | null;
  createdAt: string;
  updatedAt: string;
};

export type Teacher = TeacherDirectoryRecord & {
  gender?: string | null;
  birthday?: string | null;
  civilStatus?: string | null;
  degreeFinished?: string | null;
  prcSpecialization?: string | null;
  minorSpecialization?: string | null;
  postGraduateDegree?: string | null;
  originalAppointmentDate?: string | null;
  stationStartDate?: string | null;
  cellphoneNumber?: string | null;
  personalEmail?: string | null;
  depEdEmail?: string | null;
  office365Account?: string | null;
  r4a3Account?: string | null;
  province?: string | null;
  town?: string | null;
  barangay?: string | null;
  street?: string | null;
};

export type TeacherListQuery = { page: number; limit: number; search?: string };
export type TeacherListResponse = { data: TeacherDirectoryRecord[]; meta: { page: number; limit: number; total: number; totalPages: number } };

export type CreateTeacherInput = {
  firstName: string;
  middleName?: string;
  lastName: string;
  suffix?: string;
  employeeNumber: string;
  designation: string;
  stationStatus?: TeacherStationStatus;
  gender?: string;
  birthday?: string;
  civilStatus?: string;
  degreeFinished?: string;
  prcSpecialization?: string;
  minorSpecialization?: string;
  postGraduateDegree?: string;
  originalAppointmentDate?: string;
  stationStartDate?: string;
  cellphoneNumber?: string;
  personalEmail?: string;
  depEdEmail?: string;
  office365Account?: string;
  r4a3Account?: string;
  province?: string;
  town?: string;
  barangay?: string;
  street?: string;
};

export type UpdateTeacherInput = Required<Pick<Teacher,
  | "firstName"
  | "middleName"
  | "lastName"
  | "suffix"
  | "employeeNumber"
  | "designation"
  | "stationStatus"
  | "gender"
  | "birthday"
  | "civilStatus"
  | "degreeFinished"
  | "prcSpecialization"
  | "minorSpecialization"
  | "postGraduateDegree"
  | "originalAppointmentDate"
  | "stationStartDate"
  | "cellphoneNumber"
  | "personalEmail"
  | "depEdEmail"
  | "office365Account"
  | "r4a3Account"
  | "province"
  | "town"
  | "barangay"
  | "street"
>;
