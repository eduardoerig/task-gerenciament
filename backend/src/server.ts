import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import cron from 'node-cron';
import { db } from './config/db.js';
import { env } from './config/env.js';
import { requireAuth } from './middlewares/auth.middleware.js';
import { authRouter } from './routes/auth.routes.js';
import { taskRouter } from './routes/task.routes.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_, res) => res.json({ ok: true, service: 'leisure-manager-api' }));
app.use('/api/auth', authRouter);
app.use('/api', requireAuth, taskRouter);

cron.schedule('*/5 * * * *', async () => {
  const upcoming = await db.leisureTask.findMany({
    where: {
      completed: false,
      reminderAt: {
        gte: new Date(),
        lte: new Date(Date.now() + 5 * 60 * 1000)
      }
    },
    include: { user: true }
  });

  upcoming.forEach((task) => {
    console.log(`[Reminder] ${task.user.email} -> ${task.title} (${task.reminderAt?.toISOString()})`);
  });
});

app.listen(env.PORT, () => {
  console.log(`API executando em http://localhost:${env.PORT}`);
});
