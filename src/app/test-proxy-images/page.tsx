'use client';

import { useState } from 'react';
import { CustomWheel } from '@/components/CustomWheel';

export default function TestProxyImagesPage() {
  const [testData, setTestData] = useState([
    {
      option: 'S3 Прокси',
      style: { backgroundColor: '#EC4899', textColor: 'white' },
      image: undefined as string | undefined,
      imagePosition: { x: 0, y: 0 }
    },
    {
      option: 'GitHub Прокси', 
      style: { backgroundColor: '#3B82F6', textColor: 'white' },
      image: undefined as string | undefined,
      imagePosition: { x: 0, y: 0 }
    }
  ]);

  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    setLogs(prev => [...prev, logMessage]);
  };

  const clearLogs = () => {
    setLogs([]);
    console.clear();
  };

  const testS3Proxy = async () => {
    addLog('🚀 Тестируем прокси для S3 изображения...');
    
    try {
      // Сначала создаем и загружаем тестовое изображение в S3
      const canvas = document.createElement('canvas');
      canvas.width = 120;
      canvas.height = 120;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Создаем градиент
        const gradient = ctx.createRadialGradient(60, 60, 0, 60, 60, 60);
        gradient.addColorStop(0, '#ff6b6b');
        gradient.addColorStop(1, '#4ecdc4');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 120, 120);
        
        // Добавляем текст
        ctx.fillStyle = 'white';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('PROXY', 60, 55);
        ctx.fillText('S3', 60, 75);
      }

      canvas.toBlob(async (blob) => {
        if (!blob) return;

        const formData = new FormData();
        formData.append('image', blob, 'proxy-test-s3.png');

        addLog('📤 Загружаем изображение в S3...');
        
        const uploadResponse = await fetch('/api/upload-image', {
          method: 'POST',
          body: formData,
        });

        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          addLog(`✅ Изображение загружено в S3: ${uploadResult.url}`);
          
          // Теперь используем это изображение через прокси
          const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(uploadResult.url)}`;
          addLog(`🔗 Тестируем прокси URL: ${proxyUrl}`);
          
          // Устанавливаем оригинальный S3 URL в рулетку (он попробует прямую загрузку, потом без CORS, потом прокси)
          setTestData(prev => prev.map((item, index) => 
            index === 0 ? { ...item, image: uploadResult.url } : item
          ));
          
          addLog('🎯 S3 URL установлен в рулетку - смотрите логи CustomWheel в консоли');
        } else {
          const error = await uploadResponse.json();
          addLog(`❌ Ошибка загрузки в S3: ${error.error}`);
        }
      }, 'image/png');
    } catch (error) {
      addLog(`❌ Ошибка теста S3 прокси: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  };

  const testGitHubProxy = () => {
    addLog('🐙 Тестируем прокси для GitHub изображения...');
    
    const githubUrl = 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png';
    addLog(`🔗 Оригинальный GitHub URL: ${githubUrl}`);
    
    // Устанавливаем GitHub URL в рулетку
    setTestData(prev => prev.map((item, index) => 
      index === 1 ? { ...item, image: githubUrl } : item
    ));
    
    addLog('🎯 GitHub URL установлен в рулетку - смотрите логи CustomWheel в консоли');
  };

  const testProxyDirectly = async (url: string) => {
    addLog(`🧪 Прямое тестирование прокси для: ${url}`);
    
    try {
      const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(url)}`;
      addLog(`🔗 Прокси URL: ${proxyUrl}`);
      
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        addLog(`✅ Прямое тестирование прокси успешно: ${img.width}x${img.height}`);
      };
      
      img.onerror = (error) => {
        addLog(`❌ Прямое тестирование прокси неудачно`);
      };
      
      img.src = proxyUrl;
    } catch (error) {
      addLog(`❌ Ошибка прямого тестирования: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  };

  const clearImages = () => {
    addLog('🧹 Очищаем изображения');
    setTestData(prev => prev.map(item => ({ ...item, image: undefined })));
  };

  const handleSpin = () => {
    if (!mustSpin) {
      const newPrizeNumber = Math.floor(Math.random() * testData.length);
      setPrizeNumber(newPrizeNumber);
      setMustSpin(true);
    }
  };

  const handleStopSpinning = () => {
    setMustSpin(false);
  };

  return (
    <div className="container mx-auto p-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Тест прокси API для изображений</h1>
      
      <div className="mb-6 p-4 bg-blue-100 border border-blue-400 rounded-lg">
        <h2 className="text-lg font-semibold mb-2 text-blue-800">💡 Как это работает</h2>
        <p className="text-blue-700 text-sm">
          Прокси API загружает изображения на сервере и отдает их с правильными CORS заголовками. 
          CustomWheel автоматически попробует: 1) прямую загрузку с CORS, 2) без CORS, 3) через прокси API.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Левая колонка - тесты */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Тесты прокси</h2>
            
            <div className="space-y-3">
              <button
                onClick={testS3Proxy}
                className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600"
              >
                🔴 Тест S3 через прокси
              </button>
              
              <button
                onClick={testGitHubProxy}
                className="w-full bg-gray-800 text-white py-2 px-4 rounded-lg hover:bg-gray-900"
              >
                🐙 Тест GitHub через прокси
              </button>
              
              <button
                onClick={() => testProxyDirectly('https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png')}
                className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600"
              >
                🧪 Прямой тест прокси
              </button>
              
              <button
                onClick={clearImages}
                className="w-full bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600"
              >
                🧹 Очистить изображения
              </button>
              
              <button
                onClick={clearLogs}
                className="w-full bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600"
              >
                🗑️ Очистить логи
              </button>
            </div>
          </div>

          {/* Состояние сегментов */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Состояние сегментов</h2>
            
            <div className="space-y-3">
              {testData.map((segment, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex items-center space-x-3 mb-2">
                    <div
                      className="w-6 h-6 rounded-full border"
                      style={{ backgroundColor: segment.style.backgroundColor }}
                    />
                    <span className="font-medium">{segment.option}</span>
                  </div>
                  
                  <div className="text-sm">
                    <div><strong>Изображение:</strong> {segment.image ? '✅ Есть' : '❌ Нет'}</div>
                    {segment.image && (
                      <div className="text-xs text-gray-600 break-all mt-1">
                        {segment.image.substring(0, 50)}...
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Средняя колонка - рулетка */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-center">Тестовая рулетка</h2>
            <div className="flex justify-center">
              <CustomWheel
                mustStartSpinning={mustSpin}
                prizeNumber={prizeNumber}
                data={testData}
                onStopSpinning={handleStopSpinning}
                size="medium"
                isPro={true}
              />
            </div>
            
            <div className="text-center mt-4">
              <button
                onClick={handleSpin}
                disabled={mustSpin}
                className="bg-gradient-to-r from-orange-400 to-pink-400 text-white px-8 py-3 rounded-lg hover:from-orange-500 hover:to-pink-500 transition-all shadow-lg disabled:opacity-50"
              >
                {mustSpin ? 'Крутится...' : 'Крутить!'}
              </button>
            </div>
          </div>
        </div>

        {/* Правая колонка - логи */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Логи тестирования</h2>
            
            <div className="bg-gray-100 rounded-lg p-4 h-96 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-gray-500 text-center">Логи пусты</div>
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

          {/* Инструкции */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-green-800">📋 Что смотреть</h2>
            <div className="space-y-2 text-sm text-green-700">
              <div><strong>В этих логах:</strong> Процесс тестирования</div>
              <div><strong>В консоли браузера:</strong> Детальные логи CustomWheel</div>
              <div><strong>Ожидаемый результат:</strong> Изображения загружаются через прокси после неудачных попыток прямой загрузки</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 