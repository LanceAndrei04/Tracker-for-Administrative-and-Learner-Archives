import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { AiMappingRequest } from './ai-mapping.types';

@Injectable()
export class AiPrivacyGuard {
  assertSafe(
    request: AiMappingRequest,
  ): void {
    const serialized =
      JSON.stringify(request);

    if (this.containsPossibleLrn(serialized)) {
      throw new BadRequestException(
        'AI request blocked: possible LRN detected.',
      );
    }

    if (
      this.containsPossiblePhone(serialized)
    ) {
      throw new BadRequestException(
        'AI request blocked: possible phone number detected.',
      );
    }

    if (
      this.containsEmail(serialized)
    ) {
      throw new BadRequestException(
        'AI request blocked: possible email detected.',
      );
    }
  }

  private containsPossibleLrn(
    value: string,
  ): boolean {
    return /\b\d{12}\b/.test(value);
  }

  private containsPossiblePhone(
    value: string,
  ): boolean {
    return /\b(?:09\d{9}|639\d{9})\b/.test(
      value.replace(/[+\s-]/g, ''),
    );
  }

  private containsEmail(
    value: string,
  ): boolean {
    return /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(
      value,
    );
  }
}