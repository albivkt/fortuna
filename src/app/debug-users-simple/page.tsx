'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_WHEELS } from '@/lib/graphql/queries';

export default function DebugUsersSimple() {
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const { data, loading, error } = useQuery(GET_WHEELS);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sessionId = localStorage.getItem('gifty_session_id');
      const authToken = localStorage.getItem('auth_token');
      const userDisplayName = localStorage.getItem('user_display_name');
      
      setSessionInfo({
        sessionId,
        authToken,
        userDisplayName,
        expectedEmail: sessionId ? `temp_${sessionId}@gifty.local` : null
      });
    }
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Отладка пользователей</h1>
      
      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="font-semibold mb-2">Информация о сессии</h2>
        <pre className="text-sm">
          {JSON.stringify(sessionInfo, null, 2)}
        </pre>
      </div>

      <div className="bg-white border rounded p-4">
        <h2 className="font-semibold mb-2">GraphQL данные рулеток</h2>
        
        {loading && <p>Загрузка...</p>}
        
        {error && (
          <div className="text-red-600">
            <p><strong>Ошибка:</strong> {error.message}</p>
          </div>
        )}
        
        {data && (
          <div>
            <p><strong>Количество рулеток:</strong> {data.wheels?.length || 0}</p>
            {data.wheels?.map((wheel: any, index: number) => (
              <div key={wheel.id} className="border-t pt-2 mt-2">
                <p><strong>Рулетка {index + 1}:</strong></p>
                <p>ID: {wheel.id}</p>
                <p>Название: {wheel.title}</p>
                <p>Создатель ID: {wheel.user?.id}</p>
                <p>Создатель имя: {wheel.user?.name}</p>
                <p>Создатель email: {wheel.user?.email}</p>
                <p>Дата создания: {wheel.createdAt}</p>
                <p>Сегментов: {wheel.segments?.length}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 