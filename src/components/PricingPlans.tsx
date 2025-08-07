'use client';

import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { PLAN_PRICES } from '@/lib/planLimits';

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
      plan
      planExpiresAt
    }
  }
`;



interface PricingPlansProps {
  onClose?: () => void;
}

export default function PricingPlans({ onClose }: PricingPlansProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const router = useRouter();

  const { data, loading, refetch } = useQuery(GET_PLAN_LIMITS, {
    errorPolicy: 'ignore' // Игнорируем ошибки GraphQL для отображения статичной версии
  });

  const handleUpgrade = () => {
    // Перенаправляем на страницу оплаты с выбранным периодом
    router.push(`/payment?period=${selectedPeriod}`);
  };

  // Показываем статичную версию, если данные не загружены
  const currentPlan = data?.me?.plan || 'FREE';
  const planExpiresAt = data?.me?.planExpiresAt;
  const limits = data?.planLimits;

  const monthlyPrice = PLAN_PRICES.PRO.MONTHLY / 100; // конвертируем из копеек в рубли
  const yearlyPrice = PLAN_PRICES.PRO.YEARLY / 100; // конвертируем из копеек в рубли
  const yearlyMonthlyPrice = Math.round(yearlyPrice / 12);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">Выберите тарифный план</h2>
        <p className="text-gray-300">
          Текущий план: <span className="font-semibold bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">{currentPlan}</span>
          {planExpiresAt && (
            <span className="text-sm text-gray-400 ml-2">
              (до {new Date(planExpiresAt).toLocaleDateString('ru-RU')})
            </span>
          )}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        {/* FREE Plan */}
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border-2 border-gray-700/50 hover:border-gray-600/50 transition-all">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">Бесплатный</h3>
            <div className="text-3xl font-bold text-white">0 ₽</div>
            <div className="text-gray-400">навсегда</div>
          </div>

          <ul className="space-y-3 mb-6">
            <li className="flex items-center">
              <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-300">До 3 рулеток</span>
            </li>
            <li className="flex items-center">
              <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-300">Максимум 6 сегментов</span>
            </li>
            <li className="flex items-center">
              <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-300">Базовые цвета</span>
            </li>
            <li className="flex items-center text-gray-500">
              <svg className="w-5 h-5 text-gray-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              <span>Нет изображений</span>
            </li>
            <li className="flex items-center text-gray-500">
              <svg className="w-5 h-5 text-gray-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              <span>Нет весов призов</span>
            </li>
          </ul>

          {currentPlan === 'FREE' && (
            <div className="text-center">
              <div className="bg-gray-700/50 text-gray-300 px-4 py-2 rounded-lg font-medium border border-gray-600/50">
                Текущий план
              </div>
            </div>
          )}
        </div>

        {/* PRO Plan */}
        <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border-2 border-orange-400/30 relative hover:border-orange-400/50 transition-all">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <span className="bg-gradient-to-r from-orange-400 to-pink-400 text-white px-4 py-1 rounded-full text-sm font-medium shadow-lg">
              Рекомендуем
            </span>
          </div>

          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">PRO</h3>
            <div className="mb-4">
              <div className="flex justify-center space-x-4 mb-4">
                <button
                  onClick={() => setSelectedPeriod('MONTHLY')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedPeriod === 'MONTHLY'
                      ? 'bg-gradient-to-r from-orange-400 to-pink-400 text-white shadow-lg'
                      : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 border border-gray-600/50'
                  }`}
                >
                  Месяц
                </button>
                <button
                  onClick={() => setSelectedPeriod('YEARLY')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all relative ${
                    selectedPeriod === 'YEARLY'
                      ? 'bg-gradient-to-r from-orange-400 to-pink-400 text-white shadow-lg'
                      : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 border border-gray-600/50'
                  }`}
                >
                  Год
                  <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    -17%
                  </span>
                </button>
              </div>
              
              {selectedPeriod === 'MONTHLY' ? (
                <div>
                  <div className="text-3xl font-bold text-white">{monthlyPrice} ₽</div>
                  <div className="text-gray-400">в месяц</div>
                </div>
              ) : (
                <div>
                  <div className="text-3xl font-bold text-white">{yearlyPrice} ₽</div>
                  <div className="text-gray-400">в год (~{yearlyMonthlyPrice} ₽/мес)</div>
                </div>
              )}
            </div>
          </div>

          <ul className="space-y-3 mb-6">
            <li className="flex items-center">
              <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-300">Безлимитное создание рулеток</span>
            </li>
            <li className="flex items-center">
              <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-300">До 20 сегментов на рулетку</span>
            </li>
            <li className="flex items-center">
              <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-300">Изображения призов</span>
            </li>
            <li className="flex items-center">
              <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-300">Веса призов</span>
            </li>
            <li className="flex items-center">
              <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-300">Расширенные настройки дизайна</span>
            </li>
            <li className="flex items-center">
              <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-300">Статистика розыгрышей</span>
            </li>
          </ul>

          {currentPlan === 'PRO' ? (
            <div className="text-center">
              <div className="bg-green-500/20 text-green-400 px-4 py-2 rounded-lg font-medium border border-green-500/30">
                Текущий план
              </div>
            </div>
          ) : (
            <button
              onClick={handleUpgrade}
              className="w-full bg-gradient-to-r from-orange-400 to-pink-400 text-white py-3 px-6 rounded-lg font-medium hover:from-orange-500 hover:to-pink-500 transition-all transform hover:scale-105 shadow-lg"
            >
              Обновиться до PRO
            </button>
          )}
        </div>
      </div>

      {onClose && (
        <div className="text-center">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-300 font-medium transition-colors"
          >
            Закрыть
          </button>
        </div>
      )}
    </div>
  );
} 