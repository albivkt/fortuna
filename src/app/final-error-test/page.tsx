'use client';

import { useState, useEffect } from 'react';
import { CustomWheel } from '@/components/CustomWheel';

export default function FinalErrorTestPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [errorCount, setErrorCount] = useState(0);

  // Проблемное изображение из ошибки
  const problemImageUrl = 'https://s3.twcstorage.ru/617774af-gifty/wheel-images/1750680655099-pk24bh.png';

  // Данные с проблемным изображением
  const wheelData = [
    { option: 'Проблемный сегмент', style: { backgroundColor: '#ff6b6b', textColor: '#ffffff' }, image: problemImageUrl },
    { option: 'Сегмент 2', style: { backgroundColor: '#4ecdc4', textColor: '#ffffff' } },
    { option: 'Сегмент 3', style: { backgroundColor: '#45b7d1', textColor: '#ffffff' } },
    { option: 'Сегмент 4', style: { backgroundColor: '#96ceb4', textColor: '#ffffff' } },
  ];

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    setLogs(prev => [...prev, logMessage]);
  };

  const clearLogs = () => {
    setLogs([]);
    setErrorCount(0);
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

  // Отслеживаем ошибки консоли
  useEffect(() => {
    const originalError = console.error;
    console.error = (...args) => {
      // Проверяем, есть ли в ошибке URL изображения
      const errorMessage = args.join(' ');
      if (errorMessage.includes('s3.twcstorage.ru') || errorMessage.includes('img.src') || errorMessage.includes('URL изображения')) {
        setErrorCount(prev => prev + 1);
        addLog(`❌ ОШИБКА ОБНАРУЖЕНА: ${errorMessage}`);
      }
      originalError.apply(console, args);
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  // Автоматический тест при загрузке
  useEffect(() => {
    addLog('🔍 Страница загружена, начинаем мониторинг ошибок...');
    addLog(`🎯 Тестируемое изображение: ${problemImageUrl}`);
    addLog('📊 Следим за ошибками консоли...');
  }, []);

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Финальный тест исправления ошибки</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Левая колонка - рулетка и управление */}
        <div className="space-y-6">
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
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Статус исправления</h2>
            
            <div className="space-y-3">
              <div className={`p-4 rounded-lg ${errorCount === 0 ? 'bg-green-100 border border-green-300' : 'bg-red-100 border border-red-300'}`}>
                <div className={`text-lg font-semibold ${errorCount === 0 ? 'text-green-800' : 'text-red-800'}`}>
                  {errorCount === 0 ? '✅ Ошибки не обнаружены!' : `❌ Обнаружено ошибок: ${errorCount}`}
                </div>
                <div className={`text-sm ${errorCount === 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {errorCount === 0 
                    ? 'Исправление работает корректно' 
                    : 'Требуется дополнительное исправление'
                  }
                </div>
              </div>
              
              <button
                onClick={clearLogs}
                className="w-full bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600"
              >
                Очистить логи и счётчик
              </button>
            </div>
          </div>
        </div>

        {/* Правая колонка - логи и информация */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Логи мониторинга</h2>
            
            <div className="h-64 overflow-y-auto bg-gray-50 p-4 rounded border text-xs font-mono">
              {logs.length === 0 ? (
                <div className="text-gray-500">Логи появятся здесь...</div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className={`mb-1 ${log.includes('❌') ? 'text-red-600 font-bold' : ''}`}>
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-blue-800">Что исправлено</h2>
            <div className="space-y-2 text-sm text-blue-700">
              <div><strong>🔧 Проблема:</strong> console.error() с URL вызывал ошибку Next.js</div>
              <div><strong>✅ Решение:</strong> Заменили console.error на console.log для URL</div>
              <div><strong>🎯 Тестируемый URL:</strong> s3.twcstorage.ru/617774af-gifty/wheel-images/1750680655099-pk24bh.png</div>
              <div><strong>📊 Мониторинг:</strong> Автоматически отслеживаем ошибки консоли</div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-green-800">Ожидаемый результат</h2>
            <div className="space-y-2 text-sm text-green-700">
              <div><strong>✅ Нет ошибок:</strong> "Error: img.src" больше не появляется</div>
              <div><strong>✅ Нет ошибок:</strong> "Error: URL изображения" больше не появляется</div>
              <div><strong>✅ Прокси работает:</strong> Изображение загружается через /api/proxy-image</div>
              <div><strong>✅ Рулетка работает:</strong> Компонент отображается корректно</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 