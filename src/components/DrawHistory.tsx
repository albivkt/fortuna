'use client';

import { useState, useEffect } from 'react';
import { DrawHistory as DrawHistoryType } from '@/types';
import { 
  getDrawHistory, 
  getDrawHistoryStats, 
  clearDrawHistory,
  exportDrawHistoryToCSV,
  downloadCSV 
} from '@/lib/drawHistory';
import { getCurrentUser } from '@/lib/user';
import ProBadge from './ProBadge';

interface DrawHistoryProps {
  wheelId: string;
  wheelTitle: string;
  onClose: () => void;
}

export function DrawHistory({ wheelId, wheelTitle, onClose }: DrawHistoryProps) {
  const [history, setHistory] = useState<DrawHistoryType[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    loadData();
    setCurrentUser(getCurrentUser());
  }, [wheelId]);

  const loadData = () => {
    setIsLoading(true);
    try {
      const historyData = getDrawHistory(wheelId);
      const statsData = getDrawHistoryStats(wheelId);
      setHistory(historyData);
      setStats(statsData);
    } catch (error) {
      console.error('Ошибка при загрузке истории:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (confirm('Вы уверены, что хотите очистить всю историю розыгрышей? Это действие нельзя отменить.')) {
      try {
        clearDrawHistory(wheelId);
        loadData();
      } catch (error) {
        alert('Ошибка при очистке истории');
      }
    }
  };

  const handleExportCSV = () => {
    if (currentUser?.plan !== 'PRO') {
      alert('Экспорт в CSV доступен только для PRO пользователей');
      return;
    }

    try {
      const csvContent = exportDrawHistoryToCSV(wheelId, wheelTitle);
      const filename = `история_${wheelTitle.replace(/[^a-zA-Zа-яА-Я0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
      downloadCSV(csvContent, filename);
    } catch (error) {
      alert('Ошибка при экспорте: ' + (error as Error).message);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('ru-RU'),
      time: date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    };
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Загрузка истории...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">История розыгрышей</h2>
              <p className="text-gray-600 mt-1">{wheelTitle}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="p-6 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalDraws}</div>
                <div className="text-sm text-gray-600">Всего розыгрышей</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.uniquePrizes}</div>
                <div className="text-sm text-gray-600">Уникальных призов</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">
                  {stats.mostFrequentPrize ? stats.mostFrequentPrize.prize : 'Нет данных'}
                </div>
                <div className="text-sm text-gray-600">
                  Частый приз {stats.mostFrequentPrize && `(${stats.mostFrequentPrize.count}x)`}
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-orange-600">
                  {stats.lastDraw ? formatDate(stats.lastDraw.createdAt).date : 'Нет данных'}
                </div>
                <div className="text-sm text-gray-600">Последний розыгрыш</div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleExportCSV}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Экспорт CSV</span>
              {currentUser?.plan !== 'PRO' && <ProBadge />}
            </button>
            
            <button
              onClick={handleClearHistory}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Очистить историю</span>
            </button>
          </div>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto">
          {history.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-lg font-medium">История пуста</p>
              <p className="text-sm">Проведите первый розыгрыш, чтобы увидеть результаты здесь</p>
            </div>
          ) : (
            <div className="p-6">
              <div className="space-y-3">
                {history.map((item, index) => {
                  const { date, time } = formatDate(item.createdAt);
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">#{history.length - index}</span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{item.prize}</div>
                          {item.participant && (
                            <div className="text-sm text-gray-600">Участник: {item.participant}</div>
                          )}
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <div>{date}</div>
                        <div>{time}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 