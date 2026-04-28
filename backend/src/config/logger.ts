import pino from 'pino';
import { env } from './env.js';

const isDev = env.NODE_ENV !== 'production';

const logger = pino({
  level: env.LOG_LEVEL ?? 'info',
  ...(isDev && { transport: { target: 'pino-pretty' } }), // Transport useful for dev
});

export default logger;
