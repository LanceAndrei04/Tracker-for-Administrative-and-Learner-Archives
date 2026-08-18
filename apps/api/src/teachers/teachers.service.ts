import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '../generated/prisma/client';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { TeacherQueryDto } from './dto/teacher-query.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { TeachersRepository } from './teachers.repository';

type NullableString = string | null | undefined;
type NullableDate = string | null | undefined;

@Injectable()
export class TeachersService {
  constructor(private readonly teachersRepository: TeachersRepository) {}

  findAll(query: TeacherQueryDto) {
    return this.teachersRepository.findAllDirectory(query);
  }

  async findById(id: string) {
    const teacher = await this.teachersRepository.findFullById(id);
    if (!teacher) throw new NotFoundException('Teacher not found.');
    return teacher;
  }

  async create(dto: CreateTeacherDto) {
    const employeeNumber = dto.employeeNumber.trim();
    const existing = await this.teachersRepository.findByEmployeeNumber(employeeNumber);
    if (existing) throw new ConflictException('A teacher with this employee number already exists.');
    return this.teachersRepository.create({
      firstName: dto.firstName.trim(),
      middleName: this.optionalCreateString(dto.middleName),
      lastName: dto.lastName.trim(),
      suffix: this.optionalCreateString(dto.suffix),
      gender: this.optionalCreateString(dto.gender),
      birthday: this.toCreateDate(dto.birthday),
      civilStatus: this.optionalCreateString(dto.civilStatus),
      employeeNumber,
      designation: dto.designation.trim(),
      stationStatus: dto.stationStatus,
      degreeFinished: this.optionalCreateString(dto.degreeFinished),
      prcSpecialization: this.optionalCreateString(dto.prcSpecialization),
      minorSpecialization: this.optionalCreateString(dto.minorSpecialization),
      postGraduateDegree: this.optionalCreateString(dto.postGraduateDegree),
      originalAppointmentDate: this.toCreateDate(dto.originalAppointmentDate),
      stationStartDate: this.toCreateDate(dto.stationStartDate),
      cellphoneNumber: this.optionalCreateString(dto.cellphoneNumber),
      personalEmail: this.optionalCreateString(dto.personalEmail),
      depEdEmail: this.optionalCreateString(dto.depEdEmail),
      office365Account: this.optionalCreateString(dto.office365Account),
      r4a3Account: this.optionalCreateString(dto.r4a3Account),
      province: this.optionalCreateString(dto.province),
      town: this.optionalCreateString(dto.town),
      barangay: this.optionalCreateString(dto.barangay),
      street: this.optionalCreateString(dto.street),
    });
  }

  async update(id: string, dto: UpdateTeacherDto) {
    const teacher = await this.teachersRepository.findFullById(id);
    if (!teacher) throw new NotFoundException('Teacher not found.');
    if (dto.employeeNumber !== undefined) {
      const employeeNumber = dto.employeeNumber.trim();
      if (employeeNumber !== teacher.employeeNumber) {
        const existing = await this.teachersRepository.findByEmployeeNumber(employeeNumber);
        if (existing && existing.id !== id) throw new ConflictException('A teacher with this employee number already exists.');
      }
    }
    return this.teachersRepository.update(id, this.toUpdateData(dto));
  }

  private optionalCreateString(value: string | undefined) {
    return value === undefined ? undefined : value.trim() || undefined;
  }

  private optionalUpdateString(value: NullableString) {
    if (value === undefined || value === null) return value;
    return value.trim() || null;
  }

  private toCreateDate(value: string | undefined) {
    return value === undefined ? undefined : new Date(value);
  }

  private toUpdateDate(value: NullableDate) {
    if (value === undefined || value === null) return value;
    return new Date(value);
  }

  private toUpdateData(dto: UpdateTeacherDto): Prisma.TeacherUpdateInput {
    return {
      firstName: dto.firstName === undefined ? undefined : dto.firstName.trim(),
      middleName: this.optionalUpdateString(dto.middleName),
      lastName: dto.lastName === undefined ? undefined : dto.lastName.trim(),
      suffix: this.optionalUpdateString(dto.suffix),
      gender: this.optionalUpdateString(dto.gender),
      birthday: this.toUpdateDate(dto.birthday),
      civilStatus: this.optionalUpdateString(dto.civilStatus),
      employeeNumber: dto.employeeNumber === undefined ? undefined : dto.employeeNumber.trim(),
      designation: dto.designation === undefined ? undefined : dto.designation.trim(),
      stationStatus: dto.stationStatus,
      degreeFinished: this.optionalUpdateString(dto.degreeFinished),
      prcSpecialization: this.optionalUpdateString(dto.prcSpecialization),
      minorSpecialization: this.optionalUpdateString(dto.minorSpecialization),
      postGraduateDegree: this.optionalUpdateString(dto.postGraduateDegree),
      originalAppointmentDate: this.toUpdateDate(dto.originalAppointmentDate),
      stationStartDate: this.toUpdateDate(dto.stationStartDate),
      cellphoneNumber: this.optionalUpdateString(dto.cellphoneNumber),
      personalEmail: this.optionalUpdateString(dto.personalEmail),
      depEdEmail: this.optionalUpdateString(dto.depEdEmail),
      office365Account: this.optionalUpdateString(dto.office365Account),
      r4a3Account: this.optionalUpdateString(dto.r4a3Account),
      province: this.optionalUpdateString(dto.province),
      town: this.optionalUpdateString(dto.town),
      barangay: this.optionalUpdateString(dto.barangay),
      street: this.optionalUpdateString(dto.street),
    };
  }
}
