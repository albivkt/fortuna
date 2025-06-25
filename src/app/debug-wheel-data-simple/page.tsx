'use client';

import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_WHEELS, GET_WHEEL } from '@/lib/graphql/queries';

export default function DebugWheelDataSimplePage() {
  const [selectedWheelId, setSelectedWheelId] = useState<string>('');
  const [logs, setLogs] = useState<string[]>([]);

  const { data: wheelsData, loading: wheelsLoading } = useQuery(GET_WHEELS);
  const { data: wheelData, loading: wheelLoading } = useQuery(GET_WHEEL, {
    variables: { id: selectedWheelId },
    skip: !selectedWheelId
  });

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const analyzeWheel = () => {
    if (!wheelData?.wheel) {
      addLog('❌ Нет данных рулетки для анализа');
      return;
    }

    const wheel = wheelData.wheel;
    addLog(`🎡 Анализируем рулетку: ${wheel.title}`);
    addLog(`🆔 ID: ${wheel.id}`);
    addLog(`👤 Пользователь: ${wheel.user?.name || wheel.user?.email}`);
    addLog(`📊 Количество сегментов: ${wheel.segments?.length || 0}`);

    if (wheel.segments) {
      wheel.segments.forEach((segment: any, index: number) => {
        addLog(`📝 Сегмент ${index}:`);
        addLog(`  - Текст: ${segment.option}`);
        addLog(`  - Цвет: ${segment.style?.backgroundColor}`);
        addLog(`  - Есть изображение: ${!!segment.image}`);
        if (segment.image) {
          addLog(`  - URL изображения: ${segment.image}`);
          addLog(`  - Длина URL: ${segment.image.length}`);
          addLog(`  - Валидный URL: ${segment.image.startsWith('https://')}`);
          
          // Тестируем доступность изображения
          const img = new Image();
          img.onload = () => {
            addLog(`  ✅ Изображение сегмента ${index} доступно: ${img.width}x${img.height}`);
          };
          img.onerror = () => {
            addLog(`  ❌ Изображение сегмента ${index} недоступно`);
          };
          img.src = segment.image;
        } else {
          addLog(`  - Изображение: отсутствует`);
        }
        
        if (segment.imagePosition) {
          addLog(`  - Позиция изображения: x=${segment.imagePosition.x}, y=${segment.imagePosition.y}`);
        }
      });
    }

    if (wheel.customDesign) {
      addLog(`🎨 Кастомный дизайн:`);
      addLog(`  - Фон: ${wheel.customDesign.backgroundColor}`);
      addLog(`  - Граница: ${wheel.customDesign.borderColor}`);
      addLog(`  - Текст: ${wheel.customDesign.textColor}`);
      addLog(`  - Центральное изображение: ${wheel.customDesign.centerImage || 'нет'}`);
    }
  };

  const analyzeAllWheels = () => {
    if (!wheelsData?.wheels) {
      addLog('❌ Нет данных рулеток для анализа');
      return;
    }

    addLog(`📊 Анализируем все рулетки (${wheelsData.wheels.length})`);
    
    wheelsData.wheels.forEach((wheel: any, wheelIndex: number) => {
      addLog(`\n🎡 Рулетка ${wheelIndex + 1}: ${wheel.title}`);
      addLog(`🆔 ID: ${wheel.id}`);
      
      const segmentsWithImages = wheel.segments?.filter((s: any) => s.image) || [];
      addLog(`🖼️ Сегментов с изображениями: ${segmentsWithImages.length}/${wheel.segments?.length || 0}`);
      
      segmentsWithImages.forEach((segment: any, segIndex: number) => {
        addLog(`  📷 Изображение ${segIndex + 1}: ${segment.image.substring(0, 50)}...`);
      });
    });
  };

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Диагностика данных рулетки</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Левая колонка - управление */}
        <div className="space-y-6">
          {/* Выбор рулетки */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Выбор рулетки</h2>
            
            {wheelsLoading ? (
              <p>Загрузка рулеток...</p>
            ) : wheelsData?.wheels ? (
              <select
                value={selectedWheelId}
                onChange={(e) => setSelectedWheelId(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
              >
                <option value="">Выберите рулетку</option>
                {wheelsData.wheels.map((wheel: any) => (
                  <option key={wheel.id} value={wheel.id}>
                    {wheel.title} (ID: {wheel.id})
                  </option>
                ))}
              </select>
            ) : (
              <p>Нет доступных рулеток</p>
            )}
          </div>

          {/* Действия */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Действия</h2>
            <div className="space-y-3">
              <button
                onClick={analyzeWheel}
                disabled={!selectedWheelId || wheelLoading}
                className="w-full bg-blue-500 text-white py-3 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
              >
                Анализировать выбранную рулетку
              </button>
              
              <button
                onClick={analyzeAllWheels}
                disabled={wheelsLoading}
                className="w-full bg-green-500 text-white py-3 px-4 rounded hover:bg-green-600 disabled:opacity-50"
              >
                Анализировать все рулетки
              </button>
              
              <button
                onClick={() => setLogs([])}
                className="w-full bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
              >
                Очистить логи
              </button>
            </div>
          </div>

          {/* Информация о выбранной рулетке */}
          {wheelData?.wheel && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Краткая информация</h2>
              <div className="space-y-2 text-sm">
                <div><strong>Название:</strong> {wheelData.wheel.title}</div>
                <div><strong>ID:</strong> {wheelData.wheel.id}</div>
                <div><strong>Сегментов:</strong> {wheelData.wheel.segments?.length || 0}</div>
                <div><strong>С изображениями:</strong> {wheelData.wheel.segments?.filter((s: any) => s.image).length || 0}</div>
                <div><strong>Публичная:</strong> {wheelData.wheel.isPublic ? 'Да' : 'Нет'}</div>
              </div>
            </div>
          )}
        </div>

        {/* Правая колонка - логи */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Результаты анализа</h2>
          <div className="bg-gray-100 rounded p-4 h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500 text-sm">Результаты анализа появятся здесь...</p>
            ) : (
              <div className="space-y-1">
                {logs.map((log, index) => (
                  <div key={index} className="text-xs font-mono whitespace-pre-wrap">
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