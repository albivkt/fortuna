# GraphQL интеграция в Fortuna

## Обзор

Приложение Fortuna теперь поддерживает отправку запросов колеса рулетки через GraphQL. Это обеспечивает более структурированный и типизированный способ взаимодействия с данными.

## Архитектура

### GraphQL Server
- **Эндпоинт**: `/api/graphql`
- **Сервер**: Apollo Server с интеграцией Next.js
- **Схема**: Определена в `src/lib/graphql/typeDefs.ts`
- **Резолверы**: Реализованы в `src/lib/graphql/resolvers.ts`

### GraphQL Client
- **Клиент**: Apollo Client
- **Конфигурация**: `src/lib/graphql/client.ts`
- **Хуки**: `src/lib/graphql/hooks.ts`
- **Запросы**: `src/lib/graphql/queries.ts`

## Поддерживаемые операции

### Запросы (Queries)

#### `wheels`
Получить все рулетки текущего пользователя
```graphql
query GetWheels {
  wheels {
    id
    title
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
  }
}
```

#### `wheel(id: ID!)`
Получить конкретную рулетку по ID
```graphql
query GetWheel($id: ID!) {
  wheel(id: $id) {
    id
    title
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
      createdAt
      user {
        name
      }
    }
  }
}
```

#### `publicWheels`
Получить публичные рулетки
```graphql
query GetPublicWheels {
  publicWheels {
    id
    title
    segments {
      option
      style {
        backgroundColor
        textColor
      }
    }
    createdAt
    user {
      name
    }
  }
}
```

#### `me`
Получить информацию о текущем пользователе
```graphql
query GetMe {
  me {
    id
    email
    name
    wheels {
      id
      title
      createdAt
    }
  }
}
```

### Мутации (Mutations)

#### `createWheel`
Создать новую рулетку
```graphql
mutation CreateWheel($input: CreateWheelInput!) {
  createWheel(input: $input) {
    id
    title
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

#### `updateWheel`
Обновить существующую рулетку
```graphql
mutation UpdateWheel($id: ID!, $input: CreateWheelInput!) {
  updateWheel(id: $id, input: $input) {
    id
    title
    segments {
      option
      style {
        backgroundColor
        textColor
      }
    }
    isPublic
  }
}
```

#### `deleteWheel`
Удалить рулетку
```graphql
mutation DeleteWheel($id: ID!) {
  deleteWheel(id: $id)
}
```

#### `spinWheel`
Записать результат вращения рулетки
```graphql
mutation SpinWheel($input: SpinWheelInput!) {
  spinWheel(input: $input) {
    id
    result
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

## Использование в компонентах

### Импорт хуков
```typescript
import { 
  useWheels, 
  useWheel, 
  useCreateWheel, 
  useUpdateWheel, 
  useDeleteWheel, 
  useSpinWheel 
} from '@/lib/graphql/hooks';
```

### Пример использования

#### Получение списка рулеток
```typescript
const { data, loading, error, refetch } = useWheels();
const wheels = data?.wheels || [];

if (loading) return <div>Загрузка...</div>;
if (error) return <div>Ошибка: {error.message}</div>;
```

#### Создание рулетки
```typescript
const [createWheel, { loading: creating }] = useCreateWheel();

const handleCreate = async () => {
  try {
    await createWheel({
      variables: {
        input: {
          title: 'Моя рулетка',
          segments: [
            {
              option: 'Приз 1',
              style: {
                backgroundColor: '#EC4899',
                textColor: 'white'
              }
            }
          ],
          isPublic: false
        }
      }
    });
  } catch (error) {
    console.error('Ошибка создания:', error);
  }
};
```

#### Вращение рулетки
```typescript
const [spinWheel] = useSpinWheel();

const handleSpin = async (wheelId: string, result: string) => {
  try {
    await spinWheel({
      variables: {
        input: {
          wheelId,
          result
        }
      }
    });
  } catch (error) {
    console.error('Ошибка записи результата:', error);
  }
};
```

## Обновленные страницы

Следующие страницы были обновлены для использования GraphQL:

1. **Страница рулетки** (`/roulette/[id]`) - использует `useWheel` и `useSpinWheel`
2. **Дашборд** (`/dashboard`) - использует `useWheels` и `useDeleteWheel`
3. **Создание рулетки** (`/dashboard/create`) - использует `useCreateWheel`
4. **Редактирование рулетки** (`/dashboard/edit/[id]`) - использует `useWheel` и `useUpdateWheel`

## Тестирование

Для тестирования GraphQL функциональности:

1. Перейдите на `/test-graphql`
2. Создайте тестовую рулетку
3. Проверьте отображение данных
4. Удалите рулетку

## Совместимость

GraphQL интеграция полностью совместима с существующей системой localStorage:
- Данные продолжают храниться в localStorage
- Существующие рулетки остаются доступными
- Пользовательские данные сохраняются

## Типы данных

### CreateWheelInput
```typescript
interface CreateWheelInput {
  title: string;
  description?: string;
  segments: WheelSegmentInput[];
  isPublic?: boolean;
}
```

### WheelSegmentInput
```typescript
interface WheelSegmentInput {
  option: string;
  style: WheelSegmentStyleInput;
}
```

### WheelSegmentStyleInput
```typescript
interface WheelSegmentStyleInput {
  backgroundColor: string;
  textColor: string;
}
```

### SpinWheelInput
```typescript
interface SpinWheelInput {
  wheelId: string;
  result: string;
}
```

## Преимущества GraphQL

1. **Типизация** - Полная типизация запросов и ответов
2. **Гибкость** - Запрос только нужных данных
3. **Единый эндпоинт** - Все операции через `/api/graphql`
4. **Кэширование** - Автоматическое кэширование Apollo Client
5. **Оптимизация** - Batch запросы и оптимистичные обновления

## Развитие

В будущем можно добавить:
- Подписки (Subscriptions) для real-time обновлений
- Пагинацию для больших списков рулеток
- Фильтрацию и сортировку
- Агрегированные данные и статистику
- Интеграцию с внешними API 