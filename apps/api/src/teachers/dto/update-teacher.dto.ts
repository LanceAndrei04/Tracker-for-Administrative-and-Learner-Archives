import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, ValidateIf } from 'class-validator';
import { TeacherStationStatus } from '../../generated/prisma/client';

export class UpdateTeacherDto {
  @ValidateIf((_object, value) => value !== undefined)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  middleName?: string | null;

  @ValidateIf((_object, value) => value !== undefined)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  suffix?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  gender?: string | null;

  @IsOptional()
  @IsDateString()
  birthday?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  civilStatus?: string | null;

  @ValidateIf((_object, value) => value !== undefined)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  employeeNumber?: string;

  @ValidateIf((_object, value) => value !== undefined)
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  designation?: string;

  @IsOptional()
  @IsEnum(TeacherStationStatus)
  stationStatus?: TeacherStationStatus | null;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  degreeFinished?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  prcSpecialization?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  minorSpecialization?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  postGraduateDegree?: string | null;

  @IsOptional()
  @IsDateString()
  originalAppointmentDate?: string | null;

  @IsOptional()
  @IsDateString()
  stationStartDate?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  cellphoneNumber?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(254)
  personalEmail?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(254)
  depEdEmail?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(254)
  office365Account?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(254)
  r4a3Account?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  province?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  town?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  barangay?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  street?: string | null;
}
