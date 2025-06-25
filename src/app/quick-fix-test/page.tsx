'use client';

import { useState } from 'react';
import { CustomWheel } from '@/components/CustomWheel';

export default function QuickFixTestPage() {
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);

  // Данные с проблемным изображением
  const wheelData = [
    { 
      option: 'Проблемный сегмент', 
      style: { backgroundColor: '#ff6b6b', textColor: '#ffffff' }, 
      image: 'https://s3.twcstorage.ru/617774af-gifty/wheel-images/1750680655099-pk24bh.png' 
    },
    { option: 'Сегмент 2', style: { backgroundColor: '#4ecdc4', textColor: '#ffffff' } },
    { option: 'Сегмент 3', style: { backgroundColor: '#45b7d1', textColor: '#ffffff' } },
    { option: 'Сегмент 4', style: { backgroundColor: '#96ceb4', textColor: '#ffffff' } },
  ];

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
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Быстрый тест исправления ошибки</h1>
      
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Тест рулетки с проблемным изображением</h2>
        
        <div className="flex flex-col items-center space-y-6">
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
            className={`px-8 py-3 rounded-lg font-semibold text-lg ${
              mustSpin 
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {mustSpin ? 'Крутится...' : 'Запустить рулетку'}
          </button>
        </div>
      </div>

      <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-green-800">Что проверяем</h2>
        <div className="space-y-2 text-sm text-green-700">
          <div><strong>✅ Исправление:</strong> Ошибка "Error: img.src" больше не должна появляться</div>
          <div><strong>🔍 Проверьте консоль:</strong> URL теперь выводятся через console.log, а не console.error</div>
          <div><strong>🎯 Тестируемое изображение:</strong> https://s3.twcstorage.ru/617774af-gifty/wheel-images/1750680655099-pk24bh.png</div>
          <div><strong>🔄 Процесс:</strong> Изображение попробует загрузиться с CORS, без CORS, затем через прокси</div>
        </div>
      </div>

      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-blue-800">Инструкции</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm text-blue-700">
          <li>Откройте консоль разработчика (F12)</li>
          <li>Обратите внимание на логи загрузки изображений</li>
          <li>Убедитесь, что нет ошибок "Error: img.src" или "Error: URL изображения"</li>
          <li>Проверьте, что изображение загружается через прокси API</li>
          <li>Запустите рулетку для полного теста</li>
        </ol>
      </div>
    </div>
  );
} 