import { Injectable } from '@nestjs/common';
import {
  AiMappingRequest,
  AiMappingResult,
} from './ai-mapping.types';
import { AiPrivacyGuard } from './ai-privacy.guard';

@Injectable()
export class AiMappingService {
  constructor(
    private readonly privacyGuard:
      AiPrivacyGuard,
  ) {}

  async suggestMappings(
    request: AiMappingRequest,
  ): Promise<AiMappingResult> {
    /*
     * Hard stop before any request
     * reaches an external AI provider.
     */
    this.privacyGuard.assertSafe(request);

    /*
     * Gemini integration comes next.
     */

    return {
      suggestions: [],
    };
  }
}