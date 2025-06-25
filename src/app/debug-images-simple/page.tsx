'use client';

import { useState, useEffect } from 'react';

export default function DebugImagesSimplePage() {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [clientInfo, setClientInfo] = useState<{
    currentUrl: string;
    userAgent: string;
    cookiesEnabled: boolean;
  } | null>(null);

  // Получаем информацию о клиенте только на клиентской стороне
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setClientInfo({
        currentUrl: window.location.href,
        userAgent: navigator.userAgent,
        cookiesEnabled: navigator.cookieEnabled
      });
    }
  }, []);

  const testS3Upload = async () => {
    try {
      setUploadStatus('Создаем тестовое изображение...');
      
      // Создаем простое тестовое изображение
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Красный фон
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(0, 0, 100, 100);
        
        // Белый текст
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('TEST', 50, 45);
        ctx.fillText('IMG', 50, 65);
      }

      setUploadStatus('Конвертируем в blob...');
      
      canvas.toBlob(async (blob) => {
        if (!blob) {
          setUploadStatus('Ошибка: не удалось создать blob');
          return;
        }

        const formData = new FormData();
        formData.append('image', blob, 'debug-test.png');

        setUploadStatus('Отправляем на сервер...');
        console.log('📤 Отправляем запрос на /api/upload-image');
        
        const response = await fetch('/api/upload-image', {
          method: 'POST',
          body: formData,
        });

        console.log('📨 Статус ответа:', response.status);
        console.log('📨 Статус текст:', response.statusText);
        console.log('📨 Headers:', Object.fromEntries(response.headers.entries()));
        console.log('📨 OK:', response.ok);

        const result = await response.json();
        console.log('📥 Результат:', result);
        console.log('📥 Тип результата:', typeof result);
        console.log('📥 Ключи результата:', Object.keys(result));

        if (response.ok) {
          console.log('✅ Ответ успешный');
          console.log('🔗 URL изображения:', result.url);
          console.log('🔗 Тип URL:', typeof result.url);
          console.log('🔗 Валидный URL:', result.url && result.url.startsWith('http'));
          
          setImageUrl(result.url);
          setUploadStatus(`✅ Успешно загружено: ${result.url}`);
        } else {
          console.error('❌ Ошибка ответа сервера');
          setUploadStatus(`❌ Ошибка: ${result.error || 'Неизвестная ошибка'}`);
        }
      }, 'image/png');
    } catch (error) {
      console.error('❌ Ошибка загрузки:', error);
      setUploadStatus(`❌ Исключение: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  };

  const testImageAccess = () => {
    if (!imageUrl) {
      alert('Сначала загрузите изображение');
      return;
    }

    console.log('🧪 Тестируем доступность изображения:', imageUrl);
    console.log('🔍 Тип URL:', typeof imageUrl);
    console.log('🔍 Длина URL:', imageUrl.length);
    console.log('🔍 Начинается с https:', imageUrl.startsWith('https://'));
    
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      console.log('✅ Изображение загружено успешно');
      console.log('📏 Размеры:', img.width, 'x', img.height);
      console.log('📏 naturalWidth:', img.naturalWidth, 'naturalHeight:', img.naturalHeight);
      alert(`✅ Изображение доступно! Размеры: ${img.width}x${img.height}`);
    };
    
    img.onerror = (error) => {
      console.error('❌ Ошибка загрузки изображения');
      console.error('❌ URL изображения:', imageUrl);
      console.error('❌ img.src:', img.src);
      console.error('❌ img.complete:', img.complete);
      if (error instanceof Event) {
        console.error('❌ error.type:', error.type);
      }
      if (error instanceof ErrorEvent) {
        console.error('❌ error.message:', error.message);
      }
      
      // Попробуем загрузить без CORS
      console.log('🔄 Пробуем загрузить без crossOrigin...');
      const img2 = new Image();
      img2.onload = () => {
        console.log('✅ Изображение загружено без CORS');
        alert('✅ Изображение доступно без CORS!');
      };
      img2.onerror = (error2) => {
        console.error('❌ Ошибка загрузки без CORS');
        if (error2 instanceof Event) {
          console.error('❌ error2.type:', error2.type);
        }
        if (error2 instanceof ErrorEvent) {
          console.error('❌ error2.message:', error2.message);
        }
        alert('❌ Изображение недоступно даже без CORS! Проверьте URL.');
      };
      img2.src = imageUrl;
      
      alert('❌ Изображение недоступно с CORS! Проверьте консоль для деталей.');
    };
    
    img.src = imageUrl;
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Простая диагностика изображений</h1>
      
      <div className="space-y-6">
        {/* Тест загрузки */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Тест загрузки в S3</h2>
          <button
            onClick={testS3Upload}
            className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 mb-4"
          >
            Создать и загрузить тестовое изображение
          </button>
          
          {uploadStatus && (
            <div className="p-3 bg-gray-100 rounded-lg">
              <p className="text-sm">{uploadStatus}</p>
            </div>
          )}
        </div>

        {/* Результат */}
        {imageUrl && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Результат загрузки</h2>
            
            <div className="space-y-4">
              <div>
                <strong>URL изображения:</strong>
                <div className="p-2 bg-gray-100 rounded mt-1 break-all text-sm">
                  {imageUrl}
                </div>
              </div>
              
              <div>
                <strong>Предпросмотр:</strong>
                <div className="mt-2">
                  <img 
                    src={imageUrl} 
                    alt="Загруженное изображение" 
                    className="w-32 h-32 object-cover border rounded"
                    onLoad={() => console.log('✅ Изображение отображено в браузере')}
                    onError={(e) => console.error('❌ Ошибка отображения изображения:', e)}
                  />
                </div>
              </div>
              
              <button
                onClick={testImageAccess}
                className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600"
              >
                Проверить доступность изображения
              </button>
            </div>
          </div>
        )}

        {/* Инструкции */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-yellow-800">Инструкции</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm text-yellow-700">
            <li>Нажмите кнопку "Создать и загрузить тестовое изображение"</li>
            <li>Дождитесь завершения загрузки</li>
            <li>Проверьте предпросмотр изображения</li>
            <li>Нажмите "Проверить доступность изображения" для дополнительной проверки</li>
            <li>Откройте консоль браузера для просмотра подробных логов</li>
          </ol>
        </div>

        {/* Отладочная информация */}
        <div className="bg-gray-100 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Отладочная информация</h2>
          <div className="space-y-2 text-sm">
            {clientInfo ? (
              <>
                <div><strong>Current URL:</strong> {clientInfo.currentUrl}</div>
                <div><strong>User Agent:</strong> {clientInfo.userAgent}</div>
                <div><strong>Cookies enabled:</strong> {clientInfo.cookiesEnabled ? 'Yes' : 'No'}</div>
              </>
            ) : (
              <div>Загрузка информации о клиенте...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 