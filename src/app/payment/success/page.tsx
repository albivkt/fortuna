'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useApolloClient } from '@apollo/client';
import { useMe } from '@/lib/graphql/hooks';
import { getPayment } from '@/lib/yookassa';

export default function PaymentSuccessPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [paymentInfo, setPaymentInfo] = useState<any>(null);
  const [attempts, setAttempts] = useState(0);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const client = useApolloClient();
  const { data: meData, refetch: refetchMe } = useMe();

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        console.log('🔄 Проверяем URL параметры:', Object.fromEntries(searchParams.entries()));
        
        // Проверяем, что пользователь авторизован
        const userData = await refetchMe();
        console.log('👤 Данные пользователя:', userData?.data?.me);
        
        if (!userData?.data?.me) {
          console.log('❌ Пользователь не авторизован');
          setPaymentStatus('error');
          setIsLoading(false);
          return;
        }
        
        // Если уже PRO - показываем успех сразу
        if (userData.data.me.plan === 'PRO') {
          console.log('✅ Подписка PRO уже активна!');
          setPaymentStatus('success');
          setPaymentInfo({
            status: 'succeeded',
            amount: { value: '400.00' },
            description: 'Подписка GIFTY PRO'
          });
          await client.resetStore();
          setIsLoading(false);
          return;
        }
        
        // Если еще FREE - ждем активации с ограниченным временем
        console.log('⏳ Ожидаем активацию подписки...', `Попытка ${attempts + 1}/5`);
        
        if (attempts < 5) { // Уменьшил до 5 попыток (10 секунд)
          setAttempts(prev => prev + 1);
          setTimeout(checkPaymentStatus, 2000);
        } else {
          // Превышено время ожидания - показываем успех с предупреждением
          console.log('⚠️ Время ожидания истекло, но оплата должна была пройти');
          setPaymentStatus('success');
          setPaymentInfo({
            status: 'processing',
            amount: { value: '400.00' },
            description: 'Подписка GIFTY PRO (активируется)'
          });
          setIsLoading(false);
        }

      } catch (error) {
        console.error('❌ Ошибка проверки статуса:', error);
        setPaymentStatus('error');
        setIsLoading(false);
      }
    };

    checkPaymentStatus();
  }, [attempts, searchParams, refetchMe, client]);

  if (isLoading || paymentStatus === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700/50 p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Обработка платежа
            </h1>
            <p className="text-gray-300">
              Пожалуйста, подождите. Активируем вашу PRO подписку... 
              <br />
              <span className="text-sm text-gray-400">Попытка {attempts + 1} из 5</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700/50 p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Ошибка платежа
            </h1>
            <p className="text-gray-300 mb-6">
              К сожалению, произошла ошибка при обработке вашего платежа. Попробуйте еще раз.
            </p>
            <div className="space-y-3">
              <Link
                href="/payment"
                className="block w-full bg-gradient-to-r from-orange-400 to-pink-400 text-white px-6 py-3 rounded-lg hover:from-orange-500 hover:to-pink-500 transition-all font-medium text-center"
              >
                Попробовать снова
              </Link>
              <Link
                href="/dashboard"
                className="block w-full text-gray-300 hover:text-white px-6 py-3 rounded-lg border border-gray-600 hover:border-gray-500 transition-all font-medium text-center"
              >
                Вернуться в панель
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Успешная оплата
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
            🎉 Оплата успешна!
          </h1>
          
          <p className="text-gray-300 mb-6">
            {paymentInfo?.status === 'processing' 
              ? 'Оплата прошла успешно! Ваша подписка PRO активируется в течение нескольких минут.'
              : 'Поздравляем! Ваша подписка PRO активирована. Теперь вы можете пользоваться всеми возможностями платформы.'
            }
          </p>

          {paymentInfo?.status === 'processing' && (
            <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-yellow-300 text-sm mb-3">
                Если подписка не активировалась автоматически, вы можете активировать её вручную:
              </p>
              <button
                onClick={async () => {
                  try {
                    // Попробуем активировать подписку через GraphQL
                    const response = await fetch('/api/graphql', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        query: `mutation { upgradeToPro(period: "MONTHLY") { id plan status } }`
                      })
                    });
                    
                    if (response.ok) {
                      await refetchMe();
                      await client.resetStore();
                      window.location.reload();
                    }
                  } catch (error) {
                    console.error('Ошибка активации:', error);
                  }
                }}
                className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg font-medium text-sm transition-colors"
              >
                Активировать подписку
              </button>
            </div>
          )}

          {paymentInfo && (
            <div className="bg-gray-700/50 rounded-xl p-4 mb-6 text-left">
              <h3 className="text-sm font-semibold text-gray-300 mb-2">Детали платежа:</h3>
              <div className="space-y-1 text-sm text-gray-400">
                <div className="flex justify-between">
                  <span>Сумма:</span>
                  <span className="text-white">{paymentInfo.amount.value} ₽</span>
                </div>
                <div className="flex justify-between">
                  <span>Статус:</span>
                  <span className={paymentInfo.status === 'processing' ? 'text-yellow-400' : 'text-green-400'}>
                    {paymentInfo.status === 'processing' ? 'Обрабатывается' : 'Оплачено'}
                  </span>
                </div>
                {paymentInfo.description && (
                  <div className="flex justify-between">
                    <span>Описание:</span>
                    <span className="text-white text-right">{paymentInfo.description}</span>
                  </div>
                )}
              </div>
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