'use client';

import { useState, useEffect } from 'react';
import { CustomWheel } from '@/components/CustomWheel';
import ImageUpload from '@/components/ImageUpload';

export default function TestWheelImagesPage() {
  const [segments, setSegments] = useState([
    { 
      option: 'Приз 1', 
      style: { backgroundColor: '#EC4899', textColor: 'white' },
      image: undefined as string | undefined,
      imagePosition: { x: 0, y: 0 }
    },
    { 
      option: 'Приз 2', 
      style: { backgroundColor: '#3B82F6', textColor: 'white' },
      image: undefined as string | undefined,
      imagePosition: { x: 0, y: 0 }
    },
    { 
      option: 'Приз 3', 
      style: { backgroundColor: '#EF4444', textColor: 'white' },
      image: undefined as string | undefined,
      imagePosition: { x: 0, y: 0 }
    }
  ]);

  const [testImageUrl, setTestImageUrl] = useState<string>('');
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);

  const updateSegmentImage = (index: number, imageUrl: string) => {
    console.log(`🖼️ Обновляем изображение сегмента ${index}:`, imageUrl);
    const newSegments = [...segments];
    newSegments[index] = { ...newSegments[index], image: imageUrl };
    setSegments(newSegments);
  };

  const removeSegmentImage = (index: number) => {
    console.log(`🗑️ Удаляем изображение сегмента ${index}`);
    const newSegments = [...segments];
    newSegments[index] = { ...newSegments[index], image: undefined };
    setSegments(newSegments);
  };

  const handleSpin = () => {
    if (!mustSpin) {
      const newPrizeNumber = Math.floor(Math.random() * segments.length);
      setPrizeNumber(newPrizeNumber);
      setMustSpin(true);
    }
  };

  const handleStopSpinning = () => {
    setMustSpin(false);
    console.log(`🎉 Выпал сегмент ${prizeNumber}: ${segments[prizeNumber]?.option}`);
  };

  const testDirectImageUrl = () => {
    // Тестовое изображение - логотип GitHub
    const testUrl = 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png';
    console.log('🧪 Тестируем прямой URL изображения:', testUrl);
    updateSegmentImage(0, testUrl);
    setTestImageUrl(testUrl);
  };

  const testS3Upload = async () => {
    try {
      // Создаем тестовое изображение
      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 200;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Рисуем градиент
        const gradient = ctx.createRadialGradient(100, 100, 0, 100, 100, 100);
        gradient.addColorStop(0, '#ff6b6b');
        gradient.addColorStop(1, '#4ecdc4');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 200, 200);
        
        // Добавляем текст
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('S3 TEST', 100, 100);
        ctx.fillText('IMAGE', 100, 130);
      }

      canvas.toBlob(async (blob) => {
        if (!blob) return;

        const formData = new FormData();
        formData.append('image', blob, 'test-wheel-segment.png');

        console.log('📤 Загружаем тестовое изображение в S3...');
        
        const response = await fetch('/api/upload-image', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();
        console.log('📥 Результат загрузки:', result);

        if (response.ok) {
          updateSegmentImage(1, result.url);
          setTestImageUrl(result.url);
          alert('✅ Изображение загружено в S3: ' + result.url);
        } else {
          alert('❌ Ошибка загрузки: ' + result.error);
        }
      }, 'image/png');
    } catch (error) {
      console.error('❌ Ошибка теста S3:', error);
      alert('Ошибка: ' + (error instanceof Error ? error.message : 'Неизвестная ошибка'));
    }
  };

  // Проверяем доступность изображений
  useEffect(() => {
    segments.forEach((segment, index) => {
      if (segment.image) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          console.log(`✅ Изображение сегмента ${index} загружено успешно`);
        };
        img.onerror = (error) => {
          console.error(`❌ Ошибка загрузки изображения сегмента ${index}:`, error);
        };
        img.src = segment.image;
      }
    });
  }, [segments]);

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Тест изображений в CustomWheel</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Левая колонка - рулетка */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-center">Рулетка с изображениями</h2>
            <div className="flex justify-center">
              <CustomWheel
                mustStartSpinning={mustSpin}
                prizeNumber={prizeNumber}
                data={segments}
                onStopSpinning={handleStopSpinning}
                isPro={true}
                size="medium"
                isEditable={true}
                onImagePositionChange={(segmentIndex, position) => {
                  console.log(`📍 Позиция изображения сегмента ${segmentIndex}:`, position);
                  const newSegments = [...segments];
                  newSegments[segmentIndex] = { ...newSegments[segmentIndex], imagePosition: position };
                  setSegments(newSegments);
                }}
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

          {/* Быстрые тесты */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Быстрые тесты</h2>
            <div className="space-y-3">
              <button
                onClick={testDirectImageUrl}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
              >
                Тест прямого URL (GitHub логотип)
              </button>
              <button
                onClick={testS3Upload}
                className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600"
              >
                Тест загрузки в S3
              </button>
            </div>
            {testImageUrl && (
              <div className="mt-4">
                <p className="text-sm font-medium">Последнее загруженное изображение:</p>
                <img 
                  src={testImageUrl} 
                  alt="Тест" 
                  className="w-16 h-16 object-cover border rounded mt-2"
                />
                <p className="text-xs text-gray-600 mt-1 break-all">{testImageUrl}</p>
              </div>
            )}
          </div>
        </div>

        {/* Правая колонка - управление сегментами */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Управление сегментами</h2>
            
            {segments.map((segment, index) => (
              <div key={index} className="border rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div
                    className="w-8 h-8 rounded-full border-2 border-gray-300 flex-shrink-0 overflow-hidden"
                    style={{ 
                      backgroundColor: segment.image ? 'transparent' : segment.style.backgroundColor,
                      backgroundImage: segment.image ? `url(${segment.image})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  />
                  <span className="font-medium">{segment.option}</span>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Изображение:</label>
                    <ImageUpload
                      onImageSelect={(imageUrl) => updateSegmentImage(index, imageUrl)}
                      currentImage={segment.image}
                      disabled={false}
                    />
                    {segment.image && (
                      <button
                        onClick={() => removeSegmentImage(index)}
                        className="mt-2 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                      >
                        Удалить изображение
                      </button>
                    )}
                  </div>
                  
                  {segment.imagePosition && (
                    <div className="text-xs text-gray-500">
                      Позиция: x={segment.imagePosition.x.toFixed(2)}, y={segment.imagePosition.y.toFixed(2)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Отладочная информация */}
          <div className="bg-gray-100 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Отладочная информация</h2>
            <pre className="bg-white p-4 rounded text-xs overflow-auto max-h-64">
              {JSON.stringify(segments, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
} 