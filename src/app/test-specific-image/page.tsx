'use client';

import { useState, useEffect } from 'react';
import { CustomWheel } from '@/components/CustomWheel';

export default function TestSpecificImagePage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [testResults, setTestResults] = useState<{
    direct: string;
    noCors: string;
    proxy: string;
  }>({
    direct: 'Не тестировано',
    noCors: 'Не тестировано', 
    proxy: 'Не тестировано'
  });

  // Конкретное изображение из ошибки
  const imageUrl = 'https://s3.twcstorage.ru/617774af-gifty/wheel-images/1750680655099-pk24bh.png';

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

  // Тест прямой загрузки с CORS
  const testDirectLoad = () => {
    addLog('🔄 Тестируем прямую загрузку с CORS...');
    
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      addLog(`✅ Прямая загрузка с CORS успешна: ${img.width}x${img.height}`);
      setTestResults(prev => ({ ...prev, direct: '✅ Успех' }));
    };
    
    img.onerror = (error) => {
      addLog(`❌ Прямая загрузка с CORS неудачна`);
      console.error('Direct load error:', error);
      setTestResults(prev => ({ ...prev, direct: '❌ CORS ошибка' }));
    };
    
    img.src = imageUrl;
  };

  // Тест загрузки без CORS
  const testNoCorsLoad = () => {
    addLog('🔄 Тестируем загрузку без CORS...');
    
    const img = new Image();
    // Не устанавливаем crossOrigin
    
    img.onload = () => {
      addLog(`✅ Загрузка без CORS успешна: ${img.width}x${img.height}`);
      addLog(`⚠️ Ограниченная функциональность (нельзя использовать в Canvas)`);
      setTestResults(prev => ({ ...prev, noCors: '✅ Успех (ограниченно)' }));
    };
    
    img.onerror = (error) => {
      addLog(`❌ Загрузка без CORS неудачна`);
      console.error('No CORS load error:', error);
      setTestResults(prev => ({ ...prev, noCors: '❌ Ошибка' }));
    };
    
    img.src = imageUrl;
  };

  // Тест загрузки через прокси
  const testProxyLoad = () => {
    addLog('🔄 Тестируем загрузку через прокси API...');
    
    const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
    addLog(`🔗 Прокси URL: ${proxyUrl}`);
    
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Теперь должно работать
    
    img.onload = () => {
      addLog(`✅ Прокси загрузка успешна: ${img.width}x${img.height}`);
      addLog(`🎉 Полная функциональность восстановлена!`);
      setTestResults(prev => ({ ...prev, proxy: '✅ Успех (полная функциональность)' }));
    };
    
    img.onerror = (error) => {
      addLog(`❌ Прокси загрузка неудачна`);
      console.error('Proxy load error:', error);
      setTestResults(prev => ({ ...prev, proxy: '❌ Ошибка прокси' }));
    };
    
    img.src = proxyUrl;
  };

  // Тест прокси API напрямую
  const testProxyApi = async () => {
    addLog('🧪 Тестируем прокси API напрямую...');
    
    try {
      const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
      const response = await fetch(proxyUrl);
      
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        const blob = await response.blob();
        addLog(`✅ Прокси API работает: ${contentType}, размер: ${blob.size} байт`);
        
        // Создаем object URL для проверки
        const objectUrl = URL.createObjectURL(blob);
        addLog(`🔗 Object URL создан: ${objectUrl.substring(0, 50)}...`);
        
        // Освобождаем память
        setTimeout(() => URL.revokeObjectURL(objectUrl), 5000);
      } else {
        const errorData = await response.json();
        addLog(`❌ Прокси API ошибка: ${response.status} - ${errorData.error}`);
      }
    } catch (error) {
      addLog(`❌ Ошибка запроса к прокси API: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  };

  // Тест в CustomWheel
  const [wheelData, setWheelData] = useState([
    {
      option: 'Тест изображения',
      style: { backgroundColor: '#EC4899', textColor: 'white' },
      image: undefined as string | undefined,
      imagePosition: { x: 0, y: 0 }
    },
    {
      option: 'Без изображения',
      style: { backgroundColor: '#3B82F6', textColor: 'white' },
      image: undefined as string | undefined,
      imagePosition: { x: 0, y: 0 }
    }
  ]);

  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);

  const testInWheel = () => {
    addLog('🎡 Тестируем изображение в CustomWheel...');
    addLog('📺 Смотрите логи CustomWheel в консоли браузера');
    
    setWheelData(prev => prev.map((item, index) => 
      index === 0 ? { ...item, image: imageUrl } : item
    ));
  };

  const clearWheelImage = () => {
    addLog('🧹 Очищаем изображение из рулетки');
    setWheelData(prev => prev.map((item, index) => 
      index === 0 ? { ...item, image: undefined } : item
    ));
  };

  const runAllTests = () => {
    addLog('🚀 Запускаем все тесты последовательно...');
    clearLogs();
    
    setTimeout(() => testDirectLoad(), 100);
    setTimeout(() => testNoCorsLoad(), 2000);
    setTimeout(() => testProxyLoad(), 4000);
    setTimeout(() => testProxyApi(), 6000);
  };

  const handleSpin = () => {
    if (!mustSpin) {
      const newPrizeNumber = Math.floor(Math.random() * wheelData.length);
      setPrizeNumber(newPrizeNumber);
      setMustSpin(true);
    }
  };

  const handleStopSpinning = () => {
    setMustSpin(false);
  };

  return (
    <div className="container mx-auto p-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Тест конкретного изображения</h1>
      
      <div className="mb-6 p-4 bg-red-100 border border-red-400 rounded-lg">
        <h2 className="text-lg font-semibold mb-2 text-red-800">🎯 Тестируемое изображение</h2>
        <p className="text-red-700 text-sm font-mono break-all">
          {imageUrl}
        </p>
        <p className="text-red-600 text-xs mt-2">
          Это изображение из реальной ошибки CORS в вашем приложении
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Левая колонка - тесты */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Тесты загрузки</h2>
            
            <div className="space-y-3">
              <button
                onClick={runAllTests}
                className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 font-semibold"
              >
                🚀 Запустить все тесты
              </button>
              
              <div className="border-t pt-3">
                <button
                  onClick={testDirectLoad}
                  className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 mb-2"
                >
                  1️⃣ Прямая загрузка (с CORS)
                </button>
                
                <button
                  onClick={testNoCorsLoad}
                  className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 mb-2"
                >
                  2️⃣ Загрузка без CORS
                </button>
                
                <button
                  onClick={testProxyLoad}
                  className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 mb-2"
                >
                  3️⃣ Загрузка через прокси
                </button>
                
                <button
                  onClick={testProxyApi}
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
                >
                  🧪 Тест прокси API
                </button>
              </div>
              
              <div className="border-t pt-3">
                <button
                  onClick={testInWheel}
                  className="w-full bg-indigo-500 text-white py-2 px-4 rounded-lg hover:bg-indigo-600 mb-2"
                >
                  🎡 Тест в CustomWheel
                </button>
                
                <button
                  onClick={clearWheelImage}
                  className="w-full bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600"
                >
                  🧹 Очистить из рулетки
                </button>
              </div>
              
              <button
                onClick={clearLogs}
                className="w-full bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600"
              >
                🗑️ Очистить логи
              </button>
            </div>
          </div>

          {/* Результаты тестов */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Результаты тестов</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="font-medium">1️⃣ Прямая загрузка:</span>
                <span className="text-sm">{testResults.direct}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="font-medium">2️⃣ Без CORS:</span>
                <span className="text-sm">{testResults.noCors}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="font-medium">3️⃣ Прокси:</span>
                <span className="text-sm">{testResults.proxy}</span>
              </div>
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
                data={wheelData}
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

          {/* Состояние сегментов */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Состояние сегментов</h2>
            
            <div className="space-y-3">
              {wheelData.map((segment, index) => (
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
                        {segment.image.substring(0, 30)}...
                      </div>
                    )}
                  </div>
                </div>
              ))}
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

          {/* Ожидаемый результат */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-green-800">🎯 Ожидаемый результат</h2>
            <div className="space-y-2 text-sm text-green-700">
              <div><strong>1️⃣ Прямая загрузка:</strong> ❌ CORS ошибка</div>
              <div><strong>2️⃣ Без CORS:</strong> ✅ Успех (ограниченно)</div>
              <div><strong>3️⃣ Прокси:</strong> ✅ Успех (полная функциональность)</div>
              <div><strong>CustomWheel:</strong> Автоматически переключится на прокси</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 