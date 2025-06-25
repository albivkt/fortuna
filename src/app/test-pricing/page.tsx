'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import Link from 'next/link';

const GET_PLAN_LIMITS = gql`
  query GetPlanLimits {
    planLimits {
      maxWheels
      maxSegments
      allowImages
      allowWeights
      allowCustomDesign
      allowStatistics
    }
    me {
      id
      email
      name
      plan
      planExpiresAt
    }
  }
`;

const UPGRADE_TO_PRO = gql`
  mutation UpgradeToPro($period: String!) {
    upgradeToPro(period: $period) {
      id
      plan
      status
      amount
      period
      startDate
      endDate
    }
  }
`;

export default function TestPricingPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [isUpgrading, setIsUpgrading] = useState(false);

  const { data, loading, error, refetch } = useQuery(GET_PLAN_LIMITS);
  const [upgradeToPro] = useMutation(UPGRADE_TO_PRO);

  const handleUpgrade = async () => {
    try {
      setIsUpgrading(true);
      const result = await upgradeToPro({
        variables: { period: selectedPeriod }
      });
      
      console.log('Upgrade result:', result);
      
      // Обновляем данные пользователя
      await refetch();
      
      alert('Поздравляем! Вы успешно обновились до PRO тарифа!');
    } catch (error: any) {
      console.error('Ошибка при обновлении тарифа:', error);
      alert('Ошибка при обновлении тарифа: ' + error.message);
    } finally {
      setIsUpgrading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Ошибка загрузки</h2>
          <p className="text-gray-600 mb-6">{error.message}</p>
          <Link
            href="/dashboard"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Вернуться в дашборд
          </Link>
        </div>
      </div>
    );
  }

  const currentPlan = data?.me?.plan || 'FREE';
  const planExpiresAt = data?.me?.planExpiresAt;
  const limits = data?.planLimits;
  const user = data?.me;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">G</span>
              </div>
              <Link href="/" className="text-2xl font-bold text-gray-900">
                GIFTY
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Дашборд
              </Link>
              <Link
                href="/pricing"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Тарифы
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Тестирование системы монетизации</h1>
          <p className="text-gray-600">Проверка работы тарифных планов и лимитов</p>
        </div>

        {/* User Info */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Информация о пользователе</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p><strong>ID:</strong> {user?.id}</p>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Имя:</strong> {user?.name || 'Не указано'}</p>
            </div>
            <div>
              <p><strong>Текущий план:</strong> <span className={`font-semibold ${currentPlan === 'PRO' ? 'text-green-600' : 'text-blue-600'}`}>{currentPlan}</span></p>
              {planExpiresAt && (
                <p><strong>Действует до:</strong> {new Date(planExpiresAt).toLocaleDateString('ru-RU')}</p>
              )}
            </div>
          </div>
        </div>

        {/* Plan Limits */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Лимиты тарифного плана</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p><strong>Максимум рулеток:</strong> {limits?.maxWheels === -1 ? 'Безлимитно' : limits?.maxWheels}</p>
              <p><strong>Максимум сегментов:</strong> {limits?.maxSegments}</p>
              <p><strong>Изображения:</strong> {limits?.allowImages ? '✅ Да' : '❌ Нет'}</p>
            </div>
            <div>
              <p><strong>Веса призов:</strong> {limits?.allowWeights ? '✅ Да' : '❌ Нет'}</p>
              <p><strong>Кастомный дизайн:</strong> {limits?.allowCustomDesign ? '✅ Да' : '❌ Нет'}</p>
              <p><strong>Статистика:</strong> {limits?.allowStatistics ? '✅ Да' : '❌ Нет'}</p>
            </div>
          </div>
        </div>

        {/* Upgrade Section */}
        {currentPlan !== 'PRO' && (
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Обновление до PRO</h2>
            
            <div className="flex justify-center space-x-4 mb-6">
              <button
                onClick={() => setSelectedPeriod('MONTHLY')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  selectedPeriod === 'MONTHLY'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Месяц (400 ₽)
              </button>
              <button
                onClick={() => setSelectedPeriod('YEARLY')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors relative ${
                  selectedPeriod === 'YEARLY'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Год (4000 ₽)
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  -17%
                </span>
              </button>
            </div>

            <div className="text-center">
              <button
                onClick={handleUpgrade}
                disabled={isUpgrading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-8 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isUpgrading ? 'Обновление...' : `Обновиться до PRO (${selectedPeriod === 'MONTHLY' ? '400 ₽/мес' : '4000 ₽/год'})`}
              </button>
            </div>
          </div>
        )}

        {currentPlan === 'PRO' && (
          <div className="bg-green-50 rounded-xl shadow-lg p-6 mb-8 text-center">
            <div className="text-4xl mb-4">🎉</div>
            <h2 className="text-xl font-semibold text-green-800 mb-2">Поздравляем!</h2>
            <p className="text-green-700">У вас активен PRO тариф со всеми возможностями!</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-center space-x-4">
          <Link
            href="/dashboard"
            className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Вернуться в дашборд
          </Link>
          <Link
            href="/dashboard/create"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Создать рулетку
          </Link>
        </div>
      </div>
    </div>
  );
} 