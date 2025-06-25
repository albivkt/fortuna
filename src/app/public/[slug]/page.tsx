'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { GET_WHEEL_BY_SLUG, SPIN_WHEEL_BY_SLUG } from '@/lib/graphql/queries';
import { PublicWheel } from '@/components/PublicWheel';
import { formatDateSafely } from '@/lib/dateUtils';

export default function PublicWheelPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [participant, setParticipant] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);

  const { data, loading, error, refetch } = useQuery(GET_WHEEL_BY_SLUG, {
    variables: { slug },
    skip: !slug,
  });

  const [spinWheelBySlug] = useMutation(SPIN_WHEEL_BY_SLUG, {
    onCompleted: (data) => {
      console.log('✅ Spin completed:', data.spinWheelBySlug);
      setLastResult(data.spinWheelBySlug.result);
      setIsSpinning(false);
      // Обновляем данные рулетки чтобы показать новый спин
      refetch();
    },
    onError: (error) => {
      console.error('❌ Spin error:', error);
      setIsSpinning(false);
      alert('Ошибка при вращении рулетки: ' + error.message);
    },
  });

  const wheel = data?.wheelBySlug;

  const handleSpin = async (result: string) => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    setLastResult(null);

    try {
      await spinWheelBySlug({
        variables: {
          slug,
          result,
          participant: participant.trim() || undefined,
        },
      });
    } catch (error) {
      console.error('Spin error:', error);
      setIsSpinning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка рулетки...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Рулетка не найдена</h1>
          <p className="text-gray-600 mb-6">
            {error.message.includes('not found') 
              ? 'Рулетка с такой ссылкой не существует или была удалена.'
              : 'Произошла ошибка при загрузке рулетки.'}
          </p>
          <Link 
            href="/" 
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            На главную
          </Link>
        </div>
      </div>
    );
  }

  if (!wheel) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Рулетка не найдена</p>
        </div>
      </div>
    );
  }

  if (!wheel.allowGuestSpin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-yellow-500 text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Доступ ограничен</h1>
          <p className="text-gray-600 mb-6">
            Создатель этой рулетки не разрешил гостям её использовать.
          </p>
          <Link 
            href="/" 
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            На главную
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">G</span>
                </div>
                <span className="text-2xl font-bold text-gray-900">GIFTY</span>
              </Link>
              <span className="text-gray-400">•</span>
              <span className="text-gray-600">Публичная рулетка</span>
            </div>
            <Link 
              href="/register" 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Создать свою рулетку
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Левая колонка - Информация о рулетке */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{wheel.title}</h1>
              {wheel.description && (
                <p className="text-gray-600 mb-4">{wheel.description}</p>
              )}
              <div className="text-sm text-gray-500">
                <p>Создано: {wheel.user?.name || 'Пользователь'}</p>
                <p>Дата: {formatDateSafely(wheel.createdAt)}</p>
              </div>
            </div>

            {/* Форма участника */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Участие</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="participant" className="block text-sm font-medium text-gray-700 mb-2">
                    Ваше имя (необязательно)
                  </label>
                  <input
                    type="text"
                    id="participant"
                    value={participant}
                    onChange={(e) => setParticipant(e.target.value)}
                    placeholder="Введите ваше имя"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                    disabled={isSpinning}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Если не указать имя, вы будете отображаться как "Гость"
                </p>
              </div>
            </div>

            {/* Последний результат */}
            {lastResult && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-green-800 mb-2">🎉 Результат</h3>
                <p className="text-green-700 font-medium">{lastResult}</p>
                {participant && (
                  <p className="text-green-600 text-sm mt-1">Участник: {participant}</p>
                )}
              </div>
            )}
          </div>

          {/* Правая колонка - Рулетка */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <PublicWheel
                segments={wheel.segments || []}
                onSpin={handleSpin}
                isSpinning={isSpinning}
                disabled={isSpinning}
                customDesign={wheel.customDesign}
                isPro={wheel.user?.plan === 'pro'}
              />
            </div>
          </div>
        </div>

        {/* История вращений */}
        {wheel.spins && wheel.spins.length > 0 && (
          <div className="mt-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">История вращений</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {wheel.spins.slice(0, 10).map((spin: any) => (
                  <div key={spin.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div>
                      <span className="font-medium text-gray-900">{spin.result}</span>
                      {spin.participant && (
                        <span className="text-gray-500 text-sm ml-2">• {spin.participant}</span>
                      )}
                    </div>
                    <span className="text-gray-400 text-sm">
                      {new Date(spin.createdAt).toLocaleString('ru-RU')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 