import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import authRouter from './modules/auth/auth.router.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import { loggerMiddleware } from './middlewares/logger.middleware.js';
import { env } from './config/env.js';
import logger from './config/logger.js';
import bracketRouter from './modules/bracket/bracket.router.js';
import matchRouter from './modules/match/match.router.js';

const app = express();
const httpServer = createServer(app);

app.use(cors());
app.use(express.json());
app.use(loggerMiddleware);

app.use('/auth', authRouter);
app.use('/brackets', bracketRouter);
app.use('/matches', matchRouter);

app.use(errorMiddleware);

const PORT = env.PORT ?? 4000;
httpServer.listen(PORT, () => {
  logger.info(`Server running on port http://localhost:${PORT}`);
});
