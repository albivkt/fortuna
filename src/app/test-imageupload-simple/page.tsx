'use client';

import { useState } from 'react';
import ImageUpload from '@/components/ImageUpload';

export default function TestImageUploadSimplePage() {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [status, setStatus] = useState<string>('');

  const handleImageSelect = (url: string) => {
    console.log('🖼️ ImageUpload callback called with:', url, 'type:', typeof url);
    setImageUrl(url);
    setStatus(`✅ Изображение выбрано: ${url}`);
  };

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Тест компонента ImageUpload</h1>
      
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Загрузка изображения</h2>
          
          <ImageUpload
            onImageSelect={handleImageSelect}
            currentImage={imageUrl || undefined}
          />
          
          {status && (
            <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded text-green-700">
              {status}
            </div>
          )}
        </div>

        {imageUrl && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Результат</h2>
            
            <div className="space-y-4">
              <div>
                <strong>URL:</strong>
                <div className="p-2 bg-gray-100 rounded mt-1 break-all text-sm">
                  {imageUrl}
                </div>
              </div>
              
              <div>
                <strong>Тип:</strong> {typeof imageUrl}
              </div>
              
              <div>
                <strong>Предпросмотр:</strong>
                <div className="mt-2">
                  <img 
                    src={imageUrl} 
                    alt="Загруженное изображение" 
                    className="w-32 h-32 object-cover border rounded"
                    onLoad={() => console.log('✅ Изображение отображено')}
                    onError={(e) => console.error('❌ Ошибка отображения:', e)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-yellow-800">Инструкции</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm text-yellow-700">
            <li>Убедитесь, что сервер перезапущен после добавления S3 переменных</li>
            <li>Загрузите изображение через drag & drop или кнопку</li>
            <li>Проверьте консоль браузера на наличие ошибок</li>
            <li>Убедитесь, что callback получает строку URL, а не File объект</li>
          </ol>
        </div>

        <div className="bg-gray-100 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Отладочная информация</h2>
          <div className="space-y-2 text-sm">
            <div><strong>Current imageUrl:</strong> {imageUrl || 'Не задан'}</div>
            <div><strong>Type of imageUrl:</strong> {typeof imageUrl}</div>
            <div><strong>Is string:</strong> {typeof imageUrl === 'string' ? 'Yes' : 'No'}</div>
            <div><strong>Is valid URL:</strong> {imageUrl && imageUrl.startsWith('http') ? 'Yes' : 'No'}</div>
          </div>
        </div>
      </div>
    </div>
  );
} 