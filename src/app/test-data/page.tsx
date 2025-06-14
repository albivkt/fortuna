'use client';

import { useState, useEffect } from 'react';
import { getCurrentUser, clearUser, User } from '@/lib/user';
import { getUserRoulettes, Roulette } from '@/lib/roulettes';
import { getAllDrawHistory, clearAllUserHistory } from '@/lib/drawHistory';
import { DrawHistory } from '@/types';
import Link from 'next/link';

export default function TestDataPage() {
  const [user, setUser] = useState<User | null>(null);
  const [roulettes, setRoulettes] = useState<Roulette[]>([]);
  const [drawHistory, setDrawHistory] = useState<DrawHistory[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    loadUserData();
  }, []);

  const loadUserData = () => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    
    if (currentUser) {
      const userRoulettes = getUserRoulettes(currentUser.id);
      setRoulettes(userRoulettes);
      
      const userHistory = getAllDrawHistory(currentUser.id);
      setDrawHistory(userHistory);
    }
  };

  const handleLogout = () => {
    clearUser();
    setUser(null);
    setRoulettes([]);
    setDrawHistory([]);
  };

  const handleClearHistory = () => {
    if (user && confirm('Очистить всю историю розыгрышей?')) {
      clearAllUserHistory(user.id);
      setDrawHistory([]);
    }
  };

  const handleClearAllData = () => {
    if (confirm('Очистить ВСЕ данные localStorage? (рулетки, история, пользователи)')) {
      localStorage.clear();
      setUser(null);
      setRoulettes([]);
      setDrawHistory([]);
    }
  };

  if (!isClient) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
          Тестирование данных пользователей
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Текущий пользователь */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Текущий пользователь</h2>
            
            {user ? (
              <div className="space-y-3">
                <div>
                  <span className="font-medium text-gray-700">ID:</span>
                  <span className="ml-2 text-gray-600 text-sm">{user.id}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Имя:</span>
                  <span className="ml-2 text-gray-600">{user.name}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Email:</span>
                  <span className="ml-2 text-gray-600">{user.email}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">План:</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                    user.plan === 'pro' 
                      ? 'bg-purple-100 text-purple-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {user.plan === 'pro' ? 'PRO' : 'FREE'}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Создан:</span>
                  <span className="ml-2 text-gray-600 text-sm">
                    {new Date(user.createdAt).toLocaleString('ru-RU')}
                  </span>
                </div>
                
                <div className="pt-4 space-y-2">
                  <button
                    onClick={handleLogout}
                    className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                  >
                    Выйти из аккаунта
                  </button>
                  <button
                    onClick={handleClearHistory}
                    className="w-full bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm"
                  >
                    Очистить историю
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">Пользователь не авторизован</p>
                <div className="space-y-2">
                  <Link
                    href="/login"
                    className="block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Войти
                  </Link>
                  <Link
                    href="/register"
                    className="block bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    Зарегистрироваться
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Рулетки пользователя */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Рулетки ({roulettes.length})
            </h2>
            
            {roulettes.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {roulettes.map((roulette) => (
                  <div key={roulette.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="font-medium text-gray-900 text-sm">{roulette.name}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      ID: {roulette.id}
                    </div>
                    <div className="text-xs text-gray-500">
                      Сегментов: {roulette.segments.length}
                    </div>
                    <div className="text-xs text-gray-500">
                      Создана: {new Date(roulette.createdAt).toLocaleDateString('ru-RU')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-8">Нет рулеток</p>
            )}
          </div>

          {/* История розыгрышей */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              История розыгрышей ({drawHistory.length})
            </h2>
            
            {drawHistory.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {drawHistory.slice(-10).reverse().map((entry) => (
                  <div key={entry.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="font-medium text-gray-900 text-sm">{entry.prize}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Рулетка: {entry.wheelId}
                    </div>
                    {entry.participant && (
                      <div className="text-xs text-gray-500">
                        Участник: {entry.participant}
                      </div>
                    )}
                    <div className="text-xs text-gray-500">
                      {new Date(entry.createdAt).toLocaleString('ru-RU')}
                    </div>
                  </div>
                ))}
                {drawHistory.length > 10 && (
                  <div className="text-xs text-gray-500 text-center">
                    ... и еще {drawHistory.length - 10} записей
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-8">Нет истории</p>
            )}
          </div>
        </div>

        {/* Инструкции для тестирования */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Инструкции для тестирования</h2>
          
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <h3 className="font-medium text-gray-800 mb-2">Тестирование изоляции данных:</h3>
              <ol className="list-decimal list-inside text-gray-600 space-y-1">
                <li>Войдите в один аккаунт</li>
                <li>Создайте рулетку и сделайте розыгрыш</li>
                <li>Выйдите из аккаунта</li>
                <li>Войдите в другой аккаунт</li>
                <li>Проверьте, что история и рулетки не смешиваются</li>
                <li>Войдите обратно в первый аккаунт</li>
                <li>Проверьте, что данные сохранились</li>
              </ol>
            </div>

            <div>
              <h3 className="font-medium text-gray-800 mb-2">Проверка лимитов:</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Бесплатный план: максимум 6 сегментов</li>
                <li>Демо-рулетки должны соответствовать лимитам</li>
                <li>При создании рулетки проверяется лимит</li>
                <li>Новые пользователи получают план "FREE"</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Ожидаемое поведение:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>✅ История розыгрышей привязана к пользователю</li>
              <li>✅ Рулетки сохраняются при повторном входе</li>
              <li>✅ Лимит сегментов: 6 для FREE, 20 для PRO</li>
              <li>✅ Демо-рулетки соответствуют лимитам</li>
              <li>✅ Данные разных пользователей изолированы</li>
            </ul>
          </div>
        </div>

        {/* Действия для отладки */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Действия для отладки</h2>
          
          <div className="flex flex-wrap gap-4">
            <button
              onClick={loadUserData}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Обновить данные
            </button>
            
            <button
              onClick={handleClearAllData}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Очистить ВСЕ данные
            </button>
            
            <Link
              href="/dashboard"
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              В дашборд
            </Link>
            
            <Link
              href="/test-auth"
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Тест аутентификации
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 