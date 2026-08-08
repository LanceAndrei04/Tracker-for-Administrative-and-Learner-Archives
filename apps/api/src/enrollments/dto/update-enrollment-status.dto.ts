import { IsIn, IsString } from 'class-validator';

export class UpdateEnrollmentStatusDto {
  @IsString()
  @IsIn([
    'ACTIVE',
    'TRANSFERRED',
    'WITHDRAWN',
    'COMPLETED',
    'GRADUATED',
    'INACTIVE',
  ])
  status!: string;
}