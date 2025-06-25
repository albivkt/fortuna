'use client';

import { useState, useEffect } from 'react';
import { apolloClient } from '@/lib/graphql/client';
import { gql } from '@apollo/client';

const GET_ALL_DATA = gql`
  query GetAllData {
    wheels {
      id
      title
      createdAt
      user {
        id
        name
        email
      }
      segments {
        option
        style {
          backgroundColor
          textColor
        }
      }
    }
  }
`;

export default function DebugDbPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionInfo, setSessionInfo] = useState<any>({});

  useEffect(() => {
    // Получаем информацию о сессии
    if (typeof window !== 'undefined') {
      const sessionId = localStorage.getItem('fortuna_session_id');
      const authToken = localStorage.getItem('auth_token');
      setSessionInfo({
        sessionId,
        authToken,
        hasSession: !!sessionId,
        hasAuth: !!authToken
      });
    }
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Запрос всех данных...');
      const result = await apolloClient.query({
        query: GET_ALL_DATA,
        fetchPolicy: 'network-only' // Принудительно запрашиваем с сервера
      });
      
      console.log('✅ Данные получены:', result);
      setData(result.data);
    } catch (err) {
      console.error('❌ Ошибка получения данных:', err);
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setLoading(false);
    }
  };

  const createTestWheel = async () => {
    try {
      console.log('🎡 Создание тестовой рулетки...');
      
      const CREATE_WHEEL = gql`
        mutation CreateTestWheel($input: CreateWheelInput!) {
          createWheel(input: $input) {
            id
            title
            createdAt
            user {
              id
              name
              email
            }
          }
        }
      `;

      const result = await apolloClient.mutate({
        mutation: CREATE_WHEEL,
        variables: {
          input: {
            title: `Тестовая рулетка ${Date.now()}`,
            segments: [
              { option: 'Приз 1', style: { backgroundColor: '#EC4899', textColor: 'white' } },
              { option: 'Приз 2', style: { backgroundColor: '#3B82F6', textColor: 'white' } }
            ],
            isPublic: false
          }
        }
      });

      console.log('✅ Рулетка создана:', result);
      alert('Рулетка создана! Обновите данные.');
    } catch (err) {
      console.error('❌ Ошибка создания:', err);
      alert('Ошибка: ' + (err instanceof Error ? err.message : 'Неизвестная ошибка'));
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Отладка базы данных</h1>
      
      {/* Информация о сессии */}
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-2">Информация о сессии</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p><strong>Session ID:</strong></p>
            <p className="font-mono text-xs break-all">{sessionInfo.sessionId || 'Нет'}</p>
          </div>
          <div>
            <p><strong>Auth Token:</strong></p>
            <p className="font-mono text-xs break-all">{sessionInfo.authToken || 'Нет'}</p>
          </div>
        </div>
      </div>

      {/* Кнопки управления */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={fetchData}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Загрузка...' : 'Получить все данные'}
        </button>
        
        <button
          onClick={createTestWheel}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Создать тестовую рулетку
        </button>
      </div>

      {/* Ошибки */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Ошибка:</strong> {error}
        </div>
      )}

      {/* Данные */}
      {data && (
        <div className="space-y-6">
          <div className="bg-white border rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4">
              Все рулетки в базе данных ({data.wheels?.length || 0})
            </h2>
            
            {data.wheels?.length === 0 ? (
              <p className="text-gray-500">Рулеток в базе данных нет</p>
            ) : (
              <div className="space-y-4">
                {data.wheels?.map((wheel: any, index: number) => (
                  <div key={wheel.id} className="border rounded p-4 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-semibold text-lg">{wheel.title}</h3>
                        <p className="text-sm text-gray-600">
                          ID: <span className="font-mono">{wheel.id}</span>
                        </p>
                        <p className="text-sm text-gray-600">
                          Создана: {new Date(wheel.createdAt).toLocaleString('ru-RU')}
                        </p>
                        <p className="text-sm text-gray-600">
                          Сегментов: {wheel.segments?.length || 0}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Пользователь:</h4>
                        <p className="text-sm">
                          <strong>ID:</strong> <span className="font-mono">{wheel.user.id}</span>
                        </p>
                        <p className="text-sm">
                          <strong>Имя:</strong> {wheel.user.name}
                        </p>
                        <p className="text-sm">
                          <strong>Email:</strong> <span className="font-mono">{wheel.user.email}</span>
                        </p>
                      </div>
                    </div>
                    
                    {wheel.segments && wheel.segments.length > 0 && (
                      <div className="mt-3">
                        <h4 className="font-medium mb-2">Сегменты:</h4>
                        <div className="flex flex-wrap gap-2">
                          {wheel.segments.map((segment: any, segIndex: number) => (
                            <span
                              key={segIndex}
                              className="px-2 py-1 rounded text-sm"
                              style={{
                                backgroundColor: segment.style.backgroundColor,
                                color: segment.style.textColor
                              }}
                            >
                              {segment.option}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Raw данные для отладки */}
      {data && (
        <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm">
          <h3 className="text-white mb-2">Raw данные (JSON):</h3>
          <pre className="whitespace-pre-wrap overflow-auto max-h-96">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
} 