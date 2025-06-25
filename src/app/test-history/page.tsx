'use client';

import { useState } from 'react';
import { useQuery, useLazyQuery } from '@apollo/client';
import { GET_WHEELS, GET_WHEEL } from '@/lib/graphql/queries';

export default function TestHistoryPage() {
  const [selectedWheelId, setSelectedWheelId] = useState<string>('');
  const [showHistory, setShowHistory] = useState(false);
  
  const { data: wheelsData, loading: wheelsLoading } = useQuery(GET_WHEELS);
  const [getWheelHistory, { data: historyData, loading: historyLoading }] = useLazyQuery(GET_WHEEL);

  const handleShowHistory = (wheelId: string) => {
    setSelectedWheelId(wheelId);
    setShowHistory(true);
    getWheelHistory({
      variables: { id: wheelId }
    });
  };

  const selectedWheel = wheelsData?.wheels?.find((w: any) => w.id === selectedWheelId);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Тест истории вращений через GraphQL
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Список рулеток */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Мои рулетки
            </h2>
            
            {wheelsLoading ? (
              <p>Загрузка...</p>
            ) : (
              <div className="space-y-4">
                {wheelsData?.wheels?.map((wheel: any) => (
                  <div key={wheel.id} className="border rounded-lg p-4">
                    <h3 className="font-medium text-gray-900">{wheel.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Вращений: {wheel.spins.length}
                    </p>
                    <p className="text-sm text-gray-600">
                      Создана: {new Date(wheel.createdAt).toLocaleDateString('ru-RU')}
                    </p>
                    
                    <button
                      onClick={() => handleShowHistory(wheel.id)}
                      className="mt-3 bg-green-100 text-green-700 px-3 py-1 rounded text-sm hover:bg-green-200"
                    >
                      📜 Показать историю
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* История вращений */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              История вращений
            </h2>
            
            {!showHistory ? (
              <p className="text-gray-500">Выберите рулетку для просмотра истории</p>
            ) : historyLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Загрузка истории...</p>
              </div>
            ) : (
              <div>
                <h3 className="font-medium text-gray-900 mb-4">
                  {selectedWheel?.title}
                </h3>
                
                {historyData?.wheel?.spins?.length === 0 ? (
                  <p className="text-gray-500">История вращений пуста</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {historyData?.wheel?.spins?.map((spin: any) => (
                      <div key={spin.id} className="bg-gray-50 p-3 rounded-lg border">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {spin.participant ? (
                                <>
                                  <span className="text-blue-600 font-semibold">{spin.participant}</span> выиграл: 
                                  <span className="text-green-600 font-semibold ml-1">{spin.result}</span>
                                </>
                              ) : (
                                <>
                                  Результат: <span className="text-green-600 font-semibold">{spin.result}</span>
                                </>
                              )}
                            </p>
                            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                              <p>📅 {new Date(spin.createdAt).toLocaleString('ru-RU')}</p>
                              {spin.user && (
                                <p>👤 {spin.user.name || 'Гость'}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-xl ml-2">🎉</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 text-center">
          <a
            href="/dashboard"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Вернуться в дашборд
          </a>
        </div>
      </div>
    </div>
  );
} 