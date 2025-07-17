'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_WHEELS, CREATE_WHEEL, UPDATE_WHEEL, GET_WHEEL } from '@/lib/graphql/queries';
import { CustomWheel } from '@/components/CustomWheel';
import ImageUpload from '@/components/ImageUpload';

interface TestSegment {
  text: string;
  color: string;
  image: string | null;
  imagePosition: { x: number; y: number };
}

export default function DebugImagePersistencePage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [testWheelId, setTestWheelId] = useState<string>('');
  const [segments, setSegments] = useState<TestSegment[]>([
    { text: 'Тест 1', color: '#EC4899', image: null, imagePosition: { x: 0, y: 0 } },
    { text: 'Тест 2', color: '#3B82F6', image: null, imagePosition: { x: 0, y: 0 } }
  ]);

  const { data: wheelsData, loading: wheelsLoading, refetch: refetchWheels } = useQuery(GET_WHEELS);
  const { data: wheelData, loading: wheelLoading, refetch: refetchWheel } = useQuery(GET_WHEEL, {
    variables: { id: testWheelId },
    skip: !testWheelId
  });
  const [createWheel] = useMutation(CREATE_WHEEL);
  const [updateWheel] = useMutation(UPDATE_WHEEL);

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

  // Создаем тестовую рулетку
  const createTestWheel = async () => {
    try {
      addLog('🎡 Создаем тестовую рулетку...');
      addLog(`📝 Сегменты перед созданием: ${JSON.stringify(segments.map(s => ({ text: s.text, hasImage: !!s.image, imageUrl: s.image })))}`);
      
      const wheelInput = {
        title: `Тест изображений ${new Date().toLocaleTimeString()}`,
        segments: segments.map(segment => ({
          option: segment.text,
          style: {
            backgroundColor: segment.color,
            textColor: 'white'
          },
          image: segment.image || undefined,
          imagePosition: { x: segment.imagePosition.x, y: segment.imagePosition.y }
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

  // Обновляем тестовую рулетку
  const updateTestWheel = async () => {
    if (!testWheelId) {
      addLog('❌ Сначала создайте тестовую рулетку');
      return;
    }

    try {
      addLog('🔄 Обновляем тестовую рулетку...');
      addLog(`📝 Сегменты перед обновлением: ${JSON.stringify(segments.map(s => ({ text: s.text, hasImage: !!s.image, imageUrl: s.image })))}`);
      
      const wheelInput = {
        title: `Обновленный тест изображений ${new Date().toLocaleTimeString()}`,
        segments: segments.map(segment => ({
          option: segment.text,
          style: {
            backgroundColor: segment.color,
            textColor: 'white'
          },
          image: segment.image || undefined,
          imagePosition: { x: segment.imagePosition.x, y: segment.imagePosition.y }
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
        refetchWheel();
      } else {
        addLog(`❌ Ошибка обновления: ${JSON.stringify(result.errors)}`);
      }
    } catch (error) {
      addLog(`❌ Исключение при обновлении: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  };

  // Загружаем данные рулетки
  const loadWheelData = () => {
    if (!wheelData?.wheel) {
      addLog('❌ Нет данных рулетки для загрузки');
      return;
    }

    addLog('📥 Загружаем данные рулетки...');
    const wheel = wheelData.wheel;
    
    addLog(`🔍 Сырые данные из БД: ${JSON.stringify(wheel.segments.map((s: any, i: number) => ({ 
      index: i, 
      option: s.option, 
      hasImage: !!s.image, 
      imageUrl: s.image,
      imageLength: s.image?.length || 0
    })))}`);

    const transformedSegments = wheel.segments.map((segment: any) => ({
      text: segment.option,
      color: segment.style.backgroundColor,
      image: (segment.image && segment.image.trim() !== '') ? segment.image : null,
      imagePosition: segment.imagePosition ? { x: segment.imagePosition.x, y: segment.imagePosition.y } : { x: 0, y: 0 }
    }));

    addLog(`🔄 Трансформированные сегменты: ${JSON.stringify(transformedSegments.map((s, i) => ({ 
      index: i, 
      text: s.text, 
      hasImage: !!s.image, 
      imageUrl: s.image,
      imageLength: s.image?.length || 0
    })))}`);

    setSegments(transformedSegments);
  };

  // Обновляем сегмент
  const updateSegment = (index: number, field: 'text' | 'color' | 'image', value: string | null) => {
    addLog(`🔄 Обновляем сегмент ${index}, поле ${field}: ${value}`);
    const newSegments = [...segments];
    newSegments[index] = { ...newSegments[index], [field]: value };
    setSegments(newSegments);
  };

  // Проверяем изображение
  const testImageUrl = (url: string) => {
    if (!url) {
      addLog('❌ URL изображения пуст');
      return;
    }

    addLog(`🧪 Тестируем URL изображения: ${url}`);
    
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      addLog(`✅ Изображение доступно! Размеры: ${img.width}x${img.height}`);
    };
    
    img.onerror = (error) => {
      addLog(`❌ Изображение недоступно!`);
    };
    
    img.src = url;
  };

  // Преобразуем сегменты для CustomWheel
  const wheelData_display = segments.map(segment => ({
    option: segment.text,
    style: { 
      backgroundColor: segment.color, 
      textColor: 'white'
    },
    image: segment.image && segment.image.trim() !== '' ? segment.image : undefined,
    imagePosition: segment.imagePosition
  }));

  return (
    <div className="container mx-auto p-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Диагностика сохранения изображений</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Левая колонка - управление */}
        <div className="space-y-6">
          {/* Управление рулеткой */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Управление тестовой рулеткой</h2>
            <div className="space-y-4">
              <div className="flex space-x-2">
                <button
                  onClick={createTestWheel}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Создать рулетку
                </button>
                <button
                  onClick={updateTestWheel}
                  disabled={!testWheelId}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  Обновить рулетку
                </button>
                <button
                  onClick={loadWheelData}
                  disabled={!testWheelId}
                  className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
                >
                  Загрузить данные
                </button>
              </div>
              
              {testWheelId && (
                <div className="text-sm text-gray-600">
                  <strong>ID рулетки:</strong> {testWheelId}
                </div>
              )}
            </div>
          </div>

          {/* Редактирование сегментов */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Редактирование сегментов</h2>
            <div className="space-y-4">
              {segments.map((segment, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div
                      className="w-8 h-8 rounded-full border-2 border-gray-300"
                      style={{ backgroundColor: segment.color }}
                    />
                    <input
                      type="text"
                      value={segment.text}
                      onChange={(e) => updateSegment(index, 'text', e.target.value)}
                      className="flex-1 px-3 py-2 border rounded"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Изображение:</label>
                    <ImageUpload
                      onImageSelect={(imageUrl) => {
                        addLog(`🖼️ Изображение загружено для сегмента ${index}: ${imageUrl}`);
                        updateSegment(index, 'image', imageUrl);
                      }}
                      currentImage={segment.image || undefined}
                    />
                    
                    {segment.image && (
                      <div className="flex items-center space-x-2">
                        <img
                          src={segment.image}
                          alt="Превью"
                          className="w-16 h-16 object-cover rounded border"
                        />
                        <button
                          onClick={() => testImageUrl(segment.image!)}
                          className="bg-gray-500 text-white px-2 py-1 rounded text-xs hover:bg-gray-600"
                        >
                          Тест
                        </button>
                        <button
                          onClick={() => updateSegment(index, 'image', null)}
                          className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                        >
                          Удалить
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Логи */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Логи</h2>
              <button
                onClick={clearLogs}
                className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
              >
                Очистить
              </button>
            </div>
            
            <div className="h-64 overflow-y-auto bg-gray-50 p-4 rounded border text-xs font-mono">
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

        {/* Правая колонка - превью */}
        <div className="space-y-6">
          {/* Превью рулетки */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-center">Превью рулетки</h2>
            <div className="flex justify-center">
              <CustomWheel
                mustStartSpinning={false}
                prizeNumber={0}
                data={wheelData_display}
                onStopSpinning={() => {}}
                isPro={true}
                size="medium"
              />
            </div>
          </div>

          {/* Отладочная информация */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Отладочная информация</h2>
            <div className="space-y-4">
              <div>
                <strong>Состояние сегментов:</strong>
                <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-32 mt-1">
                  {JSON.stringify(segments.map((s, i) => ({ 
                    index: i, 
                    text: s.text, 
                    hasImage: !!s.image,
                    imageUrl: s.image?.substring(0, 50) + (s.image && s.image.length > 50 ? '...' : '')
                  })), null, 2)}
                </pre>
              </div>
              
              <div>
                <strong>Данные для рулетки:</strong>
                <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-32 mt-1">
                  {JSON.stringify(wheelData_display.map((s, i) => ({ 
                    index: i, 
                    option: s.option, 
                    hasImage: !!s.image,
                    imageUrl: s.image?.substring(0, 50) + (s.image && s.image.length > 50 ? '...' : '')
                  })), null, 2)}
                </pre>
              </div>

              {wheelData?.wheel && (
                <div>
                  <strong>Данные из БД:</strong>
                  <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-32 mt-1">
                    {JSON.stringify(wheelData.wheel.segments.map((s: any, i: number) => ({ 
                      index: i, 
                      option: s.option, 
                      hasImage: !!s.image,
                      imageUrl: s.image?.substring(0, 50) + (s.image && s.image.length > 50 ? '...' : '')
                    })), null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 