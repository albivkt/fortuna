'use client';

import { useState } from 'react';

export default function TestWebhookPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testWebhook = async () => {
    setLoading(true);
    try {
      const testData = {
        type: 'notification',
        event: 'payment.succeeded',
        object: {
          id: 'test-payment-id',
          status: 'succeeded',
          amount: {
            value: '400.00',
            currency: 'RUB'
          },
          metadata: {
            userId: 'test-user-id',
            plan: 'PRO',
            period: 'MONTHLY'
          }
        }
      };

      const response = await fetch('/api/yookassa/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      });

      const result = await response.json();
      setResult(JSON.stringify(result, null, 2));
    } catch (error) {
      setResult('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Тест Webhook ЮKassa</h1>
        
        <button
          onClick={testWebhook}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium disabled:opacity-50"
        >
          {loading ? 'Отправка...' : 'Тестировать Webhook'}
        </button>

        {result && (
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Результат:</h2>
            <pre className="bg-gray-800 p-4 rounded-lg overflow-auto">
              {result}
            </pre>
          </div>
        )}

        <div className="mt-8 bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Информация:</h2>
          <ul className="space-y-2 text-gray-300">
            <li>• Webhook URL: <code>/api/yookassa/webhook</code></li>
            <li>• Этот тест симулирует успешный платеж</li>
            <li>• Проверьте консоль браузера для логов</li>
            <li>• В продакшене webhook будет вызываться ЮKassa автоматически</li>
          </ul>
        </div>
      </div>
    </div>
  );
}