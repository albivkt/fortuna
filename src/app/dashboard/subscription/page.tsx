'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser, updateUser, type User } from '@/lib/user';

export default function SubscriptionPage() {
  const [user, setUser] = useState<User | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const userData = getCurrentUser();
    if (userData) {
      setUser(userData);
    } else {
      router.push('/login');
    }
  }, [router]);

  const handleUpgradeToPro = async () => {
    if (!user) return;

    setIsProcessing(true);
    
    try {
      // Симуляция процесса оплаты
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Обновляем план пользователя
      const updatedUser = updateUser({ plan: 'pro' });
      if (updatedUser) {
        setUser(updatedUser);
        alert('Поздравляем! Вы успешно обновились до PRO плана!');
        router.push('/dashboard');
      }
    } catch (error) {
      alert('Произошла ошибка при обработке платежа. Попробуйте еще раз.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDowngradeToFree = () => {
    if (!user) return;

    if (confirm('Вы уверены, что хотите перейти на бесплатный план? Вы потеряете доступ к PRO функциям.')) {
      const updatedUser = updateUser({ plan: 'free' });
      if (updatedUser) {
        setUser(updatedUser);
        alert('Вы успешно перешли на бесплатный план.');
      }
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">G</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">GIFTY</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                ← Назад к дашборду
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Current Plan Status */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Управление подпиской</h1>
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-white shadow-sm">
            <div className={`w-3 h-3 rounded-full mr-3 ${user.plan === 'pro' ? 'bg-purple-500' : 'bg-gray-400'}`}></div>
            <span className="text-lg font-medium text-gray-900">
              Текущий план: {user.plan === 'pro' ? 'PRO' : 'Бесплатный'}
            </span>
          </div>
        </div>

        {/* Pricing Plans */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* Free Plan */}
          <div className={`bg-white rounded-2xl shadow-lg p-8 border-2 ${user.plan === 'free' ? 'border-blue-500' : 'border-gray-200'}`}>
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Бесплатный</h3>
              <div className="text-4xl font-bold text-gray-900 mb-2">0₽</div>
              <p className="text-gray-600">навсегда</p>
            </div>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">До 3 рулеток</span>
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">До 6 сегментов</span>
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">Базовые настройки</span>
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="text-gray-500">Без изображений призов</span>
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="text-gray-500">Без статистики</span>
              </li>
            </ul>

            {user.plan === 'free' ? (
              <div className="text-center">
                <div className="bg-blue-100 text-blue-700 px-6 py-3 rounded-lg font-medium">
                  Текущий план
                </div>
              </div>
            ) : (
              <button
                onClick={handleDowngradeToFree}
                className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Перейти на бесплатный
              </button>
            )}
          </div>

          {/* PRO Monthly Plan */}
          <div className={`bg-white rounded-2xl shadow-lg p-8 border-2 relative ${user.plan === 'pro' ? 'border-purple-500' : 'border-gray-200'}`}>
            {user.plan !== 'pro' && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-purple-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                  Популярный
                </span>
              </div>
            )}
            
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">PRO Месячный</h3>
              <div className="text-4xl font-bold text-purple-600 mb-2">400₽</div>
              <p className="text-gray-600">в месяц</p>
            </div>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">Безлимитное создание рулеток</span>
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">До 20 сегментов</span>
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">Изображения призов</span>
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">Расширенные настройки дизайна</span>
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">Настройка веса призов</span>
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">Статистика розыгрышей</span>
              </li>
            </ul>

            {user.plan === 'pro' ? (
              <div className="text-center">
                <div className="bg-purple-100 text-purple-700 px-6 py-3 rounded-lg font-medium">
                  Текущий план
                </div>
              </div>
            ) : (
              <button
                onClick={handleUpgradeToPro}
                disabled={isProcessing}
                className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Обработка...
                  </div>
                ) : (
                  'Обновить до PRO - 400₽/мес'
                )}
              </button>
            )}
          </div>

          {/* PRO Yearly Plan */}
          <div className={`bg-white rounded-2xl shadow-lg p-8 border-2 relative ${user.plan === 'pro' ? 'border-purple-500' : 'border-gray-200'}`}>
            {user.plan !== 'pro' && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                  Выгодно
                </span>
              </div>
            )}
            
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">PRO Годовой</h3>
              <div className="text-4xl font-bold text-purple-600 mb-2">4000₽</div>
              <p className="text-gray-600">в год</p>
              <p className="text-sm text-green-600 font-medium mt-1">
                Экономия 17% (333₽/мес)
              </p>
            </div>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">Безлимитное создание рулеток</span>
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">До 20 сегментов</span>
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">Изображения призов</span>
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">Расширенные настройки дизайна</span>
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">Настройка веса призов</span>
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">Статистика розыгрышей</span>
              </li>
            </ul>

            {user.plan === 'pro' ? (
              <div className="text-center">
                <div className="bg-purple-100 text-purple-700 px-6 py-3 rounded-lg font-medium">
                  Текущий план
                </div>
              </div>
            ) : (
              <button
                onClick={handleUpgradeToPro}
                disabled={isProcessing}
                className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Обработка...
                  </div>
                ) : (
                  'Обновить до PRO - 4000₽/год'
                )}
              </button>
            )}
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Часто задаваемые вопросы</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Можно ли отменить подписку?</h3>
              <p className="text-gray-600">Да, вы можете отменить подписку в любое время. После отмены вы сохраните доступ к PRO функциям до конца оплаченного периода.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Что происходит с моими рулетками при переходе на бесплатный план?</h3>
              <p className="text-gray-600">Все ваши рулетки сохранятся, но вы сможете создавать новые только в рамках лимитов бесплатного плана (до 3 рулеток).</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Есть ли скидка при годовой оплате?</h3>
              <p className="text-gray-600">Да, при выборе годового плана вы экономите 17% по сравнению с ежемесячной оплатой.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 