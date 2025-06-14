/** @type {import('next').NextConfig} */
const nextConfig = {
  // Настройки безопасности
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Заголовки безопасности
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self'",
              "connect-src 'self'",
              "frame-ancestors 'none'"
            ].join('; '),
          },
        ],
      },
    ];
  },
  
  // Настройки для продакшена
  async redirects() {
    return [
      // Принудительное перенаправление на HTTPS в продакшене
      ...(process.env.NODE_ENV === 'production' ? [
        {
          source: '/(.*)',
          has: [
            {
              type: 'header',
              key: 'x-forwarded-proto',
              value: 'http',
            },
          ],
          destination: 'https://your-domain.com/:path*',
          permanent: true,
        },
      ] : []),
    ];
  },
  
  // Оптимизация изображений
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Настройки компиляции
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Внешние пакеты для серверных компонентов
  serverExternalPackages: ['crypto'],
  
  // Отключаем ESLint для сборки
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Отключаем TypeScript проверки для сборки
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig; 