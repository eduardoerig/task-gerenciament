import type { Request, Response } from 'express';
import { loginUser, registerUser } from '../services/auth.service.js';

export async function register(req: Request, res: Response) {
  try {
    const data = await registerUser(req.body);
    res.status(201).json(data);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const data = await loginUser(req.body);
    res.status(200).json(data);
  } catch (error) {
    res.status(401).json({ message: (error as Error).message });
  }
}
