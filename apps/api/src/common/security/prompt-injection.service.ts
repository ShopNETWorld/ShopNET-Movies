import { Injectable, BadRequestException } from '@nestjs/common';
import { Logger } from '@shopnet/logger';

const logger = new Logger('prompt-injection-defense');

export interface PromptInspectionResult {
  isSuspicious: boolean;
  detectedPatterns: string[];
  sanitized: string;
}

/**
 * Prompt Injection & Adversarial AI Defense Service.
 * Detects jailbreak patterns, system prompt override attempts, and special token delimiters.
 */
@Injectable()
export class PromptInjectionService {
  // Common adversarial jailbreak signatures & system prompt escape sequences
  private readonly injectionSignatures: Array<{ name: string; regex: RegExp; severity: 'high' | 'medium' }> = [
    {
      name: 'INSTRUCTION_OVERRIDE',
      regex: /(?:ignore|disregard|forget|override)\s+(?:all\s+)?(?:previous|prior|above|system)\s+(?:instructions|guidelines|rules|prompts)/i,
      severity: 'high',
    },
    {
      name: 'SYSTEM_ROLEPLAY_JAILBREAK',
      regex: /(?:you are now in|enter|switch to)\s+(?:DAN|developer mode|unrestricted mode|jailbreak mode)/i,
      severity: 'high',
    },
    {
      name: 'SPECIAL_TOKEN_DELIMITERS',
      regex: /<\|(?:im_start|im_end|endoftext|system)\|>/i,
      severity: 'high',
    },
    {
      name: 'SYSTEM_DELIMITER_HIJACK',
      regex: /\[(?:SYSTEM|INSTRUCTION|SYSTEM\s+PROMPT)\]/i,
      severity: 'medium',
    },
    {
      name: 'PROMPT_LEAK_ATTEMPT',
      regex: /(?:print|reveal|display|output|show)\s+(?:your\s+)?(?:system\s+prompt|initial\s+instructions|base\s+instructions)/i,
      severity: 'medium',
    },
  ];

  /**
   * Inspect a user prompt for adversarial injection signatures.
   */
  inspectPrompt(prompt: string): PromptInspectionResult {
    if (!prompt || typeof prompt !== 'string') {
      return { isSuspicious: false, detectedPatterns: [], sanitized: '' };
    }

    const detectedPatterns: string[] = [];
    let highSeverityCount = 0;

    for (const signature of this.injectionSignatures) {
      if (signature.regex.test(prompt)) {
        detectedPatterns.push(signature.name);
        if (signature.severity === 'high') {
          highSeverityCount++;
        }
      }
    }

    // Sanitize special token tags that could trick LLM tokenizer / prompt assemblers
    const sanitized = prompt
      .replace(/<\|(?:im_start|im_end|endoftext|system)\|>/gi, '')
      .replace(/\[\/?(?:SYSTEM|INSTRUCTION)\]/gi, '');

    const isSuspicious = highSeverityCount > 0 || detectedPatterns.length >= 2;

    if (isSuspicious) {
      logger.warn('Prompt injection pattern detected', {
        detectedPatterns,
        snippet: prompt.slice(0, 100),
      });
    }

    return {
      isSuspicious,
      detectedPatterns,
      sanitized,
    };
  }

  /**
   * Validates that a prompt does not contain high-severity injection attacks.
   * Throws BadRequestException if an active attack pattern is present.
   */
  assertSafePrompt(prompt: string): string {
    const result = this.inspectPrompt(prompt);
    if (result.isSuspicious) {
      throw new BadRequestException(
        `Adversarial prompt pattern detected: [${result.detectedPatterns.join(', ')}]. Request rejected for security.`,
      );
    }
    return result.sanitized;
  }
}
