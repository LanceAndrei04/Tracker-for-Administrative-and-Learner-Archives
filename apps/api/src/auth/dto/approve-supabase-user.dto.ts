import { IsEmail, MaxLength } from 'class-validator';

export class ApproveSupabaseUserDto {
  @IsEmail()
  @MaxLength(254)
  email!: string;
}
