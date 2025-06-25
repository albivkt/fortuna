'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_WHEELS, CREATE_WHEEL, UPDATE_WHEEL } from '@/lib/graphql/queries';
import ImageUpload from '@/components/ImageUpload';

interface Segment {
  text: string;
  color: string;
  image: string | null;
  imagePosition: { x: number; y: number };
}

export default function DebugSaveImagesPage() {
  const [segments, setSegments] = useState<Segment[]>([
    { text: 'Тест 1', color: '#EC4899', image: null, imagePosition: { x: 0, y: 0 } },
    { text: 'Тест 2', color: '#3B82F6', image: null, imagePosition: { x: 0, y: 0 } }
  ]);
  const [testWheelId, setTestWheelId] = useState<string>('');
  const [logs, setLogs] = useState<string[]>([]);

  const { data: wheelsData, refetch: refetchWheels } = useQuery(GET_WHEELS);
  const [createWheel] = useMutation(CREATE_WHEEL);
  const [updateWheel] = useMutation(UPDATE_WHEEL);

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const uploadTestImage = async (segmentIndex: number) => {
    try {
      addLog(`📤 Загружаем тестовое изображение для сегмента ${segmentIndex}...`);
      
      // Создаем простое тестовое изображение
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        const colors = ['#ff0000', '#00ff00', '#0000ff'];
        ctx.fillStyle = colors[segmentIndex % colors.length];
        ctx.fillRect(0, 0, 100, 100);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`IMG ${segmentIndex + 1}`, 50, 55);
      }

      canvas.toBlob(async (blob) => {
        if (!blob) return;

        const formData = new FormData();
        formData.append('image', blob, `debug-segment-${segmentIndex}.png`);

        const response = await fetch('/api/upload-image', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();
        addLog(`📥 Результат загрузки: ${response.ok ? '✅' : '❌'} ${result.url || result.error}`);

        if (response.ok) {
          const newSegments = [...segments];
          newSegments[segmentIndex] = { ...newSegments[segmentIndex], image: result.url };
          setSegments(newSegments);
          addLog(`🔄 Локальное состояние обновлено для сегмента ${segmentIndex}`);
        }
      }, 'image/png');
    } catch (error) {
      addLog(`❌ Ошибка загрузки: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  };

  const createTestWheel = async () => {
    try {
      addLog('🎡 Создаем тестовую рулетку...');
      addLog(`📝 Данные сегментов: ${JSON.stringify(segments.map(s => ({ text: s.text, hasImage: !!s.image, imageUrl: s.image })))}`);
      
      const wheelInput = {
        title: `Тест изображений ${new Date().toLocaleTimeString()}`,
        segments: segments.map(segment => ({
          option: segment.text,
          style: {
            backgroundColor: segment.color,
            textColor: 'white'
          },
          image: segment.image || undefined,
          imagePosition: segment.imagePosition
        })),
        isPublic: false
      };

      addLog(`📤 Отправляем данные: ${JSON.stringify(wheelInput, null, 2)}`);

      const result = await createWheel({
        variables: { input: wheelInput }
      });

      if (result.data?.createWheel) {
        const wheel = result.data.createWheel;
        setTestWheelId(wheel.id);
        addLog(`✅ Рулетка создана с ID: ${wheel.id}`);
        addLog(`📊 Сохраненные сегменты: ${JSON.stringify(wheel.segments.map((s: any) => ({ option: s.option, hasImage: !!s.image, imageUrl: s.image })))}`);
        refetchWheels();
      } else {
        addLog(`❌ Ошибка создания: ${JSON.stringify(result.errors)}`);
      }
    } catch (error) {
      addLog(`❌ Исключение при создании: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  };

  const updateTestWheel = async () => {
    if (!testWheelId) {
      addLog('❌ Сначала создайте тестовую рулетку');
      return;
    }

    try {
      addLog('🔄 Обновляем тестовую рулетку...');
      addLog(`📝 Текущие данные сегментов: ${JSON.stringify(segments.map(s => ({ text: s.text, hasImage: !!s.image, imageUrl: s.image })))}`);
      
      const wheelInput = {
        title: `Обновленный тест изображений ${new Date().toLocaleTimeString()}`,
        segments: segments.map(segment => ({
          option: segment.text,
          style: {
            backgroundColor: segment.color,
            textColor: 'white'
          },
          image: segment.image || undefined,
          imagePosition: segment.imagePosition
        })),
        isPublic: false
      };

      addLog(`📤 Отправляем обновления: ${JSON.stringify(wheelInput, null, 2)}`);

      const result = await updateWheel({
        variables: { 
          id: testWheelId,
          input: wheelInput 
        }
      });

      if (result.data?.updateWheel) {
        const wheel = result.data.updateWheel;
        addLog(`✅ Рулетка обновлена`);
        addLog(`📊 Обновленные сегменты: ${JSON.stringify(wheel.segments.map((s: any) => ({ option: s.option, hasImage: !!s.image, imageUrl: s.image })))}`);
        refetchWheels();
      } else {
        addLog(`❌ Ошибка обновления: ${JSON.stringify(result.errors)}`);
      }
    } catch (error) {
      addLog(`❌ Исключение при обновлении: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  };

  const checkSavedWheel = () => {
    if (!testWheelId || !wheelsData?.wheels) {
      addLog('❌ Нет данных для проверки');
      return;
    }

    const wheel = wheelsData.wheels.find((w: any) => w.id === testWheelId);
    if (wheel) {
      addLog(`🔍 Найдена рулетка: ${wheel.title}`);
      addLog(`📊 Сегменты из базы: ${JSON.stringify(wheel.segments.map((s: any) => ({ option: s.option, hasImage: !!s.image, imageUrl: s.image })))}`);
      
      // Проверяем каждое изображение
      wheel.segments.forEach((segment: any, index: number) => {
        if (segment.image) {
          addLog(`🖼️ Проверяем изображение сегмента ${index}: ${segment.image}`);
          
          const img = new Image();
          img.onload = () => addLog(`✅ Изображение сегмента ${index} доступно`);
          img.onerror = () => addLog(`❌ Изображение сегмента ${index} недоступно`);
          img.src = segment.image;
        } else {
          addLog(`⚪ Сегмент ${index} без изображения`);
        }
      });
    } else {
      addLog('❌ Рулетка не найдена в списке');
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Диагностика сохранения изображений</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Левая колонка - управление */}
        <div className="space-y-6">
          {/* Сегменты */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Тестовые сегменты</h2>
            <div className="space-y-4">
              {segments.map((segment, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium">{segment.text}</span>
                    <div 
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: segment.color }}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <button
                      onClick={() => uploadTestImage(index)}
                      className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                    >
                      Загрузить тестовое изображение
                    </button>
                    
                    {segment.image && (
                      <div className="space-y-2">
                        <img 
                          src={segment.image} 
                          alt={`Сегмент ${index}`}
                          className="w-16 h-16 object-cover border rounded"
                        />
                        <p className="text-xs text-gray-600 break-all">{segment.image}</p>
                        <button
                          onClick={() => {
                            const newSegments = [...segments];
                            newSegments[index] = { ...newSegments[index], image: null };
                            setSegments(newSegments);
                          }}
                          className="w-full bg-red-500 text-white py-1 px-2 rounded text-sm hover:bg-red-600"
                        >
                          Удалить изображение
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Действия */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Действия</h2>
            <div className="space-y-3">
              <button
                onClick={createTestWheel}
                className="w-full bg-green-500 text-white py-3 px-4 rounded hover:bg-green-600"
              >
                1. Создать тестовую рулетку
              </button>
              
              <button
                onClick={updateTestWheel}
                disabled={!testWheelId}
                className="w-full bg-orange-500 text-white py-3 px-4 rounded hover:bg-orange-600 disabled:opacity-50"
              >
                2. Обновить рулетку
              </button>
              
              <button
                onClick={checkSavedWheel}
                disabled={!testWheelId}
                className="w-full bg-purple-500 text-white py-3 px-4 rounded hover:bg-purple-600 disabled:opacity-50"
              >
                3. Проверить сохраненные данные
              </button>
              
              <button
                onClick={() => setLogs([])}
                className="w-full bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
              >
                Очистить логи
              </button>
            </div>
            
            {testWheelId && (
              <div className="mt-4 p-3 bg-blue-100 rounded">
                <p className="text-sm"><strong>ID тестовой рулетки:</strong> {testWheelId}</p>
              </div>
            )}
          </div>
        </div>

        {/* Правая колонка - логи */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Логи диагностики</h2>
          <div className="bg-gray-100 rounded p-4 h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500 text-sm">Логи появятся здесь...</p>
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
  );
} 