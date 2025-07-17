'use client';

import { useState, useEffect } from 'react';
import { useWheel } from '@/lib/graphql/hooks';

export default function TestFullHistoryPage() {
  const wheelId = 'cmc8uuxii0001vepg1qt4y1b6';
  const { data: wheelData, loading, error } = useWheel(wheelId);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const wheel = wheelData?.wheel;
  const spins = wheel?.spins || [];
  const totalPages = Math.ceil(spins.length / itemsPerPage);
  
  // Получаем спины для текущей страницы
  const getCurrentPageSpins = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return spins.slice().reverse().slice(startIndex, endIndex);
  };

  if (loading) return <div className="p-8">Загрузка...</div>;
  if (error) return <div className="p-8 text-red-600">Ошибка: {error.message}</div>;
  if (!wheel) return <div className="p-8">Рулетка не найдена</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-3xl font-bold mb-4">Полная история спинов</h1>
          <div className="text-gray-600">
            <p><strong>Рулетка:</strong> {wheel.title}</p>
            <p><strong>Владелец:</strong> {wheel.user?.name}</p>
            <p><strong>Всего спинов:</strong> {spins.length}</p>
          </div>
        </div>

        {spins.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-500">Нет спинов для отображения</p>
          </div>
        ) : (
          <>
            {/* Пагинация сверху */}
            {totalPages > 1 && (
              <div className="bg-white rounded-lg shadow p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Показано {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, spins.length)} из {spins.length}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-50"
                    >
                      Назад
                    </button>
                    <span className="px-3 py-1">
                      {currentPage} из {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-50"
                    >
                      Вперед
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Список спинов */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Результат
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Участник
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Пользователь
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Дата
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getCurrentPageSpins().map((spin, index) => {
                    const actualIndex = (currentPage - 1) * itemsPerPage + index + 1;
                    const globalIndex = spins.length - actualIndex + 1;
                    
                    return (
                      <tr key={spin.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{globalIndex}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            {spin.result}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                            {spin.participant || 'Не указан'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {spin.user?.name || 'Без имени'} 
                          <span className="text-gray-500 text-xs ml-1">({spin.user?.id?.slice(-8)})</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(spin.createdAt).toLocaleString('ru-RU')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Пагинация снизу */}
            {totalPages > 1 && (
              <div className="bg-white rounded-lg shadow p-4 mt-6">
                <div className="flex items-center justify-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 bg-gray-600 text-white rounded disabled:opacity-50"
                  >
                    Первая
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-50"
                  >
                    Назад
                  </button>
                  <span className="px-4 py-1 bg-gray-100 rounded">
                    {currentPage} из {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-50"
                  >
                    Вперед
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 bg-gray-600 text-white rounded disabled:opacity-50"
                  >
                    Последняя
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 