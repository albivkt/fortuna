'use client';

import { useState } from 'react';
import { useApolloClient } from '@apollo/client';
import { useCreateWheel, useWheels } from '@/lib/graphql/hooks';
import { useRouter } from 'next/navigation';

export default function ResetAllPage() {
  const client = useApolloClient();
  const router = useRouter();
  const { data: wheelsData, loading: wheelsLoading, refetch } = useWheels();
  const [createWheel, { loading: creating }] = useCreateWheel();
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    setLogs(prev => [logMessage, ...prev]);
    console.log(logMessage);
  };

  const resetEverything = async () => {
    addLog('🗑️ Начинаем полный сброс...');
    
    try {
      // 1. Очищаем localStorage
      if (typeof window !== 'undefined') {
        localStorage.clear();
        addLog('✅ localStorage очищен');
      }
      
      // 2. Очищаем кэш Apollo
      await client.clearStore();
      addLog('✅ Кэш Apollo очищен');
      
      // 3. Создаем новую сессию
      if (typeof window !== 'undefined') {
        const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('fortuna_session_id', newSessionId);
        addLog(`✅ Новая сессия создана: ${newSessionId}`);
      }
      
      addLog('🎉 Полный сброс завершен!');
      alert('Все данные сброшены! Перезагрузите страницу.');
      
    } catch (error) {
      addLog(`❌ Ошибка сброса: ${error}`);
    }
  };

  const testCreateAndList = async () => {
    addLog('🧪 Начинаем тест создания и отображения...');
    
    try {
      // 1. Проверяем текущий список
      addLog('1️⃣ Проверяем текущий список рулеток...');
      await refetch();
      addLog(`📊 Текущее количество рулеток: ${wheelsData?.wheels?.length || 0}`);
      
      // 2. Создаем новую рулетку
      addLog('2️⃣ Создаем новую рулетку...');
      const result = await createWheel({
        variables: {
          input: {
            title: `Тест ${Date.now()}`,
            segments: [
              { option: 'Приз 1', style: { backgroundColor: '#EC4899', textColor: 'white' } },
              { option: 'Приз 2', style: { backgroundColor: '#3B82F6', textColor: 'white' } }
            ],
            isPublic: false
          }
        }
      });
      
      if (result.data?.createWheel) {
        addLog(`✅ Рулетка создана: ${result.data.createWheel.title}`);
      } else {
        addLog('❌ Рулетка не создана');
        return;
      }
      
      // 3. Ждем немного и проверяем список снова
      addLog('3️⃣ Ждем 2 секунды и проверяем список...');
      setTimeout(async () => {
        await refetch();
        const newCount = wheelsData?.wheels?.length || 0;
        addLog(`📊 Новое количество рулеток: ${newCount}`);
        
        if (newCount > 0) {
          addLog('🎉 УСПЕХ! Рулетки отображаются!');
        } else {
          addLog('❌ ПРОБЛЕМА! Рулетки не отображаются!');
        }
      }, 2000);
      
    } catch (error) {
      addLog(`❌ Ошибка теста: ${error}`);
    }
  };

  const showSessionInfo = () => {
    if (typeof window !== 'undefined') {
      const sessionId = localStorage.getItem('fortuna_session_id');
      const authToken = localStorage.getItem('auth_token');
      
      addLog('📋 Информация о сессии:');
      addLog(`   Session ID: ${sessionId}`);
      addLog(`   Auth Token: ${authToken || 'Нет'}`);
      addLog(`   Ожидаемый email: temp_${sessionId}@fortuna.local`);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Полный сброс и тестирование</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Управление */}
        <div className="space-y-4">
          <div className="bg-white border rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4">Управление</h2>
            
            <div className="space-y-2">
              <button
                onClick={resetEverything}
                className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                🗑️ Полный сброс (localStorage + кэш)
              </button>
              
              <button
                onClick={showSessionInfo}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                📋 Показать информацию о сессии
              </button>
              
              <button
                onClick={testCreateAndList}
                disabled={creating}
                className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
              >
                {creating ? 'Тестируем...' : '🧪 Тест: создать и проверить'}
              </button>
              
              <button
                onClick={() => refetch()}
                disabled={wheelsLoading}
                className="w-full bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
              >
                {wheelsLoading ? 'Обновляется...' : '🔄 Обновить список рулеток'}
              </button>
            </div>
          </div>

          {/* Текущее состояние */}
          <div className="bg-white border rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4">Текущее состояние</h2>
            
            <div className="space-y-2 text-sm">
              <p><strong>Рулеток в списке:</strong> {wheelsData?.wheels?.length || 0}</p>
              <p><strong>Загрузка:</strong> {wheelsLoading ? 'Да' : 'Нет'}</p>
              <p><strong>Создание:</strong> {creating ? 'Да' : 'Нет'}</p>
            </div>
            
            {wheelsData?.wheels && wheelsData.wheels.length > 0 && (
              <div className="mt-4">
                <p className="font-medium mb-2">Рулетки:</p>
                <div className="space-y-1">
                  {wheelsData.wheels.map((wheel, index) => (
                    <div key={wheel.id} className="text-xs bg-gray-100 p-2 rounded">
                      {index + 1}. {wheel.title}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Логи */}
        <div className="bg-white border rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Логи</h2>
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

      <div className="mt-6 text-center">
        <button
          onClick={() => router.push('/dashboard')}
          className="text-blue-500 hover:underline"
        >
          ← Вернуться к дашборду
        </button>
      </div>
    </div>
  );
} 