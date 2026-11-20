
type Environment = Record<string, any>;

function required(env: Environment, key: string): string {
  const value = env[key];

  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`La variable ${key} es obligatoria.`);
  }

  return value.trim();
}

function parseBoolean(env: Environment, key: string, fallback = false): boolean {
  const value = env[key];

  if (value === undefined || value === '') return fallback;
  if (value === 'true') return true;
  if (value === 'false') return false;

  throw new Error(`${key} debe ser true o false.`);
}

function parsePort(value: string, key: string): number {
  const port = Number(value);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`${key} debe ser un puerto válido.`);
  }

  return port;
}

export function validateEnv(env: Environment): Environment {
  const nodeEnv = env.NODE_ENV?.trim() || 'development';
  const mailMode = env.MAIL_MODE?.trim() || 'smtp';

  if (!['development', 'test', 'production'].includes(nodeEnv)) {
    throw new Error('NODE_ENV no tiene un valor válido.');
  }

  if (!['smtp', 'simulation'].includes(mailMode)) {
    throw new Error('MAIL_MODE debe ser smtp o simulation.');
  }

  const jwtSecret = required(env, 'JWT_SECRET');

  if (jwtSecret.length < 32) {
    throw new Error('JWT_SECRET debe tener al menos 32 caracteres.');
  }

  const dbSync = parseBoolean(env, 'DB_SYNC');
  const dbLogging = parseBoolean(env, 'DB_LOGGING');

  if (nodeEnv === 'production' && (dbSync || dbLogging)) {
    throw new Error(
      'DB_SYNC y DB_LOGGING deben estar desactivados en producción.',
    );
  }

  if (mailMode === 'simulation' && nodeEnv !== 'development') {
    throw new Error('La simulación SMTP solo está permitida en desarrollo.');
  }

  if (mailMode === 'smtp') {
    const mailFrom = required(env, 'MAIL_FROM');

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mailFrom)) {
      throw new Error('MAIL_FROM debe ser un correo válido.');
    }

    required(env, 'MAIL_HOST');
    required(env, 'MAIL_USER');
    required(env, 'MAIL_PASSWORD');

    const mailPort = parsePort(required(env, 'MAIL_PORT'), 'MAIL_PORT');

    if (![465, 587].includes(mailPort)) {
      throw new Error('MAIL_PORT debe ser 465 o 587.');
    }

    env.MAIL_PORT = mailPort;
  }

  const imageUrl = env.MAIL_IMAGE_URL?.trim();

  if (imageUrl) {
    try {
      if (new URL(imageUrl).protocol !== 'https:') {
        throw new Error();
      }
    } catch {
      throw new Error('MAIL_IMAGE_URL debe ser una URL HTTPS válida.');
    }
  }

  const dbPort = parsePort(
    env.DB_PORT || '3306',
    'DB_PORT',
  );

  return {
    ...env,
    NODE_ENV: nodeEnv,
    MAIL_MODE: mailMode,
    PORT: parsePort(env.PORT || '8080', 'PORT'),
    DB_PORT: dbPort,
    DB_HOST: required(env, 'DB_HOST'),
    DB_USERNAME: required(env, 'DB_USERNAME'),
    DB_PASSWORD: required(env, 'DB_PASSWORD'),
    DB_NAME: required(env, 'DB_NAME'),
    DB_SYNC: dbSync,
    DB_LOGGING: dbLogging,
    JWT_SECRET: jwtSecret,
    JWT_EXPIRES_IN: env.JWT_EXPIRES_IN || '3600',
  };
}
