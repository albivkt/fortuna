'use client';

import { useState } from 'react';

export default function DebugUploadSimplePage() {
  const [status, setStatus] = useState('');
  const [result, setResult] = useState<any>(null);

  const testUpload = async () => {
    try {
      setStatus('Создаем тестовое изображение...');
      
      // Создаем простое тестовое изображение (красный квадрат 50x50)
      const canvas = document.createElement('canvas');
      canvas.width = 50;
      canvas.height = 50;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(0, 0, 50, 50);
      }

      setStatus('Конвертируем в blob...');
      
      canvas.toBlob(async (blob) => {
        if (!blob) {
          setStatus('❌ Не удалось создать blob');
          return;
        }

        setStatus('Создаем FormData...');
        const formData = new FormData();
        formData.append('image', blob, 'test.png');

        setStatus('Отправляем на сервер...');
        console.log('📤 Отправляем запрос на /api/upload-image');
        
        try {
          const response = await fetch('/api/upload-image', {
            method: 'POST',
            body: formData,
          });

          console.log('📨 Статус ответа:', response.status);
          console.log('📨 Headers:', Object.fromEntries(response.headers.entries()));

          const result = await response.json();
          console.log('📥 Результат:', result);

          setResult(result);

          if (response.ok) {
            setStatus(`✅ Успешно! URL: ${result.url}`);
          } else {
            setStatus(`❌ Ошибка: ${result.error}`);
          }
        } catch (fetchError) {
          console.error('❌ Ошибка fetch:', fetchError);
          setStatus(`❌ Ошибка сети: ${fetchError instanceof Error ? fetchError.message : 'Неизвестная ошибка'}`);
        }
      }, 'image/png');
    } catch (error) {
      console.error('❌ Общая ошибка:', error);
      setStatus(`❌ Ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  };

  const testFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setStatus('Загружаем выбранный файл...');
      
      const formData = new FormData();
      formData.append('image', file);

      console.log('📤 Загружаем файл:', file.name, file.type, file.size);
      
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      console.log('📨 Статус ответа:', response.status);
      const result = await response.json();
      console.log('📥 Результат:', result);

      setResult(result);

      if (response.ok) {
        setStatus(`✅ Файл загружен! URL: ${result.url}`);
      } else {
        setStatus(`❌ Ошибка загрузки файла: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ Ошибка загрузки файла:', error);
      setStatus(`❌ Ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Простая диагностика загрузки</h1>
      
      <div className="space-y-6">
        {/* Тест создания изображения */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Тест 1: Создание и загрузка тестового изображения</h2>
          <button
            onClick={testUpload}
            className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 mb-4"
          >
            Создать и загрузить тестовое изображение
          </button>
        </div>

        {/* Тест загрузки файла */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Тест 2: Загрузка файла</h2>
          <input
            type="file"
            accept="image/*"
            onChange={testFileUpload}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        {/* Статус */}
        {status && (
          <div className="bg-gray-100 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Статус:</h3>
            <p className="text-sm">{status}</p>
          </div>
        )}

        {/* Результат */}
        {result && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="font-semibold mb-4">Результат API:</h3>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
            
            {result.url && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Предпросмотр:</h4>
                <img 
                  src={result.url} 
                  alt="Загруженное изображение" 
                  className="max-w-xs border rounded"
                  onLoad={() => console.log('✅ Изображение отображено')}
                  onError={(e) => console.error('❌ Ошибка отображения изображения:', e)}
                />
                <p className="text-xs text-gray-600 mt-2 break-all">
                  <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    {result.url}
                  </a>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Информация */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="font-semibold mb-2 text-yellow-800">Инструкции:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-yellow-700">
            <li>Откройте консоль браузера (F12)</li>
            <li>Попробуйте оба теста</li>
            <li>Проверьте логи в консоли</li>
            <li>Если есть ошибки, скопируйте их</li>
          </ol>
        </div>
      </div>
    </div>
  );
} 