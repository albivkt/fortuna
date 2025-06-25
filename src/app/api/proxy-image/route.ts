import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'URL параметр обязателен' },
        { status: 400 }
      );
    }

    // Проверяем, что URL начинается с нашего S3 домена для безопасности
    const allowedDomains = [
      'https://s3.twcstorage.ru',
      'https://github.githubassets.com', // Для тестирования
    ];

    const isAllowed = allowedDomains.some(domain => imageUrl.startsWith(domain));
    
    if (!isAllowed) {
      return NextResponse.json(
        { error: 'Домен не разрешен для проксирования' },
        { status: 403 }
      );
    }

    console.log('🔄 Проксируем изображение:', imageUrl);

    // Загружаем изображение
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; FortunaApp/1.0)',
      },
    });

    if (!response.ok) {
      console.error('❌ Ошибка загрузки изображения:', response.status, response.statusText);
      return NextResponse.json(
        { error: `Ошибка загрузки изображения: ${response.status}` },
        { status: response.status }
      );
    }

    // Получаем тип контента
    const contentType = response.headers.get('content-type') || 'image/png';
    
    // Проверяем, что это действительно изображение
    if (!contentType.startsWith('image/')) {
      return NextResponse.json(
        { error: 'URL не содержит изображение' },
        { status: 400 }
      );
    }

    // Получаем данные изображения
    const imageBuffer = await response.arrayBuffer();

    console.log('✅ Изображение успешно проксировано:', {
      url: imageUrl,
      contentType,
      size: imageBuffer.byteLength
    });

    // Возвращаем изображение с правильными CORS заголовками
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
        'Access-Control-Allow-Headers': '*',
        'Cache-Control': 'public, max-age=3600', // Кешируем на 1 час
      },
    });

  } catch (error) {
    console.error('❌ Ошибка прокси изображения:', error);
    
    return NextResponse.json(
      { 
        error: 'Ошибка проксирования изображения',
        details: error instanceof Error ? error.message : 'Неизвестная ошибка'
      },
      { status: 500 }
    );
  }
}

// Обработка OPTIONS запроса для CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': '*',
    },
  });
} 