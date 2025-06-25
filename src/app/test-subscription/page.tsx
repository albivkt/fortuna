'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { gql } from '@apollo/client';

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

export default function TestSubscriptionPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { data: planData, loading: planLoading, refetch } = useQuery(GET_PLAN_LIMITS, {
    errorPolicy: 'ignore'
  });
  
  const [upgradeToPro] = useMutation(UPGRADE_TO_PRO, {
    onCompleted: (data) => {
      console.log('✅ PRO upgrade completed:', data);
      alert('Поздравляем! Вы успешно обновились до PRO плана!');
      refetch();
    },
    onError: (error) => {
      console.error('❌ Error upgrading to PRO:', error);
      alert('Ошибка при обновлении до PRO: ' + error.message);
    }
  });

  const handleUpgradeToProMonthly = async () => {
    setIsProcessing(true);
    try {
      await upgradeToPro({
        variables: { period: 'MONTHLY' }
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpgradeToProYearly = async () => {
    setIsProcessing(true);
    try {
      await upgradeToPro({
        variables: { period: 'YEARLY' }
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const currentPlan = planData?.me?.plan || 'FREE';
  const planExpiresAt = planData?.me?.planExpiresAt;

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Тестирование системы подписок
        </h1>

        {/* Текущий статус */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Текущий статус</h2>
          
          {planLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-600">Загрузка...</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p><strong>План:</strong> <span className={`font-semibold ${currentPlan === 'PRO' ? 'text-green-600' : 'text-blue-600'}`}>{currentPlan}</span></p>
              {planExpiresAt && (
                <p><strong>Действует до:</strong> {new Date(planExpiresAt).toLocaleDateString('ru-RU')}</p>
              )}
              <p><strong>Пользователь:</strong> {planData?.me?.email || 'Не определен'}</p>
              <p><strong>ID:</strong> {planData?.me?.id || 'Не определен'}</p>
            </div>
          )}
        </div>

        {/* Лимиты плана */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Лимиты текущего плана</h2>
          
          {planData?.planLimits ? (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p><strong>Макс. рулеток:</strong> {planData.planLimits.maxWheels === -1 ? 'Безлимитно' : planData.planLimits.maxWheels}</p>
                <p><strong>Макс. сегментов:</strong> {planData.planLimits.maxSegments}</p>
                <p><strong>Изображения:</strong> {planData.planLimits.allowImages ? '✅ Да' : '❌ Нет'}</p>
              </div>
              <div>
                <p><strong>Веса призов:</strong> {planData.planLimits.allowWeights ? '✅ Да' : '❌ Нет'}</p>
                <p><strong>Кастомный дизайн:</strong> {planData.planLimits.allowCustomDesign ? '✅ Да' : '❌ Нет'}</p>
                <p><strong>Статистика:</strong> {planData.planLimits.allowStatistics ? '✅ Да' : '❌ Нет'}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-600">Лимиты не загружены</p>
          )}
        </div>

        {/* Кнопки активации */}
        {currentPlan !== 'PRO' && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Активировать PRO план</h2>
            
            <div className="space-y-4">
              <button
                onClick={handleUpgradeToProMonthly}
                disabled={isProcessing}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Обработка...' : 'Активировать PRO (месячный) - 400₽'}
              </button>
              
              <button
                onClick={handleUpgradeToProYearly}
                disabled={isProcessing}
                className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Обработка...' : 'Активировать PRO (годовой) - 4000₽'}
              </button>
            </div>
          </div>
        )}

        {currentPlan === 'PRO' && (
          <div className="bg-green-50 rounded-lg shadow-lg p-6 mb-8 text-center">
            <div className="text-4xl mb-4">🎉</div>
            <h2 className="text-xl font-semibold text-green-800 mb-2">Поздравляем!</h2>
            <p className="text-green-700">У вас активен PRO тариф со всеми возможностями!</p>
          </div>
        )}

        {/* Навигация */}
        <div className="text-center space-x-4">
          <a
            href="/dashboard"
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium inline-block"
          >
            Вернуться в дашборд
          </a>
          <a
            href="/dashboard/subscription"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium inline-block"
          >
            Страница подписки
          </a>
        </div>
      </div>
    </div>
  );
} 