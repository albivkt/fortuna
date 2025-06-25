'use client';

import { useState, useEffect } from 'react';
import { useWheels, useCreateWheel } from '@/lib/graphql/hooks';
import { apolloClient } from '@/lib/graphql/client';
import { gql } from '@apollo/client';

export default function TestWheelsIssuePage() {
  const { data: wheelsData, loading: wheelsLoading, error: wheelsError, refetch } = useWheels();
  const [createWheel, { loading: creating }] = useCreateWheel();
  const [sessionInfo, setSessionInfo] = useState<any>({});
  const [rawData, setRawData] = useState<any>(null);
  const [step, setStep] = useState(1);

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

  // Шаг 1: Создать рулетку
  const handleCreateWheel = async () => {
    console.log('🎡 Шаг 1: Создание рулетки');
    try {
      const result = await createWheel({
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
      setStep(2);
    } catch (error) {
      console.error('❌ Ошибка создания:', error);
    }
  };

  // Шаг 2: Проверить через прямой запрос
  const handleDirectQuery = async () => {
    console.log('🔍 Шаг 2: Прямой запрос к GraphQL');
    try {
      const result = await apolloClient.query({
        query: gql`
          query GetWheelsDirectly {
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
        `,
        fetchPolicy: 'network-only'
      });
      
      console.log('✅ Прямой запрос выполнен:', result);
      setRawData(result.data);
      setStep(3);
    } catch (error) {
      console.error('❌ Ошибка прямого запроса:', error);
    }
  };

  // Шаг 3: Обновить хук
  const handleRefreshHook = () => {
    console.log('🔄 Шаг 3: Обновление хука useWheels');
    refetch();
    setStep(4);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Диагностика проблемы с рулетками</h1>
      
      {/* Информация о сессии */}
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-2">Информация о сессии</h2>
        <div className="text-sm space-y-1">
          <p><strong>Session ID:</strong> <code>{sessionInfo.sessionId || 'Нет'}</code></p>
          <p><strong>Auth Token:</strong> <code>{sessionInfo.authToken ? 'Есть' : 'Нет'}</code></p>
          <p><strong>Тип токена:</strong> {sessionInfo.authToken?.startsWith('temp_') ? 'Временный' : 'Реальный'}</p>
        </div>
      </div>

      {/* Пошаговая диагностика */}
      <div className="space-y-6">
        {/* Шаг 1 */}
        <div className={`border rounded-lg p-4 ${step >= 1 ? 'bg-white' : 'bg-gray-100'}`}>
          <h3 className="text-lg font-semibold mb-2">Шаг 1: Создание рулетки</h3>
          <button
            onClick={handleCreateWheel}
            disabled={creating || step > 1}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {creating ? 'Создается...' : step > 1 ? '✅ Выполнено' : 'Создать рулетку'}
          </button>
        </div>

        {/* Шаг 2 */}
        <div className={`border rounded-lg p-4 ${step >= 2 ? 'bg-white' : 'bg-gray-100'}`}>
          <h3 className="text-lg font-semibold mb-2">Шаг 2: Прямой запрос к GraphQL</h3>
          <button
            onClick={handleDirectQuery}
            disabled={step < 2 || step > 2}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
          >
            {step > 2 ? '✅ Выполнено' : 'Выполнить прямой запрос'}
          </button>
          
          {rawData && (
            <div className="mt-4 bg-gray-100 p-3 rounded">
              <p><strong>Найдено рулеток:</strong> {rawData.wheels?.length || 0}</p>
              {rawData.wheels?.map((wheel: any) => (
                <div key={wheel.id} className="text-sm mt-2">
                  <p>• {wheel.title} (ID: {wheel.id})</p>
                  <p className="text-gray-600 ml-4">Пользователь: {wheel.user.email}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Шаг 3 */}
        <div className={`border rounded-lg p-4 ${step >= 3 ? 'bg-white' : 'bg-gray-100'}`}>
          <h3 className="text-lg font-semibold mb-2">Шаг 3: Обновление хука useWheels</h3>
          <button
            onClick={handleRefreshHook}
            disabled={step < 3 || step > 3}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
          >
            {step > 3 ? '✅ Выполнено' : 'Обновить хук'}
          </button>
        </div>

        {/* Шаг 4 - Результат */}
        <div className={`border rounded-lg p-4 ${step >= 4 ? 'bg-white' : 'bg-gray-100'}`}>
          <h3 className="text-lg font-semibold mb-2">Шаг 4: Результат хука useWheels</h3>
          
          {wheelsLoading && <p className="text-blue-600">Загрузка...</p>}
          
          {wheelsError && (
            <div className="bg-red-100 p-3 rounded mb-4">
              <p className="text-red-800"><strong>Ошибка:</strong> {wheelsError.message}</p>
            </div>
          )}
          
          <div className="bg-gray-100 p-3 rounded">
            <p><strong>Статус загрузки:</strong> {wheelsLoading ? 'Загружается' : 'Завершено'}</p>
            <p><strong>Найдено рулеток через хук:</strong> {wheelsData?.wheels?.length || 0}</p>
            
            {wheelsData?.wheels && wheelsData.wheels.length > 0 && (
              <div className="mt-2">
                <p><strong>Рулетки:</strong></p>
                {wheelsData.wheels.map((wheel: any) => (
                  <div key={wheel.id} className="text-sm mt-1">
                    <p>• {wheel.title} (ID: {wheel.id})</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Сравнение результатов */}
      {step >= 4 && (
        <div className="mt-6 bg-yellow-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Сравнение результатов</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p><strong>Прямой запрос:</strong></p>
              <p>{rawData?.wheels?.length || 0} рулеток</p>
            </div>
            <div>
              <p><strong>Хук useWheels:</strong></p>
              <p>{wheelsData?.wheels?.length || 0} рулеток</p>
            </div>
          </div>
          
          {(rawData?.wheels?.length || 0) !== (wheelsData?.wheels?.length || 0) && (
            <div className="mt-4 bg-red-100 p-3 rounded">
              <p className="text-red-800 font-semibold">⚠️ ПРОБЛЕМА НАЙДЕНА!</p>
              <p className="text-red-700">Прямой запрос и хук возвращают разное количество рулеток.</p>
              <p className="text-red-700">Это указывает на проблему с кэшированием или контекстом пользователя.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 