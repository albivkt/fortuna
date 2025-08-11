'use client';

import { useState } from 'react';
import { useMe } from '@/lib/graphql/hooks';
import { useMutation } from '@apollo/client';
import { UPGRADE_TO_PRO } from '@/lib/graphql/queries';

export default function ManualActivationPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { data: meData, refetch: refetchMe } = useMe();
  
  const [upgradeToPro] = useMutation(UPGRADE_TO_PRO);

  const activateSubscription = async (period: string) => {
    setLoading(true);
    setResult('');
    
    try {
      console.log('🔄 Ручная активация подписки...');
      
      const response = await upgradeToPro({
        variables: { period }
      });
      
      console.log('📋 GraphQL ответ:', response);
      
      if (response.data?.upgradeToPro) {
        setResult('✅ Подписка активирована вручную!\n' + JSON.stringify(response.data.upgradeToPro, null, 2));
        await refetchMe();
      } else {
        setResult('❌ Ошибка GraphQL: ' + JSON.stringify(response.errors || response, null, 2));
      }
    } catch (error) {
      console.error('❌ Ошибка активации:', error);
      setResult('❌ Ошибка: ' + (error instanceof Error ? error.message : 'Неизвестная ошибка'));
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔧 Ручная активация подписки</h1>
        
        <div className="bg-gray-800 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-bold mb-4">Текущий статус:</h2>
          <div className="space-y-2">
            <p><strong>Email:</strong> {meData?.me?.email || 'Не определен'}</p>
            <p><strong>План:</strong> {meData?.me?.plan || 'Не определен'}</p>
            <p><strong>Истекает:</strong> {meData?.me?.planExpiresAt ? new Date(meData.me.planExpiresAt).toLocaleString('ru-RU') : 'Не указано'}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => activateSubscription('MONTHLY')}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium disabled:opacity-50"
          >
            {loading ? 'Активируем...' : '⚡ Активировать месячную'}
          </button>

          <button
            onClick={() => activateSubscription('YEARLY')}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-medium disabled:opacity-50"
          >
            {loading ? 'Активируем...' : '⚡ Активировать годовую'}
          </button>
        </div>

        {result && (
          <div className="bg-gray-800 p-4 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Результат:</h2>
            <pre className="text-sm overflow-auto whitespace-pre-wrap">
              {result}
            </pre>
          </div>
        )}

        <div className="mt-8 bg-yellow-900/30 border border-yellow-600/30 rounded-lg p-4">
          <h3 className="text-lg font-bold text-yellow-400 mb-2">⚠️ Внимание</h3>
          <p className="text-yellow-200">
            Эта страница предназначена для ручной активации подписки в случае проблем с webhook от ЮKassa. 
            Используйте только если оплата прошла успешно, но подписка не активировалась автоматически.
          </p>
        </div>
      </div>
    </div>
  );
} 