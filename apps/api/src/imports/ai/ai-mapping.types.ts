import { ImportTarget } from '../mapping/mapping.types';

export type AiMappingColumn = {
  columnIndex: number;
  header: string;

  samplePatterns: string[];

  currentSuggestion: string | null;
};

export type AiMappingRequest = {
  target: ImportTarget;

  availableFields: {
    key: string;
    label: string;
  }[];

  columns: AiMappingColumn[];
};

export type AiColumnSuggestion = {
  columnIndex: number;

  suggestedField: string | null;

  confidence: number;

  reason: string;
};

export type AiMappingResult = {
  suggestions: AiColumnSuggestion[];
};