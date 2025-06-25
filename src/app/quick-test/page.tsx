'use client';

import { useState } from 'react';
import { useWheels, useCreateWheel } from '@/lib/graphql/hooks';

export default function QuickTestPage() {
  const { data: wheelsData, loading: wheelsLoading, refetch } = useWheels();
  const [createWheel, { loading: creating }] = useCreateWheel();
  const [testResult, setTestResult] = useState<string>('');

  const createTestWheel = async () => {
    setTestResult('Создаю тестовую рулетку...');
    
    try {
      const result = await createWheel({
        variables: {
          input: {
            title: `Тестовая рулетка ${Date.now()}`,
            description: 'Создана для тестирования',
            segments: [
              {
                option: 'Приз 1',
                style: { backgroundColor: '#FF6B6B', textColor: 'white' }
              },
              {
                option: 'Приз 2',
                style: { backgroundColor: '#4ECDC4', textColor: 'white' }
              },
              {
                option: 'Приз 3',
                style: { backgroundColor: '#45B7D1', textColor: 'white' }
              }
            ],
            isPublic: true
          }
        }
      });

      if (result.data?.createWheel) {
        setTestResult(`✅ Рулетка создана успешно! ID: ${result.data.createWheel.id}`);
        // Обновляем список
        await refetch();
      }
    } catch (error: any) {
      setTestResult(`❌ Ошибка: ${error.message}`);
      console.error('Ошибка создания рулетки:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Быстрое тестирование рулеток
        </h1>

        {/* Кнопка создания */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Создание рулетки</h2>
          <button
            onClick={createTestWheel}
            disabled={creating}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {creating ? 'Создаю...' : 'Создать тестовую рулетку'}
          </button>
          
          {testResult && (
            <div className="mt-4 p-3 bg-gray-100 rounded">
              {testResult}
            </div>
          )}
        </div>

        {/* Список рулеток */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              Мои рулетки ({wheelsData?.wheels?.length || 0})
            </h2>
            <button
              onClick={() => refetch()}
              disabled={wheelsLoading}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
            >
              {wheelsLoading ? 'Загрузка...' : 'Обновить'}
            </button>
          </div>

          {wheelsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Загрузка рулеток...</p>
            </div>
          ) : wheelsData?.wheels && wheelsData.wheels.length > 0 ? (
            <div className="space-y-4">
              {wheelsData.wheels.map((wheel) => (
                <div key={wheel.id} className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg">{wheel.title}</h3>
                  <p className="text-gray-600">{wheel.description}</p>
                  <div className="mt-2 text-sm text-gray-500">
                    <p>ID: {wheel.id}</p>
                    <p>Сегментов: {wheel.segments?.length || 0}</p>
                    <p>Создано: {new Date(wheel.createdAt).toLocaleString('ru-RU')}</p>
                    <p>Пользователь: {wheel.user?.name || 'Неизвестно'}</p>
                    <p>Публичная: {wheel.isPublic ? 'Да' : 'Нет'}</p>
                  </div>
                  
                  {wheel.segments && wheel.segments.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">Сегменты:</p>
                      <div className="flex flex-wrap gap-2">
                        {wheel.segments.map((segment, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 rounded text-sm"
                            style={{
                              backgroundColor: segment.style.backgroundColor,
                              color: segment.style.textColor
                            }}
                          >
                            {segment.option}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Рулетки не найдены</p>
              <p className="text-sm mt-2">Создайте первую рулетку, нажав кнопку выше</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 