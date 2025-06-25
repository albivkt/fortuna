'use client';

import { useState } from 'react';
import ImageUpload from '@/components/ImageUpload';

export default function DebugImageSavePage() {
  const [testImageUrl, setTestImageUrl] = useState<string>('');
  const [segmentData, setSegmentData] = useState({
    text: 'Тестовый сегмент',
    color: '#EC4899',
    image: null as string | null
  });
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const handleImageSelect = (imageUrl: string) => {
    addLog(`🖼️ ImageUpload callback: ${imageUrl}`);
    addLog(`🔍 URL тип: ${typeof imageUrl}`);
    addLog(`🔍 URL длина: ${imageUrl.length}`);
    addLog(`🔍 URL валидный: ${imageUrl.startsWith('https://')}`);
    
    setTestImageUrl(imageUrl);
    setSegmentData(prev => ({ ...prev, image: imageUrl }));
    
    addLog(`✅ Локальное состояние обновлено`);
  };

  const testImageAccess = () => {
    if (!testImageUrl) {
      addLog('❌ Нет URL для тестирования');
      return;
    }

    addLog(`🧪 Тестируем доступность изображения: ${testImageUrl}`);
    
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      addLog(`✅ Изображение загружено успешно: ${img.width}x${img.height}`);
    };
    
    img.onerror = (error) => {
      addLog(`❌ Ошибка загрузки изображения`);
      console.error('Image error:', error);
    };
    
    img.src = testImageUrl;
  };

  const simulateSave = () => {
    addLog(`💾 Симуляция сохранения...`);
    addLog(`📝 Данные сегмента: ${JSON.stringify(segmentData)}`);
    
    // Симулируем JSON.stringify как в GraphQL resolver
    const serialized = JSON.stringify([{
      option: segmentData.text,
      style: {
        backgroundColor: segmentData.color,
        textColor: 'white'
      },
      image: segmentData.image,
      imagePosition: { x: 0, y: 0 }
    }]);
    
    addLog(`📤 Сериализованные данные: ${serialized}`);
    
    // Симулируем десериализацию
    try {
      const parsed = JSON.parse(serialized);
      addLog(`📥 Десериализованные данные: ${JSON.stringify(parsed)}`);
      addLog(`🔍 Изображение после десериализации: ${parsed[0].image}`);
      addLog(`✅ Изображение сохранилось: ${!!parsed[0].image}`);
    } catch (error) {
      addLog(`❌ Ошибка десериализации: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Диагностика сохранения изображений</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Левая колонка - тесты */}
        <div className="space-y-6">
          {/* Загрузка изображения */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">1. Загрузка изображения</h2>
            <ImageUpload
              onImageSelect={handleImageSelect}
              currentImage={testImageUrl || undefined}
            />
            
            {testImageUrl && (
              <div className="mt-4">
                <p className="text-sm font-medium">Загруженное изображение:</p>
                <img 
                  src={testImageUrl} 
                  alt="Тест" 
                  className="w-24 h-24 object-cover border rounded mt-2"
                />
                <p className="text-xs text-gray-600 mt-1 break-all">{testImageUrl}</p>
              </div>
            )}
          </div>

          {/* Тесты */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">2. Тесты</h2>
            <div className="space-y-3">
              <button
                onClick={testImageAccess}
                disabled={!testImageUrl}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
              >
                Проверить доступность изображения
              </button>
              
              <button
                onClick={simulateSave}
                disabled={!testImageUrl}
                className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:opacity-50"
              >
                Симулировать сохранение/загрузку
              </button>
              
              <button
                onClick={() => setLogs([])}
                className="w-full bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
              >
                Очистить логи
              </button>
            </div>
          </div>

          {/* Данные сегмента */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">3. Текущие данные</h2>
            <div className="space-y-2">
              <div>
                <strong>Текст:</strong> {segmentData.text}
              </div>
              <div className="flex items-center space-x-2">
                <strong>Цвет:</strong>
                <div 
                  className="w-6 h-6 rounded border"
                  style={{ backgroundColor: segmentData.color }}
                />
                <span>{segmentData.color}</span>
              </div>
              <div>
                <strong>Изображение:</strong> {segmentData.image ? '✅ Есть' : '❌ Нет'}
              </div>
              {segmentData.image && (
                <div className="text-xs text-gray-600 break-all mt-1">
                  {segmentData.image}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Правая колонка - логи */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Логи диагностики</h2>
          <div className="bg-gray-100 rounded p-4 h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500 text-sm">Логи появятся здесь...</p>
            ) : (
              <div className="space-y-1">
                {logs.map((log, index) => (
                  <div key={index} className="text-xs font-mono">
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Инструкции */}
      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="font-semibold mb-2 text-yellow-800">Инструкции:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-yellow-700">
          <li>Загрузите изображение с помощью ImageUpload компонента</li>
          <li>Проверьте доступность изображения</li>
          <li>Протестируйте симуляцию сохранения</li>
          <li>Проверьте логи на наличие ошибок</li>
        </ol>
      </div>
    </div>
  );
} 