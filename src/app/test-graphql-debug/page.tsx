'use client';

import { useState } from 'react';
import { useWheels, useCreateWheel } from '@/lib/graphql/hooks';

export default function TestGraphQLPage() {
  const { data: wheelsData, loading: wheelsLoading, error: wheelsError, refetch } = useWheels();
  const [createWheel, { loading: creating }] = useCreateWheel();
  const [testName, setTestName] = useState('Тестовая рулетка');

  const handleCreateTest = async () => {
    try {
      const result = await createWheel({
        variables: {
          input: {
            title: testName,
            segments: [
              { option: 'Приз 1', style: { backgroundColor: '#EC4899', textColor: 'white' } },
              { option: 'Приз 2', style: { backgroundColor: '#3B82F6', textColor: 'white' } }
            ],
            isPublic: false
          }
        }
      });
      console.log('Результат создания:', result);
      alert('Рулетка создана!');
      refetch();
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Ошибка: ' + error);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Отладка GraphQL</h1>
      
      <div className="mb-6">
        <h2 className="text-xl mb-2">Создать тестовую рулетку</h2>
        <input
          type="text"
          value={testName}
          onChange={(e) => setTestName(e.target.value)}
          className="border p-2 mr-2"
        />
        <button
          onClick={handleCreateTest}
          disabled={creating}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {creating ? 'Создается...' : 'Создать'}
        </button>
      </div>

      <div>
        <h2 className="text-xl mb-2">Мои рулетки</h2>
        {wheelsLoading && <p>Загрузка...</p>}
        {wheelsError && <p className="text-red-500">Ошибка: {wheelsError.message}</p>}
        {wheelsData && (
          <div>
            <p>Найдено рулеток: {wheelsData.wheels.length}</p>
            <ul className="list-disc pl-4">
              {wheelsData.wheels.map((wheel) => (
                <li key={wheel.id}>
                  {wheel.title} (ID: {wheel.id})
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
} 