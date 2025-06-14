'use client';

import { useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createNewUser, clearAllUserData } from '@/lib/user';
import Captcha from '@/components/Captcha';
import { validateEmail, validatePassword, validateName } from '@/lib/validation';

const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      user {
        id
        email
        name
      }
    }
  }
`;

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });
  const [error, setError] = useState('');
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const router = useRouter();

  const [register, { loading }] = useMutation(REGISTER_MUTATION, {
    onCompleted: (data) => {
      console.log('Registration successful:', data);
      // Сохраняем токен в localStorage
      localStorage.setItem('token', data.register.token);
      
      // Создаем и сохраняем данные пользователя с бесплатным планом
      createNewUser({
        name: formData.name,
        email: formData.email
      });
      
      // Перенаправляем в личный кабинет
      router.push('/dashboard');
    },
    onError: (error) => {
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
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setValidationErrors([]);

    console.log('Submitting registration with data:', formData);

    // Проверка CAPTCHA
    if (!isCaptchaVerified) {
      setError('Пожалуйста, пройдите проверку CAPTCHA');
      return;
    }

    // Валидация данных
    const errors: string[] = [];
    
    if (formData.name) {
      const nameValidation = validateName(formData.name);
      if (!nameValidation.isValid) {
        errors.push(...nameValidation.errors);
      }
    }
    
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      errors.push(...emailValidation.errors);
    }
    
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      errors.push(...passwordValidation.errors);
    }
    
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    // Сохраняем данные регистрации временно
    localStorage.setItem('temp_registration_data', JSON.stringify({
      name: formData.name,
      email: formData.email
    }));

    try {
      console.log('Calling register mutation...');
      await register({
        variables: {
          input: formData,
        },
      });
    } catch (err) {
      console.error('Registration submission error:', err);
      // Очищаем все данные предыдущего пользователя
      clearAllUserData();
      
      // Создаем нового пользователя локально с бесплатным планом
      createNewUser({
        name: formData.name,
        email: formData.email
      });
      router.push('/dashboard');
    }
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
          <h2 className="text-3xl font-bold text-gray-900">Регистрация</h2>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Имя (необязательно)"
                value={formData.name}
                onChange={handleChange}
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 text-lg"
              />
            </div>
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
                autoComplete="new-password"
                required
                placeholder="Пароль (минимум 6 символов)"
                value={formData.password}
                onChange={handleChange}
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 text-lg"
              />
              <p className="text-xs text-gray-500 mt-1 px-1">
                Пароль должен содержать минимум 6 символов
              </p>
            </div>
          </div>

          {/* CAPTCHA */}
          <div>
            <Captcha 
              onVerify={setIsCaptchaVerified}
              onReset={() => setIsCaptchaVerified(false)}
            />
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {validationErrors.length > 0 && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              <ul className="list-disc list-inside space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading || !isCaptchaVerified}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading && (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>
          </div>

          <div className="text-center">
            <span className="text-gray-600">Уже есть аккаунт? </span>
            <Link href="/login" className="text-blue-600 hover:text-blue-500 font-medium">
              Войти
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
} 