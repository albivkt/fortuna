'use client';

import { useState } from 'react';

export default function TestImageCorsPage() {
  const [testUrl, setTestUrl] = useState('https://s3.twcstorage.ru/617774af-gifty/wheel-images/1750805947495-s3td9e.jpg');
  const [results, setResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    console.log(message);
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testImageLoad = (withCors: boolean) => {
    addResult(`🧪 Тестируем загрузку ${withCors ? 'С' : 'БЕЗ'} CORS: ${testUrl}`);
    
    const img = new Image();
    if (withCors) {
      img.crossOrigin = 'anonymous';
    }
    
    img.onload = () => {
      addResult(`✅ ${withCors ? 'С CORS' : 'БЕЗ CORS'}: Изображение загружено успешно`);
      addResult(`📏 ${withCors ? 'С CORS' : 'БЕЗ CORS'}: Размеры: ${img.width}x${img.height}`);
      addResult(`📏 ${withCors ? 'С CORS' : 'БЕЗ CORS'}: Natural размеры: ${img.naturalWidth}x${img.naturalHeight}`);
      addResult(`📏 ${withCors ? 'С CORS' : 'БЕЗ CORS'}: Complete: ${img.complete}`);
    };
    
    img.onerror = (error) => {
      addResult(`❌ ${withCors ? 'С CORS' : 'БЕЗ CORS'}: Ошибка загрузки изображения`);
      addResult(`❌ ${withCors ? 'С CORS' : 'БЕЗ CORS'}: Error type: ${error.type || 'unknown'}`);
    };
    
    img.src = testUrl;
  };

  const uploadAndTest = async () => {
    try {
      addResult('📤 Загружаем новое тестовое изображение...');
      
      // Создаем простое тестовое изображение
      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 200;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Градиент фон
        const gradient = ctx.createRadialGradient(100, 100, 0, 100, 100, 100);
        gradient.addColorStop(0, '#ff6b6b');
        gradient.addColorStop(1, '#4ecdc4');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 200, 200);
        
        // Текст
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('CORS TEST', 100, 90);
        ctx.fillText(new Date().getSeconds().toString(), 100, 130);
      }

      canvas.toBlob(async (blob) => {
        if (!blob) return;

        const formData = new FormData();
        formData.append('image', blob, 'cors-test.png');

        const response = await fetch('/api/upload-image', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (response.ok) {
          addResult(`✅ Новое изображение загружено: ${result.url}`);
          setTestUrl(result.url);
          
          // Автоматически тестируем новое изображение
          setTimeout(() => {
            testImageLoad(false);
            setTimeout(() => testImageLoad(true), 1000);
          }, 500);
        } else {
          addResult(`❌ Ошибка загрузки: ${result.error}`);
        }
      }, 'image/png');
    } catch (error) {
      addResult(`❌ Исключение: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Тест CORS для изображений</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Левая колонка - управление */}
        <div className="space-y-6">
          {/* URL тестирования */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">URL для тестирования</h2>
            <input
              type="text"
              value={testUrl}
              onChange={(e) => setTestUrl(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg text-sm"
              placeholder="URL изображения"
            />
          </div>

          {/* Тесты */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Тесты</h2>
            <div className="space-y-3">
              <button
                onClick={() => testImageLoad(false)}
                className="w-full bg-blue-500 text-white py-3 px-4 rounded hover:bg-blue-600"
              >
                Тест БЕЗ CORS
              </button>
              
              <button
                onClick={() => testImageLoad(true)}
                className="w-full bg-green-500 text-white py-3 px-4 rounded hover:bg-green-600"
              >
                Тест С CORS
              </button>
              
              <button
                onClick={uploadAndTest}
                className="w-full bg-purple-500 text-white py-3 px-4 rounded hover:bg-purple-600"
              >
                Загрузить и протестировать новое изображение
              </button>
              
              <button
                onClick={() => setResults([])}
                className="w-full bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
              >
                Очистить результаты
              </button>
            </div>
          </div>

          {/* Предпросмотр */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Предпросмотр</h2>
            <img 
              src={testUrl} 
              alt="Тестовое изображение" 
              className="w-full max-w-xs border rounded"
              onLoad={() => addResult('🖼️ Предпросмотр: изображение загружено')}
              onError={() => addResult('❌ Предпросмотр: ошибка загрузки')}
            />
          </div>
        </div>

        {/* Правая колонка - результаты */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Результаты тестов</h2>
          <div className="bg-gray-100 rounded p-4 h-96 overflow-y-auto">
            {results.length === 0 ? (
              <p className="text-gray-500 text-sm">Результаты появятся здесь...</p>
            ) : (
              <div className="space-y-1">
                {results.map((result, index) => (
                  <div key={index} className="text-xs font-mono">
                    {result}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Информация */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold mb-2 text-blue-800">Информация:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-blue-700">
          <li>CORS настроен для bucket: 617774af-gifty</li>
          <li>Разрешенные origins: * (все)</li>
          <li>Разрешенные методы: GET, HEAD</li>
          <li>Если тест БЕЗ CORS работает, а С CORS нет - проблема в настройках сервера</li>
          <li>Если оба теста работают - проблема решена!</li>
        </ul>
      </div>
    </div>
  );
} 