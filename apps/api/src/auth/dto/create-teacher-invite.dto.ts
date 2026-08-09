import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateTeacherInviteDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  fullName!: string;

  @IsEmail()
  @MaxLength(254)
  email!: string;
}
