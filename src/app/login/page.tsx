'use client';

import { useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createUser, initializeUser, clearAllUserData } from '@/lib/user';

const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        id
        email
        name
      }
    }
  }
`;

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const router = useRouter();

  const [login, { loading }] = useMutation(LOGIN_MUTATION, {
    onCompleted: (data) => {
      // Очищаем данные предыдущего пользователя
      clearAllUserData();
      
      // Сохраняем токен в localStorage
      localStorage.setItem('token', data.login.token);
      
      // Создаем и сохраняем данные пользователя (существующий пользователь)
      const user = createUser({
        name: data.login.user.name || 'Пользователь',
        email: data.login.user.email
      }, false);
      
      // Инициализируем пользователя с миграцией данных
      initializeUser(user);
      
      // Перенаправляем в личный кабинет
      router.push('/dashboard');
    },
    onError: (error) => {
      console.error('Login error:', error);
      // Показываем ошибку пользователю вместо автоматического входа
      if (error.message.includes('Invalid credentials') || error.message.includes('User not found')) {
        setError('Неверный email или пароль');
      } else if (error.message.includes('Network error')) {
        setError('Ошибка сети. Проверьте подключение к интернету');
      } else {
        setError('Ошибка входа. Попробуйте еще раз');
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Email и пароль обязательны');
      return;
    }

    // Валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Введите корректный email адрес');
      return;
    }

    // Валидация пароля
    if (formData.password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }

    try {
      await login({
        variables: {
          input: formData,
        },
      });
    } catch (err) {
      // Ошибка уже обработана в onError
      console.error('Login submission error:', err);
    }
  };

  // Демо-вход для тестирования
  const handleDemoLogin = () => {
    // Очищаем данные предыдущего пользователя
    clearAllUserData();
    
    const user = createUser({
      name: 'Демо пользователь',
      email: 'demo@example.com'
    }, true); // Создаем как нового пользователя с бесплатным планом
    
    // Инициализируем пользователя с миграцией данных
    initializeUser(user);
    
    localStorage.setItem('token', 'demo-token');
    router.push('/dashboard');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center items-center space-x-2 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">G</span>
            </div>
            <span className="text-3xl font-bold text-gray-900">Gifty</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Вход</h2>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 text-lg"
              />
            </div>
            <div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="Пароль (минимум 6 символов)"
                value={formData.password}
                onChange={handleChange}
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 text-lg"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </div>

          <div className="text-center space-y-4">
            <div>
              <span className="text-gray-600">Нет аккаунта? </span>
              <Link href="/register" className="text-blue-600 hover:text-blue-500 font-medium">
                Зарегистрироваться
              </Link>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <button
                type="button"
                onClick={handleDemoLogin}
                className="w-full bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Демо-вход (для тестирования)
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 