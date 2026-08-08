import {
  ImportSchema,
  ImportTarget,
} from './mapping.types';
import { studentImportSchema } from '../schemas/student-import.schema';

const schemaRegistry: Record<
  ImportTarget,
  ImportSchema
> = {
  STUDENT: studentImportSchema,
};

export function getImportSchema(
  target: ImportTarget,
): ImportSchema {
  return schemaRegistry[target];
}