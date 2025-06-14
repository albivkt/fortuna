// Утилиты для валидации данных
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Валидация email
export function validateEmail(email: string): ValidationResult {
  const errors: string[] = [];
  
  if (!email) {
    errors.push('Email обязателен');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Некорректный формат email');
  } else if (email.length > 254) {
    errors.push('Email слишком длинный');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Валидация пароля
export function validatePassword(password: string): ValidationResult {
  const errors: string[] = [];
  
  if (!password) {
    errors.push('Пароль обязателен');
  } else {
    if (password.length < 8) {
      errors.push('Пароль должен содержать минимум 8 символов');
    }
    if (password.length > 128) {
      errors.push('Пароль слишком длинный');
    }
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Пароль должен содержать строчные буквы');
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Пароль должен содержать заглавные буквы');
    }
    if (!/(?=.*\d)/.test(password)) {
      errors.push('Пароль должен содержать цифры');
    }
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      errors.push('Пароль должен содержать специальные символы (@$!%*?&)');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Валидация имени
export function validateName(name: string): ValidationResult {
  const errors: string[] = [];
  
  if (!name) {
    errors.push('Имя обязательно');
  } else {
    if (name.length < 2) {
      errors.push('Имя должно содержать минимум 2 символа');
    }
    if (name.length > 50) {
      errors.push('Имя слишком длинное');
    }
    if (!/^[a-zA-Zа-яА-Я\s]+$/.test(name)) {
      errors.push('Имя может содержать только буквы и пробелы');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Валидация названия рулетки
export function validateRouletteName(name: string): ValidationResult {
  const errors: string[] = [];
  
  if (!name || !name.trim()) {
    errors.push('Название рулетки обязательно');
  } else {
    const trimmedName = name.trim();
    if (trimmedName.length < 3) {
      errors.push('Название должно содержать минимум 3 символа');
    }
    if (trimmedName.length > 100) {
      errors.push('Название слишком длинное');
    }
    // Проверка на потенциально опасные символы
    if (/<script|javascript:|data:|vbscript:/i.test(trimmedName)) {
      errors.push('Название содержит недопустимые символы');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Валидация сегмента рулетки
export function validateSegment(text: string, color: string): ValidationResult {
  const errors: string[] = [];
  
  if (!text || !text.trim()) {
    errors.push('Текст сегмента обязателен');
  } else {
    const trimmedText = text.trim();
    if (trimmedText.length < 1) {
      errors.push('Текст сегмента не может быть пустым');
    }
    if (trimmedText.length > 50) {
      errors.push('Текст сегмента слишком длинный');
    }
    // Проверка на XSS
    if (/<script|javascript:|data:|vbscript:/i.test(trimmedText)) {
      errors.push('Текст содержит недопустимые символы');
    }
  }
  
  if (!color) {
    errors.push('Цвет сегмента обязателен');
  } else if (!/^#[0-9A-F]{6}$/i.test(color)) {
    errors.push('Некорректный формат цвета');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Санитизация HTML
export function sanitizeHtml(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Валидация файлов изображений
export function validateImageFile(file: File): ValidationResult {
  const errors: string[] = [];
  
  // Проверка типа файла
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    errors.push('Разрешены только изображения (JPEG, PNG, GIF, WebP)');
  }
  
  // Проверка размера файла (максимум 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    errors.push('Размер файла не должен превышать 5MB');
  }
  
  // Проверка имени файла
  if (file.name.length > 255) {
    errors.push('Имя файла слишком длинное');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Rate limiting для API
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  
  constructor(
    private maxRequests: number = 100,
    private windowMs: number = 15 * 60 * 1000 // 15 минут
  ) {}
  
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    if (!this.requests.has(identifier)) {
      this.requests.set(identifier, []);
    }
    
    const userRequests = this.requests.get(identifier)!;
    
    // Удаляем старые запросы
    const validRequests = userRequests.filter(time => time > windowStart);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    
    return true;
  }
  
  getRemainingRequests(identifier: string): number {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    if (!this.requests.has(identifier)) {
      return this.maxRequests;
    }
    
    const userRequests = this.requests.get(identifier)!;
    const validRequests = userRequests.filter(time => time > windowStart);
    
    return Math.max(0, this.maxRequests - validRequests.length);
  }
} 