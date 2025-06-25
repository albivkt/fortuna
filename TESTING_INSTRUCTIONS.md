# Инструкция по тестированию GraphQL бэкенда

## Проблема
При создании рулетки она не появляется в дашборде, хотя должна сохраняться через GraphQL бэкенд.

## Шаги для диагностики

### 1. Откройте страницу отладки GraphQL
Перейдите по адресу: `http://localhost:3001/debug-graphql`

### 2. Тестирование GraphQL запросов

#### Тест 1: Проверка запроса wheels
1. Нажмите кнопку "Тест wheels query"
2. Проверьте результат - должен вернуться пустой массив `[]` или массив с рулетками

#### Тест 2: Создание рулетки
1. Нажмите кнопку "Создать тестовую рулетку"
2. Проверьте результат - должна создаться рулетка с ID

#### Тест 3: Повторная проверка wheels
1. Снова нажмите "Тест wheels query"
2. Теперь должна появиться созданная рулетка

### 3. Проверка консоли браузера
1. Откройте DevTools (F12)
2. Перейдите на вкладку Console
3. Создайте рулетку через обычный интерфейс (`/dashboard/create`)
4. Проверьте, есть ли ошибки в консоли

### 4. Проверка консоли сервера
1. Откройте терминал где запущен `npm run dev`
2. Создайте рулетку через интерфейс
3. Проверьте логи сервера - должны появиться сообщения:
   - `🔍 GraphQL Context created for: POST`
   - `🚀 GraphQL Operation: CreateWheel`
   - `🎡 GraphQL createWheel mutation called`
   - `✅ Wheel created successfully: [ID]`

### 5. Проверка базы данных
1. Откройте Prisma Studio: `http://localhost:5555`
2. Проверьте таблицы User и Wheel
3. Убедитесь, что данные сохраняются

## Возможные проблемы и решения

### Проблема 1: GraphQL эндпоинт не отвечает
**Симптомы:** Ошибки сети при запросах к `/api/graphql`
**Решение:** 
```bash
# Перезапустите сервер
npm run dev
```

### Проблема 2: Ошибки базы данных
**Симптомы:** Ошибки Prisma в консоли сервера
**Решение:**
```bash
# Пересоздайте базу данных
npx prisma db push --force-reset
npx prisma generate
```

### Проблема 3: Проблемы с кэшем Apollo
**Симптомы:** Данные не обновляются в интерфейсе
**Решение:** Очистите кэш браузера или используйте режим инкогнито

### Проблема 4: Ошибки аутентификации
**Симптомы:** Ошибки "Access denied" или проблемы с временными пользователями
**Решение:** Проверьте логи создания временных пользователей

## Отладочная информация

### Логи GraphQL сервера
При правильной работе вы должны видеть:
```
🔍 GraphQL Context created for: POST
🚀 GraphQL Operation: GetWheels
🔍 GraphQL wheels query called
👤 User from context: null
🆕 Creating temp user
✅ Temp user created: [USER_ID]
🎡 Wheels for temp user: 0
```

### Логи создания рулетки
```
🔍 GraphQL Context created for: POST
🚀 GraphQL Operation: CreateWheel
🎡 GraphQL createWheel mutation called
📝 Input: { "title": "...", "segments": [...] }
👤 User from context: null
🆕 Creating temp user for wheel creation
✅ Temp user created: [USER_ID]
💾 Creating wheel in database...
✅ Wheel created successfully: [WHEEL_ID]
```

## Контакты для поддержки
Если проблема не решается, предоставьте:
1. Скриншоты ошибок из консоли браузера
2. Логи из консоли сервера
3. Результаты тестов с страницы `/debug-graphql` 