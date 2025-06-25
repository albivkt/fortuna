'use client';

import { useState } from 'react';
import { useMe } from '@/lib/graphql/hooks';
import { useMutation, gql } from '@apollo/client';
import Link from 'next/link';

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

export default function TestProStatusPage() {
  const { data: meData, loading: meLoading, refetch } = useMe();
  const [upgrading, setUpgrading] = useState(false);

  const [upgradeToPro] = useMutation(UPGRADE_TO_PRO, {
    onCompleted: (data) => {
      console.log('✅ Plan upgraded:', data);
      alert('План успешно обновлен до PRO!');
      refetch(); // Обновляем данные пользователя
    },
    onError: (error) => {
      console.error('❌ Error upgrading plan:', error);
      alert('Ошибка при обновлении плана: ' + error.message);
    }
  });

  const handleUpgrade = async () => {
    setUpgrading(true);
    try {
      await upgradeToPro({
        variables: { period: 'MONTHLY' }
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setUpgrading(false);
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  if (meLoading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Тест статуса PRO плана</h1>
            <Link 
              href="/dashboard"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Вернуться в дашборд
            </Link>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Текущий статус */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Текущий статус пользователя</h2>
              
              {meData?.me ? (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium">ID:</span>
                    <span className="text-gray-600">{meData.me.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Имя:</span>
                    <span className="text-gray-600">{meData.me.name || 'Не указано'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Email:</span>
                    <span className="text-gray-600">{meData.me.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">План:</span>
                    <span className={`font-semibold ${
                      meData.me.plan === 'PRO' ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      {meData.me.plan || 'FREE'}
                    </span>
                  </div>
                  {meData.me.planExpiresAt && (
                    <div className="flex justify-between">
                      <span className="font-medium">Действует до:</span>
                      <span className="text-gray-600">
                        {new Date(meData.me.planExpiresAt).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">Пользователь не авторизован</p>
              )}
            </div>

            {/* Действия */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Действия</h2>
              
              <div className="space-y-4">
                <button
                  onClick={handleRefresh}
                  className="w-full bg-blue-500 text-white px-4 py-3 rounded hover:bg-blue-600 transition-colors"
                >
                  🔄 Обновить данные
                </button>

                <button
                  onClick={handleUpgrade}
                  disabled={upgrading || meData?.me?.plan === 'PRO'}
                  className="w-full bg-green-500 text-white px-4 py-3 rounded hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {upgrading ? 'Обновление...' : '⭐ Активировать PRO'}
                </button>

                {meData?.me?.plan === 'PRO' && (
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                    ✅ У вас активен PRO план!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Инструкции */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-3">📋 Инструкции для тестирования</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Проверьте текущий план пользователя (должен быть FREE)</li>
            <li>Нажмите "Активировать PRO" для обновления плана</li>
            <li>После успешной активации план должен измениться на PRO</li>
            <li>Нажмите "Обновить данные" для проверки синхронизации</li>
            <li>Вернитесь в дашборд и убедитесь, что:</li>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
              <li>Кнопка "Обновить до PRO" исчезла</li>
              <li>Показывается "План: PRO"</li>
              <li>Отображается дата окончания подписки</li>
            </ul>
          </ol>
        </div>

        {/* Отладочная информация */}
        <div className="bg-gray-50 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold mb-3">🔧 Отладочная информация</h3>
          <pre className="text-xs bg-white p-4 rounded border overflow-auto">
            {JSON.stringify(meData, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
} 