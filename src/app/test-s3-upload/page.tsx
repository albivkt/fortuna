'use client';

import { useState } from 'react';
import ImageUpload from '@/components/ImageUpload';

export default function TestS3UploadPage() {
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (imageUrl: string) => {
    console.log('✅ Изображение загружено:', imageUrl);
    if (imageUrl) {
      setUploadedImages(prev => [...prev, imageUrl]);
    }
  };

  const testDirectUpload = async () => {
    setLoading(true);
    try {
      // Создаем тестовый файл (1x1 пиксель PNG)
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(0, 0, 1, 1);
      }

      canvas.toBlob(async (blob) => {
        if (!blob) return;

        const formData = new FormData();
        formData.append('image', blob, 'test.png');

        const response = await fetch('/api/upload-image', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (response.ok) {
          console.log('✅ Прямая загрузка успешна:', result);
          setUploadedImages(prev => [...prev, result.url]);
        } else {
          console.error('❌ Ошибка прямой загрузки:', result);
          alert('Ошибка: ' + result.error);
        }
      }, 'image/png');
    } catch (error) {
      console.error('❌ Ошибка теста:', error);
      alert('Ошибка теста: ' + (error instanceof Error ? error.message : 'Неизвестная ошибка'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Тест загрузки изображений в S3</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Загрузка через компонент */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Загрузка через ImageUpload компонент</h2>
          <ImageUpload
            onImageSelect={handleImageUpload}
            disabled={false}
          />
          <p className="text-sm text-gray-600 mt-2">
            Перетащите изображение или нажмите для выбора файла
          </p>
        </div>

        {/* Прямая загрузка */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Прямая загрузка API</h2>
          <button
            onClick={testDirectUpload}
            disabled={loading}
            className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Загрузка...' : 'Тест загрузки (создать тестовое изображение)'}
          </button>
          <p className="text-sm text-gray-600 mt-2">
            Создает и загружает тестовое изображение 1x1 пиксель
          </p>
        </div>
      </div>

      {/* Результаты */}
      {uploadedImages.length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Загруженные изображения ({uploadedImages.length})</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {uploadedImages.map((url, index) => (
              <div key={index} className="border rounded-lg p-2">
                <img
                  src={url}
                  alt={`Загруженное изображение ${index + 1}`}
                  className="w-full h-32 object-cover rounded mb-2"
                  onError={(e) => {
                    console.error('Ошибка загрузки изображения:', url);
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="text-xs text-gray-600 break-all">
                  <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    {url.split('/').pop()}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Информация о конфигурации */}
      <div className="mt-8 bg-gray-100 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Информация о S3 конфигурации</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <strong>S3 Endpoint:</strong> https://s3.twcstorage.ru
          </div>
          <div>
            <strong>Bucket:</strong> 617774af-gifty
          </div>
          <div>
            <strong>Region:</strong> ru-1
          </div>
          <div>
            <strong>Максимальный размер:</strong> 5 MB
          </div>
        </div>
      </div>
    </div>
  );
} 