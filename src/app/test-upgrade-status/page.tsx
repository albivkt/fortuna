'use client';

import { useState } from 'react';
import { useMe, usePlanLimits, useUpgradeToPro } from '@/lib/graphql/hooks';
import Link from 'next/link';

export default function TestUpgradeStatusPage() {
  const { data: meData, loading: meLoading, refetch: refetchMe } = useMe();
  const { data: planData, loading: planLoading, refetch: refetchPlan } = usePlanLimits();
  const [upgradeToPro, { loading: upgrading }] = useUpgradeToPro();
  const [upgradeStatus, setUpgradeStatus] = useState<string>('');

  const handleUpgrade = async () => {
    try {
      setUpgradeStatus('Обновление...');
      await upgradeToPro({
        variables: { period: 'MONTHLY' }
      });
      setUpgradeStatus('✅ Успешно обновлен до PRO!');
      
      // Обновляем данные
      await Promise.all([refetchMe(), refetchPlan()]);
    } catch (error: any) {
      console.error('Error upgrading:', error);
      setUpgradeStatus('❌ Ошибка: ' + error.message);
    }
  };

  const handleRefresh = async () => {
    setUpgradeStatus('Обновление данных...');
    try {
      await Promise.all([refetchMe(), refetchPlan()]);
      setUpgradeStatus('✅ Данные обновлены!');
    } catch (error: any) {
      setUpgradeStatus('❌ Ошибка обновления: ' + error.message);
    }
  };

  const currentPlan = planData?.me?.plan || meData?.me?.plan || 'FREE';
  const isPro = currentPlan?.toLowerCase() === 'pro';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Тест статуса обновления до PRO</h1>

        {/* Статус загрузки */}
        {(meLoading || planLoading) && (
          <div className="bg-blue-500/20 text-blue-400 p-4 rounded-lg mb-6">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400 inline-block mr-2"></div>
            Загрузка данных...
          </div>
        )}

        {/* Статус обновления */}
        {upgradeStatus && (
          <div className={`p-4 rounded-lg mb-6 ${
            upgradeStatus.includes('✅') ? 'bg-green-500/20 text-green-400' : 
            upgradeStatus.includes('❌') ? 'bg-red-500/20 text-red-400' : 
            'bg-yellow-500/20 text-yellow-400'
          }`}>
            {upgradeStatus}
          </div>
        )}

        {/* Данные пользователя */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
            <h2 className="text-xl font-semibold text-white mb-4">Данные из useMe</h2>
            <div className="text-gray-300 space-y-2">
              <p><strong>ID:</strong> {meData?.me?.id || 'N/A'}</p>
              <p><strong>Email:</strong> {meData?.me?.email || 'N/A'}</p>
              <p><strong>Имя:</strong> {meData?.me?.name || 'N/A'}</p>
              <p><strong>План:</strong> <span className={meData?.me?.plan === 'PRO' ? 'text-yellow-400' : 'text-gray-400'}>{meData?.me?.plan || 'N/A'}</span></p>
              <p><strong>Истекает:</strong> {meData?.me?.planExpiresAt ? new Date(meData.me.planExpiresAt).toLocaleString('ru-RU') : 'N/A'}</p>
            </div>
          </div>

          <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
            <h2 className="text-xl font-semibold text-white mb-4">Данные из usePlanLimits</h2>
            <div className="text-gray-300 space-y-2">
              <p><strong>ID:</strong> {planData?.me?.id || 'N/A'}</p>
              <p><strong>Email:</strong> {planData?.me?.email || 'N/A'}</p>
              <p><strong>Имя:</strong> {planData?.me?.name || 'N/A'}</p>
              <p><strong>План:</strong> <span className={planData?.me?.plan === 'PRO' ? 'text-yellow-400' : 'text-gray-400'}>{planData?.me?.plan || 'N/A'}</span></p>
              <p><strong>Истекает:</strong> {planData?.me?.planExpiresAt ? new Date(planData.me.planExpiresAt).toLocaleString('ru-RU') : 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Итоговый статус */}
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Итоговый статус</h2>
          <div className="text-gray-300 space-y-2">
            <p><strong>Текущий план:</strong> <span className={isPro ? 'text-yellow-400' : 'text-gray-400'}>{currentPlan}</span></p>
            <p><strong>PRO статус:</strong> <span className={isPro ? 'text-green-400' : 'text-red-400'}>{isPro ? '✅ Активен' : '❌ Неактивен'}</span></p>
          </div>
        </div>

        {/* Действия */}
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Действия</h2>
          <div className="space-y-4">
            <button
              onClick={handleRefresh}
              className="w-full bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              🔄 Обновить данные
            </button>

            <button
              onClick={handleUpgrade}
              disabled={upgrading || isPro}
              className="w-full bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {upgrading ? 'Обновление...' : isPro ? '✅ Уже PRO' : '⭐ Активировать PRO'}
            </button>

            {isPro && (
              <div className="bg-green-500/20 text-green-400 p-4 rounded-lg text-center">
                🎉 Поздравляем! У вас активен PRO план!
              </div>
            )}
          </div>
        </div>

        {/* Навигация */}
        <div className="flex justify-center space-x-4">
          <Link
            href="/dashboard"
            className="bg-gray-700 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors font-medium"
          >
            Вернуться в дашборд
          </Link>
          <Link
            href="/dashboard/subscription"
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            Страница подписки
          </Link>
        </div>
      </div>
    </div>
  );
}
