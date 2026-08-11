import { ImportSchema } from '../mapping/mapping.types';

export const studentImportSchema: ImportSchema = {
  target: 'STUDENT',

  fields: [
    {
      key: 'lrn',
      label: 'Learner Reference Number',
      aliases: [
        'LRN',
        'LEARNER REFERENCE NUMBER',
        'LEARNERS REFERENCE NUMBER',
        'LEARNER REF NO',
        'LEARNER REF NUMBER',
        'LEARNER REFERENCE NO',
      ],
      normalizer: 'IDENTIFIER',
      required: true,
    },

    {
      key: 'fullName',
      label: 'Learner Name',
      aliases: [
        'NAME',
        'STUDENT NAME',
        'LEARNER NAME',
        'NAME OF LEARNER',
        'NAME OF PUPIL',
        'PUPIL NAME',
      ],
      normalizer: 'PERSON_NAME',
      required: true,
    },

    {
      key: 'birthday',
      label: 'Birthday',
      aliases: [
        'BIRTHDAY',
        'BIRTH DATE',
        'BIRTHDATE',
        'DATE OF BIRTH',
        'DOB',
      ],
      normalizer: 'DATE',
      required: false,
    },

    {
      key: 'birthplace',
      label: 'Birthplace',
      aliases: [
        'BIRTHPLACE',
        'BIRTH PLACE',
        'PLACE OF BIRTH',
      ],
      normalizer: 'TEXT',
      required: false,
    },

    {
      key: 'grade',
      label: 'Grade Level',
      aliases: [
        'GRADE',
        'GRADE LEVEL',
        'YEAR LEVEL',
        'LEVEL',
      ],
      normalizer: 'GRADE',
      required: false,
    },

    {
      key: 'address',
      label: 'Address',
      aliases: [
        'ADDRESS',
        'HOME ADDRESS',
        'RESIDENTIAL ADDRESS',
        'CURRENT ADDRESS',
      ],
      normalizer: 'TEXT',
      required: false,
    },

    {
      key: 'fatherName',
      label: "Father's Name",
      aliases: [
        "FATHER'S NAME",
        'FATHER NAME',
        'NAME OF FATHER',
      ],
      normalizer: 'TEXT',
      required: false,
    },

    {
      key: 'motherName',
      label: "Mother's Name",
      aliases: [
        "MOTHER'S NAME",
        'MOTHER NAME',
        'NAME OF MOTHER',
      ],
      normalizer: 'TEXT',
      required: false,
    },

    {
      key: 'guardianName',
      label: "Guardian's Name",
      aliases: [
        "GUARDIAN'S NAME",
        'GUARDIAN NAME',
        'NAME OF GUARDIAN',

        // Known typo from your test sheet
        "GUIARDIAN'S NAME",
      ],
      normalizer: 'TEXT',
      required: false,
    },

    {
      key: 'contactNumber',
      label: 'Contact Number',
      aliases: [
        'CONTACT NUMBER',
        'CONTACT NO',
        'CONTACT NO.',
        'PHONE NUMBER',
        'MOBILE NUMBER',
        'PARENT CONTACT',
        'GUARDIAN CONTACT',
      ],
      normalizer: 'PHONE',
      required: false,
    },

    {
      key: 'remarks',
      label: 'Remarks',
      aliases: [
        'REMARKS',
        'NOTES',
        'COMMENTS',
      ],
      normalizer: 'TEXT',
      required: false,
    },
  ],
};
