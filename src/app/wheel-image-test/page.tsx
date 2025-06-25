'use client';

import { useState } from 'react';
import { CustomWheel } from '@/components/CustomWheel';

export default function WheelImageTestPage() {
  const [testData, setTestData] = useState([
    {
      option: 'Приз 1',
      style: { backgroundColor: '#EC4899', textColor: 'white' },
      image: undefined as string | undefined
    },
    {
      option: 'Приз 2', 
      style: { backgroundColor: '#3B82F6', textColor: 'white' },
      image: undefined as string | undefined
    },
    {
      option: 'Приз 3',
      style: { backgroundColor: '#EF4444', textColor: 'white' },
      image: undefined as string | undefined
    }
  ]);

  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);

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

  const addTestImage = async (segmentIndex: number) => {
    try {
      console.log(`🧪 Добавляем тестовое изображение для сегмента ${segmentIndex}...`);
      
      // Создаем простое тестовое изображение
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Цветной фон
        const colors = ['#ff0000', '#00ff00', '#0000ff'];
        ctx.fillStyle = colors[segmentIndex % colors.length];
        ctx.fillRect(0, 0, 100, 100);
        
        // Белый текст
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`IMG`, 50, 40);
        ctx.fillText(`${segmentIndex + 1}`, 50, 70);
      }

      canvas.toBlob(async (blob) => {
        if (!blob) return;

        const formData = new FormData();
        formData.append('image', blob, `test-segment-${segmentIndex}.png`);

        console.log(`📤 Отправляем тестовое изображение для сегмента ${segmentIndex}...`);
        
        const response = await fetch('/api/upload-image', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();
        console.log(`📥 Результат загрузки для сегмента ${segmentIndex}:`, result);

        if (response.ok) {
          console.log(`✅ Тестовое изображение загружено для сегмента ${segmentIndex}:`, result.url);
          
          // Обновляем данные рулетки
          setTestData(prev => prev.map((item, index) => 
            index === segmentIndex 
              ? { ...item, image: result.url }
              : item
          ));
        } else {
          alert(`❌ Ошибка загрузки изображения для сегмента ${segmentIndex}: ${result.error}`);
        }
      }, 'image/png');
    } catch (error) {
      console.error(`❌ Ошибка создания тестового изображения для сегмента ${segmentIndex}:`, error);
      alert(`❌ Ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  };

  const removeImage = (segmentIndex: number) => {
    setTestData(prev => prev.map((item, index) => 
      index === segmentIndex 
        ? { ...item, image: undefined }
        : item
    ));
  };

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Тест CustomWheel с изображениями</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Левая колонка - Управление */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Управление сегментами</h2>
            
            <div className="space-y-4">
              {testData.map((segment, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{segment.option}</span>
                    <div 
                      className="w-8 h-8 rounded border-2"
                      style={{ backgroundColor: segment.style.backgroundColor }}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    {segment.image ? (
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-sm text-green-600">✅ Изображение загружено</span>
                          <button
                            onClick={() => removeImage(index)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Удалить
                          </button>
                        </div>
                        <img 
                          src={segment.image} 
                          alt={`Сегмент ${index + 1}`}
                          className="w-16 h-16 object-cover border rounded"
                        />
                        <div className="text-xs text-gray-500 break-all">
                          {segment.image}
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => addTestImage(index)}
                        className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                      >
                        Добавить тестовое изображение
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Управление рулеткой</h2>
            <button
              onClick={handleSpin}
              disabled={mustSpin}
              className="w-full bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 disabled:opacity-50"
            >
              {mustSpin ? 'Крутится...' : 'Крутить рулетку'}
            </button>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-yellow-800">Инструкции</h2>
            <ol className="list-decimal list-inside space-y-2 text-sm text-yellow-700">
              <li>Добавьте тестовые изображения к сегментам</li>
              <li>Проверьте консоль браузера на логи загрузки</li>
              <li>Покрутите рулетку для проверки отображения</li>
              <li>Следите за логами CustomWheel в консоли</li>
            </ol>
          </div>
        </div>

        {/* Правая колонка - Рулетка */}
        <div className="flex flex-col">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-center">Рулетка</h2>
            <div className="flex justify-center">
              <CustomWheel
                mustStartSpinning={mustSpin}
                prizeNumber={prizeNumber}
                data={testData}
                onStopSpinning={handleStopSpinning}
                size="medium"
              />
            </div>
          </div>

          <div className="bg-gray-100 rounded-lg p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">Отладочная информация</h2>
            <div className="space-y-2 text-sm">
              <div><strong>Всего сегментов:</strong> {testData.length}</div>
              <div><strong>Сегментов с изображениями:</strong> {testData.filter(s => s.image).length}</div>
              <div><strong>Крутится:</strong> {mustSpin ? 'Да' : 'Нет'}</div>
              <div><strong>Текущий приз:</strong> {prizeNumber}</div>
            </div>
            
            <div className="mt-4">
              <strong>Данные сегментов:</strong>
              <pre className="bg-white p-2 rounded text-xs overflow-auto max-h-40 mt-1">
                {JSON.stringify(testData.map((s, i) => ({ 
                  index: i, 
                  option: s.option, 
                  hasImage: !!s.image,
                  imageUrl: s.image?.substring(0, 50) + (s.image && s.image.length > 50 ? '...' : '')
                })), null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 