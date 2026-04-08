import { Router } from 'express';
import {
  completeTaskHandler,
  createTaskHandler,
  dashboardHandler,
  deleteTaskHandler,
  goalCreateHandler,
  goalListHandler,
  listTaskHandler,
  statsHandler,
  suggestionsHandler,
  updateTaskHandler
} from '../controllers/task.controller.js';

export const taskRouter = Router();

taskRouter.get('/dashboard', dashboardHandler);
taskRouter.get('/tasks', listTaskHandler);
taskRouter.post('/tasks', createTaskHandler);
taskRouter.patch('/tasks/:id', updateTaskHandler);
taskRouter.delete('/tasks/:id', deleteTaskHandler);
taskRouter.patch('/tasks/:id/complete', completeTaskHandler);
taskRouter.get('/stats', statsHandler);
taskRouter.get('/suggestions', suggestionsHandler);
taskRouter.get('/goals', goalListHandler);
taskRouter.post('/goals', goalCreateHandler);
