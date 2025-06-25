import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  plan: string;
}

// Хеширование пароля
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 12);
};

// Проверка пароля
export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

// Генерация JWT токена
export const generateToken = (payload: { userId: string; email: string }): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

// Верификация JWT токена
export const verifyToken = (token: string): { userId: string; email: string } | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
  } catch (error) {
    return null;
  }
};

// Получение токена из заголовков
export const getTokenFromHeaders = (headers: any): string | null => {
  const authorization = headers.authorization || headers.Authorization;
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.substring(7);
  }
  return null;
};

// Получение пользователя по токену
export const getUserFromToken = async (token: string): Promise<AuthUser | null> => {
  const payload = verifyToken(token);
  if (!payload) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
      },
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name ?? undefined,
      plan: user.plan,
    };
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
};

// Создание или получение пользователя (для совместимости с localStorage)
export const createOrGetUser = async (userData: { 
  name?: string; 
  email?: string; 
  tempId?: string 
}): Promise<AuthUser> => {
  console.log('🔍 createOrGetUser called with:', userData);
  
  // Если есть email, пытаемся найти существующего пользователя
  if (userData.email && !userData.email.includes('@gifty.local')) {
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      console.log('✅ Found existing user:', existingUser.id);
      return {
        id: existingUser.id,
        email: existingUser.email,
        name: existingUser.name ?? undefined,
        plan: existingUser.plan,
      };
    }
  }

  // КРИТИЧЕСКИ ВАЖНО: Используем tempId как есть, с fallback только в крайнем случае
  if (!userData.tempId) {
    console.log('⚠️ No tempId provided, creating fallback');
    userData.tempId = `emergency_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  const tempEmail = userData.email || `temp_${userData.tempId}@gifty.local`;
  
  console.log('🔍 Looking for temp user with email:', tempEmail);
  console.log('🆔 Using tempId:', userData.tempId);
  
  const existingTempUser = await prisma.user.findUnique({
    where: { email: tempEmail },
  });

  if (existingTempUser) {
    console.log('✅ Found existing temp user:', existingTempUser.id, existingTempUser.email);
    return {
      id: existingTempUser.id,
      email: existingTempUser.email,
      name: existingTempUser.name ?? undefined,
      plan: existingTempUser.plan,
    };
  }

  // Создаем нового временного пользователя с точным tempId
  console.log('🆕 Creating new temp user with email:', tempEmail);
  
  // Пытаемся получить имя из зарегистрированного пользователя
  let displayName = 'Гость';
  if (typeof window !== 'undefined') {
    try {
      const { getCurrentUser } = require('@/lib/user');
      const registeredUser = getCurrentUser();
      displayName = registeredUser?.name || 'Гость';
    } catch (error) {
      console.log('Could not get registered user name, using default');
    }
  }
  
  const newUser = await prisma.user.create({
    data: {
      email: tempEmail,
      name: userData.name || displayName,
      plan: 'FREE',
    },
  });

  console.log('✅ Created new temp user:', newUser.id, newUser.email);
  return {
    id: newUser.id,
    email: newUser.email,
    name: newUser.name ?? undefined,
    plan: newUser.plan,
  };
};

// Получение пользователя из контекста (для резолверов)
export const getUserFromContext = async (context: any): Promise<AuthUser | null> => {
  const token = getTokenFromHeaders(context.req?.headers || {});
  const sessionId = context.req?.headers['x-session-id'] || context.req?.headers['X-Session-Id'];
  
  console.log('🔍 getUserFromContext called with:', {
    hasToken: !!token,
    tokenType: token?.startsWith('temp_') ? 'temporary' : 'real',
    hasSessionId: !!sessionId,
    sessionId: sessionId,
    token: token
  });
  
  // Если есть реальный токен
  if (token && !token.startsWith('temp_')) {
    console.log('🔐 Using real token');
    return getUserFromToken(token);
  }
  
  // КРИТИЧЕСКИ ВАЖНО: Всегда используем sessionId если он есть
  // Это обеспечивает консистентность между всеми запросами
  let tempId = null;
  
  if (sessionId) {
    // Приоритет всегда у sessionId
    tempId = sessionId;
    console.log('🆔 Using sessionId as tempId (PRIORITY):', tempId);
  } else if (token && token.startsWith('temp_')) {
    // Fallback на токен только если нет sessionId
    tempId = token.replace('temp_', '');
    console.log('🆔 Using token tempId (FALLBACK):', tempId);
  }
  
  if (tempId) {
    const user = await createOrGetUser({ tempId });
    console.log('👤 Resolved user:', user.id, user.email);
    console.log('📧 Expected email pattern: temp_' + tempId + '@fortuna.local');
    return user;
  }
  
  console.log('❌ No user context found - no sessionId or temp token');
  return null;
}; 