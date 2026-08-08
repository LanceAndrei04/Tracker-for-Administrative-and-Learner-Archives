import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateGradeDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsInt()
  @Min(0)
  level!: number;
}