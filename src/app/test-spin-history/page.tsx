'use client';

import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { useState } from 'react';

const GET_WHEEL_SPINS = gql`
  query GetWheelSpins($id: ID!) {
    wheel(id: $id) {
      id
      title
      spins {
        id
        result
        participant
        createdAt
        user {
          id
          name
        }
      }
    }
  }
`;

export default function TestSpinHistoryPage() {
  const [wheelId, setWheelId] = useState('cmc8uuxii0001vepg1qt4y1b6');
  const [shouldFetch, setShouldFetch] = useState(false);

  const { data, loading, error, refetch } = useQuery(GET_WHEEL_SPINS, {
    variables: { id: wheelId },
    skip: !shouldFetch
  });

  const handleCheck = () => {
    setShouldFetch(true);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Тест истории розыгрышей</h1>
        
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
            {data && (
              <button
                onClick={() => refetch()}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
              >
                Обновить
              </button>
            )}
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
              <h2 className="text-xl font-bold text-white mb-4">Информация о рулетке</h2>
              <div className="text-gray-300">
                <p><strong>ID:</strong> {data.wheel.id}</p>
                <p><strong>Название:</strong> {data.wheel.title}</p>
                <p><strong>Всего розыгрышей:</strong> {data.wheel.spins.length}</p>
              </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-xl">
              <h2 className="text-xl font-bold text-white mb-4">История розыгрышей</h2>
              {data.wheel.spins.length === 0 ? (
                <p className="text-gray-400">Нет розыгрышей</p>
              ) : (
                <div className="space-y-4">
                  {data.wheel.spins.slice(0, 10).map((spin: any, index: number) => (
                    <div key={spin.id} className="bg-gray-700/50 p-4 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <h3 className="text-white font-semibold mb-2">Основная информация</h3>
                          <p><strong>ID:</strong> <span className="text-blue-400">{spin.id}</span></p>
                          <p><strong>Результат:</strong> <span className="text-yellow-400">{spin.result}</span></p>
                          <p><strong>Дата:</strong> {new Date(spin.createdAt).toLocaleString('ru-RU')}</p>
                        </div>
                        
                        <div>
                          <h3 className="text-white font-semibold mb-2">Участник</h3>
                          <p><strong>participant:</strong> <span className="text-green-400">"{spin.participant || 'null'}"</span></p>
                          <p><strong>user.id:</strong> <span className="text-blue-400">{spin.user?.id || 'null'}</span></p>
                          <p><strong>user.name:</strong> <span className="text-purple-400">"{spin.user?.name || 'null'}"</span></p>
                          
                          <div className="mt-2 p-2 bg-gray-600/50 rounded">
                            <strong className="text-orange-400">Итоговое отображение:</strong>
                            <p className="text-white">
                              "{spin.participant || spin.user?.name || 'Участник'}" выиграл: {spin.result}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-gray-600">
                        <strong className="text-sm text-gray-400">Raw данные:</strong>
                        <pre className="text-xs text-gray-300 mt-1 overflow-auto">
                          {JSON.stringify(spin, null, 2)}
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-blue-900/50 p-6 rounded-xl">
              <h3 className="text-lg font-bold text-blue-300 mb-3">Инструкции:</h3>
              <div className="space-y-2 text-sm text-gray-300">
                <p>1. Покрутите рулетку несколько раз</p>
                <p>2. Нажмите "Обновить" чтобы увидеть новые данные</p>
                <p>3. Проверьте поле "participant" - оно должно содержать введенное имя</p>
                <p>4. Если "participant" пустое, то будет использоваться "user.name" или "Участник"</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 