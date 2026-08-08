import { IsUUID } from 'class-validator';

export class ChangeSectionDto {
  @IsUUID()
  sectionId!: string;
}