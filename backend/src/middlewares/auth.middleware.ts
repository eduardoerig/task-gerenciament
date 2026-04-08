import type { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../utils/jwt.js';

declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        email: string;
      };
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Token ausente.' });
    return;
  }

  const token = header.replace('Bearer ', '');

  try {
    const payload = verifyToken(token);
    req.auth = payload;
    next();
  } catch {
    res.status(401).json({ message: 'Token inválido.' });
  }
}
