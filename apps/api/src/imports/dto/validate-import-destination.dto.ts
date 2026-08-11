import { IsUUID } from 'class-validator';

export class ValidateImportDestinationDto {
  @IsUUID()
  schoolYearId!: string;

  @IsUUID()
  sectionId!: string;
}
