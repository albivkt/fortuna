'use client';

import { useState } from 'react';
import { useWheels, useCreateWheel, useDeleteWheel } from '@/lib/graphql/hooks';

export default function TestGraphQLPage() {
  const { data: wheelsData, loading: wheelsLoading, error: wheelsError, refetch } = useWheels();
  const [createWheel, { loading: creating }] = useCreateWheel();
  const [deleteWheel] = useDeleteWheel();
  
  const [testTitle, setTestTitle] = useState('Тестовая рулетка');

  const wheels = wheelsData?.wheels || [];

  const handleCreateTestWheel = async () => {
    try {
      await createWheel({
        variables: {
          input: {
            title: testTitle,
            segments: [
              {
                option: 'Приз 1',
                style: {
                  backgroundColor: '#EC4899',
                  textColor: 'white'
                }
              },
              {
                option: 'Приз 2',
                style: {
                  backgroundColor: '#3B82F6',
                  textColor: 'white'
                }
              }
            ],
            isPublic: false
          }
        }
      });
      
      alert('Рулетка создана через GraphQL!');
      refetch();
    } catch (error) {
      console.error('Ошибка создания рулетки:', error);
      alert('Ошибка создания рулетки');
    }
  };

  const handleDeleteWheel = async (id: string, title: string) => {
    if (confirm(`Удалить рулетку "${title}"?`)) {
      try {
        await deleteWheel({
          variables: { id }
        });
        
        alert('Рулетка удалена через GraphQL!');
        refetch();
      } catch (error) {
        console.error('Ошибка удаления рулетки:', error);
        alert('Ошибка удаления рулетки');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Тестирование GraphQL
        </h1>

        {/* Создание рулетки */}
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Создать тестовую рулетку
          </h2>
          
          <div className="flex space-x-4">
            <input
              type="text"
              value={testTitle}
              onChange={(e) => setTestTitle(e.target.value)}
              placeholder="Название рулетки"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleCreateTestWheel}
              disabled={creating}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {creating ? 'Создание...' : 'Создать'}
            </button>
          </div>
        </div>

        {/* Список рулеток */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Рулетки из GraphQL
          </h2>
          
          {wheelsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Загрузка рулеток...</p>
            </div>
          ) : wheelsError ? (
            <div className="text-center py-8">
              <p className="text-red-600">Ошибка загрузки: {wheelsError.message}</p>
              <button
                onClick={() => refetch()}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Повторить
              </button>
            </div>
          ) : wheels.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Нет рулеток</p>
            </div>
          ) : (
            <div className="space-y-4">
              {wheels.map((wheel) => (
                <div key={wheel.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{wheel.title}</h3>
                      <p className="text-sm text-gray-600">
                        Сегментов: {wheel.segments.length} | 
                        Создано: {new Date(wheel.createdAt).toLocaleDateString('ru-RU')} |
                        Автор: {wheel.user.name}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteWheel(wheel.id, wheel.title)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Удалить
                    </button>
                  </div>
                  
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">Сегменты:</p>
                    <div className="flex flex-wrap gap-2">
                      {wheel.segments.map((segment, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 rounded-full text-sm font-medium"
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
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Информация о GraphQL */}
        <div className="bg-white p-6 rounded-xl shadow-lg mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Информация о GraphQL
          </h2>
          
          <div className="space-y-2 text-sm text-gray-600">
            <p>• GraphQL эндпоинт: <code className="bg-gray-100 px-2 py-1 rounded">/api/graphql</code></p>
            <p>• Используется Apollo Client для запросов</p>
            <p>• Данные хранятся в localStorage (совместимость с существующей системой)</p>
            <p>• Поддерживаются запросы: wheels, wheel, publicWheels, me</p>
            <p>• Поддерживаются мутации: createWheel, updateWheel, deleteWheel, spinWheel</p>
          </div>
        </div>
      </div>
    </div>
  );
} 