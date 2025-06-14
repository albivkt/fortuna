'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { DesignControls } from '@/components/DesignControls';

// Динамический импорт для избежания SSR проблем
const Wheel = dynamic(
  () => import('react-custom-roulette').then((mod) => ({ default: mod.Wheel })),
  { 
    ssr: false,
    loading: () => (
      <div className="w-80 h-80 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shadow-2xl">
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
  const [showDesignPanel, setShowDesignPanel] = useState(false);
  const [customDesign, setCustomDesign] = useState({
    backgroundColor: 'transparent',
    borderColor: '#ffffff',
    textColor: '#ffffff'
  });

  // Устанавливаем флаг клиентской загрузки и загружаем сохраненные настройки дизайна
  useEffect(() => {
    setIsClient(true);
    
    // Загружаем сохраненные настройки дизайна
    const savedDesign = localStorage.getItem('homePageDesign');
    if (savedDesign) {
      try {
        const parsedDesign = JSON.parse(savedDesign);
        setCustomDesign(parsedDesign);
      } catch (error) {
        console.error('Ошибка загрузки настроек дизайна:', error);
      }
    }
  }, []);

  // Сохраняем настройки дизайна при их изменении
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('homePageDesign', JSON.stringify(customDesign));
    }
  }, [customDesign, isClient]);

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

  // Преобразуем данные рулетки с учетом кастомного дизайна
  const customWheelData = wheelData.map(item => ({
    ...item,
    style: {
      ...item.style,
      textColor: customDesign.textColor
    }
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">G</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">GIFTY</span>
            </div>
            <div className="flex space-x-4">
              <a href="/login" className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg transition-colors">
                Вход
              </a>
              <a href="/register" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Регистрация
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                Создавайте
                <br />
                кастомные
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  колёса подарков
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Генерируйте рулетки с подарками
                <br />
                и делитесь ими с друзьями
              </p>
              <a 
                href="/register"
                className="bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg inline-block"
              >
                Зарегистрироваться
              </a>
            </div>
            
            {/* React Custom Roulette Wheel */}
            <div className="flex flex-col items-center">
              <div className="relative">
                {/* Design Controls Button */}
                <button
                  onClick={() => setShowDesignPanel(!showDesignPanel)}
                  className="absolute -top-4 -right-4 z-10 bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 transition-colors shadow-lg"
                  title="Настройки дизайна"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                  </svg>
                </button>

                {/* Design Panel */}
                {showDesignPanel && (
                  <div className="absolute -top-4 -left-80 z-20 bg-white rounded-xl shadow-xl p-6 w-72 border">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Настройки дизайна</h3>
                    <DesignControls
                      customDesign={customDesign}
                      setCustomDesign={setCustomDesign}
                      isPro={true}
                      showProMessage={false}
                    />
                  </div>
                )}

                <div 
                  className="p-4 rounded-xl transition-all duration-300"
                  style={{ backgroundColor: customDesign.backgroundColor }}
                >
                  {isClient ? (
                    <Wheel
                      mustStartSpinning={mustSpin}
                      prizeNumber={prizeNumber}
                      data={customWheelData}
                      onStopSpinning={handleStopSpinning}
                      backgroundColors={['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#06B6D4', '#EC4899']}
                      textColors={[customDesign.textColor]}
                      outerBorderColor={customDesign.borderColor}
                      outerBorderWidth={8}
                      innerBorderColor={customDesign.borderColor}
                      innerBorderWidth={4}
                      radiusLineColor={customDesign.borderColor}
                      radiusLineWidth={2}
                      fontSize={16}
                      textDistance={60}
                      spinDuration={0.8}
                    />
                  ) : (
                    <div className="w-80 h-80 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shadow-2xl">
                      <span className="text-white font-bold text-lg">Подготовка рулетки...</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Spin Button */}
              <div className="mt-8">
                <button
                  className="bg-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-purple-700 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleSpinClick}
                  disabled={mustSpin}
                >
                  {mustSpin ? 'Крутится...' : 'Крутить колесо!'}
                </button>
              </div>
              
              {/* Result Display */}
              {winner && (
                <div className="mt-6 p-4 bg-green-100 border-2 border-green-300 rounded-lg max-w-md">
                  <p className="text-green-800 font-bold text-lg text-center">
                    🎉 Поздравляем! Выпал: <span className="text-green-600">{winner}</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12">
            {/* Free Plan */}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Бесплатный
                <br />
                план
              </h3>
              <ul className="text-gray-600 space-y-2 mb-6">
                <li>• До 3 рулеток</li>
                <li>• До 6 сегментов</li>
                <li>• Базовые настройки</li>
                <li>• Без изображений</li>
              </ul>
              <p className="text-lg font-bold text-blue-600">
                Бесплатно
              </p>
            </div>

            {/* Pro Plan */}
            <div className="text-center relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Популярный
                </span>
              </div>
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                PRO
                <br />
                план
              </h3>
              <ul className="text-gray-600 space-y-2 mb-6">
                <li>• Безлимитное создание рулеток</li>
                <li>• До 20 сегментов + изображения</li>
                <li>• Расширенные настройки дизайна</li>
                <li>• Вес призов, статистика</li>
              </ul>
              <div className="space-y-1">
                <p className="text-lg font-bold text-purple-600">
                  400₽/месяц
                </p>
                <p className="text-sm text-gray-500">
                  или 4000₽/год (скидка 17%)
                </p>
              </div>
            </div>

            {/* Real-time */}
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Розыгрыши
                <br />
                в реальном
                <br />
                времени
              </h3>
              <div className="text-gray-600 space-y-2">
                <p>Мгновенные уведомления</p>
                <p>Создайте или присоединитесь к розыгрышу</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Готовы создать своё колесо подарков?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Присоединяйтесь к тысячам пользователей, которые уже создают незабываемые моменты
          </p>
          <a 
            href="/register"
            className="bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg inline-block"
          >
            Начать бесплатно
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
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
                <li><a href="#" className="hover:text-white transition-colors">Тарифы</a></li>
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
                <li><a href="#" className="hover:text-white transition-colors">Блог</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Карьера</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Gifty. Все права защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
