import { GraphQLError } from 'graphql';
import { prisma } from '../prisma';
import { 
  hashPassword, 
  comparePassword, 
  generateToken, 
  getUserFromContext,
  createOrGetUser,
  type AuthUser 
} from '../auth';
import { 
  getPlanLimits, 
  getEffectivePlan, 
  checkWheelCreationLimits, 
  checkSegmentLimits,
  PLAN_PRICES 
} from '../planLimits';

// Типы для входных данных
interface CreateWheelInput {
  title: string;
  description?: string;
  segments: WheelSegmentInput[];
  isPublic?: boolean;
  allowGuestSpin?: boolean;
  customDesign?: CustomDesignInput;
}

interface UpdateWheelInput {
  title: string;
  description?: string;
  segments: WheelSegmentInput[];
  isPublic?: boolean;
  allowGuestSpin?: boolean;
  customDesign?: CustomDesignInput;
}

interface CustomDesignInput {
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  centerImage?: string;
}

interface GeneratePublicLinkInput {
  wheelId: string;
}

interface WheelSegmentInput {
  option: string;
  style: WheelSegmentStyleInput;
  weight?: number;
  image?: string;
  imagePosition?: { x: number; y: number };
}

interface WheelSegmentStyleInput {
  backgroundColor: string;
  textColor: string;
}

interface SpinWheelInput {
  wheelId: string;
  result: string;
  participant?: string;
}

interface RegisterInput {
  email: string;
  password: string;
  name?: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface CreateSubscriptionInput {
  plan: string;
  period: string;
}

// Преобразование сегментов из JSON в GraphQL формат
const transformSegments = (segments: any) => {
      try {
      if (typeof segments === 'string') {
        // Проверяем, что строка не пустая
        if (!segments || segments.trim() === '') {
          return [];
        }
        segments = JSON.parse(segments);
      } else if (segments === null || segments === undefined) {
        return [];
      }
    
    return Array.isArray(segments) ? segments.map((segment: any) => ({
      option: segment.option || segment.text || 'Вариант',
      style: {
        backgroundColor: segment.style?.backgroundColor || segment.color || '#3B82F6',
        textColor: segment.style?.textColor || 'white'
      },
      weight: segment.weight || null,
      image: (segment.image && segment.image.trim() !== '') ? segment.image : null,
      imagePosition: segment.imagePosition || null
    })) : [];
  } catch (error) {
    console.error('❌ Error parsing segments:', error, 'Raw segments:', segments);
    return [];
  }
};

// Преобразование кастомного дизайна из JSON в GraphQL формат
const transformCustomDesign = (customDesign: any) => {
  console.log('🎨 Transform custom design - input:', customDesign);
  try {
    if (typeof customDesign === 'string') {
      if (!customDesign || customDesign.trim() === '') {
        console.log('🎨 Empty string custom design, returning null');
        return null;
      }
      customDesign = JSON.parse(customDesign);
      console.log('🎨 Parsed custom design from string:', customDesign);
    } else if (customDesign === null || customDesign === undefined) {
      console.log('🎨 Null/undefined custom design, returning null');
      return null;
    }
    
    const result = {
      backgroundColor: customDesign.backgroundColor || 'transparent',
      borderColor: customDesign.borderColor || '#ffffff',
      textColor: customDesign.textColor || 'white',
      centerImage: customDesign.centerImage || ''
    };
    console.log('🎨 Transform custom design - result:', result);
    return result;
  } catch (error) {
    console.error('❌ Error parsing custom design:', error, 'Raw custom design:', customDesign);
    return null;
  }
};

export const resolvers = {
  Query: {
    me: async (_: any, __: any, context: any) => {
      const user = await getUserFromContext(context);
      if (!user) return null;
      
      const userWithWheels = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
          wheels: {
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              title: true,
              createdAt: true,
            }
          }
        }
      });

      return userWithWheels;
    },

    wheels: async (_: any, __: any, context: any) => {
      console.log('🔍 GraphQL wheels query called');
      
      try {
        let user = await getUserFromContext(context);
        console.log('👤 User from context:', user ? user.id : 'null');
        
        // Если пользователь не найден, создаем временного на основе сессии
        if (!user) {
          console.log('🆕 Creating temp user');
          let sessionId = context.req?.headers['x-session-id'] || 
                         context.req?.headers['X-Session-Id'] ||
                         context.req?.headers['authorization']?.replace('Bearer temp_', '');
          
          if (!sessionId) {
            console.log('❌ No session ID found in headers');
            throw new GraphQLError('Session ID is required for temporary users');
          }
          
          console.log('🆔 Using sessionId for temp user:', sessionId);
          user = await createOrGetUser({ tempId: sessionId });
          console.log('✅ Temp user created/found:', user.id, user.email);
        }

        const wheels = await prisma.wheel.findMany({
          where: { userId: user.id },
          include: {
            user: true,
            spins: {
              include: {
                user: true,
              },
              orderBy: { createdAt: 'desc' },
            },
          },
          orderBy: { createdAt: 'desc' },
        });
        
        console.log('🎡 Wheels found for user:', wheels.length);
        return wheels.map(wheel => ({
          ...wheel,
          segments: transformSegments(wheel.segments),
          customDesign: transformCustomDesign(wheel.customDesign),
          createdAt: wheel.createdAt ? wheel.createdAt.toISOString() : new Date().toISOString()
        }));
      } catch (error) {
        console.error('❌ Error in wheels query:', error);
        throw error;
      }
    },

    wheel: async (_: any, { id }: { id: string }, context: any) => {
      console.log('🔍 GraphQL wheel query called for ID:', id);
      
      const wheel = await prisma.wheel.findUnique({
        where: { id },
        include: {
          user: true,
          spins: {
            include: {
              user: true,
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!wheel) {
        console.log('❌ Wheel not found for ID:', id);
        throw new GraphQLError('Wheel not found');
      }

      console.log('✅ Wheel found:', {
        id: wheel.id,
        title: wheel.title,
        userId: wheel.userId,
        userName: wheel.user?.name,
        userEmail: wheel.user?.email,
        createdAt: wheel.createdAt
      });

      // Проверяем права доступа для приватных рулеток
      if (!wheel.isPublic) {
        const user = await getUserFromContext(context);
        if (!user || user.id !== wheel.userId) {
          throw new GraphQLError('Access denied');
        }
      }

      console.log('🎨 Raw custom design from DB:', wheel.customDesign);
      const transformedCustomDesign = transformCustomDesign(wheel.customDesign);
      console.log('🎨 Transformed custom design for wheel query:', transformedCustomDesign);
      
      return {
        ...wheel,
        segments: transformSegments(wheel.segments),
        customDesign: transformedCustomDesign,
        createdAt: wheel.createdAt ? wheel.createdAt.toISOString() : new Date().toISOString()
      };
    },

    publicWheels: async () => {
      const wheels = await prisma.wheel.findMany({
        where: { isPublic: true },
        include: {
          user: true,
          spins: {
            include: {
              user: true,
            },
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });
      
      return wheels.map(wheel => ({
        ...wheel,
        segments: transformSegments(wheel.segments),
        customDesign: transformCustomDesign(wheel.customDesign),
        createdAt: wheel.createdAt ? wheel.createdAt.toISOString() : new Date().toISOString()
      }));
    },

    wheelBySlug: async (_: any, { slug }: { slug: string }) => {
      console.log('🔍 GraphQL wheelBySlug query called for slug:', slug);
      
      const wheel = await prisma.wheel.findUnique({
        where: { publicSlug: slug },
        include: {
          user: true,
          spins: {
            include: {
              user: true,
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!wheel) {
        console.log('❌ Wheel not found for slug:', slug);
        throw new GraphQLError('Wheel not found');
      }

      // Проверяем, что рулетка имеет публичную ссылку
      if (!wheel.publicSlug) {
        throw new GraphQLError('This wheel does not have a public link');
      }

      console.log('✅ Wheel found by slug:', {
        id: wheel.id,
        title: wheel.title,
        slug: wheel.publicSlug,
        allowGuestSpin: wheel.allowGuestSpin
      });

      return {
        ...wheel,
        segments: transformSegments(wheel.segments),
        customDesign: transformCustomDesign(wheel.customDesign),
        createdAt: wheel.createdAt ? wheel.createdAt.toISOString() : new Date().toISOString()
      };
    },

    planLimits: async (_: any, __: any, context: any) => {
      const user = await getUserFromContext(context);
      if (!user) {
        return getPlanLimits('FREE');
      }
      
      const userWithPlan = await prisma.user.findUnique({
        where: { id: user.id },
        select: { plan: true, planExpiresAt: true }
      });
      
      const effectivePlan = getEffectivePlan(userWithPlan);
      return getPlanLimits(effectivePlan);
    },

    subscriptions: async (_: any, __: any, context: any) => {
      const user = await getUserFromContext(context);
      if (!user) throw new GraphQLError('Authentication required');

      const subscriptions = await prisma.subscription.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
      });

      return subscriptions.map(sub => ({
        ...sub,
        startDate: sub.startDate.toISOString(),
        endDate: sub.endDate.toISOString(),
        createdAt: sub.createdAt.toISOString()
      }));
    },
  },

  Mutation: {
    register: async (_: any, { input }: { input: RegisterInput }) => {
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

    login: async (_: any, { input }: { input: LoginInput }) => {
      const { email, password } = input;

      // Находим пользователя
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          wheels: true,
        },
      });

      if (!user || !user.password) {
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

    createWheel: async (_: any, { input }: { input: CreateWheelInput }, context: any) => {
      console.log('🎡 GraphQL createWheel mutation called');
      console.log('📝 Input:', JSON.stringify(input, null, 2));
      
      try {
        let user = await getUserFromContext(context);
        console.log('👤 User from context:', user ? user.id : 'null');
        
        // Если пользователь не найден, создаем временного на основе сессии
        if (!user) {
          console.log('🆕 Creating temp user for wheel creation');
          let sessionId = context.req?.headers['x-session-id'] || 
                         context.req?.headers['X-Session-Id'] ||
                         context.req?.headers['authorization']?.replace('Bearer temp_', '');
          
          if (!sessionId) {
            console.log('❌ No session ID found in headers for wheel creation');
            throw new GraphQLError('Session ID is required for temporary users');
          }
          
          console.log('🆔 Using sessionId for temp user:', sessionId);
          user = await createOrGetUser({ tempId: sessionId });
          console.log('✅ Temp user created/found:', user.id, user.email);
        }

        // Получаем полную информацию о пользователе для проверки плана
        const fullUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { plan: true, planExpiresAt: true }
        });

        const effectivePlan = getEffectivePlan(fullUser);
        
        // Проверяем лимиты создания рулеток
        const canCreateWheel = await checkWheelCreationLimits(user.id, effectivePlan);
        if (!canCreateWheel) {
          throw new GraphQLError('Достигнут лимит создания рулеток для вашего тарифа. Обновитесь до PRO для безлимитного создания.');
        }

        // Проверяем лимиты сегментов
        const canCreateSegments = checkSegmentLimits(input.segments.length, effectivePlan);
        if (!canCreateSegments) {
          const limits = getPlanLimits(effectivePlan);
          throw new GraphQLError(`Максимальное количество сегментов для вашего тарифа: ${limits.maxSegments}`);
        }

        // Проверяем использование PRO функций
        const limits = getPlanLimits(effectivePlan);
        const hasImages = input.segments.some(s => s.image);
        const hasWeights = input.segments.some(s => s.weight);

        if (hasImages && !limits.allowImages) {
          throw new GraphQLError('Изображения доступны только в PRO тарифе');
        }

        if (hasWeights && !limits.allowWeights) {
          throw new GraphQLError('Настройка весов сегментов доступна только в PRO тарифе');
        }

        console.log('💾 Creating wheel in database...');
        console.log('🎨 CustomDesign being saved:', input.customDesign);
        console.log('🎨 CustomDesign JSON:', input.customDesign ? JSON.stringify(input.customDesign) : undefined);
        
        const wheel = await prisma.wheel.create({
          data: {
            title: input.title,
            description: input.description,
            segments: JSON.stringify(input.segments),
            customDesign: input.customDesign ? JSON.stringify(input.customDesign) : undefined,
            isPublic: input.isPublic || false,
            allowGuestSpin: input.allowGuestSpin || false,
            userId: user.id,
          },
          include: {
            user: true,
            spins: {
              include: {
                user: true,
              },
            },
          },
        });

        console.log('✅ Wheel created successfully:', wheel.id, 'for user:', user.id);
        console.log('🔧 Wheel data being returned:', {
          id: wheel.id,
          title: wheel.title,
          description: wheel.description,
          isPublic: wheel.isPublic,
          userId: wheel.userId,
          segmentsRaw: wheel.segments,
          customDesignRaw: wheel.customDesign,
          createdAt: wheel.createdAt,
          createdAtType: typeof wheel.createdAt,
          createdAtISO: wheel.createdAt ? wheel.createdAt.toISOString() : 'null'
        });
        
        const transformedCustomDesign = transformCustomDesign(wheel.customDesign);
        console.log('🎨 Transformed custom design for return:', transformedCustomDesign);
        
        return {
          ...wheel,
          segments: transformSegments(wheel.segments),
          customDesign: transformedCustomDesign,
          createdAt: wheel.createdAt ? wheel.createdAt.toISOString() : new Date().toISOString()
        };
      } catch (error) {
        console.error('❌ Error creating wheel:', error);
        throw error;
      }
    },

    updateWheel: async (_: any, { id, input }: { id: string; input: UpdateWheelInput }, context: any) => {
      console.log('🔄 GraphQL updateWheel mutation called');
      console.log('🆔 Wheel ID:', id);
      console.log('📝 Input:', JSON.stringify(input, null, 2));
      console.log('🎨 CustomDesign in input:', input.customDesign);
      console.log('🖼️ Input segments with images:', input.segments.map((s, i) => ({ 
        index: i, 
        option: s.option, 
        hasImage: !!s.image, 
        imageUrl: s.image,
        imageLength: s.image?.length || 0
      })));
      
      const user = await getUserFromContext(context);
      if (!user) throw new GraphQLError('Authentication required');

      // Проверяем права доступа
      const existingWheel = await prisma.wheel.findUnique({
        where: { id },
      });

      if (!existingWheel || existingWheel.userId !== user.id) {
        throw new GraphQLError('Wheel not found or access denied');
      }

      console.log('💾 Updating wheel in database...');
      console.log('🎨 CustomDesign being saved:', input.customDesign);
      console.log('🎨 CustomDesign JSON string:', input.customDesign ? JSON.stringify(input.customDesign) : 'undefined');

      const wheel = await prisma.wheel.update({
        where: { id },
        data: {
          title: input.title,
          description: input.description,
          segments: JSON.stringify(input.segments),
          customDesign: input.customDesign ? JSON.stringify(input.customDesign) : undefined,
          isPublic: input.isPublic,
          allowGuestSpin: input.allowGuestSpin,
        },
        include: {
          user: true,
          spins: {
            include: {
              user: true,
            },
          },
        },
      });

      console.log('✅ Wheel updated successfully');
      console.log('🎨 Raw customDesign from DB:', wheel.customDesign);
      console.log('🎨 Transformed customDesign:', transformCustomDesign(wheel.customDesign));
      console.log('🖼️ Saved segments with images:', transformSegments(wheel.segments).map((s: any, i: number) => ({ 
        index: i, 
        option: s.option, 
        hasImage: !!s.image, 
        imageUrl: s.image,
        imageLength: s.image?.length || 0
      })));

      return {
        ...wheel,
        segments: transformSegments(wheel.segments),
        customDesign: transformCustomDesign(wheel.customDesign),
        createdAt: wheel.createdAt ? wheel.createdAt.toISOString() : new Date().toISOString()
      };
    },

    deleteWheel: async (_: any, { id }: { id: string }, context: any) => {
      const user = await getUserFromContext(context);
      if (!user) throw new GraphQLError('Authentication required');

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

    spinWheel: async (_: any, { input }: { input: SpinWheelInput }, context: any) => {
      let user = await getUserFromContext(context);
      
      // Если пользователь не авторизован, создаем временного
      if (!user) {
        user = await createOrGetUser({ tempId: Date.now().toString() });
      }

      // Проверяем, существует ли колесо
      const wheel = await prisma.wheel.findUnique({
        where: { id: input.wheelId },
        include: { user: true },
      });

      if (!wheel) {
        throw new GraphQLError('Wheel not found');
      }

      // Создаем запись о вращении
      const spin = await prisma.spin.create({
        data: {
          result: input.result,
          participant: input.participant,
          userId: user.id,
          wheelId: input.wheelId,
        },
        include: {
          user: true,
          wheel: {
            include: {
              user: true,
            },
          },
        },
      });

      console.log('✅ Spin created successfully:', {
        id: spin.id,
        result: spin.result,
        participant: spin.participant,
        createdAt: spin.createdAt,
        wheelId: spin.wheelId
      });

      return {
        ...spin,
        createdAt: spin.createdAt ? spin.createdAt.toISOString() : new Date().toISOString()
      };
    },

    generatePublicLink: async (_: any, { input }: { input: GeneratePublicLinkInput }, context: any) => {
      const user = await getUserFromContext(context);
      if (!user) throw new GraphQLError('Authentication required');

      // Проверяем права доступа
      const existingWheel = await prisma.wheel.findUnique({
        where: { id: input.wheelId },
      });

      if (!existingWheel || existingWheel.userId !== user.id) {
        throw new GraphQLError('Wheel not found or access denied');
      }

      // Генерируем уникальный slug
      const generateSlug = () => {
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < 8; i++) {
          result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
      };

      let slug = generateSlug();
      
      // Проверяем уникальность slug
      let existingSlug = await prisma.wheel.findUnique({
        where: { publicSlug: slug }
      });
      
      while (existingSlug) {
        slug = generateSlug();
        existingSlug = await prisma.wheel.findUnique({
          where: { publicSlug: slug }
        });
      }

      // Обновляем рулетку с публичной ссылкой
      const wheel = await prisma.wheel.update({
        where: { id: input.wheelId },
        data: {
          publicSlug: slug,
          allowGuestSpin: true, // Автоматически разрешаем гостям крутить при создании публичной ссылки
          isPublic: true, // Автоматически делаем рулетку публичной при создании публичной ссылки
        },
        include: {
          user: true,
          spins: {
            include: {
              user: true,
            },
          },
        },
      });

      console.log('✅ Public link generated:', slug, 'for wheel:', wheel.id);

      return {
        ...wheel,
        segments: transformSegments(wheel.segments),
        customDesign: transformCustomDesign(wheel.customDesign),
        createdAt: wheel.createdAt ? wheel.createdAt.toISOString() : new Date().toISOString()
      };
    },

    removePublicLink: async (_: any, { wheelId }: { wheelId: string }, context: any) => {
      const user = await getUserFromContext(context);
      if (!user) throw new GraphQLError('Authentication required');

      // Проверяем права доступа
      const existingWheel = await prisma.wheel.findUnique({
        where: { id: wheelId },
      });

      if (!existingWheel || existingWheel.userId !== user.id) {
        throw new GraphQLError('Wheel not found or access denied');
      }

      // Удаляем публичную ссылку
      const wheel = await prisma.wheel.update({
        where: { id: wheelId },
        data: {
          publicSlug: null,
          allowGuestSpin: false,
          isPublic: false, // Автоматически делаем рулетку приватной при удалении публичной ссылки
        },
        include: {
          user: true,
          spins: {
            include: {
              user: true,
            },
          },
        },
      });

      console.log('✅ Public link removed for wheel:', wheel.id);

      return {
        ...wheel,
        segments: transformSegments(wheel.segments),
        customDesign: transformCustomDesign(wheel.customDesign),
        createdAt: wheel.createdAt ? wheel.createdAt.toISOString() : new Date().toISOString()
      };
    },

    spinWheelBySlug: async (_: any, { slug, result, participant }: { slug: string; result: string; participant?: string }) => {
      console.log('🎡 GraphQL spinWheelBySlug mutation called for slug:', slug);

      // Находим рулетку по slug
      const wheel = await prisma.wheel.findUnique({
        where: { publicSlug: slug },
        include: { user: true },
      });

      if (!wheel) {
        throw new GraphQLError('Wheel not found');
      }

      // Проверяем, разрешено ли гостям крутить рулетку
      if (!wheel.allowGuestSpin) {
        throw new GraphQLError('Guest spinning is not allowed for this wheel');
      }

      // Создаем временного пользователя для гостя
      const guestUser = await createOrGetUser({ 
        tempId: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` 
      });

      // Создаем запись о вращении
      const spin = await prisma.spin.create({
        data: {
          result,
          participant: participant || 'Гость',
          userId: guestUser.id,
          wheelId: wheel.id,
        },
        include: {
          user: true,
          wheel: {
            include: {
              user: true,
            },
          },
        },
      });

      console.log('✅ Guest spin created for wheel:', wheel.id, {
        id: spin.id,
        result: spin.result,
        participant: spin.participant,
        createdAt: spin.createdAt
      });

      return {
        ...spin,
        createdAt: spin.createdAt ? spin.createdAt.toISOString() : new Date().toISOString()
      };
    },

    upgradeToPro: async (_: any, { period }: { period: string }, context: any) => {
      const user = await getUserFromContext(context);
      if (!user) throw new GraphQLError('Authentication required');

      if (!['MONTHLY', 'YEARLY'].includes(period)) {
        throw new GraphQLError('Invalid period. Must be MONTHLY or YEARLY');
      }

      const amount = PLAN_PRICES.PRO[period as keyof typeof PLAN_PRICES.PRO];
      const startDate = new Date();
      const endDate = new Date();
      
      if (period === 'MONTHLY') {
        endDate.setMonth(endDate.getMonth() + 1);
      } else {
        endDate.setFullYear(endDate.getFullYear() + 1);
      }

      // Создаем подписку
      const subscription = await prisma.subscription.create({
        data: {
          plan: 'PRO',
          status: 'ACTIVE',
          amount,
          currency: 'RUB',
          period,
          startDate,
          endDate,
          userId: user.id,
        },
      });

      // Обновляем план пользователя
      await prisma.user.update({
        where: { id: user.id },
        data: {
          plan: 'PRO',
          planExpiresAt: endDate,
        },
      });

      return {
        ...subscription,
        startDate: subscription.startDate.toISOString(),
        endDate: subscription.endDate.toISOString(),
        createdAt: subscription.createdAt.toISOString(),
      };
    },

    createSubscription: async (_: any, { input }: { input: CreateSubscriptionInput }, context: any) => {
      const user = await getUserFromContext(context);
      if (!user) throw new GraphQLError('Authentication required');

      const { plan, period } = input;

      if (plan !== 'PRO') {
        throw new GraphQLError('Only PRO plan is available for subscription');
      }

      if (!['MONTHLY', 'YEARLY'].includes(period)) {
        throw new GraphQLError('Invalid period. Must be MONTHLY or YEARLY');
      }

      const amount = PLAN_PRICES.PRO[period as keyof typeof PLAN_PRICES.PRO];
      const startDate = new Date();
      const endDate = new Date();
      
      if (period === 'MONTHLY') {
        endDate.setMonth(endDate.getMonth() + 1);
      } else {
        endDate.setFullYear(endDate.getFullYear() + 1);
      }

      const subscription = await prisma.subscription.create({
        data: {
          plan,
          status: 'ACTIVE',
          amount,
          currency: 'RUB',
          period,
          startDate,
          endDate,
          userId: user.id,
        },
      });

      // Обновляем план пользователя
      await prisma.user.update({
        where: { id: user.id },
        data: {
          plan,
          planExpiresAt: endDate,
        },
      });

      return {
        ...subscription,
        startDate: subscription.startDate.toISOString(),
        endDate: subscription.endDate.toISOString(),
        createdAt: subscription.createdAt.toISOString(),
      };
    },

    cancelSubscription: async (_: any, { subscriptionId }: { subscriptionId: string }, context: any) => {
      const user = await getUserFromContext(context);
      if (!user) throw new GraphQLError('Authentication required');

      const subscription = await prisma.subscription.findUnique({
        where: { id: subscriptionId },
      });

      if (!subscription || subscription.userId !== user.id) {
        throw new GraphQLError('Subscription not found or access denied');
      }

      const updatedSubscription = await prisma.subscription.update({
        where: { id: subscriptionId },
        data: { status: 'CANCELLED' },
      });

      // Обновляем план пользователя на FREE
      await prisma.user.update({
        where: { id: user.id },
        data: {
          plan: 'FREE',
          planExpiresAt: null,
        },
      });

      return {
        ...updatedSubscription,
        startDate: updatedSubscription.startDate.toISOString(),
        endDate: updatedSubscription.endDate.toISOString(),
        createdAt: updatedSubscription.createdAt.toISOString(),
      };
    },
  },

  // Резолверы для вложенных полей
  Wheel: {
    segments: (parent: any) => {
      console.log('🔧 Transforming segments for wheel:', parent.id, 'Raw segments:', parent.segments);
      const transformed = transformSegments(parent.segments);
      console.log('🔧 Transformed segments:', transformed);
      return transformed;
    },
  },

  Spin: {
    wheel: async (parent: any) => {
      if (parent.wheel) return parent.wheel;
      
      return await prisma.wheel.findUnique({
        where: { id: parent.wheelId },
        include: { user: true },
      });
    },
    createdAt: (parent: any) => {
      return parent.createdAt ? parent.createdAt.toISOString() : new Date().toISOString();
    },
  },
}; 