import { betterAuth } from 'better-auth';
import { bearer } from 'better-auth/plugins';
import pg from 'pg';

export function createBetterAuthInstance(databaseUrl?: string) {
  const dbUrl = databaseUrl || process.env.DATABASE_URL;

  return betterAuth({
    database: dbUrl ? new pg.Pool({ connectionString: dbUrl }) : undefined,
    secret:
      process.env.BETTER_AUTH_SECRET ||
      'shopnet_super_secure_random_production_secret_key_123_at_least_32_chars',
    baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3001',
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
      requireEmailVerification: false
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24 // 1 day
    },
    user: {
      additionalFields: {
        role: {
          type: 'string',
          defaultValue: 'CREATOR',
          required: false
        }
      }
    },
    plugins: [bearer()]
  });
}

export const auth = createBetterAuthInstance();
export type Auth = typeof auth;
