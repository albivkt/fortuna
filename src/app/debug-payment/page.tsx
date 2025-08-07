'use client';

import { useState } from 'react';
import { useMe } from '@/lib/graphql/hooks';
import { useMutation } from '@apollo/client';
import { CREATE_PAYMENT } from '@/lib/graphql/queries';

export default function DebugPaymentPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { data: meData, refetch: refetchMe } = useMe();
  
  const [createPayment] = useMutation(CREATE_PAYMENT);

  const testWebhook = async () => {
    setLoading(true);
    setResult('');
    
    if (!meData?.me?.id) {
      setResult('❌ Пользователь не авторизован');
      setLoading(false);
      return;
    }

    try {
      // Симулируем webhook от ЮKassa
      const testWebhookData = {
        type: 'notification',
        event: 'payment.succeeded',
        object: {
          id: `test-payment-${Date.now()}`,
          status: 'succeeded',
          amount: {
            value: '400.00',
            currency: 'RUB'
          },
          metadata: {
            userId: meData.me.id,
            plan: 'PRO',
            period: 'MONTHLY',
            userEmail: meData.me.email || 'test@example.com'
          }
        }
      };

      console.log('🔄 Отправляем тестовый webhook:', testWebhookData);

      const response = await fetch('/api/yookassa/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testWebhookData)
      });

      const responseText = await response.text();
      console.log('📋 Ответ webhook:', responseText);

      if (response.ok) {
        setResult('✅ Webhook обработан успешно!\n' + responseText);
        
        // Обновляем данные пользователя
        setTimeout(async () => {
          await refetchMe();
          const updatedData = await refetchMe();
          console.log('👤 Обновленные данные:', updatedData?.data?.me);
          
          if (updatedData?.data?.me?.plan === 'PRO') {
            setResult(prev => prev + '\n\n✅ Подписка PRO активирована!');
          } else {
            setResult(prev => prev + '\n\n⚠️ Подписка не активировалась. План: ' + updatedData?.data?.me?.plan);
          }
        }, 1000);
      } else {
        setResult('❌ Ошибка webhook: ' + response.status + '\n' + responseText);
      }

    } catch (error) {
      console.error('❌ Ошибка:', error);
      setResult('❌ Ошибка: ' + (error instanceof Error ? error.message : 'Неизвестная ошибка'));
    }
    
    setLoading(false);
  };

  const testGraphQLPayment = async () => {
    setLoading(true);
    try {
      console.log('🔄 Тест создания платежа через GraphQL...');
      
      const response = await createPayment({
        variables: { period: 'MONTHLY' }
      });
      
      console.log('📋 GraphQL ответ создания платежа:', response);
      
      if (response.data?.createPayment) {
        setResult('✅ Платеж создан через GraphQL!\n' + JSON.stringify(response.data.createPayment, null, 2));
      }
    } catch (error) {
      console.error('❌ Ошибка GraphQL платежа:', error);
      setResult('❌ Ошибка GraphQL платежа: ' + (error instanceof Error ? error.message : 'Неизвестная ошибка'));
    }
    setLoading(false);
  };

  const manualUpgrade = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `mutation { upgradeToPro(period: "MONTHLY") { id plan status amount } }`
        })
      });
      
      const data = await response.json();
      console.log('📋 GraphQL ответ:', data);
      
      if (data.data?.upgradeToPro) {
        setResult('✅ Подписка активирована через GraphQL!\n' + JSON.stringify(data.data.upgradeToPro, null, 2));
        await refetchMe();
      } else {
        setResult('❌ Ошибка GraphQL: ' + JSON.stringify(data.errors || data, null, 2));
      }
    } catch (error) {
      setResult('❌ Ошибка: ' + (error instanceof Error ? error.message : 'Неизвестная ошибка'));
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔧 Диагностика платежей</h1>
        
        <div className="bg-gray-800 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-bold mb-4">Информация о пользователе:</h2>
          <div className="space-y-2 text-gray-300">
            <p><strong>ID:</strong> {meData?.me?.id || 'Не авторизован'}</p>
            <p><strong>Email:</strong> {meData?.me?.email || 'Не указан'}</p>
            <p><strong>План:</strong> {meData?.me?.plan || 'Не определен'}</p>
            <p><strong>Истекает:</strong> {meData?.me?.planExpiresAt ? new Date(meData.me.planExpiresAt).toLocaleString('ru-RU') : 'Не указано'}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <button
            onClick={testWebhook}
            disabled={loading || !meData?.me?.id}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium disabled:opacity-50"
          >
            {loading ? 'Тестируем...' : '🧪 Тест Webhook'}
          </button>

          <button
            onClick={testGraphQLPayment}
            disabled={loading || !meData?.me?.id}
            className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-medium disabled:opacity-50"
          >
            {loading ? 'Создаем...' : '🚀 GraphQL Платеж'}
          </button>

          <button
            onClick={manualUpgrade}
            disabled={loading || !meData?.me?.id}
            className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-medium disabled:opacity-50"
          >
            {loading ? 'Активируем...' : '⚡ Ручная активация'}
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

        <div className="mt-8 bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Возможные причины проблемы:</h2>
          <ul className="space-y-2 text-gray-300">
            <li>• <strong>Webhook не настроен</strong> - ЮKassa не отправляет уведомления</li>
            <li>• <strong>Неправильный URL</strong> - webhook URL недоступен для ЮKassa</li>
            <li>• <strong>Ошибка в метаданных</strong> - userId не передается или неверный</li>
            <li>• <strong>Проблема с БД</strong> - пользователь не найден или ошибка обновления</li>
            <li>• <strong>Тестовый режим</strong> - webhook может не работать в тестовом режиме</li>
          </ul>
        </div>

        <div className="mt-6 bg-yellow-900/20 border border-yellow-600/30 p-4 rounded-lg">
          <h3 className="text-yellow-300 font-bold mb-2">💡 Рекомендации:</h3>
          <ul className="space-y-1 text-yellow-200 text-sm">
            <li>1. Сначала нажмите "Тест Webhook" для проверки логики</li>
            <li>2. Если тест прошел успешно - проблема в настройке ЮKassa</li>
            <li>3. Если тест не прошел - проблема в коде webhook'а</li>
            <li>4. Используйте "Ручная активация" для немедленной активации</li>
          </ul>
        </div>
      </div>
    </div>
  );
}