import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// Простой HTTP link без дополнительной логики
const httpLink = createHttpLink({
  uri: '/api/graphql',
});

// Функция для получения или создания постоянного ID сессии
const getSessionId = () => {
  if (typeof window === 'undefined') return null;
  
  let sessionId = localStorage.getItem('gifty_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('gifty_session_id', sessionId);
    console.log('🆕 Создан новый session ID:', sessionId);
  } else {
    console.log('📋 Используется существующий session ID:', sessionId);
  }
  return sessionId;
};

const authLink = setContext((_, { headers }) => {
  // Получаем токен из localStorage или используем постоянную сессию
  let token = null;
  let sessionId = null;
  
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('auth_token');
    sessionId = getSessionId();
    
    console.log('🔐 Auth context:', { 
      hasRealToken: !!localStorage.getItem('auth_token'),
      sessionId,
      token,
      tokenType: token?.startsWith('temp_') ? 'real' : 'temporary'
    });
  }
  
  const finalHeaders = {
    ...headers,
    authorization: token ? `Bearer ${token}` : "",
    'x-session-id': sessionId || '', // Основной заголовок
    'X-Session-Id': sessionId || '', // Дублируем для надежности
  };
  
  console.log('📤 Отправляем заголовки:', finalHeaders);
  
  return {
    headers: finalHeaders
  }
});

export const apolloClient = new ApolloClient({
  link: from([authLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Wheel: {
        fields: {
          segments: {
            merge: false, // Заменяем массив полностью
          },
          spins: {
            merge: false,
          },
        },
      },
      User: {
        fields: {
          wheels: {
            merge: false,
          },
        },
      },
      Query: {
        fields: {
          wheels: {
            merge: false, // Заменяем список рулеток полностью
          },
        },
      },
    },
    // Добавляем более мягкую обработку ошибок кэша
    addTypename: true,
    resultCaching: true,
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
      fetchPolicy: 'cache-and-network',
    },
    query: {
      errorPolicy: 'all',
      fetchPolicy: 'cache-first',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});

// Функция для установки токена аутентификации
export const setAuthToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token);
    // Очищаем временную сессию при установке реального токена
    localStorage.removeItem('gifty_session_id');
  }
};

// Функция для очистки токена
export const clearAuthToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
    // Создаем новую временную сессию
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('gifty_session_id', sessionId);
  }
}; 