const requiredEnv = ['DATABASE_URL', 'JWT_SECRET'] as const;

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing environment variable: ${key}`);
  }
}

export const env = {
  DATABASE_URL: process.env.DATABASE_URL as string,
  JWT_SECRET: process.env.JWT_SECRET as string,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '7d',
  PORT: process.env.PORT ?? '4000',
  LOG_LEVEL: process.env.LOG_LEVEL ?? 'info',
  NODE_ENV: process.env.NODE_ENV ?? 'development',
};
