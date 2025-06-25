'use client';

import { useState } from 'react';

export default function DebugS3CorsPage() {
  const [testUrl, setTestUrl] = useState('');
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (result: any) => {
    setTestResults(prev => [...prev, { ...result, timestamp: new Date().toLocaleTimeString() }]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const testImageUrl = async (url: string, testName: string) => {
    console.group(`🧪 Тест: ${testName}`);
    console.log('URL:', url);
    
    addResult({ type: 'info', message: `Начинаем тест: ${testName}`, url });

    // Тест 1: Загрузка с CORS
    try {
      const img1 = new Image();
      img1.crossOrigin = 'anonymous';
      
      const corsPromise = new Promise((resolve, reject) => {
        img1.onload = () => {
          console.log('✅ CORS загрузка успешна');
          addResult({ 
            type: 'success', 
            message: `${testName}: CORS загрузка успешна`,
            details: `${img1.naturalWidth}x${img1.naturalHeight}`,
            url
          });
          resolve(true);
        };
        
        img1.onerror = (error) => {
          console.error('❌ CORS загрузка неудачна');
          addResult({ 
            type: 'error', 
            message: `${testName}: CORS загрузка неудачна`,
            details: 'Возможная проблема с CORS политикой',
            url
          });
          reject(error);
        };
        
        setTimeout(() => {
          reject(new Error('Timeout'));
        }, 10000);
      });

      img1.src = url;
      await corsPromise;
    } catch (error) {
      console.error('CORS тест не прошел:', error);
    }

    // Тест 2: Загрузка без CORS
    try {
      const img2 = new Image();
      
      const noCorsPromise = new Promise((resolve, reject) => {
        img2.onload = () => {
          console.log('✅ Загрузка без CORS успешна');
          addResult({ 
            type: 'success', 
            message: `${testName}: Загрузка без CORS успешна`,
            details: `${img2.naturalWidth}x${img2.naturalHeight}`,
            url
          });
          resolve(true);
        };
        
        img2.onerror = (error) => {
          console.error('❌ Загрузка без CORS неудачна');
          addResult({ 
            type: 'error', 
            message: `${testName}: Загрузка без CORS неудачна`,
            details: 'Изображение недоступно',
            url
          });
          reject(error);
        };
        
        setTimeout(() => {
          reject(new Error('Timeout'));
        }, 10000);
      });

      img2.src = url;
      await noCorsPromise;
    } catch (error) {
      console.error('No-CORS тест не прошел:', error);
    }

    // Тест 3: Fetch запрос
    try {
      console.log('🔄 Тестируем fetch запрос...');
      const response = await fetch(url, { 
        method: 'HEAD',
        mode: 'cors'
      });
      
      console.log('Fetch response status:', response.status);
      console.log('Fetch response headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        addResult({ 
          type: 'success', 
          message: `${testName}: Fetch запрос успешен`,
          details: `Status: ${response.status}`,
          url
        });
      } else {
        addResult({ 
          type: 'error', 
          message: `${testName}: Fetch запрос неудачен`,
          details: `Status: ${response.status}`,
          url
        });
      }
    } catch (error) {
      console.error('Fetch тест не прошел:', error);
      addResult({ 
        type: 'error', 
        message: `${testName}: Fetch запрос неудачен`,
        details: error instanceof Error ? error.message : 'Неизвестная ошибка',
        url
      });
    }

    console.groupEnd();
  };

  const runTestSuite = async () => {
    setIsLoading(true);
    clearResults();

    // Тест 1: Загрузка тестового изображения в S3
    try {
      addResult({ type: 'info', message: 'Создаем тестовое изображение...' });
      
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.fillStyle = '#ff6b6b';
        ctx.fillRect(0, 0, 100, 100);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('CORS', 50, 40);
        ctx.fillText('TEST', 50, 60);
      }

      canvas.toBlob(async (blob) => {
        if (!blob) return;

        const formData = new FormData();
        formData.append('image', blob, 'cors-test.png');

        const response = await fetch('/api/upload-image', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          setTestUrl(result.url);
          addResult({ 
            type: 'success', 
            message: 'Тестовое изображение загружено в S3',
            details: result.url,
            url: result.url
          });
          
          // Ждем немного и тестируем загруженное изображение
          setTimeout(() => {
            testImageUrl(result.url, 'S3 загруженное изображение');
          }, 1000);
        } else {
          const error = await response.json();
          addResult({ 
            type: 'error', 
            message: 'Ошибка загрузки в S3',
            details: error.error || 'Неизвестная ошибка'
          });
        }
      }, 'image/png');
    } catch (error) {
      addResult({ 
        type: 'error', 
        message: 'Ошибка создания тестового изображения',
        details: error instanceof Error ? error.message : 'Неизвестная ошибка'
      });
    }

    // Тест 2: Внешнее изображение (должно работать)
    await testImageUrl('https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png', 'Внешнее изображение (GitHub)');

    // Тест 3: Прямой URL к S3 (если есть)
    if (testUrl) {
      await testImageUrl(testUrl, 'Прямой S3 URL');
    }

    setIsLoading(false);
  };

  const testCustomUrl = async () => {
    if (!testUrl.trim()) {
      alert('Введите URL для тестирования');
      return;
    }
    
    await testImageUrl(testUrl, 'Пользовательский URL');
  };

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Диагностика CORS проблем с S3</h1>
      
      <div className="mb-6 p-4 bg-red-100 border border-red-400 rounded-lg">
        <h2 className="text-lg font-semibold mb-2 text-red-800">🚨 Обнаруженная проблема</h2>
        <p className="text-red-700 text-sm">
          Изображения успешно загружаются в S3, но браузер не может их загрузить из-за CORS политики. 
          Это означает, что S3 сервис не настроен для Cross-Origin запросов.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Левая колонка - управление */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Тесты</h2>
            
            <div className="space-y-3">
              <button
                onClick={runTestSuite}
                disabled={isLoading}
                className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {isLoading ? 'Выполняется...' : 'Запустить полный тест'}
              </button>
              
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={testUrl}
                  onChange={(e) => setTestUrl(e.target.value)}
                  placeholder="Введите URL изображения для тестирования"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                />
                <button
                  onClick={testCustomUrl}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                >
                  Тест
                </button>
              </div>
              
              <button
                onClick={clearResults}
                className="w-full bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600"
              >
                Очистить результаты
              </button>
            </div>
          </div>

          {/* Решения */}
          <div className="bg-yellow-50 border border-yellow-400 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-yellow-800">💡 Возможные решения</h2>
            <div className="space-y-3 text-sm text-yellow-700">
              <div>
                <strong>1. Настройка CORS в S3:</strong>
                <p>Обратитесь к провайдеру S3 (twcstorage.ru) для настройки CORS политики</p>
              </div>
              <div>
                <strong>2. Проксирование через API:</strong>
                <p>Создать API endpoint, который будет проксировать изображения</p>
              </div>
              <div>
                <strong>3. Использование без crossOrigin:</strong>
                <p>Загружать изображения без CORS (ограниченная функциональность)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Правая колонка - результаты */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Результаты тестов</h2>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {testResults.length === 0 ? (
                <div className="text-gray-500 text-center py-8">
                  Результаты тестов появятся здесь
                </div>
              ) : (
                testResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border-l-4 ${
                      result.type === 'success' 
                        ? 'bg-green-50 border-green-400' 
                        : result.type === 'error'
                        ? 'bg-red-50 border-red-400'
                        : 'bg-blue-50 border-blue-400'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      <span className="text-xs text-gray-500">{result.timestamp}</span>
                      <div className="flex-1">
                        <div className={`font-medium ${
                          result.type === 'success' 
                            ? 'text-green-800' 
                            : result.type === 'error'
                            ? 'text-red-800'
                            : 'text-blue-800'
                        }`}>
                          {result.message}
                        </div>
                        {result.details && (
                          <div className="text-xs text-gray-600 mt-1">
                            {result.details}
                          </div>
                        )}
                        {result.url && (
                          <div className="text-xs text-gray-500 mt-1 break-all">
                            {result.url.substring(0, 80)}...
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 