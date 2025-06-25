import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Конфигурация S3
const S3_CONFIG = {
  endpoint: 'https://s3.twcstorage.ru',
  region: 'ru-1',
  credentials: {
    accessKeyId: 'I6XD2OR7YO2ZN6L6Z629',
    secretAccessKey: '9xCOoafisG0aB9lJNvdLO1UuK73fBvMcpHMdijrJ',
  },
  forcePathStyle: true, // Для совместимости с S3-подобными сервисами
};

const BUCKET_NAME = '617774af-gifty';

// Создаем клиент S3
const s3Client = new S3Client(S3_CONFIG);

/**
 * Загружает файл в S3
 * @param file - файл для загрузки (Buffer или Uint8Array)
 * @param fileName - имя файла в S3
 * @param contentType - MIME тип файла
 * @returns URL загруженного файла
 */
export async function uploadToS3(
  file: Buffer | Uint8Array, 
  fileName: string, 
  contentType: string
): Promise<string> {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: file,
      ContentType: contentType,
      ACL: 'public-read', // Делаем файл публично доступным
      CacheControl: 'max-age=31536000', // Кэшируем на год
      Metadata: {
        'uploaded-by': 'gifty-app'
      }
    });

    await s3Client.send(command);
    
    // Возвращаем публичный URL файла
    return `${S3_CONFIG.endpoint}/${BUCKET_NAME}/${fileName}`;
  } catch (error) {
    console.error('Ошибка загрузки файла в S3:', error);
    throw new Error('Не удалось загрузить файл');
  }
}

/**
 * Удаляет файл из S3
 * @param fileName - имя файла для удаления
 */
export async function deleteFromS3(fileName: string): Promise<void> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
    });

    await s3Client.send(command);
  } catch (error) {
    console.error('Ошибка удаления файла из S3:', error);
    throw new Error('Не удалось удалить файл');
  }
}

/**
 * Получает подписанный URL для временного доступа к файлу
 * @param fileName - имя файла
 * @param expiresIn - время жизни ссылки в секундах (по умолчанию 1 час)
 * @returns подписанный URL
 */
export async function getSignedDownloadUrl(
  fileName: string, 
  expiresIn: number = 3600
): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
    });

    return await getSignedUrl(s3Client, command, { expiresIn });
  } catch (error) {
    console.error('Ошибка создания подписанного URL:', error);
    throw new Error('Не удалось создать ссылку на файл');
  }
}

/**
 * Генерирует уникальное имя файла
 * @param originalName - оригинальное имя файла
 * @param prefix - префикс для имени файла (например, 'wheel-images/')
 * @returns уникальное имя файла
 */
export function generateUniqueFileName(originalName: string, prefix: string = ''): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop();
  
  return `${prefix}${timestamp}-${randomString}.${extension}`;
}

/**
 * Проверяет, является ли файл изображением
 * @param contentType - MIME тип файла
 * @returns true если это изображение
 */
export function isImageFile(contentType: string): boolean {
  return contentType.startsWith('image/');
}

/**
 * Проверяет размер файла
 * @param fileSize - размер файла в байтах
 * @param maxSizeInMB - максимальный размер в МБ (по умолчанию 5 МБ)
 * @returns true если размер допустимый
 */
export function isValidFileSize(fileSize: number, maxSizeInMB: number = 5): boolean {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return fileSize <= maxSizeInBytes;
} 