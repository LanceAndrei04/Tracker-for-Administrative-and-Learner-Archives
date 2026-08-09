import { Injectable } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';

import type {
  AiMappingRequest,
  AiMappingResult,
} from './ai-mapping.types';

import { AiPrivacyGuard } from './ai-privacy.guard';

@Injectable()
export class AiMappingService {
  private readonly enabled: boolean;
  private readonly client: GoogleGenAI | null;
  private readonly model: string;

  constructor(
    private readonly privacyGuard: AiPrivacyGuard,
  ) {
    this.enabled =
      process.env.AI_MAPPING_ENABLED === 'true';

    const apiKey = process.env.GEMINI_API_KEY;

    this.model =
      process.env.GEMINI_MODEL ??
      'gemini-3.5-flash-lite';

    this.client =
      this.enabled && apiKey
        ? new GoogleGenAI({
            apiKey,
          })
        : null;
  }

  

  isEnabled(): boolean {
    return Boolean(
      this.enabled &&
        this.client,
    );
  }

  async suggestMappings(
    request: AiMappingRequest,
  ): Promise<AiMappingResult> {
    this.privacyGuard.assertSafe(request);

    if (!this.isEnabled()) {
      return {
        suggestions: [],
      };
    }

    try {
      const prompt =
        this.buildPrompt(request);

      const response =
        await this.client!.models.generateContent({
          model: this.model,

          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],

          config: {
            responseMimeType:
              'application/json',

            responseSchema: {
              type: 'OBJECT',

              properties: {
                suggestions: {
                  type: 'ARRAY',

                  items: {
                    type: 'OBJECT',

                    properties: {
                      columnIndex: {
                        type: 'INTEGER',
                      },

                      suggestedField: {
                        type: 'STRING',
                        nullable: true,
                      },

                      confidence: {
                        type: 'NUMBER',
                      },

                      reason: {
                        type: 'STRING',
                      },
                    },

                    required: [
                      'columnIndex',
                      'suggestedField',
                      'confidence',
                      'reason',
                    ],
                  },
                },
              },

              required: ['suggestions'],
            },
          },
        });

      if (!response.text) {
        return {
          suggestions: [],
        };
      }

      const parsed = JSON.parse(
        response.text,
      ) as AiMappingResult;

      return this.validateResult(
        parsed,
        request,
      );
    } catch {
      // Mapping suggestions are optional. Do not log request or provider data.

      return {
        suggestions: [],
      };
    }
  }

  private buildPrompt(
    request: AiMappingRequest,
  ): string {
    return `
You are assisting a school data import system.

Your task is ONLY to identify which canonical field
each ambiguous spreadsheet column most likely represents.

The input contains sanitized structural metadata only.
Do not infer or generate personal student information.

Import target:
${request.target}

Available canonical fields:
${request.availableFields
  .map(
    (field) =>
      `- ${field.key}: ${field.label}`,
  )
  .join('\n')}

Ambiguous columns:
${request.columns
  .map(
    (column) => `
Column ${column.columnIndex}
Header: ${column.header}
Current deterministic suggestion:
${column.currentSuggestion ?? 'none'}

Sanitized sample patterns:
${column.samplePatterns
  .map((pattern) => `- ${pattern}`)
  .join('\n')}
`,
  )
  .join('\n')}

Rules:

1. suggestedField must be one of the available canonical field keys or null.
2. Use null if the mapping cannot be determined safely.
3. Confidence must be between 0 and 1.
4. Prefer caution over guessing.
5. Consider both the header and structural sample patterns.
6. Do not create new fields.
7. Return one suggestion for every supplied column.
`;
  }

  private validateResult(
    result: AiMappingResult,
    request: AiMappingRequest,
  ): AiMappingResult {
    const allowedFields = new Set(
      request.availableFields.map(
        (field) => field.key,
      ),
    );

    const allowedColumns = new Set(
      request.columns.map(
        (column) =>
          column.columnIndex,
      ),
    );

    const suggestions =
      result.suggestions
        .filter((suggestion) =>
          allowedColumns.has(
            suggestion.columnIndex,
          ),
        )
        .map((suggestion) => {
          const suggestedField =
            suggestion.suggestedField &&
            allowedFields.has(
              suggestion.suggestedField,
            )
              ? suggestion.suggestedField
              : null;

          return {
            columnIndex:
              suggestion.columnIndex,

            suggestedField,

            confidence:
              Math.max(
                0,
                Math.min(
                  1,
                  suggestion.confidence,
                ),
              ),

            reason:
              suggestion.reason,
          };
        });

    return {
      suggestions,
    };
  }
}
