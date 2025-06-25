'use client';

import { useQuery } from '@apollo/client';
import { GET_WHEELS } from '@/lib/graphql/queries';
import { useEffect, useState } from 'react';

export default function TestSessionHeaders() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const { data, loading, error, refetch } = useQuery(GET_WHEELS);

  useEffect(() => {
    // Получаем данные из localStorage только на клиенте
    if (typeof window !== 'undefined') {
      const storedSessionId = localStorage.getItem('gifty_session_id');
      const storedAuthToken = localStorage.getItem('auth_token');
      setSessionId(storedSessionId);
      setAuthToken(storedAuthToken);
    }
  }, []);

  const handleRefetch = () => {
    console.log('🔄 Refetching wheels...');
    refetch();
  };

  const handleResetSession = () => {
    console.log('🔄 Resetting session...');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('gifty_session_id');
      window.location.reload();
    }
  };

  const handleClearSession = () => {
    console.log('🗑️ Clearing session...');
    if (typeof window !== 'undefined') {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Тест Session ID</h1>
      
      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="font-semibold mb-2">Информация о сессии</h2>
        <p><strong>Session ID:</strong> {sessionId || 'не установлен'}</p>
        <p><strong>Auth Token:</strong> {authToken || 'не установлен'}</p>
        <p><strong>Ожидаемый Email:</strong> {sessionId ? `temp_${sessionId}@gifty.local` : 'не определен'}</p>
        
        <div className="mt-3 space-x-2">
          <button 
            onClick={handleResetSession}
            className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
          >
            🔄 Сбросить сессию
          </button>
          <button 
            onClick={handleClearSession}
            className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
          >
            🗑️ Очистить сессию
          </button>
        </div>
      </div>

      <div className="mb-4">
        <h2 className="font-semibold mb-2">Тест создания рулетки</h2>
        <div className="space-x-2">
          <button 
            onClick={() => window.open('/dashboard/create', '_blank')}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            🎡 Создать тестовую рулетку
          </button>
          <button 
            onClick={handleRefetch}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            🔄 Обновить список
          </button>
        </div>
      </div>

      <div className="bg-white border rounded p-4">
        <h2 className="font-semibold mb-2">Мои рулетки</h2>
        
        {loading && <p>Загрузка...</p>}
        
        {error && (
          <div className="text-red-600">
            <p><strong>Ошибка загрузки рулеток</strong></p>
            <details className="mt-2">
              <summary className="cursor-pointer text-sm">Подробности ошибки</summary>
              <pre className="text-xs mt-2 bg-red-50 p-2 rounded overflow-auto">
                {JSON.stringify(error, null, 2)}
              </pre>
            </details>
          </div>
        )}
        
        {data && (
          <div className="text-green-600">
            <p><strong>Всего рулеток:</strong> {data.wheels?.length || 0}</p>
            {data.wheels?.length > 0 && (
              <div className="mt-2">
                <h3 className="font-medium">Список рулеток:</h3>
                <ul className="list-disc list-inside text-sm">
                  {data.wheels.map((wheel: any) => (
                    <li key={wheel.id}>
                      {wheel.title} (создана: {new Date(wheel.createdAt).toLocaleString()})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 