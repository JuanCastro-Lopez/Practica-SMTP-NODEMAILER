import { validateEnv } from '../src/config/env.validation';

function createValidEnv(overrides: Record<string, string> = {}) {
  return {
    NODE_ENV: 'development',
    MAIL_MODE: 'smtp',
    JWT_SECRET: '0123456789abcdef0123456789abcdef',
    MAIL_FROM: 'noreply@example.com',
    MAIL_HOST: 'smtp.example.com',
    MAIL_USER: 'smtp-user',
    MAIL_PASSWORD: 'smtp-password',
    MAIL_PORT: '587',
    DB_PORT: '3306',
    DB_HOST: 'localhost',
    DB_USERNAME: 'test-user',
    DB_PASSWORD: 'test-password',
    DB_NAME: 'test-database',
    ...overrides,
  };
}

describe('validateEnv', () => {
  it('validates required environment configurations', () => {
    const config = validateEnv(createValidEnv());

    expect(config).toEqual(
      expect.objectContaining({
        NODE_ENV: 'development',
        MAIL_MODE: 'smtp',
        MAIL_PORT: 587,
        DB_PORT: 3306,
        DB_SYNC: false,
        DB_LOGGING: false,
      }),
    );

    expect(() => validateEnv(createValidEnv({ JWT_SECRET: '' }))).toThrow(
      'La variable JWT_SECRET es obligatoria.',
    );

    expect(() =>
      validateEnv(createValidEnv({ JWT_SECRET: 'too-short' })),
    ).toThrow('JWT_SECRET debe tener al menos 32 caracteres.');

    expect(() =>
      validateEnv(
        createValidEnv({ NODE_ENV: 'production', DB_SYNC: 'true' }),
      ),
    ).toThrow('DB_SYNC y DB_LOGGING deben estar desactivados en producción.');

    expect(() => validateEnv(createValidEnv({ MAIL_MODE: 'invalid' }))).toThrow(
      'MAIL_MODE debe ser smtp o simulation.',
    );

    expect(() =>
      validateEnv(
        createValidEnv({ NODE_ENV: 'test', MAIL_MODE: 'simulation' }),
      ),
    ).toThrow('La simulación SMTP solo está permitida en desarrollo.');
  });
});
