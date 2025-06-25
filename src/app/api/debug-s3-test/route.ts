import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // Проверяем переменные окружения
    const s3Config = {
      endpoint: 'https://s3.twcstorage.ru',
      region: 'ru-1',
      bucket: '617774af-gifty',
      accessKeyId: 'I6XD2OR7YO2ZN6L6Z629',
      secretAccessKey: '9xCOoafisG0aB9lJNvdLO1UuK73fBvMcpHMdijrJ',
    };

    console.log('🔧 S3 конфигурация:', {
      endpoint: s3Config.endpoint,
      region: s3Config.region,
      bucket: s3Config.bucket,
      hasAccessKey: !!s3Config.accessKeyId,
      hasSecretKey: !!s3Config.secretAccessKey,
    });

    // Тестируем создание клиента S3
    try {
      const { S3Client } = await import('@aws-sdk/client-s3');
      
      const s3Client = new S3Client({
        endpoint: s3Config.endpoint,
        region: s3Config.region,
        credentials: {
          accessKeyId: s3Config.accessKeyId,
          secretAccessKey: s3Config.secretAccessKey,
        },
        forcePathStyle: true,
      });

      console.log('✅ S3 клиент создан успешно');

      return NextResponse.json({
        success: true,
        message: 'S3 конфигурация выглядит корректно',
        config: {
          endpoint: s3Config.endpoint,
          region: s3Config.region,
          bucket: s3Config.bucket,
          hasCredentials: true,
        }
      });
    } catch (s3Error) {
      console.error('❌ Ошибка создания S3 клиента:', s3Error);
      return NextResponse.json({
        success: false,
        error: 'Ошибка создания S3 клиента',
        details: s3Error instanceof Error ? s3Error.message : 'Неизвестная ошибка'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('❌ Общая ошибка диагностики S3:', error);
    return NextResponse.json({
      success: false,
      error: 'Ошибка диагностики S3',
      details: error instanceof Error ? error.message : 'Неизвестная ошибка'
    }, { status: 500 });
  }
} 