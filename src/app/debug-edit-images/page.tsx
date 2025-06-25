'use client';

import { useState } from 'react';
import ImageUpload from '@/components/ImageUpload';

export default function DebugEditImagesPage() {
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
  const [testSegments, setTestSegments] = useState([
    { text: 'Приз 1', color: '#EC4899', image: null as string | null },
    { text: 'Приз 2', color: '#3B82F6', image: null as string | null }
  ]);

  const updateSegment = (index: number, field: 'text' | 'color' | 'image', value: string | null) => {
    const newSegments = [...testSegments];
    newSegments[index] = { ...newSegments[index], [field]: value };
    setTestSegments(newSegments);
    console.log('🔄 Сегмент обновлен:', { index, field, value, newSegments });
  };

  const handleImageUpload = (imageUrl: string) => {
    console.log('✅ Изображение загружено:', imageUrl);
    setUploadedImageUrl(imageUrl);
  };

  const testDirectAPICall = async () => {
    try {
      // Создаем тестовое изображение
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(0, 0, 100, 100);
        ctx.fillStyle = '#ffffff';
        ctx.font = '20px Arial';
        ctx.fillText('TEST', 25, 55);
      }

      canvas.toBlob(async (blob) => {
        if (!blob) return;

        const formData = new FormData();
        formData.append('image', blob, 'test-segment.png');

        console.log('📤 Отправляем запрос на /api/upload-image...');
        
        const response = await fetch('/api/upload-image', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();
        console.log('📥 Ответ от API:', result);

        if (response.ok) {
          setUploadedImageUrl(result.url);
          alert('Тест API успешен! URL: ' + result.url);
        } else {
          alert('Ошибка API: ' + result.error);
        }
      }, 'image/png');
    } catch (error) {
      console.error('❌ Ошибка теста API:', error);
      alert('Ошибка: ' + (error instanceof Error ? error.message : 'Неизвестная ошибка'));
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Отладка изображений в редакторе рулетки</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Левая колонка - тесты */}
        <div className="space-y-6">
          {/* Тест компонента ImageUpload */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Тест ImageUpload компонента</h2>
            <ImageUpload
              onImageSelect={handleImageUpload}
              disabled={false}
            />
            {uploadedImageUrl && (
              <div className="mt-4">
                <p className="text-sm font-medium">Загруженное изображение:</p>
                <img 
                  src={uploadedImageUrl} 
                  alt="Загруженное" 
                  className="w-32 h-32 object-cover border rounded mt-2"
                />
                <p className="text-xs text-gray-600 mt-1 break-all">{uploadedImageUrl}</p>
              </div>
            )}
          </div>

          {/* Тест прямого API */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Тест прямого API вызова</h2>
            <button
              onClick={testDirectAPICall}
              className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600"
            >
              Создать и загрузить тестовое изображение
            </button>
            <p className="text-sm text-gray-600 mt-2">
              Создает изображение 100x100 с текстом "TEST" и загружает его в S3
            </p>
          </div>

          {/* Информация о состоянии */}
          <div className="bg-gray-100 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Состояние</h2>
            <div className="space-y-2 text-sm">
              <div>
                <strong>Последний загруженный URL:</strong>
                <div className="break-all text-blue-600">{uploadedImageUrl || 'Нет'}</div>
              </div>
              <div>
                <strong>Состояние сегментов:</strong>
                <pre className="bg-white p-2 rounded mt-1 text-xs overflow-auto">
                  {JSON.stringify(testSegments, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Правая колонка - имитация редактора */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Имитация редактора сегментов</h2>
            
            {testSegments.map((segment, index) => (
              <div key={index} className="border rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div
                    className="w-8 h-8 rounded-full border-2 border-gray-300 flex-shrink-0 overflow-hidden"
                    style={{ 
                      backgroundColor: segment.image ? 'transparent' : segment.color,
                      backgroundImage: segment.image ? `url(${segment.image})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  />
                  <input
                    type="text"
                    value={segment.text}
                    onChange={(e) => updateSegment(index, 'text', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Название сегмента"
                  />
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-gray-600">Цвет:</label>
                    <input
                      type="color"
                      value={segment.color}
                      onChange={(e) => updateSegment(index, 'color', e.target.value)}
                      className="w-12 h-8 rounded border cursor-pointer"
                      disabled={!!segment.image}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Изображение:</label>
                    <ImageUpload
                      onImageSelect={(imageUrl) => updateSegment(index, 'image', imageUrl)}
                      currentImage={segment.image || undefined}
                      disabled={false}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Результат */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Результат для GraphQL</h2>
            <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
              {JSON.stringify(
                testSegments.map(segment => ({
                  option: segment.text,
                  style: {
                    backgroundColor: segment.color,
                    textColor: 'white'
                  },
                  image: segment.image || undefined,
                  imagePosition: { x: 0, y: 0 }
                })),
                null,
                2
              )}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
} 