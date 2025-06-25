'use client';

import { useState } from 'react';

export default function TestImageSave() {
  const [testResult, setTestResult] = useState('');

  const testSaveImage = async () => {
    try {
      setTestResult('🔄 Тестируем сохранение изображения...');
      
      // Симулируем данные сегмента с изображением
      const testSegment = {
        option: 'Тестовый приз',
        style: {
          backgroundColor: '#EC4899',
          textColor: 'white'
        },
        image: 'https://s3.twcstorage.ru/617774af-gifty/wheel-images/1750807181498-80vsvk.jpg',
        imagePosition: { x: 0, y: 0 }
      };

      console.log('🧪 Тестовый сегмент:', testSegment);
      console.log('🧪 Есть изображение:', !!testSegment.image);
      console.log('🧪 URL изображения:', testSegment.image);
      console.log('🧪 Длина URL:', testSegment.image?.length);
      console.log('🧪 Проверка пустой строки:', testSegment.image && testSegment.image.trim() !== '');

      // Проверяем логику из edit page
      const processedImage = testSegment.image && testSegment.image.trim() !== '' ? testSegment.image : undefined;
      console.log('🧪 Обработанное изображение:', processedImage);
      console.log('🧪 Тип обработанного изображения:', typeof processedImage);

      setTestResult(`
✅ Тест завершен:
- Исходное изображение: ${testSegment.image}
- Есть изображение: ${!!testSegment.image}
- Длина URL: ${testSegment.image?.length}
- После обработки: ${processedImage}
- Тип после обработки: ${typeof processedImage}
      `);

    } catch (error) {
      console.error('❌ Ошибка теста:', error);
      setTestResult(`❌ Ошибка: ${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">🧪 Тест сохранения изображений</h1>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <button
            onClick={testSaveImage}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium"
          >
            Запустить тест
          </button>
        </div>

        {testResult && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Результат теста:</h2>
            <pre className="text-green-400 whitespace-pre-wrap">{testResult}</pre>
          </div>
        )}
      </div>
    </div>
  );
} 