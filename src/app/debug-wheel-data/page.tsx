'use client';

import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';

const GET_WHEELS = gql`
  query GetWheels {
    wheels {
      id
      title
      segments {
        option
        style {
          backgroundColor
          textColor
        }
        image
        imagePosition {
          x
          y
        }
      }
      customDesign {
        backgroundColor
        borderColor
        textColor
        centerImage
      }
      createdAt
    }
  }
`;

const GET_WHEEL = gql`
  query GetWheel($id: ID!) {
    wheel(id: $id) {
      id
      title
      segments {
        option
        style {
          backgroundColor
          textColor
        }
        image
        imagePosition {
          x
          y
        }
      }
      customDesign {
        backgroundColor
        borderColor
        textColor
        centerImage
      }
      createdAt
    }
  }
`;

export default function DebugWheelDataPage() {
  const [selectedWheelId, setSelectedWheelId] = useState<string>('');
  const { data: wheelsData, loading: wheelsLoading, error: wheelsError } = useQuery(GET_WHEELS);
  const { data: wheelData, loading: wheelLoading, error: wheelError } = useQuery(GET_WHEEL, {
    variables: { id: selectedWheelId },
    skip: !selectedWheelId
  });

  const testImageUrl = (url: string) => {
    if (!url) {
      alert('URL изображения пуст');
      return;
    }

    console.log('🧪 Тестируем URL изображения:', url);
    
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      console.log('✅ Изображение загружено успешно');
      alert(`✅ Изображение доступно! Размеры: ${img.width}x${img.height}`);
    };
    
    img.onerror = (error) => {
      console.error('❌ Ошибка загрузки изображения:', error);
      alert('❌ Изображение недоступно! Проверьте консоль.');
    };
    
    img.src = url;
  };

  if (wheelsLoading) return <div className="p-8">Загрузка рулеток...</div>;
  if (wheelsError) return <div className="p-8 text-red-500">Ошибка: {wheelsError.message}</div>;

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Отладка данных рулеток</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Левая колонка - список рулеток */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Все рулетки</h2>
            
            {wheelsData?.wheels?.length === 0 ? (
              <p className="text-gray-500">Нет рулеток</p>
            ) : (
              <div className="space-y-3">
                {wheelsData?.wheels?.map((wheel: any) => (
                  <div
                    key={wheel.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedWheelId === wheel.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedWheelId(wheel.id)}
                  >
                    <div className="font-medium">{wheel.title}</div>
                    <div className="text-sm text-gray-500">
                      ID: {wheel.id}
                    </div>
                    <div className="text-sm text-gray-500">
                      Сегментов: {wheel.segments?.length || 0}
                    </div>
                    <div className="text-sm text-gray-500">
                      С изображениями: {wheel.segments?.filter((s: any) => s.image).length || 0}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Правая колонка - детали выбранной рулетки */}
        <div className="space-y-6">
          {selectedWheelId ? (
            <>
              {wheelLoading ? (
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <p>Загрузка данных рулетки...</p>
                </div>
              ) : wheelError ? (
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <p className="text-red-500">Ошибка: {wheelError.message}</p>
                </div>
              ) : wheelData?.wheel ? (
                <>
                  {/* Основная информация */}
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Информация о рулетке</h2>
                    <div className="space-y-2 text-sm">
                      <div><strong>ID:</strong> {wheelData.wheel.id}</div>
                      <div><strong>Название:</strong> {wheelData.wheel.title}</div>
                      <div><strong>Создана:</strong> {new Date(wheelData.wheel.createdAt).toLocaleString()}</div>
                    </div>
                  </div>

                  {/* Кастомный дизайн */}
                  {wheelData.wheel.customDesign && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                      <h2 className="text-xl font-semibold mb-4">Кастомный дизайн</h2>
                      <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
                        {JSON.stringify(wheelData.wheel.customDesign, null, 2)}
                      </pre>
                      {wheelData.wheel.customDesign.centerImage && (
                        <div className="mt-4">
                          <div className="flex items-center space-x-2">
                            <strong className="text-sm">Центральное изображение:</strong>
                            <button
                              onClick={() => testImageUrl(wheelData.wheel.customDesign.centerImage)}
                              className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                            >
                              Тест
                            </button>
                          </div>
                          <img 
                            src={wheelData.wheel.customDesign.centerImage} 
                            alt="Центральное изображение" 
                            className="w-16 h-16 object-cover border rounded mt-2"
                            onLoad={() => console.log('✅ Центральное изображение загружено')}
                            onError={(e) => console.error('❌ Ошибка центрального изображения:', e)}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Сегменты */}
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Сегменты</h2>
                    <div className="space-y-4">
                      {wheelData.wheel.segments?.map((segment: any, index: number) => (
                        <div key={index} className="border rounded-lg p-4">
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
                            <div>
                              <div className="font-medium">{segment.option}</div>
                              <div className="text-sm text-gray-500">
                                Цвет: {segment.style.backgroundColor}
                              </div>
                            </div>
                          </div>
                          
                          {segment.image && (
                            <div className="mt-3 space-y-2">
                              <div className="flex items-center space-x-2">
                                <strong className="text-sm">Изображение:</strong>
                                <button
                                  onClick={() => testImageUrl(segment.image)}
                                  className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
                                >
                                  Тест URL
                                </button>
                              </div>
                              <div className="text-xs text-gray-600 break-all">
                                {segment.image}
                              </div>
                              <img 
                                src={segment.image} 
                                alt={`Сегмент ${index + 1}`} 
                                className="w-16 h-16 object-cover border rounded"
                                onLoad={() => console.log(`✅ Изображение сегмента ${index} загружено`)}
                                onError={(e) => console.error(`❌ Ошибка изображения сегмента ${index}:`, e)}
                              />
                              {segment.imagePosition && (
                                <div className="text-xs text-gray-500">
                                  Позиция: x={segment.imagePosition.x.toFixed(2)}, y={segment.imagePosition.y.toFixed(2)}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Raw JSON */}
                  <div className="bg-gray-100 rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Raw JSON данные</h2>
                    <pre className="bg-white p-4 rounded text-xs overflow-auto max-h-96">
                      {JSON.stringify(wheelData.wheel, null, 2)}
                    </pre>
                  </div>
                </>
              ) : null}
            </>
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <p className="text-gray-500">Выберите рулетку для просмотра деталей</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 