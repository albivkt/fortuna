'use client';

import { useState } from 'react';

export default function DebugS3ConfigPage() {
  const [configCheck, setConfigCheck] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkS3Config = async () => {
    setLoading(true);
    try {
      console.log('🔍 Проверяем конфигурацию S3...');
      
      const response = await fetch('/api/debug-s3-config', {
        method: 'GET',
      });

      const result = await response.json();
      console.log('📥 Результат проверки S3:', result);
      
      setConfigCheck(result);
    } catch (error) {
      console.error('❌ Ошибка проверки S3:', error);
      setConfigCheck({
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
        success: false
      });
    } finally {
      setLoading(false);
    }
  };

  const testDirectS3Upload = async () => {
    try {
      console.log('🧪 Тестируем прямую загрузку в S3...');
      
      // Создаем простое тестовое изображение
      const canvas = document.createElement('canvas');
      canvas.width = 50;
      canvas.height = 50;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(0, 0, 50, 50);
        ctx.fillStyle = '#000000';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('S3', 25, 30);
      }

      canvas.toBlob(async (blob) => {
        if (!blob) return;

        const formData = new FormData();
        formData.append('image', blob, 'debug-s3-test.png');

        console.log('📤 Отправляем запрос на /api/upload-image...');
        
        const response = await fetch('/api/upload-image', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();
        console.log('📥 Результат загрузки:', result);

        if (response.ok) {
          alert(`✅ S3 загрузка успешна!\nURL: ${result.url}`);
        } else {
          alert(`❌ Ошибка S3 загрузки:\n${result.error || 'Неизвестная ошибка'}`);
        }
      }, 'image/png');
    } catch (error) {
      console.error('❌ Ошибка теста S3:', error);
      alert(`❌ Ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Диагностика S3 конфигурации</h1>
      
      <div className="space-y-6">
        {/* Проверка конфигурации */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Проверка конфигурации S3</h2>
          <button
            onClick={checkS3Config}
            disabled={loading}
            className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50 mb-4"
          >
            {loading ? 'Проверяем...' : 'Проверить конфигурацию S3'}
          </button>
          
          {configCheck && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Результат проверки:</h3>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(configCheck, null, 2)}
              </pre>
              
              {configCheck.success ? (
                <div className="mt-2 p-3 bg-green-100 border border-green-300 rounded text-green-700">
                  ✅ S3 конфигурация корректна
                </div>
              ) : (
                <div className="mt-2 p-3 bg-red-100 border border-red-300 rounded text-red-700">
                  ❌ Проблема с S3 конфигурацией: {configCheck.error}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Тест загрузки */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Тест загрузки в S3</h2>
          <button
            onClick={testDirectS3Upload}
            className="w-full bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 mb-4"
          >
            Тестировать загрузку в S3
          </button>
          <p className="text-sm text-gray-600">
            Создает простое изображение и пытается загрузить его в S3
          </p>
        </div>

        {/* Инструкции */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-yellow-800">Инструкции</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm text-yellow-700">
            <li>Сначала проверьте конфигурацию S3</li>
            <li>Если конфигурация корректна, протестируйте загрузку</li>
            <li>Проверьте консоль браузера для подробных логов</li>
            <li>Убедитесь, что переменные окружения S3 настроены в .env.local</li>
          </ol>
        </div>

        {/* Ожидаемые переменные окружения */}
        <div className="bg-gray-100 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Ожидаемые переменные окружения</h2>
          <pre className="bg-white p-4 rounded text-sm">
{`S3_REGION=ru-1
S3_BUCKET=617774af-gifty
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
S3_ENDPOINT=https://s3.twcstorage.ru`}
          </pre>
          <p className="text-sm text-gray-600 mt-2">
            Эти переменные должны быть настроены в файле .env.local
          </p>
        </div>
      </div>
    </div>
  );
} 