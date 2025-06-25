'use client';

import { useState, useEffect } from 'react';
import { CustomWheel } from '@/components/CustomWheel';

export default function TestProblemImagePage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [testResults, setTestResults] = useState<{
    direct: string;
    noCors: string;
    proxy: string;
  }>({
    direct: 'Не тестировано',
    noCors: 'Не тестировано', 
    proxy: 'Не тестировано'
  });

  // Проблемное изображение из ошибки
  const problemImageUrl = 'https://s3.twcstorage.ru/617774af-gifty/wheel-images/1750680655099-pk24bh.png';

  // Данные для рулетки с проблемным изображением
  const [wheelData, setWheelData] = useState([
    { option: 'Сегмент 1', style: { backgroundColor: '#ff6b6b', textColor: '#ffffff' }, image: problemImageUrl },
    { option: 'Сегмент 2', style: { backgroundColor: '#4ecdc4', textColor: '#ffffff' } },
    { option: 'Сегмент 3', style: { backgroundColor: '#45b7d1', textColor: '#ffffff' } },
    { option: 'Сегмент 4', style: { backgroundColor: '#96ceb4', textColor: '#ffffff' } },
  ]);

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
      console.log('Direct load error:', error);
      setTestResults(prev => ({ ...prev, direct: '❌ CORS ошибка' }));
    };
    
    img.src = problemImageUrl;
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
      console.log('No CORS load error:', error);
      setTestResults(prev => ({ ...prev, noCors: '❌ Ошибка' }));
    };
    
    img.src = problemImageUrl;
  };

  // Тест загрузки через прокси
  const testProxyLoad = () => {
    addLog('🔄 Тестируем загрузку через прокси API...');
    
    const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(problemImageUrl)}`;
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
      console.log('Proxy load error:', error);
      setTestResults(prev => ({ ...prev, proxy: '❌ Ошибка прокси' }));
    };
    
    img.src = proxyUrl;
  };

  // Тест всех методов сразу
  const testAllMethods = () => {
    clearLogs();
    addLog('🚀 Начинаем комплексный тест проблемного изображения...');
    addLog(`🔗 Тестируемый URL: ${problemImageUrl}`);
    
    setTimeout(() => testDirectLoad(), 100);
    setTimeout(() => testNoCorsLoad(), 1000);
    setTimeout(() => testProxyLoad(), 2000);
  };

  const handleSpin = () => {
    if (!mustSpin) {
      const newPrizeNumber = Math.floor(Math.random() * wheelData.length);
      setPrizeNumber(newPrizeNumber);
      setMustSpin(true);
      addLog(`🎲 Запуск рулетки, выбран сегмент: ${newPrizeNumber}`);
    }
  };

  const handleStopSpinning = () => {
    setMustSpin(false);
    addLog(`🎉 Рулетка остановилась на: ${wheelData[prizeNumber]?.option}`);
  };

  const toggleProblemImage = () => {
    setWheelData(prev => prev.map((item, index) => 
      index === 0 
        ? { ...item, image: item.image ? undefined : problemImageUrl }
        : item
    ));
    addLog(wheelData[0].image ? 'Убираем проблемное изображение' : 'Добавляем проблемное изображение');
  };

  // Автоматически запускаем тест при загрузке страницы
  useEffect(() => {
    setTimeout(() => {
      addLog('🔍 Страница загружена, начинаем автоматический тест...');
      testAllMethods();
    }, 1000);
  }, []);

  return (
    <div className="container mx-auto p-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Тест проблемного изображения</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Левая колонка - управление */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Информация об изображении</h2>
            
            <div className="space-y-3 text-sm">
              <div><strong>URL:</strong></div>
              <div className="p-2 bg-gray-100 rounded break-all text-xs">
                {problemImageUrl}
              </div>
              
              <div><strong>Домен:</strong> s3.twcstorage.ru</div>
              <div><strong>Тип:</strong> PNG изображение</div>
              <div><strong>Источник:</strong> S3 хранилище</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Тесты загрузки</h2>
            
            <div className="space-y-3">
              <button
                onClick={testDirectLoad}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
              >
                Тест с CORS
              </button>
              
              <button
                onClick={testNoCorsLoad}
                className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600"
              >
                Тест без CORS
              </button>
              
              <button
                onClick={testProxyLoad}
                className="w-full bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600"
              >
                Тест через прокси
              </button>
              
              <button
                onClick={testAllMethods}
                className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600"
              >
                Тест всех методов
              </button>
              
              <button
                onClick={toggleProblemImage}
                className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600"
              >
                {wheelData[0].image ? 'Убрать изображение' : 'Добавить изображение'}
              </button>
              
              <button
                onClick={clearLogs}
                className="w-full bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600"
              >
                Очистить логи
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Результаты тестов</h2>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Прямая загрузка (CORS):</span>
                <span className={testResults.direct.includes('✅') ? 'text-green-600' : 'text-red-600'}>
                  {testResults.direct}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Загрузка без CORS:</span>
                <span className={testResults.noCors.includes('✅') ? 'text-green-600' : 'text-red-600'}>
                  {testResults.noCors}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Загрузка через прокси:</span>
                <span className={testResults.proxy.includes('✅') ? 'text-green-600' : 'text-red-600'}>
                  {testResults.proxy}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Средняя колонка - рулетка */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Тест рулетки</h2>
          
          <div className="flex flex-col items-center space-y-4">
            <CustomWheel
              mustStartSpinning={mustSpin}
              prizeNumber={prizeNumber}
              data={wheelData}
              onStopSpinning={handleStopSpinning}
              size="medium"
            />
            
            <button
              onClick={handleSpin}
              disabled={mustSpin}
              className={`px-6 py-3 rounded-lg font-semibold ${
                mustSpin 
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {mustSpin ? 'Крутится...' : 'Запустить рулетку'}
            </button>
            
            <div className="text-center">
              <div className="text-sm text-gray-600">
                Сегменты: {wheelData.length} | 
                С изображениями: {wheelData.filter(s => s.image).length}
              </div>
            </div>
          </div>
        </div>

        {/* Правая колонка - логи */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Логи тестирования</h2>
          
          <div className="h-96 overflow-y-auto bg-gray-50 p-4 rounded border text-xs font-mono">
            {logs.length === 0 ? (
              <div className="text-gray-500">Логи появятся здесь...</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Инструкции */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-blue-800">Что проверяем</h2>
        <div className="space-y-2 text-sm text-blue-700">
          <div><strong>🔄 Прямая загрузка с CORS:</strong> Стандартный способ загрузки изображений</div>
          <div><strong>🔄 Загрузка без CORS:</strong> Альтернативный способ без CORS заголовков</div>
          <div><strong>🔄 Загрузка через прокси:</strong> Обход CORS через наш прокси API</div>
          <div><strong>🎲 Тест рулетки:</strong> Проверка работы изображения в компоненте CustomWheel</div>
          <div><strong>📊 Логирование:</strong> Детальная информация о процессе загрузки</div>
        </div>
      </div>
    </div>
  );
} 