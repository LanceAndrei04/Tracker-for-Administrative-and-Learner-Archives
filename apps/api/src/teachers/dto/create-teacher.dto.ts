import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { TeacherStationStatus } from '../../generated/prisma/client';

export class CreateTeacherDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  middleName?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  suffix?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  gender?: string;

  @IsOptional()
  @IsDateString()
  birthday?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  civilStatus?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  employeeNumber!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  designation!: string;

  @IsOptional()
  @IsEnum(TeacherStationStatus)
  stationStatus?: TeacherStationStatus;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  degreeFinished?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  prcSpecialization?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  minorSpecialization?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  postGraduateDegree?: string;

  @IsOptional()
  @IsDateString()
  originalAppointmentDate?: string;

  @IsOptional()
  @IsDateString()
  stationStartDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  cellphoneNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(254)
  personalEmail?: string;

  @IsOptional()
  @IsString()
  @MaxLength(254)
  depEdEmail?: string;

  @IsOptional()
  @IsString()
  @MaxLength(254)
  office365Account?: string;

  @IsOptional()
  @IsString()
  @MaxLength(254)
  r4a3Account?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  province?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  town?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  barangay?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  street?: string;
}
