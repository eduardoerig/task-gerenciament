import { LeisureCategory, PriorityLevel } from '@prisma/client';
import dayjs from 'dayjs';
import { z } from 'zod';
import { db } from '../config/db.js';

const taskSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  category: z.nativeEnum(LeisureCategory),
  priority: z.nativeEnum(PriorityLevel),
  dueDate: z.string(),
  estimatedMins: z.number().int().positive().max(600),
  reminderAt: z.string().optional().nullable()
});

const goalSchema = z.object({
  title: z.string().min(3),
  targetMinutes: z.number().int().positive(),
  periodType: z.enum(['weekly', 'monthly']),
  periodStart: z.string(),
  periodEnd: z.string()
});

export async function createTask(userId: string, data: unknown) {
  const input = taskSchema.parse(data);

  return db.leisureTask.create({
    data: {
      ...input,
      dueDate: new Date(input.dueDate),
      reminderAt: input.reminderAt ? new Date(input.reminderAt) : null,
      userId
    }
  });
}

export async function listTasks(userId: string) {
  return db.leisureTask.findMany({
    where: { userId },
    orderBy: [{ completed: 'asc' }, { dueDate: 'asc' }]
  });
}

export async function updateTask(userId: string, taskId: string, data: unknown) {
  const input = taskSchema.partial().parse(data);
  await ensureTaskOwner(userId, taskId);

  return db.leisureTask.update({
    where: { id: taskId },
    data: {
      ...input,
      dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
      reminderAt: input.reminderAt ? new Date(input.reminderAt) : input.reminderAt
    }
  });
}

export async function deleteTask(userId: string, taskId: string) {
  await ensureTaskOwner(userId, taskId);
  await db.leisureTask.delete({ where: { id: taskId } });
}

export async function completeTask(userId: string, taskId: string) {
  await ensureTaskOwner(userId, taskId);
  const task = await db.leisureTask.update({
    where: { id: taskId },
    data: { completed: true, completedAt: new Date() }
  });

  await db.activityLog.create({
    data: {
      userId,
      date: new Date(),
      category: task.category,
      minutes: task.estimatedMins,
      notes: `Concluiu: ${task.title}`
    }
  });

  await evaluateGamification(userId);
  return task;
}

async function ensureTaskOwner(userId: string, taskId: string) {
  const task = await db.leisureTask.findFirst({ where: { id: taskId, userId }, select: { id: true } });
  if (!task) throw new Error('Tarefa não encontrada.');
}

async function evaluateGamification(userId: string) {
  const completed = await db.leisureTask.count({ where: { userId, completed: true } });

  if (completed >= 5) {
    await db.achievement.upsert({
      where: { userId_code: { userId, code: 'FIRST_5' } },
      update: {},
      create: {
        userId,
        code: 'FIRST_5',
        label: 'Em ritmo leve',
        description: 'Concluiu 5 atividades de lazer.'
      }
    });
  }
}

export async function getDashboard(userId: string) {
  const now = dayjs();
  const weekStart = now.startOf('week').toDate();
  const weekEnd = now.endOf('week').toDate();

  const [todayTasks, weekTasks, completed, achievements, goals] = await Promise.all([
    db.leisureTask.findMany({
      where: {
        userId,
        dueDate: {
          gte: now.startOf('day').toDate(),
          lte: now.endOf('day').toDate()
        }
      }
    }),
    db.leisureTask.findMany({ where: { userId, dueDate: { gte: weekStart, lte: weekEnd } } }),
    db.leisureTask.count({ where: { userId, completed: true } }),
    db.achievement.findMany({ where: { userId }, orderBy: { unlockedAt: 'desc' } }),
    db.goal.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } })
  ]);

  return { todayTasks, weekTasks, completed, achievements, goals };
}

export async function getStats(userId: string) {
  const logs = await db.activityLog.findMany({ where: { userId } });

  const byCategory = logs.reduce<Record<string, number>>((acc, log) => {
    acc[log.category] = (acc[log.category] || 0) + log.minutes;
    return acc;
  }, {});

  const streak = await calculateStreak(userId);

  return { totalMinutes: logs.reduce((sum, item) => sum + item.minutes, 0), byCategory, streak };
}

async function calculateStreak(userId: string): Promise<number> {
  const logs = await db.activityLog.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    select: { date: true }
  });

  let streak = 0;
  let cursor = dayjs().startOf('day');

  const uniqueDays = [...new Set(logs.map((l) => dayjs(l.date).format('YYYY-MM-DD')))];

  for (const day of uniqueDays) {
    if (dayjs(day).isSame(cursor, 'day')) {
      streak += 1;
      cursor = cursor.subtract(1, 'day');
    } else if (dayjs(day).isBefore(cursor, 'day')) {
      break;
    }
  }

  return streak;
}

export async function createGoal(userId: string, data: unknown) {
  const input = goalSchema.parse(data);
  return db.goal.create({
    data: {
      ...input,
      periodStart: new Date(input.periodStart),
      periodEnd: new Date(input.periodEnd),
      userId
    }
  });
}

export async function listGoals(userId: string) {
  return db.goal.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
}

export async function getSuggestions(userId: string) {
  const stats = await getStats(userId);
  const lower = Object.entries(stats.byCategory).sort((a, b) => a[1] - b[1])[0]?.[0];

  const suggestionsMap: Record<string, string[]> = {
    SPORTS: ['Caminhada de 20 min no bairro', 'Sessão curta de yoga'],
    READING: ['Ler 15 páginas de um livro leve', 'Revisitar um conto favorito'],
    SOCIAL: ['Enviar mensagem para um amigo', 'Marcar café de 30 minutos'],
    REST: ['Pausa guiada de respiração', 'Soneca restauradora de 20 minutos'],
    CULTURE: ['Ouvir um álbum novo', 'Visitar um museu virtual'],
    CREATIVITY: ['Desenhar por 15 minutos', 'Escrever um mini diário criativo'],
    OUTDOOR: ['Passeio ao ar livre em um parque', 'Observar o pôr do sol']
  };

  const focus = lower ?? 'REST';
  return { focusCategory: focus, suggestions: suggestionsMap[focus] };
}
