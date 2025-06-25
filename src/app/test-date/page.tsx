'use client';

import { useQuery } from '@apollo/client';
import { GET_WHEELS } from '@/lib/graphql/queries';

export default function TestDatePage() {
  const { data, loading, error } = useQuery(GET_WHEELS);

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error.message}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Тест даты создания рулеток</h1>
      
      {data?.wheels?.map((wheel: any) => (
        <div key={wheel.id} className="border p-4 mb-4 rounded">
          <h2 className="text-xl font-semibold">{wheel.title}</h2>
          <div className="mt-2 space-y-1">
            <p>ID: {wheel.id}</p>
            <p>Дата создания (raw): {JSON.stringify(wheel.createdAt)}</p>
            <p>Тип даты: {typeof wheel.createdAt}</p>
            <p>Дата создания (new Date): {wheel.createdAt ? new Date(wheel.createdAt).toString() : 'null'}</p>
            <p>Дата создания (formatted): {wheel.createdAt ? new Date(wheel.createdAt).toLocaleDateString('ru-RU') : 'Invalid Date'}</p>
            <p>Дата создания (ISO): {wheel.createdAt ? new Date(wheel.createdAt).toISOString() : 'null'}</p>
            <p>Дата создания (время): {wheel.createdAt ? new Date(wheel.createdAt).getTime() : 'null'}</p>
            <p>Проверка isNaN: {wheel.createdAt ? isNaN(new Date(wheel.createdAt).getTime()) : 'true'}</p>
          </div>
        </div>
      ))}
    </div>
  );
} 