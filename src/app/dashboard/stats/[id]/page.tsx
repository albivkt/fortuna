'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { getRouletteById, getRouletteStats, type Roulette, type RouletteStats } from '@/lib/roulettes';
import { getCurrentUser, type User } from '@/lib/user';

export default function RouletteStatsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [roulette, setRoulette] = useState<Roulette | null>(null);
  const [stats, setStats] = useState<RouletteStats | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const rouletteId = params.id as string;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const userData = getCurrentUser();
    if (!userData) {
      router.push('/login');
      return;
    }

    if (userData.plan !== 'pro') {
      router.push('/dashboard/subscription');
      return;
    }

    setUser(userData);

    // Загружаем данные рулетки
    const rouletteData = getRouletteById(rouletteId);
    if (!rouletteData) {
      router.push('/dashboard');
      return;
    }

    // Проверяем, что рулетка принадлежит пользователю
    if (rouletteData.userId !== userData.id) {
      router.push('/dashboard');
      return;
    }

    setRoulette(rouletteData);
    
    // Загружаем статистику
    const statsData = getRouletteStats(rouletteId);
    setStats(statsData);
    setLoading(false);
  }, [router, rouletteId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка статистики...</p>
        </div>
      </div>
    );
  }

  if (!roulette || !user) {
    return null;
  }

  // Подготавливаем данные для графиков
  const segmentStats = roulette.segments.map(segment => ({
    ...segment,
    wins: stats?.segmentWins[segment.id] || 0,
    percentage: stats?.totalSpins ? ((stats.segmentWins[segment.id] || 0) / stats.totalSpins * 100).toFixed(1) : '0'
  }));

  const mostWinningSegment = segmentStats.reduce((prev, current) => 
    prev.wins > current.wins ? prev : current
  );

  const leastWinningSegment = segmentStats.reduce((prev, current) => 
    prev.wins < current.wins ? prev : current
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">G</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">GIFTY</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                ← Назад к дашборду
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{roulette.name}</h1>
            <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
              PRO Статистика
            </span>
          </div>
          <p className="text-gray-600">
            Подробная аналитика розыгрышей и статистика призов
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Всего розыгрышей</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalSpins || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Призов</p>
                <p className="text-2xl font-bold text-gray-900">{roulette.segments.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Самый частый</p>
                <p className="text-lg font-bold text-gray-900 truncate">{mostWinningSegment.text}</p>
                <p className="text-sm text-gray-500">{mostWinningSegment.wins} раз</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Последний розыгрыш</p>
                <p className="text-sm font-bold text-gray-900">
                  {stats?.lastSpinDate 
                    ? new Date(stats.lastSpinDate).toLocaleDateString('ru-RU')
                    : 'Нет данных'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Segment Statistics */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Статистика по призам</h2>
            <div className="space-y-4">
              {segmentStats.map((segment) => (
                <div key={segment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: segment.color }}
                    ></div>
                    <span className="font-medium text-gray-900">{segment.text}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">{segment.wins}</div>
                    <div className="text-sm text-gray-500">{segment.percentage}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Visual Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Визуальное распределение</h2>
            <div className="space-y-3">
              {segmentStats.map((segment) => (
                <div key={segment.id} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">{segment.text}</span>
                    <span className="text-gray-500">{segment.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-300"
                      style={{ 
                        backgroundColor: segment.color,
                        width: `${segment.percentage}%`
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Дополнительная информация</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Анализ справедливости</h3>
              <p className="text-gray-600 text-sm mb-2">
                Теоретическая вероятность каждого приза: {(100 / roulette.segments.length).toFixed(1)}%
              </p>
              {stats && stats.totalSpins > 0 && (
                <div className="space-y-1">
                  {segmentStats.map((segment) => {
                    const expectedPercentage = 100 / roulette.segments.length;
                    const actualPercentage = parseFloat(segment.percentage);
                    const deviation = Math.abs(actualPercentage - expectedPercentage);
                    const isDeviated = deviation > 5; // Отклонение больше 5%
                    
                    return (
                      <div key={segment.id} className="text-sm">
                        <span className="text-gray-700">{segment.text}: </span>
                        <span className={isDeviated ? 'text-orange-600' : 'text-green-600'}>
                          {deviation.toFixed(1)}% отклонение
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Рекомендации</h3>
              <div className="space-y-2 text-sm text-gray-600">
                {stats && stats.totalSpins < 10 && (
                  <p>• Проведите больше розыгрышей для получения более точной статистики</p>
                )}
                {mostWinningSegment.wins > (stats?.totalSpins || 0) * 0.4 && stats && stats.totalSpins > 10 && (
                  <p>• Приз "{mostWinningSegment.text}" выпадает чаще обычного</p>
                )}
                {leastWinningSegment.wins < (stats?.totalSpins || 0) * 0.1 && stats && stats.totalSpins > 10 && (
                  <p>• Приз "{leastWinningSegment.text}" выпадает реже обычного</p>
                )}
                <p>• Используйте веса призов для корректировки вероятностей</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 