import {
  Body,
  Controller,
  Get,
  Param,
  Post,
} from '@nestjs/common';
import { CreateSectionDto } from './dto/create-section.dto';
import { SectionsService } from './sections.service';

@Controller('sections')
export class SectionsController {
  constructor(
    private readonly sectionsService: SectionsService,
  ) {}

  @Get()
  findAll() {
    return this.sectionsService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.sectionsService.findById(id);
  }

  @Post()
  create(@Body() dto: CreateSectionDto) {
    return this.sectionsService.create(dto);
  }
}