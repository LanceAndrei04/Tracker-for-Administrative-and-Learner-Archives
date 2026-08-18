import { ConflictException, NotFoundException } from '@nestjs/common';

jest.mock('./teachers.repository', () => ({
  TeachersRepository: class TeachersRepository {},
}));

import { TeachersService } from './teachers.service';

describe('TeachersService', () => {
  const repository = {
    findAllDirectory: jest.fn(),
    findDirectoryById: jest.fn(),
    findFullById: jest.fn(),
    findByEmployeeNumber: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };
  const service = new TeachersService(repository as any);

  beforeEach(() => jest.resetAllMocks());

  it('uses the full personnel record for an authenticated profile request', async () => {
    repository.findFullById.mockResolvedValue({ id: 'teacher-1', firstName: 'Maria', lastName: 'Cruz', personalEmail: 'maria@example.com' });

    await expect(service.findById('teacher-1')).resolves.toEqual({ id: 'teacher-1', firstName: 'Maria', lastName: 'Cruz', personalEmail: 'maria@example.com' });
    expect(repository.findFullById).toHaveBeenCalledWith('teacher-1');
  });

  it('rejects a duplicate employee number before creating a teacher', async () => {
    repository.findByEmployeeNumber.mockResolvedValue({ id: 'existing-teacher' });

    await expect(service.create({ firstName: 'Maria', lastName: 'Cruz', employeeNumber: 'T-2020-014', designation: 'Teacher III' })).rejects.toBeInstanceOf(ConflictException);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('preserves explicit null values when clearing nullable personnel fields', async () => {
    repository.findFullById.mockResolvedValue({ id: 'teacher-1', employeeNumber: 'T-2020-014' });
    repository.update.mockResolvedValue({ id: 'teacher-1' });

    await service.update('teacher-1', { birthday: null, personalEmail: null, province: null });

    expect(repository.update).toHaveBeenCalledWith('teacher-1', expect.objectContaining({ birthday: null, personalEmail: null, province: null }));
  });

  it('reports a missing teacher profile', async () => {
    repository.findFullById.mockResolvedValue(null);

    await expect(service.findById('missing')).rejects.toBeInstanceOf(NotFoundException);
  });
});
