// Middleware для безопасности API
import { NextRequest, NextResponse } from 'next/server';
import { RateLimiter } from './validation';

// Глобальные rate limiters
const generalLimiter = new RateLimiter(100, 15 * 60 * 1000); // 100 запросов за 15 минут
const authLimiter = new RateLimiter(5, 15 * 60 * 1000); // 5 попыток авторизации за 15 минут
const registrationLimiter = new RateLimiter(3, 60 * 60 * 1000); // 3 регистрации за час

// Получение IP адреса клиента
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  return realIP || 'unknown';
}

// Проверка подозрительных User-Agent
function isSuspiciousUserAgent(userAgent: string | null): boolean {
  if (!userAgent) return true;
  
  const suspiciousPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python/i,
    /java/i,
    /go-http-client/i,
    /postman/i
  ];
  
  return suspiciousPatterns.some(pattern => pattern.test(userAgent));
}

// Проверка заголовков безопасности
function validateSecurityHeaders(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const host = request.headers.get('host');
  
  // Проверка CORS для критических операций
  if (request.method === 'POST' || request.method === 'PUT' || request.method === 'DELETE') {
    if (!origin && !referer) {
      return false; // Подозрительный запрос без origin/referer
    }
    
    // Проверка, что origin соответствует нашему домену
    if (origin && !origin.includes(host || '')) {
      const allowedOrigins = [
        'http://localhost:3000',
        'https://localhost:3000',
        process.env.NEXT_PUBLIC_APP_URL
      ].filter(Boolean);
      
      if (!allowedOrigins.some(allowed => allowed && origin.startsWith(allowed))) {
        return false;
      }
    }
  }
  
  return true;
}

// Основной middleware безопасности
export function securityMiddleware(request: NextRequest) {
  const ip = getClientIP(request);
  const userAgent = request.headers.get('user-agent');
  const pathname = request.nextUrl.pathname;
  
  // Проверка rate limiting
  let limiter = generalLimiter;
  
  if (pathname.includes('/api/auth')) {
    limiter = authLimiter;
  } else if (pathname.includes('/api/auth/register')) {
    limiter = registrationLimiter;
  }
  
  if (!limiter.isAllowed(ip || 'unknown')) {
    return NextResponse.json(
      { 
        error: 'Слишком много запросов',
        message: 'Превышен лимит запросов. Попробуйте позже.'
      },
      { status: 429 }
    );
  }
  
  // Проверка подозрительного User-Agent для критических операций
  if ((pathname.includes('/api/auth') || pathname.includes('/api/payment')) && 
      isSuspiciousUserAgent(userAgent)) {
    return NextResponse.json(
      { error: 'Доступ запрещен', message: 'Подозрительная активность' },
      { status: 403 }
    );
  }
  
  // Проверка заголовков безопасности
  if (!validateSecurityHeaders(request)) {
    return NextResponse.json(
      { error: 'Недопустимый запрос', message: 'Нарушение политики безопасности' },
      { status: 400 }
    );
  }
  
  // Добавление заголовков безопасности к ответу
  const response = NextResponse.next();
  
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // CSP для предотвращения XSS
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-ancestors 'none'"
  ].join('; ');
  
  response.headers.set('Content-Security-Policy', csp);
  
  // HSTS для HTTPS
  if (request.nextUrl.protocol === 'https:') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  return response;
}

// Middleware для проверки CSRF токена
export function csrfMiddleware(request: NextRequest) {
  if (request.method === 'GET' || request.method === 'HEAD' || request.method === 'OPTIONS') {
    return NextResponse.next();
  }
  
  const csrfToken = request.headers.get('x-csrf-token');
  const sessionToken = request.cookies.get('csrf-token')?.value;
  
  if (!csrfToken || !sessionToken || csrfToken !== sessionToken) {
    return NextResponse.json(
      { error: 'CSRF токен недействителен' },
      { status: 403 }
    );
  }
  
  return NextResponse.next();
}

// Логирование подозрительной активности
export function logSuspiciousActivity(
  ip: string,
  userAgent: string | null,
  action: string,
  details?: any
) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    ip,
    userAgent,
    action,
    details,
    severity: 'warning'
  };
  
  // В продакшене здесь должна быть интеграция с системой логирования
  console.warn('Подозрительная активность:', logEntry);
  
  // Можно добавить отправку в внешний сервис мониторинга
  // await sendToSecurityService(logEntry);
}

// Проверка на SQL инъекции в параметрах
export function detectSQLInjection(input: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i,
    /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
    /(--|\/\*|\*\/)/,
    /(\b(SCRIPT|JAVASCRIPT|VBSCRIPT)\b)/i,
    /(<script|<\/script>)/i
  ];
  
  return sqlPatterns.some(pattern => pattern.test(input));
}

// Проверка на XSS в параметрах
export function detectXSS(input: string): boolean {
  const xssPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /<iframe[^>]*>.*?<\/iframe>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<img[^>]*src[^>]*>/gi,
    /eval\s*\(/gi,
    /expression\s*\(/gi
  ];
  
  return xssPatterns.some(pattern => pattern.test(input));
}

// Валидация входных данных API
export function validateAPIInput(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  function checkValue(value: any, path: string = ''): void {
    if (typeof value === 'string') {
      if (detectSQLInjection(value)) {
        errors.push(`Обнаружена попытка SQL инъекции в ${path}`);
      }
      if (detectXSS(value)) {
        errors.push(`Обнаружена попытка XSS в ${path}`);
      }
      if (value.length > 10000) {
        errors.push(`Слишком длинное значение в ${path}`);
      }
    } else if (typeof value === 'object' && value !== null) {
      Object.keys(value).forEach(key => {
        checkValue(value[key], path ? `${path}.${key}` : key);
      });
    }
  }
  
  checkValue(data);
  
  return {
    isValid: errors.length === 0,
    errors
  };
} 