'use client';

import Link from 'next/link';

export default function RequisitesPage() {
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
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">G</span>
                </div>
                <span className="text-2xl font-bold text-white">GIFTY</span>
                <span className="text-sm text-gray-400 hidden sm:block">колесо подарков</span>
              </Link>
            </div>
            <div className="flex space-x-3">
              <Link href="/login" className="text-gray-300 hover:text-white px-4 py-2 rounded-lg transition-colors border border-gray-600 hover:border-gray-500">
                Вход
              </Link>
              <Link href="/register" className="bg-gradient-to-r from-orange-400 to-pink-400 text-white px-6 py-2 rounded-lg hover:from-orange-500 hover:to-pink-500 transition-all shadow-lg">
                Регистрация
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              Реквизиты
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Информация о предпринимателе и реквизиты для связи
            </p>
          </div>

          {/* Main Card */}
          <div className="bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-700/50 p-8 lg:p-12">
            
            {/* Individual Entrepreneur Info */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <svg className="w-6 h-6 text-orange-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Самозанятый предприниматель
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-700/50 rounded-xl p-6 border border-gray-600/30">
                  <h3 className="text-lg font-semibold text-white mb-4">Основная информация</h3>
                  <div className="space-y-3 text-gray-300">
                    <div className="flex justify-between">
                      <span className="text-gray-400">ФИО:</span>
                      <span className="font-medium">Ольга Данилова</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">ИНН:</span>
                      <span className="font-mono font-medium text-orange-300">370260325067</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Статус:</span>
                      <span className="text-green-400 font-medium">Самозанятый</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-700/50 rounded-xl p-6 border border-gray-600/30">
                  <h3 className="text-lg font-semibold text-white mb-4">Контактная информация</h3>
                  <div className="space-y-3 text-gray-300">
                    <div className="flex items-start">
                      <span className="text-gray-400 w-20 flex-shrink-0">Email:</span>
                      <a href="mailto:support@gifty.ru" className="text-orange-300 hover:text-orange-200 transition-colors">
                        support@gifty.ru
                      </a>
                    </div>
                    <div className="flex items-start">
                      <span className="text-gray-400 w-20 flex-shrink-0">Сайт:</span>
                      <a href="https://gifty.ru" className="text-orange-300 hover:text-orange-200 transition-colors">
                        gifty.ru
                      </a>
                    </div>
                    <div className="flex items-start">
                      <span className="text-gray-400 w-20 flex-shrink-0">Услуги:</span>
                      <span>Разработка веб-приложений</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Legal Information */}
            <div className="border-t border-gray-700/50 pt-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <svg className="w-6 h-6 text-orange-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Правовая информация
              </h2>
              
              <div className="bg-gray-700/50 rounded-xl p-6 border border-gray-600/30">
                <div className="space-y-4 text-gray-300">
                  <p>
                    <strong className="text-white">Деятельность:</strong> Разработка и поддержка веб-приложения "GIFTY" - платформы для создания интерактивных колёс подарков и рулеток.
                  </p>
                  <p>
                    <strong className="text-white">Налоговый статус:</strong> Плательщик налога на профессиональный доход (самозанятый) в соответствии с Федеральным законом от 27.11.2018 № 422-ФЗ.
                  </p>
                  <p>
                    <strong className="text-white">Регистрация:</strong> Зарегистрирован в качестве самозанятого в налоговом органе по месту ведения деятельности.
                  </p>
                  <p className="text-sm text-gray-400 border-t border-gray-600/30 pt-4 mt-4">
                    Все услуги оказываются в соответствии с действующим законодательством Российской Федерации. 
                    При оказании услуг формируются чеки через приложение "Мой налог".
                  </p>
                </div>
              </div>
            </div>

            {/* Back to Home */}
            <div className="text-center mt-8">
              <Link 
                href="/"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-400 to-pink-400 text-white px-6 py-3 rounded-xl text-lg font-semibold hover:from-orange-500 hover:to-pink-500 transition-all transform hover:scale-105 shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Вернуться на главную</span>
              </Link>
            </div>
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