import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db } from '../config/db.js';
import { signToken } from '../utils/jwt.js';

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export async function registerUser(data: unknown) {
  const input = registerSchema.parse(data);

  const existing = await db.user.findUnique({ where: { email: input.email } });
  if (existing) throw new Error('E-mail já cadastrado.');

  const passwordHash = await bcrypt.hash(input.password, 10);

  const user = await db.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash
    }
  });

  const token = signToken({ userId: user.id, email: user.email });
  return { token, user: { id: user.id, name: user.name, email: user.email } };
}

export async function loginUser(data: unknown) {
  const input = loginSchema.parse(data);
  const user = await db.user.findUnique({ where: { email: input.email } });

  if (!user) throw new Error('Credenciais inválidas.');

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) throw new Error('Credenciais inválidas.');

  const token = signToken({ userId: user.id, email: user.email });

  return { token, user: { id: user.id, name: user.name, email: user.email } };
}
