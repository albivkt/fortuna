'use client';

import { useState } from 'react';
import { useCreateWheel, useWheels } from '@/lib/graphql/hooks';
import Link from 'next/link';

export default function QuickTestCreatePage() {
  const [createWheel, { loading: creating }] = useCreateWheel();
  const { data: wheelsData, loading: wheelsLoading, refetch } = useWheels();
  const [title, setTitle] = useState('Быстрая тестовая рулетка');

  const handleQuickCreate = async () => {
    try {
      console.log('🚀 Быстрое создание рулетки...');
      
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

      console.log('✅ Результат создания:', result);
      
      if (result.data?.createWheel) {
        alert(`Рулетка "${result.data.createWheel.title}" успешно создана!`);
        refetch(); // Обновляем список
      } else {
        alert('Ошибка: рулетка не была создана');
      }
    } catch (error) {
      console.error('❌ Ошибка создания:', error);
      alert('Ошибка: ' + (error instanceof Error ? error.message : 'Неизвестная ошибка'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-6">Быстрое тестирование создания рулетки</h1>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Название рулетки:</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="Введите название"
              />
            </div>
            
            <button
              onClick={handleQuickCreate}
              disabled={creating}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {creating ? 'Создается...' : 'Создать рулетку'}
            </button>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Мои рулетки</h2>
            <button
              onClick={() => refetch()}
              disabled={wheelsLoading}
              className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 disabled:opacity-50"
            >
              {wheelsLoading ? 'Обновляется...' : 'Обновить'}
            </button>
          </div>
          
          {wheelsLoading ? (
            <p>Загрузка...</p>
          ) : wheelsData?.wheels.length === 0 ? (
            <p className="text-gray-500">Рулеток пока нет</p>
          ) : (
            <div className="space-y-2">
              {wheelsData?.wheels.map((wheel) => (
                <div key={wheel.id} className="border rounded p-3">
                  <h3 className="font-medium">{wheel.title}</h3>
                  <p className="text-sm text-gray-600">
                    Создана: {new Date(wheel.createdAt).toLocaleString('ru-RU')}
                  </p>
                  <p className="text-sm text-gray-600">
                    Сегментов: {wheel.segments.length}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link href="/dashboard" className="text-blue-500 hover:underline">
            ← Вернуться к дашборду
          </Link>
        </div>
      </div>
    </div>
  );
} 