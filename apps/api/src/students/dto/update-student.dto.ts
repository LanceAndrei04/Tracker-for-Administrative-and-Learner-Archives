import {
  IsDateString,
  IsOptional,
  IsString,
  Length,
  ValidateIf,
} from 'class-validator';

export class UpdateStudentDto {
  @ValidateIf((_object, value) => value !== undefined)
  @IsString()
  @Length(12, 12)
  lrn?: string;

  @ValidateIf((_object, value) => value !== undefined)
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  middleName?: string | null;

  @ValidateIf((_object, value) => value !== undefined)
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  suffix?: string | null;

  @ValidateIf((_object, value) => value !== undefined)
  @IsDateString()
  birthday?: string;

  @IsOptional()
  @IsString()
  birthplace?: string | null;

  @IsOptional()
  @IsString()
  address?: string | null;

  @IsOptional()
  @IsString()
  fatherName?: string | null;

  @IsOptional()
  @IsString()
  motherName?: string | null;

  @IsOptional()
  @IsString()
  guardianName?: string | null;

  @IsOptional()
  @IsString()
  contactNumber?: string | null;

  @IsOptional()
  @IsString()
  remarks?: string | null;
}
