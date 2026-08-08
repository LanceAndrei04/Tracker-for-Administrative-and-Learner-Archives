import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateSchoolYearDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{4}$/, {
    message: 'School year must use the format YYYY-YYYY',
  })
  label!: string;
}