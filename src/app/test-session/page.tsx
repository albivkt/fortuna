'use client';

import { useState, useEffect } from 'react';
import { useCreateWheel, useWheels } from '@/lib/graphql/hooks';
import { apolloClient } from '@/lib/graphql/client';

export default function TestSessionPage() {
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { data: wheelsData, loading: wheelsLoading, refetch } = useWheels();
  const [createWheel] = useCreateWheel();

  useEffect(() => {
    // Получаем информацию о сессии
    if (typeof window !== 'undefined') {
      const sessionId = localStorage.getItem('fortuna_session_id');
      const authToken = localStorage.getItem('auth_token');
      
      setSessionInfo({
        sessionId,
        authToken,
        expectedEmail: sessionId ? `temp_${sessionId}@fortuna.local` : 'не определен'
      });
    }
  }, []);

  const handleCreateTestWheel = async () => {
    setIsLoading(true);
    setTestResult('');
    
    try {
      console.log('🎡 Создание тестовой рулетки...');
      console.log('🔐 Session info before create:', {
        sessionId: localStorage.getItem('fortuna_session_id'),
        authToken: localStorage.getItem('auth_token')
      });
      
      const sessionId = localStorage.getItem('fortuna_session_id');
      console.log('🔗 Sending session ID:', sessionId);
      
      const result = await createWheel({
        variables: {
          input: {
            title: `Тест ${Date.now()}`,
            description: 'Тестовая рулетка для проверки session ID',
            segments: [
              { 
                option: 'Приз 1', 
                style: { backgroundColor: '#FF6B6B', textColor: '#FFFFFF' }
              },
              { 
                option: 'Приз 2', 
                style: { backgroundColor: '#4ECDC4', textColor: '#FFFFFF' }
              },
              { 
                option: 'Приз 3', 
                style: { backgroundColor: '#45B7D1', textColor: '#FFFFFF' }
              }
            ],
            isPublic: false
          }
        },
        context: {
          headers: {
            'x-session-id': sessionId,
            'X-Session-Id': sessionId,
          }
        }
      });
      
      console.log('✅ Рулетка создана:', result.data?.createWheel);
      console.log('🔍 Full result object:', result);
      console.log('🔍 Result data:', result.data);
      console.log('🔍 Result errors:', result.errors);
      
      if (result.data?.createWheel) {
        setTestResult(`✅ Рулетка создана: ${result.data.createWheel.title} (ID: ${result.data.createWheel.id})`);
      } else {
        setTestResult(`⚠️ Рулетка создана, но данные не получены. Errors: ${JSON.stringify(result.errors)}`);
      }
      
      // Сразу проверяем список рулеток
      console.log('🔍 Проверяем список рулеток после создания...');
      setTimeout(async () => {
        console.log('🔐 Session info before refetch:', {
          sessionId: localStorage.getItem('fortuna_session_id'),
          authToken: localStorage.getItem('auth_token')
        });
        
        const refetchResult = await refetch();
        console.log('📊 Refetch result:', refetchResult);
        console.log('🎡 Wheels after refetch:', refetchResult.data?.wheels?.length || 0);
        
        if (!refetchResult.data?.wheels) {
          setTestResult(prev => prev + '\n❌ Ошибка загрузки списка рулеток');
        } else if (refetchResult.data.wheels.length === 0) {
          setTestResult(prev => prev + '\n⚠️ ПРОБЛЕМА: Рулетка создана, но не найдена в списке!');
        } else {
          setTestResult(prev => prev + `\n✅ Рулетка найдена в списке! Всего: ${refetchResult.data.wheels.length}`);
        }
      }, 1000);
      
    } catch (error) {
      console.error('❌ Ошибка создания рулетки:', error);
      setTestResult(`❌ Ошибка: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearSession = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('fortuna_session_id');
      localStorage.removeItem('auth_token');
      apolloClient.clearStore();
      window.location.reload();
    }
  };

  const handleResetSession = () => {
    if (typeof window !== 'undefined') {
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('fortuna_session_id', newSessionId);
      localStorage.removeItem('auth_token');
      apolloClient.clearStore();
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Тест Session ID</h1>
        
        {/* Информация о сессии */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Информация о сессии</h2>
          <div className="space-y-2 font-mono text-sm">
            <div><strong>Session ID:</strong> {sessionInfo?.sessionId || 'не установлен'}</div>
            <div><strong>Auth Token:</strong> {sessionInfo?.authToken || 'не установлен'}</div>
            <div><strong>Ожидаемый Email:</strong> {sessionInfo?.expectedEmail}</div>
          </div>
          
          <div className="mt-4 space-x-4">
            <button
              onClick={handleResetSession}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              🔄 Сбросить сессию
            </button>
            <button
              onClick={handleClearSession}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              🗑️ Очистить сессию
            </button>
          </div>
        </div>

        {/* Тест создания рулетки */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Тест создания рулетки</h2>
          
          <button
            onClick={handleCreateTestWheel}
            disabled={isLoading}
            className="bg-green-500 text-white px-6 py-3 rounded hover:bg-green-600 disabled:opacity-50"
          >
            {isLoading ? '⏳ Создание...' : '🎡 Создать тестовую рулетку'}
          </button>
          
          <button
            onClick={async () => {
              console.log('🔄 Принудительное обновление списка рулеток...');
              apolloClient.clearStore();
              const result = await refetch();
              console.log('📊 Force refetch result:', result);
              setTestResult(`🔄 Принудительное обновление: найдено ${result.data?.wheels?.length || 0} рулеток`);
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 ml-4"
          >
            🔄 Обновить список
          </button>
          
          {testResult && (
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <pre className="text-sm">{testResult}</pre>
            </div>
          )}
        </div>

        {/* Список рулеток */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Мои рулетки</h2>
          
          {wheelsLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Загрузка...</p>
            </div>
          ) : (
            <div>
              <p className="mb-4">Всего рулеток: {wheelsData?.wheels?.length || 0}</p>
              
              {!wheelsData?.wheels ? (
                <p className="text-red-600">Ошибка загрузки рулеток</p>
              ) : wheelsData.wheels.length === 0 ? (
                <p className="text-gray-600">Рулетки не найдены</p>
              ) : (
                <div className="space-y-2">
                  {wheelsData.wheels.map((wheel: any) => (
                    <div key={wheel.id} className="p-3 bg-gray-50 rounded">
                      <div className="font-medium">{wheel.title}</div>
                      <div className="text-sm text-gray-600">ID: {wheel.id}</div>
                      <div className="text-sm text-gray-600">Создана: {new Date(wheel.createdAt).toLocaleString('ru-RU')}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 