'use client';

import { useState, useEffect } from 'react';
import { useWheels, useCreateWheel } from '@/lib/graphql/hooks';

export default function DebugSessionPage() {
  const { data: wheelsData, loading: wheelsLoading, error: wheelsError, refetch } = useWheels();
  const [createWheel, { loading: creating }] = useCreateWheel();
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

  const handleCreateTestWheel = async () => {
    try {
      console.log('🎡 Создание тестовой рулетки...');
      const result = await createWheel({
        variables: {
          input: {
            title: `Тестовая рулетка ${Date.now()}`,
            segments: [
              { option: 'Приз 1', style: { backgroundColor: '#EC4899', textColor: 'white' } },
              { option: 'Приз 2', style: { backgroundColor: '#3B82F6', textColor: 'white' } },
              { option: 'Приз 3', style: { backgroundColor: '#10B981', textColor: 'white' } }
            ],
            isPublic: false
          }
        }
      });
      
      console.log('✅ Результат:', result);
      alert('Рулетка создана!');
      refetch();
    } catch (error) {
      console.error('❌ Ошибка:', error);
      alert('Ошибка: ' + error);
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Отладка сессий и GraphQL</h1>
      
      {/* Информация о сессии */}
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-2">Информация о сессии</h2>
        <div className="space-y-1 text-sm">
          <p><strong>Session ID:</strong> {sessionInfo.sessionId || 'Нет'}</p>
          <p><strong>Auth Token:</strong> {sessionInfo.authToken ? 'Есть' : 'Нет'}</p>
          <p><strong>Статус сессии:</strong> {sessionInfo.hasSession ? '✅ Активна' : '❌ Нет сессии'}</p>
          <p><strong>Статус авторизации:</strong> {sessionInfo.hasAuth ? '✅ Авторизован' : '❌ Не авторизован'}</p>
        </div>
      </div>

      {/* Кнопки управления */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={handleCreateTestWheel}
          disabled={creating}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {creating ? 'Создается...' : 'Создать тестовую рулетку'}
        </button>
        
        <button
          onClick={handleRefresh}
          disabled={wheelsLoading}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          {wheelsLoading ? 'Обновляется...' : 'Обновить список'}
        </button>
      </div>

      {/* Статус загрузки */}
      {wheelsLoading && (
        <div className="bg-blue-100 p-4 rounded-lg mb-4">
          <p>🔄 Загрузка рулеток...</p>
        </div>
      )}

      {/* Ошибки */}
      {wheelsError && (
        <div className="bg-red-100 p-4 rounded-lg mb-4">
          <h3 className="font-semibold text-red-800">Ошибка GraphQL:</h3>
          <p className="text-red-700">{wheelsError.message}</p>
          {wheelsError.graphQLErrors && wheelsError.graphQLErrors.length > 0 && (
            <div className="mt-2">
              <p className="font-semibold">GraphQL ошибки:</p>
              <ul className="list-disc pl-4">
                {wheelsError.graphQLErrors.map((error, index) => (
                  <li key={index}>{error.message}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Список рулеток */}
      <div className="bg-white border rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-4">Мои рулетки ({wheelsData?.wheels.length || 0})</h2>
        
        {wheelsData?.wheels.length === 0 ? (
          <p className="text-gray-500">Рулеток пока нет. Создайте первую!</p>
        ) : (
          <div className="space-y-2">
            {wheelsData?.wheels.map((wheel) => (
              <div key={wheel.id} className="border p-3 rounded">
                <h3 className="font-semibold">{wheel.title}</h3>
                <p className="text-sm text-gray-600">ID: {wheel.id}</p>
                <p className="text-sm text-gray-600">Сегментов: {wheel.segments.length}</p>
                <p className="text-sm text-gray-600">Создана: {new Date(wheel.createdAt).toLocaleString('ru-RU')}</p>
                <p className="text-sm text-gray-600">Пользователь: {wheel.user.name} (ID: {wheel.user.id})</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 