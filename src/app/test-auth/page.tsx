'use client';

import { useState, useEffect } from 'react';
import { getCurrentUser, clearUser, User } from '@/lib/user';
import Link from 'next/link';

export default function TestAuthPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const currentUser = getCurrentUser();
    setUser(currentUser);
  }, []);

  const handleLogout = () => {
    clearUser();
    localStorage.removeItem('token');
    setUser(null);
  };

  if (!isClient) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
          Тестирование аутентификации
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Текущий статус пользователя */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Текущий пользователь</h2>
            
            {user ? (
              <div className="space-y-3">
                <div>
                  <span className="font-medium text-gray-700">ID:</span>
                  <span className="ml-2 text-gray-600">{user.id}</span>
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
                  <span className="ml-2 text-gray-600">
                    {new Date(user.createdAt).toLocaleString('ru-RU')}
                  </span>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Выйти
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">Пользователь не авторизован</p>
                <div className="space-y-2">
                  <Link
                    href="/login"
                    className="block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Войти
                  </Link>
                  <Link
                    href="/register"
                    className="block bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Зарегистрироваться
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Инструкции для тестирования */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Инструкции для тестирования</h2>
            
            <div className="space-y-4 text-sm">
              <div>
                <h3 className="font-medium text-gray-800 mb-2">1. Тестирование регистрации:</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Перейдите на страницу регистрации</li>
                  <li>Попробуйте зарегистрироваться с некорректным email</li>
                  <li>Попробуйте зарегистрироваться с коротким паролем (&lt;6 символов)</li>
                  <li>Зарегистрируйтесь с корректными данными</li>
                  <li>Проверьте, что план установлен как "FREE"</li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium text-gray-800 mb-2">2. Тестирование входа:</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Перейдите на страницу входа</li>
                  <li>Попробуйте войти с неверными данными</li>
                  <li>Убедитесь, что показывается ошибка</li>
                  <li>Попробуйте демо-вход</li>
                  <li>Проверьте, что план установлен как "FREE"</li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium text-gray-800 mb-2">3. Проверка localStorage:</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Откройте DevTools → Application → Local Storage</li>
                  <li>Проверьте ключи: gifty_user, gifty_user_plan, token</li>
                  <li>Убедитесь, что план сохраняется корректно</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Ожидаемое поведение:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>✅ Новые пользователи получают план "FREE"</li>
                <li>✅ Неверные данные входа показывают ошибку</li>
                <li>✅ Валидация email и пароля работает</li>
                <li>✅ Демо-вход создает пользователя с планом "FREE"</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Навигация */}
        <div className="mt-8 text-center space-x-4">
          <Link
            href="/"
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            На главную
          </Link>
          <Link
            href="/dashboard"
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            В дашборд
          </Link>
        </div>
      </div>
    </div>
  );
} 