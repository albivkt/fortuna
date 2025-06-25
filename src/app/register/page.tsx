'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Captcha from '@/components/Captcha';
import { validateEmail, validatePassword, validateName } from '@/lib/validation';
import { createNewUser, clearAllUserData } from '@/lib/user';
import { useRegister } from '@/lib/graphql/hooks';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const router = useRouter();

  const [register, { loading }] = useRegister();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Очищаем ошибки при изменении полей
    if (error) setError('');
    if (validationErrors.length > 0) setValidationErrors([]);
  };

  const validateForm = () => {
    const errors: string[] = [];
    
    if (!validateName(formData.name)) {
      errors.push('Имя должно содержать от 2 до 50 символов');
    }
    
    if (!validateEmail(formData.email)) {
      errors.push('Некорректный email адрес');
    }
    
    if (!validatePassword(formData.password)) {
      errors.push('Пароль должен содержать минимум 6 символов');
    }
    
    if (!isCaptchaVerified) {
      errors.push('Пожалуйста, подтвердите, что вы не робот');
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      // Очищаем все данные предыдущего пользователя
      clearAllUserData();
      
      const result = await register({
        variables: {
          input: {
            email: formData.email.trim(),
            password: formData.password,
            name: formData.name.trim(),
          }
        }
      });

      if (result.data?.register) {
        console.log('Registration successful:', result.data.register);
        
        // Создаем и сохраняем данные пользователя с бесплатным планом
        createNewUser({
          name: formData.name.trim(),
          email: formData.email.trim()
        });
        
        // Перенаправляем в личный кабинет
        router.push('/dashboard');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      // Обрабатываем различные типы ошибок
      if (error.message.includes('User already exists') || error.message.includes('already registered')) {
        setError('Пользователь с таким email уже существует');
      } else if (error.message.includes('Invalid email')) {
        setError('Некорректный email адрес');
      } else if (error.message.includes('Password too short')) {
        setError('Пароль слишком короткий');
      } else if (error.message.includes('Network error')) {
        setError('Ошибка сети. Проверьте подключение к интернету');
      } else {
        setError('Ошибка регистрации. Попробуйте еще раз');
      }
    }
  };

  const handleCaptchaVerify = (isVerified: boolean) => {
    setIsCaptchaVerified(isVerified);
    if (isVerified && error) {
      setError('');
    }
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-2">Создать аккаунт</h1>
            <p className="text-gray-400">Присоединяйтесь к нам сегодня</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                Имя
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                placeholder="Введите ваше имя..."
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50 transition-all backdrop-blur-sm"
              />
            </div>

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
                onChange={handleInputChange}
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
                autoComplete="new-password"
                required
                placeholder="••••••••••"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50 transition-all backdrop-blur-sm"
              />
              <p className="text-xs text-gray-400 mt-1">Минимум 6 символов</p>
            </div>

            {/* Captcha */}
            <div className="py-2">
              <Captcha onVerify={handleCaptchaVerify} />
            </div>

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-4 backdrop-blur-sm">
                <ul className="space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index} className="text-red-300 text-sm">• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* General Error */}
            {error && (
              <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-4 backdrop-blur-sm">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={loading || !isCaptchaVerified}
              className="w-full bg-gradient-to-r from-orange-400 to-pink-400 text-white py-3 px-4 rounded-xl font-semibold hover:from-orange-500 hover:to-pink-500 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-lg btn-glow"
            >
              {loading ? 'Создание аккаунта...' : 'Создать аккаунт'}
            </button>

            {/* Sign In Link */}
            <div className="text-center pt-4">
              <span className="text-gray-400 text-sm">Уже есть аккаунт? </span>
              <Link 
                href="/login" 
                className="text-orange-400 hover:text-orange-300 font-semibold transition-colors underline"
              >
                Войти
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