'use client';

import { useState, useEffect } from 'react';
import { apolloClient } from '@/lib/graphql/client';
import { gql } from '@apollo/client';

// Запрос для получения всех рулеток с информацией о пользователях
const GET_ALL_WHEELS_DEBUG = gql`
  query GetAllWheelsDebug {
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

// Мутация для создания рулетки с отладочной информацией
const CREATE_WHEEL_WITH_DEBUG = gql`
  mutation CreateWheelWithDebug($input: CreateWheelInput!) {
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

export default function FixUsersPage() {
  const [sessionInfo, setSessionInfo] = useState<any>({});
  const [allWheels, setAllWheels] = useState<any[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    setLogs(prev => [logMessage, ...prev]);
    console.log(logMessage);
  };

  useEffect(() => {
    updateSessionInfo();
  }, []);

  const updateSessionInfo = () => {
    if (typeof window !== 'undefined') {
      const sessionId = localStorage.getItem('fortuna_session_id');
      const authToken = localStorage.getItem('auth_token');
      
      const info = {
        sessionId,
        authToken,
        expectedEmail: sessionId ? `temp_${sessionId}@fortuna.local` : null,
        tokenEmail: authToken?.startsWith('temp_') ? `temp_${authToken.replace('temp_', '')}@fortuna.local` : null
      };
      
      setSessionInfo(info);
      addLog(`🔐 Session ID: ${sessionId}`);
      addLog(`🎫 Auth Token: ${authToken || 'Нет'}`);
      addLog(`📧 Ожидаемый email: ${info.expectedEmail}`);
      
      if (info.expectedEmail !== info.tokenEmail && info.tokenEmail) {
        addLog(`⚠️ ВНИМАНИЕ: Email из sessionId и токена не совпадают!`);
        addLog(`   SessionId email: ${info.expectedEmail}`);
        addLog(`   Token email: ${info.tokenEmail}`);
      }
    }
  };

  const fetchAllWheels = async () => {
    setLoading(true);
    addLog('🔍 Запрос всех рулеток...');
    
    try {
      const result = await apolloClient.query({
        query: GET_ALL_WHEELS_DEBUG,
        fetchPolicy: 'network-only'
      });
      
      const wheels = result.data.wheels || [];
      setAllWheels(wheels);
      addLog(`✅ Найдено рулеток: ${wheels.length}`);
      
      // Анализируем пользователей
      const users = wheels.reduce((acc: any, wheel: any) => {
        const email = wheel.user.email;
        if (!acc[email]) {
          acc[email] = { user: wheel.user, count: 0 };
        }
        acc[email].count++;
        return acc;
      }, {});
      
      Object.entries(users).forEach(([email, data]: [string, any]) => {
        addLog(`👤 ${email}: ${data.count} рулеток`);
        if (email === sessionInfo.expectedEmail) {
          addLog(`   ✅ Это ваш пользователь!`);
        }
      });
      
    } catch (error) {
      addLog(`❌ Ошибка запроса: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const createTestWheel = async () => {
    addLog('🎡 Создание тестовой рулетки...');
    addLog(`📧 Ожидаем создание для пользователя: ${sessionInfo.expectedEmail}`);
    
    try {
      const result = await apolloClient.mutate({
        mutation: CREATE_WHEEL_WITH_DEBUG,
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
        addLog(`👤 Создана для пользователя: ${wheel.user.email}`);
        
        if (wheel.user.email === sessionInfo.expectedEmail) {
          addLog(`✅ Пользователь совпадает с ожидаемым!`);
        } else {
          addLog(`❌ ПРОБЛЕМА: Пользователь НЕ совпадает!`);
          addLog(`   Ожидали: ${sessionInfo.expectedEmail}`);
          addLog(`   Получили: ${wheel.user.email}`);
        }
        
        // Обновляем список
        setTimeout(() => fetchAllWheels(), 1000);
      }
    } catch (error) {
      addLog(`❌ Ошибка создания: ${error}`);
    }
  };

  const fixSession = () => {
    addLog('🔧 Исправляем сессию...');
    
    if (typeof window !== 'undefined') {
      // Удаляем старые данные
      localStorage.removeItem('auth_token');
      localStorage.removeItem('fortuna_session_id');
      
      // Создаем новую стабильную сессию
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('fortuna_session_id', newSessionId);
      
      addLog(`✅ Новая сессия создана: ${newSessionId}`);
      addLog(`📧 Новый ожидаемый email: temp_${newSessionId}@fortuna.local`);
      
      // Обновляем информацию
      updateSessionInfo();
      
      // Очищаем кэш Apollo
      apolloClient.clearStore().then(() => {
        addLog('✅ Кэш Apollo очищен');
      });
    }
  };

  const myWheels = allWheels.filter(wheel => wheel.user.email === sessionInfo.expectedEmail);
  const otherWheels = allWheels.filter(wheel => wheel.user.email !== sessionInfo.expectedEmail);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Исправление проблемы с пользователями</h1>
      
      {/* Информация о сессии */}
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-2">Информация о сессии</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p><strong>Session ID:</strong></p>
            <p className="font-mono text-xs break-all">{sessionInfo.sessionId || 'Нет'}</p>
          </div>
          <div>
            <p><strong>Ожидаемый email:</strong></p>
            <p className="font-mono text-xs break-all text-blue-600">{sessionInfo.expectedEmail || 'Неизвестно'}</p>
          </div>
        </div>
      </div>

      {/* Кнопки управления */}
      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={fixSession}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          🔧 Исправить сессию
        </button>
        
        <button
          onClick={fetchAllWheels}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Загрузка...' : '🔍 Получить все рулетки'}
        </button>
        
        <button
          onClick={createTestWheel}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          🎡 Создать тестовую рулетку
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Мои рулетки */}
        <div className="bg-white border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4 text-green-600">
            Мои рулетки ({myWheels.length})
          </h2>
          
          {myWheels.length === 0 ? (
            <p className="text-gray-500">Ваших рулеток не найдено</p>
          ) : (
            <div className="space-y-2">
              {myWheels.map((wheel) => (
                <div key={wheel.id} className="border rounded p-2 bg-green-50">
                  <p className="font-medium text-sm">{wheel.title}</p>
                  <p className="text-xs text-gray-600">
                    {new Date(wheel.createdAt).toLocaleString('ru-RU')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Чужие рулетки */}
        <div className="bg-white border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4 text-orange-600">
            Чужие рулетки ({otherWheels.length})
          </h2>
          
          {otherWheels.length === 0 ? (
            <p className="text-gray-500">Чужих рулеток не найдено</p>
          ) : (
            <div className="space-y-2">
              {otherWheels.map((wheel) => (
                <div key={wheel.id} className="border rounded p-2 bg-orange-50">
                  <p className="font-medium text-sm">{wheel.title}</p>
                  <p className="text-xs text-gray-600">
                    {new Date(wheel.createdAt).toLocaleString('ru-RU')}
                  </p>
                  <p className="text-xs text-orange-600">
                    {wheel.user.email}
                  </p>
                </div>
              ))}
            </div>
          )}
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
          
          <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-xs h-96 overflow-y-auto">
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

      {/* Диагностика */}
      {allWheels.length > 0 && (
        <div className="mt-6 bg-yellow-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Диагностика</h3>
          
          {myWheels.length === 0 && otherWheels.length > 0 ? (
            <div className="bg-red-100 p-3 rounded">
              <p className="text-red-800 font-semibold">🚨 ПРОБЛЕМА НАЙДЕНА!</p>
              <p className="text-red-700">
                У вас нет рулеток, но есть рулетки других пользователей. 
                Это означает, что при создании и запросе используются разные пользователи.
              </p>
              <p className="text-red-700 mt-2">
                <strong>Решение:</strong> Нажмите "Исправить сессию" и попробуйте создать рулетку заново.
              </p>
            </div>
          ) : myWheels.length > 0 ? (
            <div className="bg-green-100 p-3 rounded">
              <p className="text-green-800 font-semibold">✅ Ваши рулетки найдены!</p>
              <p className="text-green-700">
                Проблема может быть в кэше или в хуке useWheels.
              </p>
            </div>
          ) : (
            <div className="bg-gray-100 p-3 rounded">
              <p className="text-gray-800">Рулеток пока нет. Создайте первую!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 