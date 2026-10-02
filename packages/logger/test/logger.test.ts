import { describe, it, expect, vi } from 'vitest';
import { Logger, sanitizeLogData } from '../src/index.js';

describe('Structured Logger Foundation', () => {
  it('should redact sensitive keys properly', () => {
    const rawData = {
      user: 'test_user',
      password: 'super_secret_password',
      apiKey: 'xyz_api_key_123',
      nested: {
        token: 'auth_jwt_token',
        publicNote: 'hello'
      }
    };

    const sanitized = sanitizeLogData(rawData) as Record<string, any>;
    expect(sanitized.user).toBe('test_user');
    expect(sanitized.password).toBe('[REDACTED]');
    expect(sanitized.apiKey).toBe('[REDACTED]');
    expect(sanitized.nested.token).toBe('[REDACTED]');
    expect(sanitized.nested.publicNote).toBe('hello');
  });

  it('should format logs with valid JSON string and service name', () => {
    const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    const logger = new Logger('test-service', 'info');

    logger.info('Test message', { requestId: 'req_123' });

    expect(consoleSpy).toHaveBeenCalledOnce();
    const loggedOutput = consoleSpy.mock.calls[0][0];
    const parsed = JSON.parse(loggedOutput);

    expect(parsed.service).toBe('test-service');
    expect(parsed.level).toBe('info');
    expect(parsed.message).toBe('Test message');
    expect(parsed.context.requestId).toBe('req_123');
    expect(parsed.timestamp).toBeDefined();

    consoleSpy.mockRestore();
  });
});
