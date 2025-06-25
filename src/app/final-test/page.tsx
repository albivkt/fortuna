'use client';

import { useState, useEffect } from 'react';
import { useCreateWheel, useWheels } from '@/lib/graphql/hooks';
import { apolloClient } from '@/lib/graphql/client';

export default function FinalTestPage() {
  const { data: wheelsData, loading: wheelsLoading, error: wheelsError, refetch } = useWheels();
  const [createWheel, { loading: creating, error: createError }] = useCreateWheel();
  const [title, setTitle] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const [sessionInfo, setSessionInfo] = useState<any>({});

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    setLogs(prev => [logMessage, ...prev]);
    console.log(logMessage);
  };

  useEffect(() => {
    // Получаем информацию о сессии
    if (typeof window !== 'undefined') {
      const sessionId = localStorage.getItem('fortuna_session_id');
      const authToken = localStorage.getItem('auth_token');
      
      setSessionInfo({
        sessionId,
        authToken,
        expectedEmail: sessionId ? `temp_${sessionId}@fortuna.local` : null
      });
      
      addLog(`🔐 Session ID: ${sessionId}`);
      addLog(`📧 Ожидаемый email: temp_${sessionId}@fortuna.local`);
    }
  }, []);

  useEffect(() => {
    if (wheelsData) {
      addLog(`📊 Загружено рулеток: ${wheelsData.wheels.length}`);
    }
  }, [wheelsData]);

  const handleCreate = async () => {
    if (!title.trim()) {
      alert('Введите название рулетки');
      return;
    }

    addLog(`🎡 Создание рулетки: "${title}"`);
    
    try {
      const result = await createWheel({
        variables: {
          input: {
            title: title,
            segments: [
              { option: 'Приз 1', style: { backgroundColor: '#EC4899', textColor: 'white' } },
              { option: 'Приз 2', style: { backgroundColor: '#3B82F6', textColor: 'white' } },
              { option: 'Приз 3', style: { backgroundColor: '#10B981', textColor: 'white' } }
            ],
            isPublic: false
          }
        }
      });

      if (result.data?.createWheel) {
        addLog(`✅ Рулетка создана: ${result.data.createWheel.title}`);
        addLog(`👤 Пользователь: ${result.data.createWheel.user?.email || 'неизвестно'}`);
        setTitle('');
        
        // Проверяем, появилась ли рулетка в списке
        setTimeout(() => {
          const currentCount = wheelsData?.wheels.length || 0;
          addLog(`🔍 Проверка: рулеток в списке ${currentCount}`);
          
          if (currentCount === 0) {
            addLog(`⚠️ Рулетка не появилась в списке, принудительно обновляем...`);
            refetch();
          }
        }, 1000);
      }
    } catch (error) {
      addLog(`❌ Ошибка создания: ${error}`);
    }
  };

  const resetSession = async () => {
    addLog('🔧 Сброс сессии...');
    
    if (typeof window !== 'undefined') {
      // Очищаем все данные
      localStorage.clear();
      
      // Создаем новую сессию
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('fortuna_session_id', newSessionId);
      
      addLog(`✅ Новая сессия: ${newSessionId}`);
      addLog(`📧 Новый email: temp_${newSessionId}@fortuna.local`);
      
      // Обновляем состояние
      setSessionInfo({
        sessionId: newSessionId,
        authToken: null,
        expectedEmail: `temp_${newSessionId}@fortuna.local`
      });
      
      // Очищаем кэш Apollo
      await apolloClient.clearStore();
      addLog('✅ Кэш Apollo очищен');
      
      // Обновляем список рулеток
      setTimeout(() => refetch(), 500);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Финальный тест исправленной функциональности</h1>
        
        {/* Информация о сессии */}
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h2 className="text-lg font-semibold mb-2">Текущая сессия</h2>
          <p className="text-sm"><strong>Session ID:</strong> <code>{sessionInfo.sessionId}</code></p>
          <p className="text-sm"><strong>Ожидаемый email:</strong> <code>{sessionInfo.expectedEmail}</code></p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Создание и управление */}
          <div className="space-y-6">
            {/* Создание рулетки */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Создать рулетку</h2>
              
              <div className="space-y-4">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Название рулетки"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
                
                <button
                  onClick={handleCreate}
                  disabled={creating || !title.trim()}
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {creating ? 'Создается...' : 'Создать рулетку'}
                </button>
                
                {createError && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <strong>Ошибка:</strong> {createError.message}
                  </div>
                )}
              </div>
            </div>

            {/* Управление */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Управление</h2>
              
              <div className="space-y-2">
                <button
                  onClick={resetSession}
                  className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
                >
                  🔧 Сбросить сессию
                </button>
                
                <button
                  onClick={() => refetch()}
                  disabled={wheelsLoading}
                  className="w-full bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600 disabled:opacity-50"
                >
                  {wheelsLoading ? 'Обновляется...' : '🔄 Обновить список'}
                </button>
              </div>
            </div>

            {/* Список рулеток */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Мои рулетки ({wheelsData?.wheels.length || 0})</h2>
                <span className={`px-2 py-1 rounded text-sm ${
                  wheelsLoading ? 'bg-yellow-100 text-yellow-800' : 
                  wheelsError ? 'bg-red-100 text-red-800' : 
                  'bg-green-100 text-green-800'
                }`}>
                  {wheelsLoading ? 'Загрузка' : wheelsError ? 'Ошибка' : 'Готово'}
                </span>
              </div>
              
              {wheelsError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  <strong>Ошибка загрузки:</strong> {wheelsError.message}
                </div>
              )}
              
              {wheelsData?.wheels.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Рулеток пока нет</p>
                  <p className="text-sm">Создайте первую!</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {wheelsData?.wheels.map((wheel, index) => (
                    <div key={wheel.id} className="border rounded p-3 bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{wheel.title}</h3>
                          <p className="text-sm text-gray-600">
                            Создана: {new Date(wheel.createdAt).toLocaleString('ru-RU')}
                          </p>
                          <p className="text-sm text-gray-600">
                            Сегментов: {wheel.segments.length}
                          </p>
                        </div>
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                          #{index + 1}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Логи */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Логи отладки</h2>
              <button
                onClick={() => setLogs([])}
                className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
              >
                Очистить
              </button>
            </div>
            
            <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm h-96 overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-gray-500">Логи появятся здесь...</p>
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

        {/* Результат теста */}
        {wheelsData && (
          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Результат теста</h2>
            
            {wheelsData.wheels.length > 0 ? (
              <div className="bg-green-100 p-4 rounded">
                <p className="text-green-800 font-semibold">🎉 УСПЕХ!</p>
                <p className="text-green-700">
                  Рулетки успешно создаются и отображаются в списке. 
                  Проблема исправлена!
                </p>
              </div>
            ) : (
              <div className="bg-yellow-100 p-4 rounded">
                <p className="text-yellow-800 font-semibold">⏳ Ожидание</p>
                <p className="text-yellow-700">
                  Создайте рулетку, чтобы проверить, работает ли исправление.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 