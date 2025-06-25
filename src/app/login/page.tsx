'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { clearAllUserData, createUser, initializeUser } from '@/lib/user';
import { useLogin } from '@/lib/graphql/hooks';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const router = useRouter();

  const [login, { loading }] = useLogin();

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
      // Очищаем данные предыдущего пользователя
      clearAllUserData();
      
      const result = await login({
        variables: {
          input: formData,
        },
      });

      if (result.data?.login) {
        console.log('Login successful:', result.data.login);
        
        // Создаем и сохраняем данные пользователя (существующий пользователь)
        const user = createUser({
          name: result.data.login.user.name || 'Пользователь',
          email: result.data.login.user.email
        }, false);
        
        // Инициализируем пользователя с миграцией данных
        initializeUser(user);
        
        // Перенаправляем в личный кабинет
        router.push('/dashboard');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      // Показываем ошибку пользователю
      if (error.message.includes('Invalid credentials') || error.message.includes('User not found')) {
        setError('Неверный email или пароль');
      } else if (error.message.includes('Network error')) {
        setError('Ошибка сети. Проверьте подключение к интернету');
      } else {
        setError('Ошибка входа. Попробуйте еще раз');
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%), 
                           radial-gradient(circle at 75% 75%, rgba(255,255,255,0.05) 0%, transparent 50%)`
        }}></div>
      </div>

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-700/50 p-8">
          
          {/* Header with Icon */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-600/30">
              <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-2">Добро пожаловать</h1>
            <p className="text-gray-400">Войдите в свой аккаунт</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="Введите ваш email..."
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50 transition-all backdrop-blur-sm"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••••"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50 transition-all backdrop-blur-sm"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-4 backdrop-blur-sm">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-400 to-pink-400 text-white py-3 px-4 rounded-xl font-semibold hover:from-orange-500 hover:to-pink-500 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-lg btn-glow"
            >
              {loading ? 'Вход...' : 'Войти'}
            </button>

            {/* Sign Up Link */}
            <div className="text-center pt-4">
              <span className="text-gray-400 text-sm">Нет аккаунта? </span>
              <Link 
                href="/register" 
                className="text-orange-400 hover:text-orange-300 font-semibold transition-colors underline"
              >
                Зарегистрироваться
              </Link>
            </div>
          </form>
        </div>

        {/* Back to Home Link */}
        <div className="text-center mt-6">
          <Link 
            href="/" 
            className="text-gray-400 hover:text-white transition-colors text-sm flex items-center justify-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Вернуться на главную</span>
          </Link>
        </div>
      </div>
    </div>
  );
} 