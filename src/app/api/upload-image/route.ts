import { NextRequest, NextResponse } from 'next/server';
import { uploadToS3, generateUniqueFileName, isImageFile, isValidFileSize } from '@/lib/s3';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Файл не найден' },
        { status: 400 }
      );
    }

    // Проверяем, что это изображение
    if (!isImageFile(file.type)) {
      return NextResponse.json(
        { error: 'Поддерживаются только изображения (JPG, PNG, GIF, WebP)' },
        { status: 400 }
      );
    }

    // Проверяем размер файла (максимум 5 МБ)
    if (!isValidFileSize(file.size, 5)) {
      return NextResponse.json(
        { error: 'Размер файла не должен превышать 5 МБ' },
        { status: 400 }
      );
    }

    // Конвертируем файл в Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Генерируем уникальное имя файла
    const fileName = generateUniqueFileName(file.name, 'wheel-images/');

    // Загружаем в S3
    const imageUrl = await uploadToS3(buffer, fileName, file.type);

    console.log('✅ Изображение успешно загружено:', {
      originalName: file.name,
      fileName,
      size: file.size,
      type: file.type,
      url: imageUrl
    });

    return NextResponse.json({
      success: true,
      url: imageUrl,
      fileName,
      originalName: file.name,
      size: file.size,
      type: file.type
    });

  } catch (error) {
    console.error('❌ Ошибка загрузки изображения:', error);
    
    return NextResponse.json(
      { 
        error: 'Ошибка загрузки изображения',
        details: error instanceof Error ? error.message : 'Неизвестная ошибка'
      },
      { status: 500 }
    );
  }
}

// Ограничиваем размер запроса до 10 МБ
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
} 