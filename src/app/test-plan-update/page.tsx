'use client';

import { useState } from 'react';
import { useMe } from '@/lib/graphql/hooks';
import { useMutation, gql } from '@apollo/client';

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

export default function TestPlanUpdatePage() {
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
    return <div className="p-8">Загрузка...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Тест обновления плана</h1>
        
        <div className="mb-6 p-4 bg-gray-50 rounded">
          <h2 className="text-lg font-semibold mb-2">Текущие данные пользователя:</h2>
          <pre className="text-sm">
            {JSON.stringify(meData?.me, null, 2)}
          </pre>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleRefresh}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Обновить данные
          </button>

          <button
            onClick={handleUpgrade}
            disabled={upgrading || meData?.me?.plan === 'PRO'}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {upgrading ? 'Обновление...' : 'Обновить до PRO'}
          </button>

          {meData?.me?.plan === 'PRO' && (
            <div className="text-green-600 font-semibold">
              ✅ У вас уже PRO план!
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-yellow-50 rounded">
          <h3 className="font-semibold mb-2">Инструкции:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Проверьте текущий план пользователя</li>
            <li>Нажмите "Обновить до PRO" если план не PRO</li>
            <li>После обновления нажмите "Обновить данные"</li>
            <li>Проверьте, что план изменился на PRO</li>
            <li>Вернитесь в дашборд и проверьте, что кнопка "Обновить до PRO" исчезла</li>
          </ol>
        </div>
      </div>
    </div>
  );
} 