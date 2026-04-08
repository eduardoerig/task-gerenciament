import type { Request, Response } from 'express';
import {
  completeTask,
  createGoal,
  createTask,
  deleteTask,
  getDashboard,
  getStats,
  getSuggestions,
  listGoals,
  listTasks,
  updateTask
} from '../services/task.service.js';

function userId(req: Request) {
  return req.auth!.userId;
}

export async function createTaskHandler(req: Request, res: Response) {
  try {
    const task = await createTask(userId(req), req.body);
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
}

export async function listTaskHandler(req: Request, res: Response) {
  const tasks = await listTasks(userId(req));
  res.json(tasks);
}

export async function updateTaskHandler(req: Request, res: Response) {
  try {
    const task = await updateTask(userId(req), req.params.id, req.body);
    res.json(task);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
}

export async function deleteTaskHandler(req: Request, res: Response) {
  try {
    await deleteTask(userId(req), req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(404).json({ message: (error as Error).message });
  }
}

export async function completeTaskHandler(req: Request, res: Response) {
  try {
    const task = await completeTask(userId(req), req.params.id);
    res.json(task);
  } catch (error) {
    res.status(404).json({ message: (error as Error).message });
  }
}

export async function dashboardHandler(req: Request, res: Response) {
  const data = await getDashboard(userId(req));
  res.json(data);
}

export async function statsHandler(req: Request, res: Response) {
  const data = await getStats(userId(req));
  res.json(data);
}

export async function goalCreateHandler(req: Request, res: Response) {
  try {
    const data = await createGoal(userId(req), req.body);
    res.status(201).json(data);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
}

export async function goalListHandler(req: Request, res: Response) {
  const data = await listGoals(userId(req));
  res.json(data);
}

export async function suggestionsHandler(req: Request, res: Response) {
  const data = await getSuggestions(userId(req));
  res.json(data);
}
