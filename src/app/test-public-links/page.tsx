'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_WHEELS, GET_PUBLIC_WHEELS, GENERATE_PUBLIC_LINK, REMOVE_PUBLIC_LINK } from '@/lib/graphql/queries';

export default function TestPublicLinksPage() {
  const [selectedWheelId, setSelectedWheelId] = useState<string>('');
  
  const { data: wheelsData, loading: wheelsLoading, refetch: refetchWheels } = useQuery(GET_WHEELS);
  const { data: publicWheelsData, loading: publicWheelsLoading, refetch: refetchPublicWheels } = useQuery(GET_PUBLIC_WHEELS);
  
  const [generatePublicLink] = useMutation(GENERATE_PUBLIC_LINK, {
    onCompleted: () => {
      refetchWheels();
      refetchPublicWheels();
    }
  });
  
  const [removePublicLink] = useMutation(REMOVE_PUBLIC_LINK, {
    onCompleted: () => {
      refetchWheels();
      refetchPublicWheels();
    }
  });

  const handleGenerateLink = async (wheelId: string) => {
    try {
      await generatePublicLink({
        variables: {
          input: { wheelId }
        }
      });
      alert('Публичная ссылка создана!');
    } catch (error) {
      console.error('Error:', error);
      alert('Ошибка создания публичной ссылки');
    }
  };

  const handleRemoveLink = async (wheelId: string) => {
    try {
      await removePublicLink({
        variables: { wheelId }
      });
      alert('Публичная ссылка удалена!');
    } catch (error) {
      console.error('Error:', error);
      alert('Ошибка удаления публичной ссылки');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Тест публичных ссылок
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Мои рулетки */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Мои рулетки
            </h2>
            
            {wheelsLoading ? (
              <p>Загрузка...</p>
            ) : (
              <div className="space-y-4">
                {wheelsData?.wheels?.map((wheel: any) => (
                  <div key={wheel.id} className="border rounded-lg p-4">
                    <h3 className="font-medium text-gray-900">{wheel.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Статус: {wheel.isPublic ? '🌐 Публичная' : '🔒 Приватная'}
                    </p>
                    {wheel.publicSlug && (
                      <p className="text-sm text-green-600 mt-1">
                        Публичная ссылка: /public/{wheel.publicSlug}
                      </p>
                    )}
                    
                    <div className="mt-3 space-x-2">
                      {wheel.publicSlug ? (
                        <>
                          <button
                            onClick={() => handleRemoveLink(wheel.id)}
                            className="bg-red-100 text-red-700 px-3 py-1 rounded text-sm hover:bg-red-200"
                          >
                            Удалить ссылку
                          </button>
                          <button
                            onClick={() => {
                              const url = `${window.location.origin}/public/${wheel.publicSlug}`;
                              navigator.clipboard.writeText(url);
                              alert('Ссылка скопирована!');
                            }}
                            className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm hover:bg-blue-200"
                          >
                            Копировать ссылку
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleGenerateLink(wheel.id)}
                          className="bg-green-100 text-green-700 px-3 py-1 rounded text-sm hover:bg-green-200"
                        >
                          Создать публичную ссылку
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Публичные рулетки */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Публичные рулетки
            </h2>
            
            {publicWheelsLoading ? (
              <p>Загрузка...</p>
            ) : (
              <div className="space-y-4">
                {publicWheelsData?.publicWheels?.length === 0 ? (
                  <p className="text-gray-500">Нет публичных рулеток</p>
                ) : (
                  publicWheelsData?.publicWheels?.map((wheel: any) => (
                    <div key={wheel.id} className="border rounded-lg p-4">
                      <h3 className="font-medium text-gray-900">{wheel.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Автор: {wheel.user.name || wheel.user.email}
                      </p>
                      <p className="text-sm text-gray-600">
                        Сегментов: {wheel.segments.length}
                      </p>
                      <p className="text-sm text-gray-600">
                        Вращений: {wheel.spins.length}
                      </p>
                      {wheel.publicSlug && (
                        <p className="text-sm text-green-600 mt-1">
                          Ссылка: /public/{wheel.publicSlug}
                        </p>
                      )}
                      
                      <div className="mt-3">
                        {wheel.publicSlug ? (
                          <a
                            href={`/public/${wheel.publicSlug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm hover:bg-blue-200"
                          >
                            Открыть рулетку
                          </a>
                        ) : (
                          <a
                            href={`/roulette/${wheel.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-200"
                          >
                            Посмотреть
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 text-center">
          <a
            href="/dashboard"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Вернуться в дашборд
          </a>
        </div>
      </div>
    </div>
  );
} 