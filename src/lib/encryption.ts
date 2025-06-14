// Система шифрования для платежных данных
import crypto from 'crypto';

// Конфигурация шифрования
const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

// Получение ключа шифрования из переменных окружения
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error('ENCRYPTION_KEY не установлен в переменных окружения');
  }
  
  // Если ключ короче 32 байт, дополняем его
  if (key.length < KEY_LENGTH) {
    return Buffer.concat([Buffer.from(key), Buffer.alloc(KEY_LENGTH - key.length)]);
  }
  
  return Buffer.from(key).slice(0, KEY_LENGTH);
}

// Интерфейс для зашифрованных данных
export interface EncryptedData {
  encrypted: string;
  iv: string;
  tag: string;
}

// Шифрование данных
export function encrypt(text: string): EncryptedData {
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    
    const cipher = crypto.createCipher(ALGORITHM, key);
    cipher.setAAD(Buffer.from('payment-data')); // Дополнительные аутентифицированные данные
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    };
  } catch (error) {
    console.error('Ошибка шифрования:', error);
    throw new Error('Не удалось зашифровать данные');
  }
}

// Расшифровка данных
export function decrypt(encryptedData: EncryptedData): string {
  try {
    const key = getEncryptionKey();
    const iv = Buffer.from(encryptedData.iv, 'hex');
    const tag = Buffer.from(encryptedData.tag, 'hex');
    
    const decipher = crypto.createDecipher(ALGORITHM, key);
    decipher.setAAD(Buffer.from('payment-data'));
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Ошибка расшифровки:', error);
    throw new Error('Не удалось расшифровать данные');
  }
}

// Хеширование паролей
export function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex');
    crypto.pbkdf2(password, salt, 100000, 64, 'sha512', (err, derivedKey) => {
      if (err) reject(err);
      resolve(salt + ':' + derivedKey.toString('hex'));
    });
  });
}

// Проверка пароля
export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const [salt, key] = hash.split(':');
    crypto.pbkdf2(password, salt, 100000, 64, 'sha512', (err, derivedKey) => {
      if (err) reject(err);
      resolve(key === derivedKey.toString('hex'));
    });
  });
}

// Генерация безопасного токена
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

// Маскировка номера карты
export function maskCardNumber(cardNumber: string): string {
  if (!cardNumber || cardNumber.length < 8) {
    return '****';
  }
  
  const cleaned = cardNumber.replace(/\D/g, '');
  const firstFour = cleaned.slice(0, 4);
  const lastFour = cleaned.slice(-4);
  const middle = '*'.repeat(cleaned.length - 8);
  
  return `${firstFour}${middle}${lastFour}`;
}

// Валидация номера карты (алгоритм Луна)
export function validateCardNumber(cardNumber: string): boolean {
  const cleaned = cardNumber.replace(/\D/g, '');
  
  if (cleaned.length < 13 || cleaned.length > 19) {
    return false;
  }
  
  let sum = 0;
  let isEven = false;
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i]);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
}

// Определение типа карты
export function getCardType(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\D/g, '');
  
  if (/^4/.test(cleaned)) {
    return 'Visa';
  } else if (/^5[1-5]/.test(cleaned) || /^2[2-7]/.test(cleaned)) {
    return 'MasterCard';
  } else if (/^3[47]/.test(cleaned)) {
    return 'American Express';
  } else if (/^6/.test(cleaned)) {
    return 'Discover';
  } else if (/^2/.test(cleaned)) {
    return 'Мир';
  }
  
  return 'Unknown';
}

// Безопасное сравнение строк (защита от timing attacks)
export function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
}

// Генерация CSRF токена
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('base64');
}

// Проверка CSRF токена
export function verifyCSRFToken(token: string, sessionToken: string): boolean {
  return safeCompare(token, sessionToken);
} 