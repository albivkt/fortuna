'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMe, useUpdateUser } from '@/lib/graphql/hooks';
import { getCurrentUser, updateUser as updateLocalUser, clearAllUserData } from '@/lib/user';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';

// GraphQL запрос для получения плана пользователя
const GET_PLAN_LIMITS = gql`
  query GetPlanLimits {
    planLimits {
      maxWheels
      maxSegments
      allowImages
      allowWeights
      allowCustomDesign
      allowStatistics
    }
    me {
      id
      email
      name
      plan
      planExpiresAt
    }
  }
`;

interface User {
  id: string;
  name?: string;
  email: string;
  plan: 'free' | 'pro';
  createdAt?: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const { data: meData, loading: meLoading, refetch } = useMe();
  const { data: planData, loading: planLoading } = useQuery(GET_PLAN_LIMITS, {
    errorPolicy: 'ignore'
  });
  const [updateUser, { loading: updating }] = useUpdateUser();

  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [activeTab, setActiveTab] = useState<'profile' | 'account' | 'notifications'>('profile');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (meData?.me) {
      // Авторизованный пользователь
      const authenticatedUser = meData.me;
      const actualPlan = planData?.me?.plan?.toLowerCase() || authenticatedUser.plan?.toLowerCase() || 'free';
      
      const userWithActualPlan: User = {
        id: authenticatedUser.id,
        name: authenticatedUser.name || 'Пользователь',
        email: authenticatedUser.email,
        plan: actualPlan as 'free' | 'pro'
      };
      
      setUser(userWithActualPlan);
      setFormData({
        name: userWithActualPlan.name || '',
        email: userWithActualPlan.email,
        newPassword: '',
        confirmPassword: ''
      });
    } else if (!meLoading && !meData?.me) {
      // Неавторизованный пользователь - используем локальные данные
      const localUser = getCurrentUser();
      
      if (localUser) {
        const tempUser: User = {
          id: localUser.id || `temp_${Date.now()}`,
          name: localUser.name || 'Гость',
          email: localUser.email || `temp_${Date.now()}@example.com`,
          plan: 'free'
        };
        
        setUser(tempUser);
        setFormData({
          name: tempUser.name || '',
          email: tempUser.email,
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        // Если нет пользователя, перенаправляем на логин
        router.push('/login');
      }
    }
  }, [meData, meLoading, planData, router]);

  const handleSaveProfile = async () => {
    if (!user) return;

    if (!formData.name.trim()) {
      alert('Пожалуйста, введите имя');
      return;
    }

    if (!formData.email.trim()) {
      alert('Пожалуйста, введите email');
      return;
    }

    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      alert('Пароли не совпадают');
      return;
    }

    setIsSaving(true);

    try {
      if (meData?.me) {
        // Обновляем через GraphQL для авторизованных пользователей
        const updateData: any = {
          name: formData.name.trim(),
          email: formData.email.trim()
        };

        if (formData.newPassword) {
          updateData.password = formData.newPassword;
        }

        await updateUser({
          variables: { input: updateData }
        });

        alert('Настройки успешно сохранены!');
        await refetch(); // Обновляем данные пользователя
      } else {
        // Обновляем локальные данные для неавторизованных пользователей
        const updatedUser = {
          ...user,
          name: formData.name.trim(),
          email: formData.email.trim()
        };
        
        updateLocalUser(updatedUser);
        setUser(updatedUser);
        alert('Настройки успешно сохранены!');
      }

      // Очищаем поля пароля
      setFormData(prev => ({
        ...prev,
        newPassword: '',
        confirmPassword: ''
      }));

    } catch (error) {
      console.error('Ошибка сохранения настроек:', error);
      alert('Ошибка при сохранении настроек: ' + (error instanceof Error ? error.message : 'Неизвестная ошибка'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = () => {
    if (!user) return;

    const confirmMessage = 'Вы уверены, что хотите удалить аккаунт? Все данные будут безвозвратно утеряны. Введите "УДАЛИТЬ" для подтверждения:';
    const userInput = prompt(confirmMessage);

    if (userInput === 'УДАЛИТЬ') {
      // Удаляем все данные пользователя
      clearAllUserData();
      alert('Аккаунт успешно удален');
      router.push('/');
    } else if (userInput !== null) {
      alert('Удаление отменено');
    }
  };

  const handleLogout = () => {
    if (confirm('Вы уверены, что хотите выйти из аккаунта?')) {
      clearAllUserData();
      router.push('/');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Загрузка...</p>
        </div>
      </div>
    );
  }

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
              <Link href="/" className="text-2xl font-bold text-white">
                GIFTY
              </Link>
              <span className="text-sm text-gray-400 hidden sm:block">настройки</span>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                href="/dashboard"
                className="text-gray-300 hover:text-white px-4 py-2 rounded-lg transition-colors border border-gray-600 hover:border-gray-500"
              >
                Назад к панели
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Настройки аккаунта</h1>
          <p className="text-gray-300 text-lg">Управляйте своим профилем и настройками</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8 items-start">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700/50 p-6">
              <div className="space-y-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                    activeTab === 'profile'
                      ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                      : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Профиль</span>
                  </div>
                </button>
                
                <button
                  onClick={() => setActiveTab('account')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                    activeTab === 'account'
                      ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                      : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>Безопасность</span>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                    activeTab === 'notifications'
                      ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                      : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM15 13.1c0 3.3 0 6.9-2.9 9.9h-4.2C5 20.1 5 16.4 5 13.1 5 9.8 8.1 7 12 7s7 2.8 7 6.1z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.73 21a2 2 0 01-3.46 0" />
                    </svg>
                    <span>Уведомления</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && (
              <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700/50 p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <h2 className="text-2xl font-bold text-white">Информация профиля</h2>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Имя
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent text-white placeholder-gray-400"
                      placeholder="Введите ваше имя"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent text-white placeholder-gray-400"
                      placeholder="Введите ваш email"
                    />
                  </div>

                  <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-white">Тарифный план</h3>
                        <p className="text-gray-400">
                          Текущий план: <span className={`font-semibold ${user.plan === 'pro' ? 'text-yellow-400' : 'text-gray-300'}`}>
                            {user.plan === 'pro' ? 'PRO' : 'Бесплатный'}
                          </span>
                        </p>
                      </div>
                      {user.plan !== 'pro' && (
                        <Link
                          href="/pricing"
                          className="bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 px-4 py-2 rounded-lg hover:from-yellow-500 hover:to-orange-500 transition-all font-medium"
                        >
                          Обновить до PRO
                        </Link>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 rounded-xl text-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'account' && (
              <div className="space-y-6">
                {/* Изменение пароля */}
                <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700/50 p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <h2 className="text-2xl font-bold text-white">Изменение пароля</h2>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Новый пароль
                      </label>
                      <input
                        type="password"
                        value={formData.newPassword}
                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent text-white placeholder-gray-400"
                        placeholder="Введите новый пароль"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Подтвердите пароль
                      </label>
                      <input
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent text-white placeholder-gray-400"
                        placeholder="Подтвердите новый пароль"
                      />
                    </div>

                    <button
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-4 rounded-xl text-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {isSaving ? 'Сохранение...' : 'Обновить пароль'}
                    </button>
                  </div>
                </div>

                {/* Управление аккаунтом */}
                <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700/50 p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <h2 className="text-2xl font-bold text-white">Управление аккаунтом</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <button
                      onClick={handleLogout}
                      className="w-full bg-gray-600 text-white py-4 rounded-xl text-lg font-semibold hover:bg-gray-700 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center space-x-3"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Выйти из аккаунта</span>
                    </button>
                    
                    <button
                      onClick={handleDeleteAccount}
                      className="w-full bg-red-600 text-white py-4 rounded-xl text-lg font-semibold hover:bg-red-700 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center space-x-3"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>Удалить аккаунт</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700/50 p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 20h7a2 2 0 002-2V8a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <h2 className="text-2xl font-bold text-white">Настройки уведомлений</h2>
                </div>
                
                <div className="space-y-6">
                  <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/30">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <h3 className="text-lg font-medium text-white">Email уведомления</h3>
                        </div>
                        <p className="text-gray-400 text-sm">Получать уведомления о новых функциях и обновлениях</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer ml-4">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                      </label>
                    </div>
                  </div>

                  <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/30">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 20h7a2 2 0 002-2V8a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <h3 className="text-lg font-medium text-white">Уведомления о розыгрышах</h3>
                        </div>
                        <p className="text-gray-400 text-sm">Получать уведомления о результатах розыгрышей</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer ml-4">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                      </label>
                    </div>
                  </div>

                  <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/30">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                          <h3 className="text-lg font-medium text-white">Маркетинговые уведомления</h3>
                        </div>
                        <p className="text-gray-400 text-sm">Получать предложения и промо-акции</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer ml-4">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={() => alert('Настройки уведомлений сохранены!')}
                    className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white py-4 rounded-xl text-lg font-semibold hover:from-orange-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-lg"
                  >
                    Сохранить настройки
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 