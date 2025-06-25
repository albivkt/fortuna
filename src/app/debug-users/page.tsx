'use client';

import { useState, useEffect } from 'react';
import { apolloClient } from '@/lib/graphql/client';
import { gql } from '@apollo/client';

const GET_ALL_WHEELS_WITH_USERS = gql`
  query GetAllWheelsWithUsers {
    wheels {
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

const CREATE_WHEEL_DEBUG = gql`
  mutation CreateWheelDebug($input: CreateWheelInput!) {
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

export default function DebugUsersPage() {
  const [sessionInfo, setSessionInfo] = useState<any>({});
  const [allWheels, setAllWheels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

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
        hasSession: !!sessionId,
        hasAuth: !!authToken
      });
      
      addLog(`🔐 Сессия: ${sessionId}`);
      addLog(`🎫 Токен: ${authToken ? 'Есть' : 'Нет'}`);
    }
  }, []);

  const fetchAllWheels = async () => {
    setLoading(true);
    addLog('🔍 Запрос всех рулеток...');
    
    try {
      const result = await apolloClient.query({
        query: GET_ALL_WHEELS_WITH_USERS,
        fetchPolicy: 'network-only'
      });
      
      setAllWheels(result.data.wheels || []);
      addLog(`✅ Найдено рулеток: ${result.data.wheels?.length || 0}`);
      
      // Группируем по пользователям
      const userGroups = result.data.wheels?.reduce((groups: any, wheel: any) => {
        const userId = wheel.user.id;
        if (!groups[userId]) {
          groups[userId] = {
            user: wheel.user,
            wheels: []
          };
        }
        groups[userId].wheels.push(wheel);
        return groups;
      }, {});
      
      Object.entries(userGroups || {}).forEach(([userId, group]: [string, any]) => {
        addLog(`👤 Пользователь ${group.user.email}: ${group.wheels.length} рулеток`);
      });
      
    } catch (error) {
      addLog(`❌ Ошибка: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const createTestWheel = async () => {
    addLog('🎡 Создание тестовой рулетки...');
    
    try {
      const result = await apolloClient.mutate({
        mutation: CREATE_WHEEL_DEBUG,
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
        const wheel = result.data.createWheel;
        addLog(`✅ Рулетка создана: ${wheel.title}`);
        addLog(`👤 Создана пользователем: ${wheel.user.email} (ID: ${wheel.user.id})`);
        
        // Обновляем список
        await fetchAllWheels();
      }
    } catch (error) {
      addLog(`❌ Ошибка создания: ${error}`);
    }
  };

  const getCurrentUserInfo = () => {
    if (typeof window === 'undefined') return null;
    
    const sessionId = localStorage.getItem('fortuna_session_id');
    const authToken = localStorage.getItem('auth_token');
    
    // Вычисляем ожидаемый email пользователя
    let expectedEmail = '';
    if (authToken && authToken.startsWith('temp_')) {
      const tempId = authToken.replace('temp_', '');
      expectedEmail = `temp_${tempId}@fortuna.local`;
    } else if (sessionId) {
      expectedEmail = `temp_${sessionId}@fortuna.local`;
    }
    
    return { sessionId, authToken, expectedEmail };
  };

  const currentUserInfo = getCurrentUserInfo();

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Отладка пользователей и рулеток</h1>
      
      {/* Информация о текущем пользователе */}
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-2">Информация о текущем пользователе</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p><strong>Session ID:</strong></p>
            <p className="font-mono text-xs break-all">{currentUserInfo?.sessionId || 'Нет'}</p>
          </div>
          <div>
            <p><strong>Auth Token:</strong></p>
            <p className="font-mono text-xs break-all">{currentUserInfo?.authToken || 'Нет'}</p>
          </div>
          <div className="md:col-span-2">
            <p><strong>Ожидаемый email пользователя:</strong></p>
            <p className="font-mono text-sm text-blue-600">{currentUserInfo?.expectedEmail || 'Неизвестно'}</p>
          </div>
        </div>
      </div>

      {/* Кнопки управления */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={fetchAllWheels}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Загрузка...' : 'Получить все рулетки'}
        </button>
        
        <button
          onClick={createTestWheel}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Создать тестовую рулетку
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Список всех рулеток */}
        <div className="bg-white border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Все рулетки в базе ({allWheels.length})</h2>
          
          {allWheels.length === 0 ? (
            <p className="text-gray-500">Рулеток нет или данные не загружены</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {allWheels.map((wheel) => (
                <div key={wheel.id} className="border rounded p-3 bg-gray-50">
                  <h3 className="font-medium">{wheel.title}</h3>
                  <p className="text-sm text-gray-600">
                    ID: <span className="font-mono">{wheel.id}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Создана: {new Date(wheel.createdAt).toLocaleString('ru-RU')}
                  </p>
                  <div className="mt-2 p-2 bg-blue-50 rounded">
                    <p className="text-sm font-medium">Пользователь:</p>
                    <p className="text-xs">ID: <span className="font-mono">{wheel.user.id}</span></p>
                    <p className="text-xs">Email: <span className="font-mono">{wheel.user.email}</span></p>
                    <p className="text-xs">Имя: {wheel.user.name}</p>
                    {wheel.user.email === currentUserInfo?.expectedEmail && (
                      <p className="text-xs text-green-600 font-semibold">✅ Это ваша рулетка!</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Логи */}
        <div className="bg-white border rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Логи отладки</h2>
            <button
              onClick={() => setLogs([])}
              className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
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

      {/* Анализ проблемы */}
      {allWheels.length > 0 && currentUserInfo?.expectedEmail && (
        <div className="mt-6 bg-yellow-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Анализ проблемы</h3>
          
          {(() => {
            const myWheels = allWheels.filter(wheel => wheel.user.email === currentUserInfo.expectedEmail);
            const otherWheels = allWheels.filter(wheel => wheel.user.email !== currentUserInfo.expectedEmail);
            
            return (
              <div className="space-y-2 text-sm">
                <p><strong>Ваши рулетки:</strong> {myWheels.length}</p>
                <p><strong>Рулетки других пользователей:</strong> {otherWheels.length}</p>
                
                {myWheels.length === 0 && allWheels.length > 0 && (
                  <div className="bg-red-100 p-3 rounded mt-4">
                    <p className="text-red-800 font-semibold">🚨 ПРОБЛЕМА НАЙДЕНА!</p>
                    <p className="text-red-700">У вас нет рулеток, но в базе есть рулетки других пользователей.</p>
                    <p className="text-red-700">Это означает, что при создании и при запросе используются разные пользователи.</p>
                  </div>
                )}
                
                {myWheels.length > 0 && (
                  <div className="bg-green-100 p-3 rounded mt-4">
                    <p className="text-green-800 font-semibold">✅ Ваши рулетки найдены!</p>
                    <p className="text-green-700">Проблема может быть в кэше или в запросе useWheels.</p>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
} 