import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import 'dotenv/config';
import authRouter from './modules/auth/auth.router';
import { errorMiddleware } from './middlewares/error.middleware';
import { loggerMiddleware } from './middlewares/logger.middleware';
import logger from './config/logger';

const app = express();
const httpServer = createServer(app);

app.use(cors());
app.use(express.json());
app.use(loggerMiddleware);

app.use('/auth', authRouter);

app.use(errorMiddleware);

const PORT = process.env.PORT ?? 4000;
httpServer.listen(PORT, () => {
  logger.info(`Server running on port http://localhost:${PORT}`);
});
