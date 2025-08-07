import { useQuery, useMutation, useApolloClient } from '@apollo/client';
import { 
  GET_WHEELS, 
  GET_WHEEL, 
  GET_PUBLIC_WHEELS, 
  GET_ME,
  GET_PLAN_LIMITS,
  CREATE_WHEEL,
  UPDATE_WHEEL,
  DELETE_WHEEL,
  SPIN_WHEEL,
  REGISTER_USER,
  LOGIN_USER,
  GENERATE_PUBLIC_LINK,
  REMOVE_PUBLIC_LINK,
  UPGRADE_TO_PRO
} from './queries';
import { setAuthToken, clearAuthToken } from './client';
import { gql } from 'graphql-tag';

// Типы для TypeScript
export interface WheelSegment {
  option: string;
  style: {
    backgroundColor: string;
    textColor: string;
  };
  image?: string;
  imagePosition?: { x: number; y: number };
}

export interface Wheel {
  id: string;
  title: string;
  description?: string;
  segments: WheelSegment[];
  isPublic: boolean;
  publicSlug?: string;
  allowGuestSpin?: boolean;
  customDesign?: CustomDesign;
  createdAt: string;
  user: {
    id: string;
    name?: string;
  };
  spins: Spin[];
}

export interface CustomDesign {
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  centerImage?: string;
}

export interface Spin {
  id: string;
  result: string;
  participant?: string;
  createdAt: string;
  user: {
    id: string;
    name?: string;
  };
  wheel?: {
    id: string;
    title: string;
  };
}

export interface User {
  id: string;
  email: string;
  name?: string;
  plan?: string;
  planExpiresAt?: string;
  wheels?: {
    id: string;
    title: string;
    createdAt: string;
  }[];
}

// Хуки для запросов
export const useWheels = () => {
  return useQuery<{ wheels: Wheel[] }>(GET_WHEELS, {
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: true,
  });
};

export const useWheel = (id: string) => {
  return useQuery<{ wheel: Wheel }>(GET_WHEEL, {
    variables: { id },
    skip: !id,
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: true,
  });
};

export const usePublicWheels = () => {
  return useQuery<{ publicWheels: Wheel[] }>(GET_PUBLIC_WHEELS, {
    errorPolicy: 'all',
  });
};

export const useMe = () => {
  return useQuery<{ me: User }>(GET_ME, {
    errorPolicy: 'all',
  });
};

export const usePlanLimits = () => {
  return useQuery<{ 
    planLimits: {
      maxWheels: number;
      maxSegments: number;
      allowImages: boolean;
      allowWeights: boolean;
      allowCustomDesign: boolean;
      allowStatistics: boolean;
    };
    me: User;
  }>(GET_PLAN_LIMITS, {
    errorPolicy: 'all',
  });
};

// Хуки для мутаций
export const useCreateWheel = () => {
  return useMutation<
    { createWheel: Wheel },
    { input: CreateWheelInput }
  >(CREATE_WHEEL, {
    refetchQueries: [{ query: GET_WHEELS }],
    awaitRefetchQueries: true,
    errorPolicy: 'all',
    // Убираем ручное обновление кэша, так как refetchQueries справится с этим
    onCompleted: (data) => {
      if (data?.createWheel) {
        console.log('✅ Wheel created successfully:', data.createWheel.id);
      }
    },
  });
};

export const useUpdateWheel = () => {
  return useMutation<
    { updateWheel: Wheel },
    { id: string; input: UpdateWheelInput }
  >(UPDATE_WHEEL, {
    refetchQueries: [{ query: GET_WHEELS }],
    awaitRefetchQueries: true,
    errorPolicy: 'all',
  });
};

export const useDeleteWheel = () => {
  return useMutation<
    { deleteWheel: boolean },
    { id: string }
  >(DELETE_WHEEL, {
    refetchQueries: [{ query: GET_WHEELS }],
    awaitRefetchQueries: true,
    errorPolicy: 'all',
  });
};

export const useSpinWheel = () => {
  return useMutation<
    { spinWheel: Spin },
    { input: SpinWheelInput }
  >(SPIN_WHEEL, {
    errorPolicy: 'all',
    // Обновляем кэш после вращения
    update: (cache, { data }) => {
      if (data?.spinWheel) {
        // Можно обновить кэш конкретного колеса
        const wheelId = data.spinWheel.wheel?.id;
        if (wheelId) {
          try {
            const existingWheel = cache.readQuery<{ wheel: Wheel }>({
              query: GET_WHEEL,
              variables: { id: wheelId },
            });
            
            if (existingWheel?.wheel) {
              cache.writeQuery({
                query: GET_WHEEL,
                variables: { id: wheelId },
                data: {
                  wheel: {
                    ...existingWheel.wheel,
                    spins: [data.spinWheel, ...existingWheel.wheel.spins],
                  },
                },
              });
            }
          } catch (error) {
            // Игнорируем ошибки кэша
            console.log('Cache update error:', error);
          }
        }
      }
    },
  });
};

export const useRegister = () => {
  const client = useApolloClient();
  
  return useMutation<
    { register: { token: string; user: User } },
    { input: RegisterInput }
  >(REGISTER_USER, {
    onCompleted: (data) => {
      // Сохраняем токен
      setAuthToken(data.register.token);
      // Очищаем кэш Apollo для обновления состояния
      client.resetStore();
    },
    errorPolicy: 'all',
  });
};

export const useLogin = () => {
  const client = useApolloClient();
  
  return useMutation<
    { login: { token: string; user: User } },
    { input: LoginInput }
  >(LOGIN_USER, {
    onCompleted: (data) => {
      // Сохраняем токен
      setAuthToken(data.login.token);
      // Очищаем кэш Apollo для обновления состояния
      client.resetStore();
    },
    errorPolicy: 'all',
  });
};

export const useGeneratePublicLink = () => {
  return useMutation<
    { generatePublicLink: Wheel },
    { input: GeneratePublicLinkInput }
  >(GENERATE_PUBLIC_LINK, {
    refetchQueries: [{ query: GET_WHEELS }],
    awaitRefetchQueries: true,
    errorPolicy: 'all',
    onCompleted: (data) => {
      console.log('✅ Public link generated:', data.generatePublicLink);
    },
    onError: (error) => {
      console.error('❌ Error generating public link:', error);
    },
  });
};

export const useRemovePublicLink = () => {
  return useMutation<
    { removePublicLink: Wheel },
    { wheelId: string }
  >(REMOVE_PUBLIC_LINK, {
    refetchQueries: [{ query: GET_WHEELS }],
    awaitRefetchQueries: true,
    errorPolicy: 'all',
    onCompleted: (data) => {
      console.log('✅ Public link removed:', data.removePublicLink);
    },
    onError: (error) => {
      console.error('❌ Error removing public link:', error);
    },
  });
};

// Типы для входных данных
export interface CreateWheelInput {
  title: string;
  description?: string;
  segments: WheelSegmentInput[];
  isPublic?: boolean;
  allowGuestSpin?: boolean;
  customDesign?: CustomDesignInput;
}

export interface UpdateWheelInput {
  title: string;
  description?: string;
  segments: WheelSegmentInput[];
  isPublic?: boolean;
  allowGuestSpin?: boolean;
  customDesign?: CustomDesignInput;
}

export interface CustomDesignInput {
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  centerImage?: string;
}

export interface WheelSegmentInput {
  option: string;
  style: WheelSegmentStyleInput;
  image?: string;
  imagePosition?: { x: number; y: number };
}

export interface WheelSegmentStyleInput {
  backgroundColor: string;
  textColor: string;
}

export interface SpinWheelInput {
  wheelId: string;
  result: string;
  participant?: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  name?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface GeneratePublicLinkInput {
  wheelId: string;
}

// Утилитарные функции
export const useLogout = () => {
  const client = useApolloClient();
  
  return () => {
    clearAuthToken();
    client.resetStore();
  };
};

// Хук для проверки аутентификации
export const useAuth = () => {
  const { data, loading, error } = useMe();
  
  return {
    user: data?.me || null,
    isAuthenticated: !!data?.me,
    loading,
    error,
  };
};

export const useUpgradeToPro = () => {
  const client = useApolloClient();
  
  return useMutation<
    { upgradeToPro: { id: string; plan: string; status: string; amount: number; period: string; startDate: string; endDate: string } },
    { period: string }
  >(UPGRADE_TO_PRO, {
    onCompleted: (data) => {
      console.log('✅ PRO upgrade completed:', data);
      // Очищаем весь кэш Apollo для обновления всех компонентов
      client.resetStore().then(() => {
        console.log('🔄 Apollo cache reset after PRO upgrade');
      });
    },
    errorPolicy: 'all',
  });
};

// GraphQL мутация для обновления пользователя
const UPDATE_USER = gql`
  mutation UpdateUser($input: UpdateUserInput!) {
    updateUser(input: $input) {
      id
      name
      email
      plan
    }
  }
`;

export const useUpdateUser = () => {
  return useMutation<
    { updateUser: { id: string; name: string; email: string; plan: string } },
    { input: { name?: string; email?: string; password?: string } }
  >(UPDATE_USER, {
    errorPolicy: 'all',
  });
}; 