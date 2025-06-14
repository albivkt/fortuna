import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

export interface JWTPayload {
  userId: string;
  email: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

export async function getUserFromToken(token: string) {
  const payload = verifyToken(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: {
      wheels: true,
    },
  });

  return user;
}

export function getTokenFromHeaders(headers: any): string | null {
  const authorization = headers.authorization || headers.Authorization;
  if (!authorization) return null;

  const token = authorization.replace('Bearer ', '');
  return token;
} 