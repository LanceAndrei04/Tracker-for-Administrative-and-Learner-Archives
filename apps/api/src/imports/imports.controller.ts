import {
  Body,
  Controller,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { ImportsService } from './imports.service';
import { ValidateImportDestinationDto } from './dto/validate-import-destination.dto';

@Controller('imports')
export class ImportsController {
  constructor(
    private readonly importsService: ImportsService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.importsService.upload(file);
  }

@Post(':id/preview')
preview(
  @Param('id') id: string,
  @Body() body: {
    sheetName: string;
    mappings: {
      columnIndex: number;
      targetField: string;
    }[];
  },
) {
  return this.importsService.preview(
    id,
    body,
  );
}

@Post(':id/validate-destination')
validateDestination(
  @Param('id') id: string,
  @Body() body: ValidateImportDestinationDto,
) {
  return this.importsService.validateDestination(
    id,
    body,
  );
}

@Post(':id/confirm')
confirm(
  @Param('id') id: string,

  @Body()
  body: {
    schoolYearId: string;
    sectionId: string;
  },
) {
  return this.importsService.confirm(
    id,
    body,
  );
}

}
