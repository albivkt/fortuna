'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

import { useQuery } from '@apollo/client';
import { GET_PUBLIC_WHEELS } from '@/lib/graphql/queries';
import { formatDateSafely } from '@/lib/dateUtils';
import { useMe } from '@/lib/graphql/hooks';

// Динамический импорт для избежания SSR проблем
const Wheel = dynamic(
  () => import('react-custom-roulette').then((mod) => ({ default: mod.Wheel })),
  { 
    ssr: false,
    loading: () => (
      <div className="w-80 h-80 rounded-full bg-gradient-to-r from-orange-400 to-pink-400 flex items-center justify-center shadow-2xl">
        <span className="text-white font-bold text-lg">Загрузка рулетки...</span>
      </div>
    )
  }
);

// Данные для рулетки в формате react-custom-roulette
const wheelData = [
  { option: 'Подарочная карта', style: { backgroundColor: '#EC4899', textColor: 'white' } },
  { option: 'Ноутбук', style: { backgroundColor: '#3B82F6', textColor: 'white' } },
  { option: 'Футболка', style: { backgroundColor: '#EF4444', textColor: 'white' } },
  { option: 'Путешествие', style: { backgroundColor: '#10B981', textColor: 'white' } },
  { option: 'Книга', style: { backgroundColor: '#F59E0B', textColor: 'white' } },
  { option: 'Гаджет', style: { backgroundColor: '#8B5CF6', textColor: 'white' } },
  { option: 'Прокачка', style: { backgroundColor: '#06B6D4', textColor: 'white' } },
];

export default function Home() {
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [winner, setWinner] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Загружаем публичные рулетки
  const { data: publicWheelsData, loading: publicWheelsLoading, error: publicWheelsError } = useQuery(GET_PUBLIC_WHEELS);
  
  // Проверяем авторизацию пользователя через GraphQL
  const { data: meData, loading: meLoading } = useMe();

  // Устанавливаем флаг клиентской загрузки
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSpinClick = () => {
    if (!mustSpin) {
      const newPrizeNumber = Math.floor(Math.random() * wheelData.length);
      setPrizeNumber(newPrizeNumber);
      setMustSpin(true);
      setWinner(null);
    }
  };

  const handleStopSpinning = () => {
    setMustSpin(false);
    setWinner(wheelData[prizeNumber].option);
  };

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <span className="text-2xl font-bold text-white">GIFTY</span>
              <span className="text-sm text-gray-400 hidden sm:block">колесо подарков</span>
            </div>
            <div className="flex space-x-3">
              {!meLoading && meData?.me ? (
                // Авторизованный пользователь
                <>
                  <div className="text-gray-300 hidden sm:flex items-center px-3 space-x-2">
                    <span>Привет, {meData.me.name || 'Пользователь'}!</span>
                    {meData.me.plan === 'PRO' && (
                      <span className="bg-gradient-to-r from-purple-400 to-pink-400 text-white text-xs px-2 py-1 rounded-full font-medium">
                        PRO
                      </span>
                    )}
                  </div>
                  <Link 
                    href="/dashboard" 
                    className="bg-gradient-to-r from-orange-400 to-pink-400 text-white px-6 py-2 rounded-lg hover:from-orange-500 hover:to-pink-500 transition-all shadow-lg flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    <span>Панель управления</span>
                  </Link>
                </>
              ) : (
                // Неавторизованный пользователь
                <>
                  <Link href="/login" className="text-gray-300 hover:text-white px-4 py-2 rounded-lg transition-colors border border-gray-600 hover:border-gray-500">
                    Вход
                  </Link>
                  <Link href="/register" className="bg-gradient-to-r from-orange-400 to-pink-400 text-white px-6 py-2 rounded-lg hover:from-orange-500 hover:to-pink-500 transition-all shadow-lg">
                    Регистрация
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Создавайте
              <br />
              <span className="bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
                колёса подарков
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Генерируйте рулетки с подарками и делитесь ими с друзьями.
              <br />
              Создайте незабываемые моменты радости
            </p>
          </div>

          {/* Main Card - Inspired by the design */}
          <div className="bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-700/50 p-8 lg:p-12 mb-16">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              
              {/* Left Side - Wheel */}
              <div className="flex flex-col items-center space-y-8">
                <div className="relative">
                  <div className="p-4 rounded-xl transition-all duration-300">
                    {isClient ? (
                      <Wheel
                        mustStartSpinning={mustSpin}
                        prizeNumber={prizeNumber}
                        data={wheelData}
                        onStopSpinning={handleStopSpinning}
                        backgroundColors={['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#06B6D4', '#EC4899']}
                        textColors={['#ffffff']}
                        outerBorderColor={'#ffffff'}
                        outerBorderWidth={8}
                        innerBorderColor={'#ffffff'}
                        innerBorderWidth={4}
                        radiusLineColor={'#ffffff'}
                        radiusLineWidth={2}
                        fontSize={16}
                        textDistance={60}
                        spinDuration={0.8}
                      />
                    ) : (
                      <div className="w-80 h-80 rounded-full bg-gradient-to-r from-orange-400 to-pink-400 flex items-center justify-center shadow-2xl">
                        <span className="text-white font-bold text-lg">Подготовка рулетки...</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Spin Button */}
                <button
                  className="bg-gradient-to-r from-orange-400 to-pink-400 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-orange-500 hover:to-pink-500 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed min-w-[200px]"
                  onClick={handleSpinClick}
                  disabled={mustSpin}
                >
                  {mustSpin ? 'Крутится...' : 'Крутить колесо!'}
                </button>
                
                {/* Result Display */}
                {winner && (
                  <div className="bg-green-500/20 border border-green-400/30 rounded-xl p-4 max-w-md backdrop-blur-sm">
                    <p className="text-green-300 font-bold text-lg text-center">
                      🎉 Поздравляем! Выпал: <span className="text-green-200">{winner}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Right Side - Features Grid */}
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-white mb-8">Возможности платформы</h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600/30">
                    <div className="text-orange-400 mb-2">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <h3 className="text-white font-semibold text-sm">Бесплатное создание</h3>
                    <p className="text-gray-400 text-xs mt-1">До 3 рулеток бесплатно</p>
                  </div>

                  <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600/30">
                    <div className="text-pink-400 mb-2">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="text-white font-semibold text-sm">PRO функции</h3>
                    <p className="text-gray-400 text-xs mt-1">Безлимит + изображения</p>
                  </div>

                  <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600/30">
                    <div className="text-blue-400 mb-2">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                      </svg>
                    </div>
                    <h3 className="text-white font-semibold text-sm">Публичные ссылки</h3>
                    <p className="text-gray-400 text-xs mt-1">Делитесь с друзьями</p>
                  </div>

                  <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600/30">
                    <div className="text-green-400 mb-2">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h3 className="text-white font-semibold text-sm">Статистика</h3>
                    <p className="text-gray-400 text-xs mt-1">Отслеживайте результаты</p>
                  </div>
                </div>

                <div className="pt-4">
                  {!meLoading && meData?.me ? (
                    <Link 
                      href="/dashboard"
                      className="w-full bg-gradient-to-r from-orange-400 to-pink-400 text-white px-6 py-3 rounded-xl text-lg font-semibold hover:from-orange-500 hover:to-pink-500 transition-all transform hover:scale-105 shadow-lg inline-block text-center"
                    >
                      Перейти к рулеткам
                    </Link>
                  ) : (
                    <Link 
                      href="/register"
                      className="w-full bg-gradient-to-r from-orange-400 to-pink-400 text-white px-6 py-3 rounded-xl text-lg font-semibold hover:from-orange-500 hover:to-pink-500 transition-all transform hover:scale-105 shadow-lg inline-block text-center"
                    >
                      Начать создавать
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Public Wheels Section */}
          <div className="bg-gray-800/60 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-700/50 p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">
                Публичные рулетки
              </h2>
              <p className="text-gray-300">
                Попробуйте рулетки, созданные другими пользователями
              </p>
            </div>

            {publicWheelsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400 mx-auto mb-4"></div>
                <p className="text-gray-400">Загрузка публичных рулеток...</p>
              </div>
            ) : publicWheelsError ? (
              <div className="text-center py-12">
                <p className="text-red-400">Ошибка загрузки публичных рулеток</p>
              </div>
            ) : !publicWheelsData?.publicWheels?.length ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Пока нет публичных рулеток</h3>
                <p className="text-gray-400">Станьте первым, кто создаст публичную рулетку!</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {publicWheelsData.publicWheels.slice(0, 6).map((wheel: any) => (
                  <div key={wheel.id} className="bg-gray-700/50 rounded-xl border border-gray-600/30 overflow-hidden hover:border-gray-500/50 transition-all backdrop-blur-sm">
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {wheel.title}
                      </h3>
                      {wheel.description && (
                        <p className="text-gray-300 mb-4 text-sm line-clamp-2">
                          {wheel.description}
                        </p>
                      )}
                      
                      <div className="space-y-2 text-sm text-gray-400 mb-4">
                        <p>Сегментов: {wheel.segments.length}</p>
                        <p>Создана: {formatDateSafely(wheel.createdAt)}</p>
                        <p>Вращений: {wheel.spins.length}</p>
                        <p className="text-green-400">🌐 Публичная</p>
                      </div>

                      <div className="flex space-x-2">
                        {wheel.publicSlug ? (
                          <Link
                            href={`/public/${wheel.publicSlug}`}
                            className="flex-1 bg-gradient-to-r from-orange-400/20 to-pink-400/20 text-orange-300 border border-orange-400/30 px-4 py-2 rounded-lg hover:from-orange-400/30 hover:to-pink-400/30 transition-colors text-sm font-medium text-center"
                          >
                            Попробовать
                          </Link>
                        ) : (
                          <Link
                            href={`/roulette/${wheel.id}`}
                            className="flex-1 bg-gradient-to-r from-orange-400/20 to-pink-400/20 text-orange-300 border border-orange-400/30 px-4 py-2 rounded-lg hover:from-orange-400/30 hover:to-pink-400/30 transition-colors text-sm font-medium text-center"
                          >
                            Посмотреть
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {publicWheelsData?.publicWheels?.length > 6 && (
              <div className="text-center mt-8">
                <Link
                  href="/public-wheels"
                  className="bg-gradient-to-r from-orange-400 to-pink-400 text-white px-6 py-3 rounded-lg hover:from-orange-500 hover:to-pink-500 transition-colors font-medium"
                >
                  Посмотреть все публичные рулетки
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-gray-900/80 backdrop-blur-sm border-t border-gray-700/50 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">G</span>
                </div>
                <span className="text-xl font-bold">GIFTY</span>
              </div>
              <p className="text-gray-400">
                Создавайте кастомные колёса подарков и делитесь радостью с друзьями
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Продукт</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Возможности</a></li>
                <li><a href="/pricing" className="hover:text-white transition-colors">Тарифы</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Примеры</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Поддержка</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Помощь</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Контакты</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Компания</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">О нас</a></li>
                <li><a href="/requisites" className="hover:text-white transition-colors">Реквизиты</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Блог</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Gifty. Все права защищены.</p>
            <p className="text-sm mt-2">ИП Данилова Ольга, ИНН: 370260325067</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
