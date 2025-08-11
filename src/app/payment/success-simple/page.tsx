'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useMe } from '@/lib/graphql/hooks';

export default function PaymentSuccessSimplePage() {
  const [showManualActivation, setShowManualActivation] = useState(false);
  const { data: meData, refetch: refetchMe } = useMe();

  useEffect(() => {
    // Показываем кнопку ручной активации через 5 секунд
    const timer = setTimeout(() => {
      setShowManualActivation(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleManualActivation = async () => {
    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `mutation { upgradeToPro(period: "MONTHLY") { id plan status } }`
        })
      });
      
      if (response.ok) {
        await refetchMe();
        alert('Подписка активирована!');
        window.location.href = '/dashboard';
      }
    } catch (error) {
      console.error('Ошибка активации:', error);
      alert('Ошибка активации. Обратитесь в поддержку.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
      <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700/50 p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-2">
            🎉 Оплата прошла успешно!
          </h1>
          
          <p className="text-gray-300 mb-6">
            Спасибо за оплату! Ваша подписка PRO активируется автоматически в течение нескольких минут.
          </p>

          {meData?.me?.plan === 'PRO' ? (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-green-300 font-medium">
                ✅ Подписка PRO активирована!
              </p>
            </div>
          ) : showManualActivation ? (
            <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-yellow-300 text-sm mb-3">
                Подписка еще не активировалась? Активируйте вручную:
              </p>
              <button
                onClick={handleManualActivation}
                className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg font-medium text-sm transition-colors"
              >
                Активировать PRO подписку
              </button>
            </div>
          ) : (
            <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-blue-300 text-sm">
                ⏳ Ожидаем активацию подписки...
              </p>
            </div>
          )}

          <div className="space-y-3">
            <Link
              href="/dashboard"
              className="block w-full bg-gradient-to-r from-orange-400 to-pink-400 text-white px-6 py-3 rounded-lg hover:from-orange-500 hover:to-pink-500 transition-all font-medium"
            >
              Перейти в панель управления
            </Link>
            <Link
              href="/manual-activation"
              className="block w-full text-blue-400 hover:text-blue-300 px-6 py-3 rounded-lg border border-blue-600 hover:border-blue-500 transition-all font-medium"
            >
              Диагностика подписки
            </Link>
            <Link
              href="/"
              className="block w-full text-gray-300 hover:text-white px-6 py-3 rounded-lg border border-gray-600 hover:border-gray-500 transition-all font-medium"
            >
              На главную
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}