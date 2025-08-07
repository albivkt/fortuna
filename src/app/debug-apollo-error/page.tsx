'use client';

import { useState } from 'react';
import { useQuery, useLazyQuery, gql } from '@apollo/client';

const GET_ME = gql`
  query GetMe {
    me {
      id
      email
      name
      plan
    }
  }
`;

const GET_WHEELS = gql`
  query GetWheels {
    wheels {
      id
      title
      createdAt
    }
  }
`;

const GET_WHEEL = gql`
  query GetWheel($id: ID!) {
    wheel(id: $id) {
      id
      title
      description
      segments {
        option
        style {
          backgroundColor
          textColor
        }
      }
      spins {
        id
        result
        participant
        createdAt
      }
    }
  }
`;

export default function DebugApolloErrorPage() {
  const [wheelId, setWheelId] = useState('');
  const [testResults, setTestResults] = useState<any[]>([]);

  // Тест базового запроса me
  const { data: meData, loading: meLoading, error: meError } = useQuery(GET_ME, {
    errorPolicy: 'all'
  });

  // Тест запроса wheels
  const { data: wheelsData, loading: wheelsLoading, error: wheelsError } = useQuery(GET_WHEELS, {
    errorPolicy: 'all'
  });

  // Ленивый запрос для конкретной рулетки
  const [getWheel, { data: wheelData, loading: wheelLoading, error: wheelError }] = useLazyQuery(GET_WHEEL, {
    errorPolicy: 'all'
  });

  const addTestResult = (test: string, result: any, error?: any) => {
    const newResult = {
      timestamp: new Date().toLocaleTimeString(),
      test,
      result,
      error: error?.message || null,
      success: !error
    };
    setTestResults(prev => [newResult, ...prev]);
  };

  const testWheel = () => {
    if (!wheelId.trim()) {
      alert('Введите ID рулетки');
      return;
    }

    console.log('🧪 Testing wheel:', wheelId);
    getWheel({
      variables: { id: wheelId },
      onCompleted: (data) => {
        console.log('✅ Wheel test completed:', data);
        addTestResult('getWheel', data);
      },
      onError: (error) => {
        console.error('❌ Wheel test failed:', error);
        addTestResult('getWheel', null, error);
      }
    });
  };

  // Добавляем результаты автоматических тестов
  if (meData && !testResults.find(r => r.test === 'me-auto')) {
    addTestResult('me-auto', meData);
  }
  if (meError && !testResults.find(r => r.test === 'me-auto-error')) {
    addTestResult('me-auto-error', null, meError);
  }

  if (wheelsData && !testResults.find(r => r.test === 'wheels-auto')) {
    addTestResult('wheels-auto', wheelsData);
  }
  if (wheelsError && !testResults.find(r => r.test === 'wheels-auto-error')) {
    addTestResult('wheels-auto-error', null, wheelsError);
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔍 Отладка Apollo GraphQL</h1>

        {/* Статус автоматических запросов */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">📊 Запрос ME</h2>
            <div className="space-y-2">
              <div>Загрузка: {meLoading ? '⏳ Да' : '✅ Нет'}</div>
              <div>Ошибка: {meError ? `❌ ${meError.message}` : '✅ Нет'}</div>
              <div>Данные: {meData ? `✅ Пользователь: ${meData.me?.name || 'Без имени'}` : '❌ Нет'}</div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">🎡 Запрос WHEELS</h2>
            <div className="space-y-2">
              <div>Загрузка: {wheelsLoading ? '⏳ Да' : '✅ Нет'}</div>
              <div>Ошибка: {wheelsError ? `❌ ${wheelsError.message}` : '✅ Нет'}</div>
              <div>Данные: {wheelsData ? `✅ Рулеток: ${wheelsData.wheels?.length || 0}` : '❌ Нет'}</div>
            </div>
          </div>
        </div>

        {/* Тест конкретной рулетки */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">🎯 Тест конкретной рулетки</h2>
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              value={wheelId}
              onChange={(e) => setWheelId(e.target.value)}
              placeholder="Введите ID рулетки"
              className="flex-1 px-3 py-2 bg-gray-700 rounded border border-gray-600 text-white"
            />
            <button
              onClick={testWheel}
              disabled={wheelLoading}
              className="px-6 py-2 bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {wheelLoading ? 'Тестирование...' : 'Тестировать'}
            </button>
          </div>
          
          {wheelError && (
            <div className="bg-red-900/50 border border-red-500 rounded p-4 mb-4">
              <h3 className="font-semibold text-red-400">Ошибка тестирования рулетки:</h3>
              <pre className="text-sm mt-2 text-red-300">{wheelError.message}</pre>
            </div>
          )}

          {wheelData && (
            <div className="bg-green-900/50 border border-green-500 rounded p-4">
              <h3 className="font-semibold text-green-400">Успешно загружена рулетка:</h3>
              <div className="text-sm mt-2 text-green-300">
                <div>ID: {wheelData.wheel?.id}</div>
                <div>Название: {wheelData.wheel?.title}</div>
                <div>Сегментов: {wheelData.wheel?.segments?.length || 0}</div>
                <div>Розыгрышей: {wheelData.wheel?.spins?.length || 0}</div>
              </div>
            </div>
          )}
        </div>

        {/* Журнал тестов */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">📋 Журнал тестов</h2>
          <div className="space-y-3">
            {testResults.length === 0 ? (
              <div className="text-gray-400">Журнал пуст</div>
            ) : (
              testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded border ${
                    result.success 
                      ? 'bg-green-900/30 border-green-500/50' 
                      : 'bg-red-900/30 border-red-500/50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold">
                      {result.success ? '✅' : '❌'} {result.test}
                    </span>
                    <span className="text-sm text-gray-400">{result.timestamp}</span>
                  </div>
                  
                  {result.error && (
                    <div className="text-red-300 text-sm mb-2">
                      Ошибка: {result.error}
                    </div>
                  )}
                  
                  {result.result && (
                    <details className="text-sm">
                      <summary className="cursor-pointer text-gray-300 hover:text-white">
                        Показать данные
                      </summary>
                      <pre className="mt-2 bg-gray-900 p-2 rounded text-xs overflow-auto">
                        {JSON.stringify(result.result, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Информация о локальном состоянии */}
        <div className="bg-gray-800 rounded-lg p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">💾 Локальное состояние</h2>
          <div className="space-y-2 text-sm">
            <div>Session ID: {typeof window !== 'undefined' ? localStorage.getItem('gifty_session_id') : 'N/A'}</div>
            <div>Auth Token: {typeof window !== 'undefined' ? (localStorage.getItem('auth_token') ? 'Есть' : 'Нет') : 'N/A'}</div>
            <div>User Agent: {typeof window !== 'undefined' ? navigator.userAgent.substring(0, 100) + '...' : 'N/A'}</div>
          </div>
        </div>
      </div>
    </div>
  );
} 