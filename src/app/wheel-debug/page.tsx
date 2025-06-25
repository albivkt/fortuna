'use client';

import { useState } from 'react';
import { CustomWheel } from '@/components/CustomWheel';

export default function WheelDebugPage() {
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
    }
  ]);

  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);

  const addTestImage = async (segmentIndex: number) => {
    try {
      console.log(`🧪 Добавляем тестовое изображение для сегмента ${segmentIndex}...`);
      
      // Создаем простое тестовое изображение
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        const colors = ['#ff0000', '#00ff00'];
        ctx.fillStyle = colors[segmentIndex];
        ctx.fillRect(0, 0, 100, 100);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${segmentIndex + 1}`, 50, 55);
      }

      canvas.toBlob(async (blob) => {
        if (!blob) return;

        const formData = new FormData();
        formData.append('image', blob, `test-${segmentIndex}.png`);
        
        const response = await fetch('/api/upload-image', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (response.ok) {
          setTestData(prev => prev.map((item, index) => 
            index === segmentIndex 
              ? { ...item, image: result.url }
              : item
          ));
        } else {
          alert(`Ошибка: ${result.error}`);
        }
      }, 'image/png');
    } catch (error) {
      console.error('Ошибка:', error);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Диагностика изображений в рулетке</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          {testData.map((segment, index) => (
            <div key={index} className="border p-4 rounded">
              <h3>{segment.option}</h3>
              {segment.image ? (
                <div>
                  <img src={segment.image} alt={`Сегмент ${index}`} className="w-16 h-16" />
                  <p className="text-xs">{segment.image}</p>
                </div>
              ) : (
                <button
                  onClick={() => addTestImage(index)}
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Добавить изображение
                </button>
              )}
            </div>
          ))}
        </div>

        <div>
          <CustomWheel
            mustStartSpinning={mustSpin}
            prizeNumber={prizeNumber}
            data={testData}
            onStopSpinning={() => setMustSpin(false)}
            size="medium"
          />
          <button
            onClick={() => {
              setPrizeNumber(Math.floor(Math.random() * testData.length));
              setMustSpin(true);
            }}
            className="mt-4 bg-green-500 text-white px-4 py-2 rounded"
          >
            Крутить
          </button>
        </div>
      </div>
    </div>
  );
} 