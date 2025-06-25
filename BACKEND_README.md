# GraphQL Бэкенд для Fortuna Roulette

## Обзор

Полноценный GraphQL бэкенд для приложения рулеток с базой данных SQLite, системой аутентификации и поддержкой временных сессий.

## Архитектура

### База данных (Prisma + SQLite)
- **SQLite** - легковесная база данных для разработки
- **Prisma** - ORM для работы с базой данных
- **Автоматическая миграция** схемы

### Модели данных

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String?
  name      String?
  plan      String   @default("FREE") // FREE, PRO
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  wheels    Wheel[]
  spins     Spin[]
}

model Wheel {
  id           String   @id @default(cuid())
  title        String
  description  String?
  segments     Json     // Массив сегментов
  isPublic     Boolean  @default(false)
  customDesign Json?    // Для PRO пользователей
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  userId       String
  user         User     @relation(fields: [userId], references: [id])
  spins        Spin[]
}

model Spin {
  id          String   @id @default(cuid())
  result      String
  participant String?
  createdAt   DateTime @default(now())
  
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  wheelId     String
  wheel       Wheel    @relation(fields: [wheelId], references: [id])
}
```

## Система аутентификации

### JWT токены
- **Регистрация/Вход** - полная аутентификация с JWT
- **Временные сессии** - для неавторизованных пользователей
- **Автоматическое создание** временных пользователей

### Поддерживаемые методы
1. **Полная регистрация** - email + пароль
2. **Вход** - email + пароль  
3. **Временная сессия** - автоматически для анонимных пользователей

## GraphQL API

### Запросы (Queries)

#### `me: User`
Получение информации о текущем пользователе
```graphql
query GetMe {
  me {
    id
    email
    name
    plan
    wheels {
      id
      title
      createdAt
    }
  }
}
```

#### `wheels: [Wheel!]!`
Получение рулеток пользователя
```graphql
query GetWheels {
  wheels {
    id
    title
    description
    segments {
      option
      style {
        backgroundColor
        textColor
      }
    }
    isPublic
    createdAt
    user {
      id
      name
    }
    spins {
      id
      result
      participant
      createdAt
    }
  }
}
```

#### `wheel(id: ID!): Wheel`
Получение конкретной рулетки
```graphql
query GetWheel($id: ID!) {
  wheel(id: $id) {
    id
    title
    description
    segments {
      option
      style {
        backgroundColor
        textColor
      }
    }
    isPublic
    createdAt
    user {
      id
      name
    }
    spins {
      id
      result
      participant
      createdAt
      user {
        name
      }
    }
  }
}
```

#### `publicWheels: [Wheel!]!`
Получение публичных рулеток
```graphql
query GetPublicWheels {
  publicWheels {
    id
    title
    description
    segments {
      option
      style {
        backgroundColor
        textColor
      }
    }
    user {
      name
    }
    spins {
      id
      result
      createdAt
    }
  }
}
```

### Мутации (Mutations)

#### `register(input: RegisterInput!): AuthPayload!`
Регистрация нового пользователя
```graphql
mutation Register($input: RegisterInput!) {
  register(input: $input) {
    token
    user {
      id
      email
      name
      plan
    }
  }
}
```

#### `login(input: LoginInput!): AuthPayload!`
Вход пользователя
```graphql
mutation Login($input: LoginInput!) {
  login(input: $input) {
    token
    user {
      id
      email
      name
      plan
    }
  }
}
```

#### `createWheel(input: CreateWheelInput!): Wheel!`
Создание новой рулетки
```graphql
mutation CreateWheel($input: CreateWheelInput!) {
  createWheel(input: $input) {
    id
    title
    description
    segments {
      option
      style {
        backgroundColor
        textColor
      }
    }
    isPublic
    createdAt
  }
}
```

#### `updateWheel(id: ID!, input: CreateWheelInput!): Wheel!`
Обновление рулетки
```graphql
mutation UpdateWheel($id: ID!, $input: CreateWheelInput!) {
  updateWheel(id: $id, input: $input) {
    id
    title
    description
    segments {
      option
      style {
        backgroundColor
        textColor
      }
    }
    isPublic
    updatedAt
  }
}
```

#### `deleteWheel(id: ID!): Boolean!`
Удаление рулетки
```graphql
mutation DeleteWheel($id: ID!) {
  deleteWheel(id: $id)
}
```

#### `spinWheel(input: SpinWheelInput!): Spin!`
Запись результата вращения
```graphql
mutation SpinWheel($input: SpinWheelInput!) {
  spinWheel(input: $input) {
    id
    result
    participant
    createdAt
    user {
      name
    }
    wheel {
      id
      title
    }
  }
}
```

## Типы входных данных

### RegisterInput
```graphql
input RegisterInput {
  email: String!
  password: String!
  name: String
}
```

### LoginInput
```graphql
input LoginInput {
  email: String!
  password: String!
}
```

### CreateWheelInput
```graphql
input CreateWheelInput {
  title: String!
  description: String
  segments: [WheelSegmentInput!]!
  isPublic: Boolean
}
```

### WheelSegmentInput
```graphql
input WheelSegmentInput {
  option: String!
  style: WheelSegmentStyleInput!
}
```

### WheelSegmentStyleInput
```graphql
input WheelSegmentStyleInput {
  backgroundColor: String!
  textColor: String!
}
```

### SpinWheelInput
```graphql
input SpinWheelInput {
  wheelId: ID!
  result: String!
  participant: String
}
```

## Использование в React

### Настройка Apollo Client
```typescript
import { apolloClient, setAuthToken, clearAuthToken } from '@/lib/graphql/client';
import { ApolloProvider } from '@apollo/client';

function App({ children }) {
  return (
    <ApolloProvider client={apolloClient}>
      {children}
    </ApolloProvider>
  );
}
```

### Использование хуков
```typescript
import { 
  useWheels, 
  useCreateWheel, 
  useSpinWheel,
  useAuth,
  useLogin,
  useRegister 
} from '@/lib/graphql/hooks';

function MyComponent() {
  // Получение данных
  const { data, loading, error } = useWheels();
  const { user, isAuthenticated } = useAuth();
  
  // Мутации
  const [createWheel] = useCreateWheel();
  const [spinWheel] = useSpinWheel();
  const [login] = useLogin();
  
  // Использование
  const handleCreateWheel = async () => {
    const result = await createWheel({
      variables: {
        input: {
          title: 'Моя рулетка',
          segments: [
            {
              option: 'Вариант 1',
              style: { backgroundColor: '#FF6B6B', textColor: 'white' }
            }
          ]
        }
      }
    });
  };
}
```

## Безопасность

### Аутентификация
- JWT токены с истечением срока действия (7 дней)
- Хеширование паролей с bcrypt
- Проверка прав доступа для приватных рулеток

### Авторизация
- Пользователи могут редактировать только свои рулетки
- Публичные рулетки доступны всем для просмотра
- Временные пользователи имеют ограниченные права

## Развертывание

### Локальная разработка
```bash
# Установка зависимостей
npm install

# Генерация Prisma клиента
npx prisma generate

# Создание базы данных
npx prisma db push

# Запуск приложения
npm run dev
```

### Переменные окружения
```env
# JWT секрет
JWT_SECRET=your-super-secret-jwt-key

# База данных
DATABASE_URL="file:./dev.db"
```

## Тестирование

### Страница тестирования
Доступна по адресу: `/test-backend`

Включает тесты:
- ✅ Регистрация и вход пользователей
- ✅ Создание рулеток
- ✅ Вращение рулеток
- ✅ Удаление рулеток
- ✅ Работа с временными сессиями
- ✅ Обновление кэша Apollo

### GraphQL Playground
Доступен по адресу: `/api/graphql`

## Преимущества нового бэкенда

### 🚀 Производительность
- Реальная база данных вместо localStorage
- Оптимизированные запросы с Prisma
- Кэширование Apollo Client

### 🔒 Безопасность
- JWT аутентификация
- Хеширование паролей
- Контроль доступа

### 📊 Масштабируемость
- Поддержка множественных пользователей
- Система планов (FREE/PRO)
- Возможность добавления новых функций

### 🛠 Разработка
- Полная типизация TypeScript
- Автоматическая генерация типов
- Удобные React хуки

## Миграция с localStorage

Приложение полностью совместимо с предыдущей версией:
- Автоматическое создание временных пользователей
- Сохранение всех существующих функций
- Плавный переход на новую систему

## Будущие возможности

- 📱 Мобильное приложение
- 🌐 Реальное время (WebSocket/GraphQL Subscriptions)
- 📈 Аналитика и статистика
- 🎨 Расширенная кастомизация для PRO
- 🔗 API для интеграций
- 📧 Email уведомления
- 🌍 Мультиязычность 