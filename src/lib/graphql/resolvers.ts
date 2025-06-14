import { GraphQLError } from 'graphql';
import { prisma } from '../prisma';
import { hashPassword, comparePassword, generateToken, getUserFromToken, getTokenFromHeaders } from '../auth';

export const resolvers = {
  Query: {
    me: async (_: any, __: any, context: any) => {
      const token = getTokenFromHeaders(context.req.headers);
      if (!token) return null;

      const user = await getUserFromToken(token);
      return user;
    },

    wheels: async (_: any, __: any, context: any) => {
      const token = getTokenFromHeaders(context.req.headers);
      if (!token) throw new GraphQLError('Authentication required');

      const user = await getUserFromToken(token);
      if (!user) throw new GraphQLError('Invalid token');

      return await prisma.wheel.findMany({
        where: { userId: user.id },
        include: {
          user: true,
          spins: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    },

    wheel: async (_: any, { id }: { id: string }, context: any) => {
      const wheel = await prisma.wheel.findUnique({
        where: { id },
        include: {
          user: true,
          spins: true,
        },
      });

      if (!wheel) throw new GraphQLError('Wheel not found');

      // Проверяем права доступа
      if (!wheel.isPublic) {
        const token = getTokenFromHeaders(context.req.headers);
        if (!token) throw new GraphQLError('Authentication required');

        const user = await getUserFromToken(token);
        if (!user || user.id !== wheel.userId) {
          throw new GraphQLError('Access denied');
        }
      }

      return wheel;
    },

    publicWheels: async () => {
      return await prisma.wheel.findMany({
        where: { isPublic: true },
        include: {
          user: true,
          spins: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });
    },
  },

  Mutation: {
    register: async (_: any, { input }: { input: any }) => {
      const { email, password, name } = input;

      // Проверяем, существует ли пользователь
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new GraphQLError('User with this email already exists');
      }

      // Хешируем пароль
      const hashedPassword = await hashPassword(password);

      // Создаем пользователя
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
        },
        include: {
          wheels: true,
        },
      });

      // Генерируем токен
      const token = generateToken({ userId: user.id, email: user.email });

      return { token, user };
    },

    login: async (_: any, { input }: { input: any }) => {
      const { email, password } = input;

      // Находим пользователя
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          wheels: true,
        },
      });

      if (!user) {
        throw new GraphQLError('Invalid email or password');
      }

      // Проверяем пароль
      const isValidPassword = await comparePassword(password, user.password);
      if (!isValidPassword) {
        throw new GraphQLError('Invalid email or password');
      }

      // Генерируем токен
      const token = generateToken({ userId: user.id, email: user.email });

      return { token, user };
    },

    createWheel: async (_: any, { input }: { input: any }, context: any) => {
      const token = getTokenFromHeaders(context.req.headers);
      if (!token) throw new GraphQLError('Authentication required');

      const user = await getUserFromToken(token);
      if (!user) throw new GraphQLError('Invalid token');

      const wheel = await prisma.wheel.create({
        data: {
          title: input.title,
          description: input.description,
          segments: input.segments,
          isPublic: input.isPublic,
          userId: user.id,
        },
        include: {
          user: true,
          spins: true,
        },
      });

      return wheel;
    },

    updateWheel: async (_: any, { id, input }: { id: string; input: any }, context: any) => {
      const token = getTokenFromHeaders(context.req.headers);
      if (!token) throw new GraphQLError('Authentication required');

      const user = await getUserFromToken(token);
      if (!user) throw new GraphQLError('Invalid token');

      // Проверяем права доступа
      const existingWheel = await prisma.wheel.findUnique({
        where: { id },
      });

      if (!existingWheel || existingWheel.userId !== user.id) {
        throw new GraphQLError('Wheel not found or access denied');
      }

      const wheel = await prisma.wheel.update({
        where: { id },
        data: {
          title: input.title,
          description: input.description,
          segments: input.segments,
          isPublic: input.isPublic,
        },
        include: {
          user: true,
          spins: true,
        },
      });

      return wheel;
    },

    deleteWheel: async (_: any, { id }: { id: string }, context: any) => {
      const token = getTokenFromHeaders(context.req.headers);
      if (!token) throw new GraphQLError('Authentication required');

      const user = await getUserFromToken(token);
      if (!user) throw new GraphQLError('Invalid token');

      // Проверяем права доступа
      const existingWheel = await prisma.wheel.findUnique({
        where: { id },
      });

      if (!existingWheel || existingWheel.userId !== user.id) {
        throw new GraphQLError('Wheel not found or access denied');
      }

      await prisma.wheel.delete({
        where: { id },
      });

      return true;
    },

    spinWheel: async (_: any, { input }: { input: any }, context: any) => {
      const token = getTokenFromHeaders(context.req.headers);
      if (!token) throw new GraphQLError('Authentication required');

      const user = await getUserFromToken(token);
      if (!user) throw new GraphQLError('Invalid token');

      // Проверяем, существует ли колесо
      const wheel = await prisma.wheel.findUnique({
        where: { id: input.wheelId },
      });

      if (!wheel) {
        throw new GraphQLError('Wheel not found');
      }

      // Создаем запись о вращении
      const spin = await prisma.spin.create({
        data: {
          result: input.result,
          userId: user.id,
          wheelId: input.wheelId,
        },
        include: {
          user: true,
          wheel: true,
        },
      });

      return spin;
    },
  },

  // Резолверы для вложенных полей
  Wheel: {
    segments: (parent: any) => {
      return Array.isArray(parent.segments) ? parent.segments : JSON.parse(parent.segments);
    },
  },
}; 