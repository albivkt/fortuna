'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useMutation, useApolloClient } from '@apollo/client';
import { gql } from '@apollo/client';
import { useMe } from '@/lib/graphql/hooks';
import { updateUser } from '@/lib/user';

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

function PaymentPageContent() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    email: '',
    phone: ''
  });
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const client = useApolloClient();
  
  // Получаем параметры из URL
  const period = searchParams.get('period') || 'MONTHLY';
  const amount = period === 'YEARLY' ? 4000 : 400;
  const periodText = period === 'YEARLY' ? 'годовая' : 'месячная';

  const { data: meData, loading: meLoading } = useMe();
  
  const [upgradeToPro] = useMutation(UPGRADE_TO_PRO, {
    onCompleted: (data) => {
      console.log('✅ PRO upgrade completed:', data);
      
      // Обновляем localStorage для совместимости
      updateUser({ plan: 'pro' });
      
      // Очищаем весь кэш Apollo для обновления всех компонентов
      client.resetStore().then(() => {
        console.log('🔄 Apollo cache reset after PRO upgrade');
      });
      
      alert('🎉 Поздравляем! Оплата прошла успешно. Вы получили PRO подписку!');
      router.push('/dashboard');
    },
    onError: (error) => {
      console.error('❌ Error upgrading to PRO:', error);
      alert('Ошибка при активации подписки: ' + error.message);
    }
  });

  useEffect(() => {
    // Проверяем авторизацию
    if (!meLoading && !meData?.me) {
      router.push('/login');
      return;
    }

    // Если пользователь уже PRO, перенаправляем в дашборд
    if (meData?.me?.plan === 'PRO') {
      router.push('/dashboard');
      return;
    }

    // Заполняем email из профиля пользователя
    if (meData?.me?.email) {
      setFormData(prev => ({
        ...prev,
        email: meData.me.email
      }));
    }
  }, [meData, meLoading, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!meData?.me) {
      alert('Необходимо войти в аккаунт');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Симуляция процесса оплаты
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // После "успешной оплаты" активируем PRO подписку
      await upgradeToPro({
        variables: { period }
      });
      
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Произошла ошибка при обработке платежа. Попробуйте еще раз.');
      setIsProcessing(false);
    }
  };

  if (meLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%), 
                           radial-gradient(circle at 75% 75%, rgba(255,255,255,0.05) 0%, transparent 50%)`
        }}></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-gray-800/50 backdrop-blur-sm border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <Link href="/" className="text-2xl font-bold text-white">
                GIFTY
              </Link>
              <span className="text-sm text-gray-400">оплата</span>
            </div>
            <Link
              href="/pricing"
              className="text-gray-300 hover:text-white font-medium transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Назад</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-4">Оплата PRO подписки</h1>
            <p className="text-gray-300">
              Завершите покупку и получите доступ ко всем премиум возможностям
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-700/50">
              <h2 className="text-xl font-bold text-white mb-6">Детали заказа</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Тариф</span>
                  <span className="text-white font-medium">PRO ({periodText})</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Период</span>
                  <span className="text-white">{period === 'YEARLY' ? '12 месяцев' : '1 месяц'}</span>
                </div>
                {period === 'YEARLY' && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Скидка</span>
                    <span className="text-green-400">-17%</span>
                  </div>
                )}
                <hr className="border-gray-700" />
                <div className="flex justify-between items-center text-lg">
                  <span className="text-white font-medium">Итого</span>
                  <span className="text-white font-bold">{amount} ₽</span>
                </div>
              </div>

              <div className="bg-gray-700/30 rounded-lg p-4">
                <h3 className="text-white font-medium mb-3">Что входит в PRO:</h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center">
                    <svg className="w-4 h-4 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Безлимитное создание рулеток
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    До 20 сегментов на рулетку
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Изображения призов
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Настройка весов призов
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Статистика розыгрышей
                  </li>
                </ul>
              </div>
            </div>

            {/* Payment Form */}
            <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-700/50">
              <h2 className="text-xl font-bold text-white mb-6">Способ оплаты</h2>
              
              <form onSubmit={handlePayment} className="space-y-6">
                {/* Payment Method Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Выберите способ оплаты
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-3"
                      />
                      <span className="text-gray-300">Банковская карта</span>
                    </label>
                  </div>
                </div>

                {/* Card Details */}
                {paymentMethod === 'card' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Номер карты
                      </label>
                      <input
                        type="text"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        placeholder="1234 5678 9012 3456"
                        className="w-full px-3 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Срок действия
                        </label>
                        <input
                          type="text"
                          name="expiryDate"
                          value={formData.expiryDate}
                          onChange={handleInputChange}
                          placeholder="MM/YY"
                          className="w-full px-3 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          CVV
                        </label>
                        <input
                          type="text"
                          name="cvv"
                          value={formData.cvv}
                          onChange={handleInputChange}
                          placeholder="123"
                          className="w-full px-3 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Имя держателя карты
                      </label>
                      <input
                        type="text"
                        name="cardholderName"
                        value={formData.cardholderName}
                        onChange={handleInputChange}
                        placeholder="IVAN IVANOV"
                        className="w-full px-3 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
                        required
                      />
                    </div>
                  </>
                )}

                {/* Contact Information */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email для чека
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Телефон (опционально)
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+7 (999) 123-45-67"
                    className="w-full px-3 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>

                {/* Pay Button */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-orange-400 to-pink-400 text-white py-4 px-6 rounded-lg font-bold text-lg hover:from-orange-500 hover:to-pink-500 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                      Обработка платежа...
                    </div>
                  ) : (
                    `Оплатить ${amount} ₽`
                  )}
                </button>

                <div className="text-center">
                  <p className="text-xs text-gray-400">
                    Нажимая кнопку "Оплатить", вы соглашаетесь с условиями использования и политикой конфиденциальности
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Загрузка...</div>
      </div>
    }>
      <PaymentPageContent />
    </Suspense>
  );
} 