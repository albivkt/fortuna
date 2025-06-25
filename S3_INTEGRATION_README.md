# S3 Интеграция для загрузки изображений

## Обзор

Приложение интегрировано с S3-совместимым хранилищем для загрузки и хранения изображений рулеток. Используется сервис TWC Storage.

## Конфигурация

### S3 Credentials
- **Endpoint**: https://s3.twcstorage.ru
- **Bucket**: 617774af-gifty
- **Region**: ru-1
- **Access Key**: I6XD2OR7YO2ZN6L6Z629
- **Secret Key**: 9xCOoafisG0aB9lJNvdLO1UuK73fBvMcpHMdijrJ

### Swift (альтернативный протокол)
- **URL**: https://swift.twcstorage.ru
- **Access Key**: wu14330:swift
- **Secret Key**: Zh6NYPbgp4IYmzKeMAUgwZFi8uLY4VpS6SIYMDge

## Файловая структура

```
src/
├── lib/
│   └── s3.ts                    # S3 конфигурация и утилиты
├── app/
│   ├── api/
│   │   └── upload-image/
│   │       └── route.ts         # API endpoint для загрузки
│   └── test-s3-upload/
│       └── page.tsx             # Тестовая страница
└── components/
    └── ImageUpload.tsx          # Компонент загрузки изображений
```

## API Endpoints

### POST /api/upload-image

Загружает изображение в S3 хранилище.

**Параметры:**
- `image` (File) - изображение для загрузки

**Ограничения:**
- Максимальный размер: 5 MB
- Поддерживаемые форматы: JPG, PNG, GIF, WebP

**Ответ:**
```json
{
  "success": true,
  "url": "https://s3.twcstorage.ru/617774af-gifty/wheel-images/1640995200000-abc123.jpg",
  "fileName": "wheel-images/1640995200000-abc123.jpg",
  "originalName": "my-image.jpg",
  "size": 102400,
  "type": "image/jpeg"
}
```

## Компоненты

### ImageUpload

Компонент для загрузки изображений с drag & drop поддержкой.

```tsx
import ImageUpload from '@/components/ImageUpload';

<ImageUpload
  onImageSelect={(imageUrl) => console.log('Загружено:', imageUrl)}
  currentImage={currentImageUrl}
  disabled={false}
/>
```

**Props:**
- `onImageSelect: (imageUrl: string) => void` - callback при успешной загрузке
- `currentImage?: string` - текущее изображение для отображения
- `disabled?: boolean` - отключить загрузку

## Утилиты

### src/lib/s3.ts

Основные функции для работы с S3:

- `uploadToS3(file, fileName, contentType)` - загрузка файла
- `deleteFromS3(fileName)` - удаление файла
- `getSignedDownloadUrl(fileName, expiresIn)` - получение подписанной ссылки
- `generateUniqueFileName(originalName, prefix)` - генерация уникального имени
- `isImageFile(contentType)` - проверка типа файла
- `isValidFileSize(fileSize, maxSizeInMB)` - проверка размера

## Использование в рулетках

### Изображения сегментов (PRO)
PRO пользователи могут загружать изображения для сегментов рулетки вместо использования цветов.

### Центральное изображение (PRO)
PRO пользователи могут загружать изображение для центра рулетки.

## Тестирование

Перейдите на `/test-s3-upload` для тестирования загрузки изображений:

1. **Загрузка через компонент** - тестирует ImageUpload компонент
2. **Прямая загрузка API** - тестирует API endpoint напрямую

## Безопасность

- Все загруженные файлы проверяются на тип (только изображения)
- Ограничен размер файлов (5 MB)
- Генерируются уникальные имена файлов для предотвращения конфликтов
- Файлы загружаются с публичным доступом для отображения в рулетках

## Структура хранения

Файлы в S3 организованы по папкам:

```
617774af-gifty/
└── wheel-images/
    ├── 1640995200000-abc123.jpg    # Изображения сегментов
    ├── 1640995201000-def456.png    # Центральные изображения
    └── ...
```

## Мониторинг

Все операции с S3 логируются в консоль:
- ✅ Успешные загрузки
- ❌ Ошибки загрузки
- 🔍 Детали файлов (размер, тип, имя)

## Troubleshooting

### Ошибка "Не удалось загрузить файл"
1. Проверьте интернет соединение
2. Убедитесь что файл является изображением
3. Проверьте размер файла (не более 5 MB)

### Изображения не отображаются
1. Проверьте URL в консоли браузера
2. Убедитесь что S3 bucket настроен для публичного чтения
3. Проверьте CORS настройки bucket

### Медленная загрузка
1. Уменьшите размер изображений
2. Используйте оптимизированные форматы (WebP, оптимизированный JPEG) 