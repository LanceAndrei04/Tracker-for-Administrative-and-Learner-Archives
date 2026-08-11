import { StudentValidator } from './student.validator';

describe('StudentValidator', () => {
  const validator = new StudentValidator();

  it('reports a blocking error when LRN is missing', () => {
    const issues = validator.validate({
      firstName: 'Ana',
      lastName: 'Santos',
    });

    expect(issues).toContainEqual({
      field: 'lrn',
      type: 'ERROR',
      code: 'LRN_REQUIRED',
      message: 'LRN is required for student import.',
    });
  });

  it('reports a warning, not an error, when birthday is missing', () => {
    const issues = validator.validate({
      lrn: '123456789012',
      firstName: 'Ana',
      lastName: 'Santos',
    });

    expect(issues).toContainEqual({
      field: 'birthday',
      type: 'WARNING',
      code: 'BIRTHDAY_NOT_PROVIDED',
      message: 'Birthday not provided.',
    });
    expect(
      issues.some(
        (issue) => issue.field === 'birthday' && issue.type === 'ERROR',
      ),
    ).toBe(false);
  });

  it('reports a blocking error when LRN is invalid', () => {
    const issues = validator.validate({
      lrn: '123',
      firstName: 'Ana',
      lastName: 'Santos',
      birthday: '2015-02-12',
    });

    expect(issues).toContainEqual({
      field: 'lrn',
      type: 'ERROR',
      code: 'INVALID_LRN',
      message: 'LRN must contain exactly 12 digits.',
    });
  });
});
