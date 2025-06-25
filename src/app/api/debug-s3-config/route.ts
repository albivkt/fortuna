import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Проверяем S3 конфигурацию...');
    
    // Проверяем наличие переменных окружения
    const config = {
      S3_REGION: process.env.S3_REGION,
      S3_BUCKET: process.env.S3_BUCKET,
      S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID,
      S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY,
      S3_ENDPOINT: process.env.S3_ENDPOINT,
    };

    console.log('📋 Переменные окружения S3:', {
      S3_REGION: config.S3_REGION ? '✅ Установлена' : '❌ Не установлена',
      S3_BUCKET: config.S3_BUCKET ? '✅ Установлена' : '❌ Не установлена',
      S3_ACCESS_KEY_ID: config.S3_ACCESS_KEY_ID ? '✅ Установлена' : '❌ Не установлена',
      S3_SECRET_ACCESS_KEY: config.S3_SECRET_ACCESS_KEY ? '✅ Установлена' : '❌ Не установлена',
      S3_ENDPOINT: config.S3_ENDPOINT ? '✅ Установлена' : '❌ Не установлена',
    });

    // Проверяем, что все переменные установлены
    const missingVars = [];
    if (!config.S3_REGION) missingVars.push('S3_REGION');
    if (!config.S3_BUCKET) missingVars.push('S3_BUCKET');
    if (!config.S3_ACCESS_KEY_ID) missingVars.push('S3_ACCESS_KEY_ID');
    if (!config.S3_SECRET_ACCESS_KEY) missingVars.push('S3_SECRET_ACCESS_KEY');
    if (!config.S3_ENDPOINT) missingVars.push('S3_ENDPOINT');

    if (missingVars.length > 0) {
      console.error('❌ Отсутствуют переменные окружения:', missingVars);
      return NextResponse.json({
        success: false,
        error: `Отсутствуют переменные окружения: ${missingVars.join(', ')}`,
        missingVariables: missingVars,
        config: {
          S3_REGION: config.S3_REGION ? 'SET' : 'MISSING',
          S3_BUCKET: config.S3_BUCKET ? 'SET' : 'MISSING',
          S3_ACCESS_KEY_ID: config.S3_ACCESS_KEY_ID ? 'SET' : 'MISSING',
          S3_SECRET_ACCESS_KEY: config.S3_SECRET_ACCESS_KEY ? 'SET' : 'MISSING',
          S3_ENDPOINT: config.S3_ENDPOINT ? 'SET' : 'MISSING',
        }
      });
    }

    // Пытаемся создать S3 клиент
    try {
      const { S3Client } = await import('@aws-sdk/client-s3');
      
      const s3Client = new S3Client({
        region: config.S3_REGION,
        endpoint: config.S3_ENDPOINT,
        credentials: {
          accessKeyId: config.S3_ACCESS_KEY_ID!,
          secretAccessKey: config.S3_SECRET_ACCESS_KEY!,
        },
        forcePathStyle: true,
      });

      console.log('✅ S3 клиент создан успешно');

      // Пытаемся проверить доступ к bucket (только создание клиента, без реального запроса)
      return NextResponse.json({
        success: true,
        message: 'S3 конфигурация корректна',
        config: {
          S3_REGION: config.S3_REGION,
          S3_BUCKET: config.S3_BUCKET,
          S3_ENDPOINT: config.S3_ENDPOINT,
          S3_ACCESS_KEY_ID: config.S3_ACCESS_KEY_ID?.substring(0, 8) + '***',
          S3_SECRET_ACCESS_KEY: '***',
        },
        clientCreated: true
      });

    } catch (s3Error) {
      console.error('❌ Ошибка создания S3 клиента:', s3Error);
      return NextResponse.json({
        success: false,
        error: `Ошибка создания S3 клиента: ${s3Error instanceof Error ? s3Error.message : 'Неизвестная ошибка'}`,
        config: {
          S3_REGION: config.S3_REGION,
          S3_BUCKET: config.S3_BUCKET,
          S3_ENDPOINT: config.S3_ENDPOINT,
          S3_ACCESS_KEY_ID: config.S3_ACCESS_KEY_ID?.substring(0, 8) + '***',
          S3_SECRET_ACCESS_KEY: '***',
        },
        clientCreated: false
      });
    }

  } catch (error) {
    console.error('❌ Общая ошибка проверки S3:', error);
    return NextResponse.json({
      success: false,
      error: `Общая ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`
    }, { status: 500 });
  }
} 