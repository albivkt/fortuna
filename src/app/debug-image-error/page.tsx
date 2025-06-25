'use client';

import { useState } from 'react';
import { CustomWheel } from '@/components/CustomWheel';

export default function DebugImageErrorPage() {
  const [testScenario, setTestScenario] = useState<string>('');
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

  const runTest = (scenario: string) => {
    console.clear();
    console.log(`🧪 Запуск теста: ${scenario}`);
    setTestScenario(scenario);

    switch (scenario) {
      case 'empty-string':
        console.log('Тестируем пустую строку как URL изображения');
        setTestData(prev => prev.map((item, index) => 
          index === 0 ? { ...item, image: '' } : item
        ));
        break;

      case 'invalid-url':
        console.log('Тестируем невалидный URL');
        setTestData(prev => prev.map((item, index) => 
          index === 0 ? { ...item, image: 'invalid-url-123' } : item
        ));
        break;

      case 'broken-url':
        console.log('Тестируем сломанный HTTP URL');
        setTestData(prev => prev.map((item, index) => 
          index === 0 ? { ...item, image: 'https://nonexistent-domain-12345.com/image.png' } : item
        ));
        break;

      case 'valid-url':
        console.log('Тестируем валидный URL');
        setTestData(prev => prev.map((item, index) => 
          index === 0 ? { ...item, image: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png' } : item
        ));
        break;

      case 'clear':
        console.log('Очищаем все изображения');
        setTestData(prev => prev.map(item => ({ ...item, image: undefined })));
        break;

      default:
        console.log('Неизвестный тест');
    }
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
    <div className="container mx-auto p-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Диагностика ошибок изображений</h1>
      
      <div className="mb-6 p-4 bg-yellow-100 border border-yellow-400 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">📋 Инструкции</h2>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Откройте консоль браузера (F12 → Console)</li>
          <li>Выберите тест из списка ниже</li>
          <li>Посмотрите детальные логи в консоли</li>
          <li>Текущий тест: <strong>{testScenario || 'Не выбран'}</strong></li>
        </ol>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Левая колонка - тесты */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Тестовые сценарии</h2>
            
            <div className="space-y-2">
              <button
                onClick={() => runTest('empty-string')}
                className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 text-left"
              >
                🔴 Пустая строка ""
              </button>
              
              <button
                onClick={() => runTest('invalid-url')}
                className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 text-left"
              >
                🟠 Невалидный URL
              </button>
              
              <button
                onClick={() => runTest('broken-url')}
                className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 text-left"
              >
                🔴 Сломанный HTTP URL
              </button>
              
              <button
                onClick={() => runTest('valid-url')}
                className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 text-left"
              >
                🟢 Валидный URL
              </button>
              
              <button
                onClick={() => runTest('clear')}
                className="w-full bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 text-left"
              >
                🧹 Очистить все
              </button>
            </div>
          </div>

          {/* Информация о состоянии */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Состояние данных</h2>
            
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
                  
                  <div className="text-sm space-y-1">
                    <div><strong>Изображение:</strong> {segment.image ? '✅ Есть' : '❌ Нет'}</div>
                    <div><strong>Тип:</strong> {typeof segment.image}</div>
                    {segment.image && (
                      <>
                        <div><strong>Длина:</strong> {segment.image.length}</div>
                        <div className="text-xs text-gray-600 break-all">
                          <strong>URL:</strong> {segment.image.substring(0, 100)}{segment.image.length > 100 ? '...' : ''}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Правая колонка - рулетка */}
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

          {/* Инструкции по анализу логов */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-blue-800">Что искать в логах</h2>
            <div className="space-y-2 text-sm text-blue-700">
              <div><strong>🔄 Начало загрузки:</strong> Таблица с данными сегментов</div>
              <div><strong>🖼️ Загрузка изображения:</strong> Детали URL для каждого сегмента</div>
              <div><strong>❌ Ошибка загрузки:</strong> Подробная информация об ошибке</div>
              <div><strong>✅ Успешная загрузка:</strong> Размеры загруженного изображения</div>
              <div><strong>🔄 Попытка без CORS:</strong> Повторная попытка загрузки</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 