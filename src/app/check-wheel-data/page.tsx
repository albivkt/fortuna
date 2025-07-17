'use client';

import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';

const GET_WHEEL = gql`
  query GetWheel($id: ID!) {
    wheel(id: $id) {
      id
      title
      customDesign {
        backgroundColor
        borderColor
        textColor
        centerImage
      }
      user {
        id
        name
        plan
      }
    }
  }
`;

export default function CheckWheelDataPage() {
  const [wheelId, setWheelId] = useState('cmc6uzui0001veqq1q4y1b6');
  const [shouldFetch, setShouldFetch] = useState(false);

  const { data, loading, error } = useQuery(GET_WHEEL, {
    variables: { id: wheelId },
    skip: !shouldFetch
  });

  const handleCheck = () => {
    setShouldFetch(true);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Проверка данных рулетки</h1>
        
        <div className="bg-gray-800 p-6 rounded-xl mb-6">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-white mb-2">ID рулетки:</label>
              <input
                type="text"
                value={wheelId}
                onChange={(e) => setWheelId(e.target.value)}
                className="w-full p-3 bg-gray-700 text-white rounded-lg"
                placeholder="Введите ID рулетки"
              />
            </div>
            <button
              onClick={handleCheck}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Проверить
            </button>
          </div>
        </div>

        {loading && (
          <div className="bg-gray-800 p-6 rounded-xl">
            <p className="text-yellow-400">Загружаем данные...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-900/50 p-6 rounded-xl">
            <p className="text-red-400">Ошибка: {error.message}</p>
          </div>
        )}

        {data?.wheel && (
          <div className="space-y-6">
            <div className="bg-gray-800 p-6 rounded-xl">
              <h2 className="text-xl font-bold text-white mb-4">Основная информация</h2>
              <div className="text-gray-300 space-y-2">
                <p><strong>ID:</strong> {data.wheel.id}</p>
                <p><strong>Название:</strong> {data.wheel.title}</p>
                <p><strong>Владелец:</strong> {data.wheel.user.name} (план: <span className={data.wheel.user.plan === 'pro' ? 'text-yellow-400' : 'text-gray-400'}>{data.wheel.user.plan}</span>)</p>
              </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-xl">
              <h2 className="text-xl font-bold text-white mb-4">Кастомный дизайн</h2>
              {data.wheel.customDesign ? (
                <div className="space-y-4">
                  <pre className="bg-gray-700 p-4 rounded text-sm text-gray-300 overflow-auto">
                    {JSON.stringify(data.wheel.customDesign, null, 2)}
                  </pre>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong className="text-white">Фон:</strong>
                      <div className="flex items-center gap-2 mt-1">
                        <div 
                          className="w-6 h-6 rounded border"
                          style={{ backgroundColor: data.wheel.customDesign.backgroundColor || 'transparent' }}
                        ></div>
                        <span className="text-gray-300">{data.wheel.customDesign.backgroundColor || 'не задан'}</span>
                      </div>
                    </div>
                    
                    <div>
                      <strong className="text-white">Граница:</strong>
                      <div className="flex items-center gap-2 mt-1">
                        <div 
                          className="w-6 h-6 rounded border-2"
                          style={{ borderColor: data.wheel.customDesign.borderColor || '#ffffff' }}
                        ></div>
                        <span className="text-gray-300">{data.wheel.customDesign.borderColor || 'не задан'}</span>
                      </div>
                    </div>
                    
                    <div>
                      <strong className="text-white">Цвет текста:</strong>
                      <div className="flex items-center gap-2 mt-1">
                        <div 
                          className="w-6 h-6 rounded border"
                          style={{ backgroundColor: data.wheel.customDesign.textColor || 'white' }}
                        ></div>
                        <span className="text-gray-300">{data.wheel.customDesign.textColor || 'не задан'}</span>
                      </div>
                    </div>
                    
                    <div>
                      <strong className="text-white">Центральное изображение:</strong>
                      <div className="mt-1">
                        {data.wheel.customDesign.centerImage ? (
                          <div className="space-y-2">
                            <p className="text-green-400">✅ Установлено</p>
                            <p className="text-xs text-gray-400 break-all">URL: {data.wheel.customDesign.centerImage}</p>
                            <img 
                              src={data.wheel.customDesign.centerImage} 
                              alt="Центральное изображение" 
                              className="w-16 h-16 object-cover border rounded"
                              onError={(e) => {
                                e.currentTarget.style.border = '2px solid red';
                                console.error('❌ Не удалось загрузить изображение');
                              }}
                            />
                          </div>
                        ) : (
                          <p className="text-red-400">❌ Не установлено</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400">Кастомный дизайн не настроен</p>
              )}
            </div>

            <div className="bg-blue-900/50 p-6 rounded-xl">
              <h3 className="text-lg font-bold text-blue-300 mb-3">Выводы:</h3>
              <div className="space-y-2 text-sm">
                <p className="text-gray-300">
                  <strong>Владелец Pro:</strong> {data.wheel.user.plan === 'pro' ? '✅ Да' : '❌ Нет'}
                </p>
                <p className="text-gray-300">
                  <strong>Центральное изображение:</strong> {data.wheel.customDesign?.centerImage ? '✅ Есть' : '❌ Нет'}
                </p>
                <p className="text-gray-300">
                  <strong>Должно отображаться:</strong> {
                    data.wheel.user.plan === 'pro' && data.wheel.customDesign?.centerImage 
                      ? '✅ Да' 
                      : '❌ Нет'
                  }
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 