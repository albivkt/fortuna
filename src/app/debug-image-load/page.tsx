'use client';

import { useState } from 'react';
import { CustomWheel } from '@/components/CustomWheel';

export default function DebugImageLoadPage() {
  const [testData, setTestData] = useState([
    {
      option: 'Тест 1',
      style: { backgroundColor: '#EC4899', textColor: 'white' },
      image: undefined as string | undefined,
      imagePosition: { x: 0, y: 0 }
    },
    {
      option: 'Тест 2', 
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

  const testDirectUrl = async () => {
    const testUrl = 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png';
    addLog(`🧪 Тестируем прямой URL: ${testUrl}`);
    
    // Тестируем доступность URL
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      addLog(`✅ Прямой URL загружен успешно: ${img.width}x${img.height}`);
      setTestData(prev => prev.map((item, index) => 
        index === 0 ? { ...item, image: testUrl } : item
      ));
    };
    
    img.onerror = (error) => {
      addLog(`❌ Ошибка загрузки прямого URL`);
      if (error instanceof Event) {
        addLog(`❌ Error type: ${error.type}`);
      }
      if (error instanceof ErrorEvent) {
        addLog(`❌ Error message: ${error.message}`);
      }
      
      // Пробуем без CORS
      const img2 = new Image();
      img2.onload = () => {
        addLog(`✅ Прямой URL загружен без CORS: ${img2.width}x${img2.height}`);
        setTestData(prev => prev.map((item, index) => 
          index === 0 ? { ...item, image: testUrl } : item
        ));
      };
      img2.onerror = () => {
        addLog(`❌ Прямой URL недоступен даже без CORS`);
      };
      img2.src = testUrl;
    };
    
    img.src = testUrl;
  };

  const testS3Upload = async () => {
    addLog('🚀 Начинаем тест загрузки в S3...');
    
    try {
      // Создаем тестовое изображение
      const canvas = document.createElement('canvas');
      canvas.width = 150;
      canvas.height = 150;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Создаем красивое тестовое изображение
        const gradient = ctx.createLinearGradient(0, 0, 150, 150);
        gradient.addColorStop(0, '#ff6b6b');
        gradient.addColorStop(0.5, '#4ecdc4');
        gradient.addColorStop(1, '#45b7d1');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 150, 150);
        
        // Добавляем круг
        ctx.beginPath();
        ctx.arc(75, 75, 40, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
        
        // Добавляем текст
        ctx.fillStyle = '#333';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('TEST', 75, 80);
      }

      addLog('📦 Конвертируем изображение в blob...');
      
      canvas.toBlob(async (blob) => {
        if (!blob) {
          addLog('❌ Не удалось создать blob');
          return;
        }

        const formData = new FormData();
        formData.append('image', blob, 'debug-test-image.png');

        addLog('📤 Отправляем на сервер...');
        
        const response = await fetch('/api/upload-image', {
          method: 'POST',
          body: formData,
        });

        addLog(`📨 Получен ответ: ${response.status} ${response.statusText}`);

        if (response.ok) {
          const result = await response.json();
          addLog(`✅ Загрузка успешна: ${result.url}`);
          
          // Тестируем доступность загруженного изображения
          const testImg = new Image();
          testImg.crossOrigin = 'anonymous';
          
          testImg.onload = () => {
            addLog(`✅ S3 изображение доступно: ${testImg.width}x${testImg.height}`);
            setTestData(prev => prev.map((item, index) => 
              index === 1 ? { ...item, image: result.url } : item
            ));
          };
          
          testImg.onerror = (error) => {
            addLog(`❌ S3 изображение недоступно`);
            if (error instanceof Event) {
              addLog(`❌ Error type: ${error.type}`);
            }
            if (error instanceof ErrorEvent) {
              addLog(`❌ Error message: ${error.message}`);
            }
          };
          
          testImg.src = result.url;
        } else {
          const result = await response.json();
          addLog(`❌ Ошибка сервера: ${result.error || 'Неизвестная ошибка'}`);
        }
      }, 'image/png');
    } catch (error) {
      addLog(`❌ Исключение: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  };

  const testBrokenUrl = () => {
    const brokenUrl = 'https://nonexistent-domain-12345.com/image.png';
    addLog(`🧪 Тестируем сломанный URL: ${brokenUrl}`);
    
    setTestData(prev => prev.map((item, index) => 
      index === 0 ? { ...item, image: brokenUrl } : item
    ));
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
      addLog(`🎲 Запуск рулетки, выбран сегмент: ${newPrizeNumber}`);
    }
  };

  const handleStopSpinning = () => {
    setMustSpin(false);
    addLog(`🎉 Рулетка остановилась на: ${testData[prizeNumber]?.option}`);
  };

  return (
    <div className="container mx-auto p-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Диагностика загрузки изображений</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Левая колонка - управление */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Тесты</h2>
            
            <div className="space-y-3">
              <button
                onClick={testDirectUrl}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
              >
                Тест прямого URL
              </button>
              
              <button
                onClick={testS3Upload}
                className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600"
              >
                Тест загрузки в S3
              </button>
              
              <button
                onClick={testBrokenUrl}
                className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600"
              >
                Тест сломанного URL
              </button>
              
              <button
                onClick={clearImages}
                className="w-full bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600"
              >
                Очистить изображения
              </button>
              
              <button
                onClick={clearLogs}
                className="w-full bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600"
              >
                Очистить логи
              </button>
            </div>
          </div>

          {/* Информация о сегментах */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Состояние сегментов</h2>
            
            {testData.map((segment, index) => (
              <div key={index} className="border rounded-lg p-3 mb-3">
                <div className="flex items-center space-x-3 mb-2">
                  <div
                    className="w-6 h-6 rounded-full border"
                    style={{ backgroundColor: segment.style.backgroundColor }}
                  />
                  <span className="font-medium">{segment.option}</span>
                </div>
                
                <div className="text-sm">
                  <div><strong>Изображение:</strong> {segment.image ? '✅' : '❌'}</div>
                  {segment.image && (
                    <div className="text-xs text-gray-600 break-all mt-1">
                      {segment.image}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Средняя колонка - рулетка */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-center">Рулетка</h2>
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
            <h2 className="text-xl font-semibold mb-4">Логи</h2>
            
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
        </div>
      </div>
    </div>
  );
} 