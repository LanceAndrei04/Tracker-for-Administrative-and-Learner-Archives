import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateSectionDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsUUID()
  gradeId!: string;

  @IsUUID()
  schoolYearId!: string;
}