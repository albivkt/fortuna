'use client';

import { useState } from 'react';
import { useCreateWheel, useWheels } from '@/lib/graphql/hooks';
import Link from 'next/link';

export default function TestFixedPage() {
  const { data: wheelsData, loading: wheelsLoading, error: wheelsError, refetch } = useWheels();
  const [createWheel, { loading: creating, error: createError }] = useCreateWheel();
  const [title, setTitle] = useState('');

  const handleCreate = async () => {
    if (!title.trim()) {
      alert('Введите название рулетки');
      return;
    }

    try {
      console.log('🎡 Создание рулетки:', title);
      
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

      console.log('✅ Результат:', result);
      
      if (result.data?.createWheel) {
        alert(`Рулетка "${result.data.createWheel.title}" создана!`);
        setTitle('');
      }
    } catch (error) {
      console.error('❌ Ошибка:', error);
      alert('Ошибка: ' + (error instanceof Error ? error.message : 'Неизвестная ошибка'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Тестирование исправленной функциональности</h1>
        
        <div className="grid md:grid-cols-2 gap-6">
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

          {/* Список рулеток */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Мои рулетки</h2>
              <button
                onClick={() => refetch()}
                disabled={wheelsLoading}
                className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 disabled:opacity-50"
              >
                {wheelsLoading ? 'Загрузка...' : 'Обновить'}
              </button>
            </div>
            
            {wheelsError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <strong>Ошибка загрузки:</strong> {wheelsError.message}
              </div>
            )}
            
            {wheelsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Загрузка...</span>
              </div>
            ) : wheelsData?.wheels.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Рулеток пока нет</p>
                <p className="text-sm">Создайте первую рулетку!</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
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
                        <p className="text-sm text-gray-600">
                          Вращений: {wheel.spins?.length || 0}
                        </p>
                      </div>
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        #{index + 1}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Статистика */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Статистика</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-blue-50 p-4 rounded">
              <div className="text-2xl font-bold text-blue-600">
                {wheelsData?.wheels.length || 0}
              </div>
              <div className="text-sm text-gray-600">Всего рулеток</div>
            </div>
            <div className="bg-green-50 p-4 rounded">
              <div className="text-2xl font-bold text-green-600">
                {wheelsData?.wheels.reduce((sum, wheel) => sum + (wheel.spins?.length || 0), 0) || 0}
              </div>
              <div className="text-sm text-gray-600">Всего вращений</div>
            </div>
            <div className="bg-purple-50 p-4 rounded">
              <div className="text-2xl font-bold text-purple-600">
                {wheelsData?.wheels.reduce((sum, wheel) => sum + wheel.segments.length, 0) || 0}
              </div>
              <div className="text-sm text-gray-600">Всего сегментов</div>
            </div>
          </div>
        </div>

        {/* Навигация */}
        <div className="mt-6 text-center space-x-4">
          <Link href="/dashboard" className="text-blue-500 hover:underline">
            ← Дашборд
          </Link>
          <Link href="/dashboard/create" className="text-blue-500 hover:underline">
            Создать рулетку →
          </Link>
          <Link href="/clear-cache" className="text-red-500 hover:underline">
            Очистить кэш
          </Link>
        </div>
      </div>
    </div>
  );
} 