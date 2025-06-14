'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getUserRoulettes, deleteRoulette as deleteRouletteFromStorage, initializeDemoData, type Roulette } from '@/lib/roulettes';
import { getCurrentUser, updateUser, clearUser, saveUser, getSavedUserPlan, type User } from '@/lib/user';
import { getUnreadNotifications } from '@/lib/notifications';
import { DrawHistory } from '@/components/DrawHistory';
import { NotificationCenter } from '@/components/NotificationCenter';
import { initializeAllDemoData } from '@/lib/demoData';

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [roulettes, setRoulettes] = useState<Roulette[]>([]);
  const [activeTab, setActiveTab] = useState<'roulettes' | 'profile' | 'subscription'>('roulettes');
  const [profileForm, setProfileForm] = useState({ name: '', email: '' });
  const [showDrawHistory, setShowDrawHistory] = useState<{ wheelId: string; wheelTitle: string } | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();

  // Функция для обновления списка рулеток
  const refreshRoulettes = () => {
    if (user) {
      const userRoulettes = getUserRoulettes(user.id);
      setRoulettes(userRoulettes);
    }
  };

  useEffect(() => {
    // Проверяем авторизацию
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Загружаем данные пользователя
    const userData = getCurrentUser();
    if (userData) {
      setUser(userData);
      setProfileForm({ name: userData.name, email: userData.email });
    } else {
      // Если нет данных пользователя, создаем временные с данными из формы регистрации
      const savedRegData = localStorage.getItem('temp_registration_data');
      const savedPlan = getSavedUserPlan(); // Получаем сохраненный план
      let tempUser: User;
      
      if (savedRegData) {
        const regData = JSON.parse(savedRegData);
        tempUser = {
          id: '1',
          name: regData.name || 'Пользователь',
          email: regData.email || 'user@example.com',
          plan: savedPlan, // Используем сохраненный план
          createdAt: new Date().toISOString()
        };
        // Сохраняем как постоянные данные пользователя
        saveUser(tempUser);
        // Удаляем временные данные
        localStorage.removeItem('temp_registration_data');
      } else {
        tempUser = {
          id: '1',
          name: 'Пользователь',
          email: 'user@example.com',
          plan: savedPlan, // Используем сохраненный план
          createdAt: new Date().toISOString()
        };
        saveUser(tempUser); // Сохраняем пользователя
      }
      setUser(tempUser);
      setProfileForm({ name: tempUser.name, email: tempUser.email });
    }

    // Инициализируем демо-данные если их нет
    const currentUserId = userData?.id || '1';
    initializeDemoData(currentUserId);
    initializeAllDemoData(currentUserId);

    // Загружаем рулетки пользователя
    const userRoulettes = getUserRoulettes(currentUserId);
    setRoulettes(userRoulettes);

    // Загружаем количество непрочитанных уведомлений
    const unread = getUnreadNotifications(currentUserId);
    setUnreadCount(unread.length);
  }, [router]);

  // Обновляем список рулеток при фокусе на странице
  useEffect(() => {
    const handleFocus = () => {
      refreshRoulettes();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    clearUser();
    router.push('/');
  };

  const handleOpenRoulette = (rouletteId: string) => {
    // Открываем рулетку для просмотра/игры
    router.push(`/roulette/${rouletteId}`);
  };

  const handleEditRoulette = (rouletteId: string) => {
    // Переходим к редактированию рулетки
    router.push(`/dashboard/edit/${rouletteId}`);
  };

  const handleDeleteRoulette = (rouletteId: string) => {
    if (confirm('Вы уверены, что хотите удалить эту рулетку?')) {
      // Удаляем рулетку из localStorage
      const success = deleteRouletteFromStorage(rouletteId);
      if (success) {
        // Обновляем список рулеток
        setRoulettes(roulettes.filter(r => r.id !== rouletteId));
      } else {
        alert('Ошибка при удалении рулетки');
      }
    }
  };

  const handleShareRoulette = (rouletteId: string) => {
    // Копируем ссылку в буфер обмена
    const shareUrl = `${window.location.origin}/roulette/${rouletteId}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert('Ссылка скопирована в буфер обмена!');
    }).catch(() => {
      // Fallback для старых браузеров
      prompt('Скопируйте эту ссылку:', shareUrl);
    });
  };

  const handleUpdateProfile = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!profileForm.name.trim() || !profileForm.email.trim()) {
      alert('Пожалуйста, заполните все поля');
      return;
    }

    const updatedUser = updateUser({ name: profileForm.name, email: profileForm.email });
    if (updatedUser) {
      setUser(updatedUser);
      alert('Профиль успешно обновлен!');
    } else {
      alert('Ошибка при обновлении профиля');
    }
  };

  const handleProfileFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileForm({
      ...profileForm,
      [e.target.name]: e.target.value
    });
  };

  const handleChangePassword = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const currentPassword = formData.get('currentPassword') as string;
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (!currentPassword || !newPassword || !confirmPassword) {
      alert('Пожалуйста, заполните все поля');
      return;
    }

    if (newPassword !== confirmPassword) {
      alert('Новые пароли не совпадают');
      return;
    }

    if (newPassword.length < 6) {
      alert('Пароль должен содержать минимум 6 символов');
      return;
    }

    // Здесь будет логика смены пароля через API
    alert('Пароль успешно изменен!');
    e.currentTarget.reset();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">G</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">GIFTY</span>
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Привет, {user.name}!</span>
              
              {/* Кнопка уведомлений */}
              <button
                onClick={() => setShowNotifications(true)}
                className="relative text-gray-600 hover:text-gray-900 p-2 rounded-lg transition-colors"
                title="Уведомления"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg transition-colors"
              >
                Выйти
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Личный кабинет</h2>
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('roulettes')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'roulettes'
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Мои рулетки
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'profile'
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Настройки профиля
                </button>
                <button
                  onClick={() => setActiveTab('subscription')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'subscription'
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Подписка
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'roulettes' && (
              <div className="space-y-6">
                {/* Header with Create Button */}
                <div className="flex justify-between items-center">
                  <h1 className="text-3xl font-bold text-gray-900">Мои рулетки</h1>
                  {user.plan === 'free' && roulettes.length >= 3 ? (
                    <div className="text-center">
                      <button
                        disabled
                        className="bg-gray-300 text-gray-500 px-6 py-3 rounded-lg cursor-not-allowed font-medium mb-2"
                      >
                        + Создать рулетку
                      </button>
                      <p className="text-sm text-red-600">
                        Достигнут лимит бесплатного плана (3/3)
                      </p>
                      <Link 
                        href="/dashboard/subscription"
                        className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                      >
                        Обновить до PRO
                      </Link>
                    </div>
                  ) : (
                    <Link
                      href="/dashboard/create"
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      + Создать рулетку
                    </Link>
                  )}
                </div>

                {/* Plan Info */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Тарифный план: {user.plan === 'free' ? 'Бесплатный' : 'PRO'}
                      </h3>
                      <p className="text-gray-600">
                        {user.plan === 'free' 
                          ? `Использовано: ${roulettes.length}/3 рулеток`
                          : 'Безлимитное количество рулеток'
                        }
                      </p>
                    </div>
                    {user.plan === 'free' && (
                      <Link 
                        href="/dashboard/subscription"
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors inline-block"
                      >
                        Обновить до PRO
                      </Link>
                    )}
                  </div>
                </div>

                {/* Roulettes Grid */}
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {roulettes.map((roulette) => (
                    <div key={roulette.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">{roulette.name}</h3>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleEditRoulette(roulette.id)}
                            className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors"
                            title="Редактировать"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => handleDeleteRoulette(roulette.id)}
                            className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors"
                            title="Удалить"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p>Сегментов: {roulette.segments.length}</p>
                        <p>Создана: {new Date(roulette.createdAt).toLocaleDateString('ru-RU')}</p>
                        <p>Статус: {roulette.isPublic ? 'Публичная' : 'Приватная'}</p>
                        {user.plan === 'pro' && roulette.stats && (
                          <p>Розыгрышей: {roulette.stats.totalSpins}</p>
                        )}
                      </div>
                      <div className="mt-4 space-y-2">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleOpenRoulette(roulette.id)}
                            className="flex-1 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                          >
                            Открыть
                          </button>
                          <button 
                            onClick={() => handleShareRoulette(roulette.id)}
                            className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                          >
                            Поделиться
                          </button>
                        </div>
                        
                        {/* Кнопка истории розыгрышей */}
                        <button
                          onClick={() => setShowDrawHistory({ wheelId: roulette.id, wheelTitle: roulette.name })}
                          className="w-full bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                        >
                          📜 История розыгрышей
                        </button>

                        {user.plan === 'pro' && (
                          <Link
                            href={`/dashboard/stats/${roulette.id}`}
                            className="w-full bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium text-center block"
                          >
                            📊 Статистика
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Empty State */}
                  {roulettes.length === 0 && (
                    <div className="col-span-full text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Пока нет рулеток</h3>
                      <p className="text-gray-600 mb-4">Создайте свою первую рулетку прямо сейчас!</p>
                      {user.plan === 'free' && roulettes.length >= 3 ? (
                        <div className="text-center">
                          <button
                            disabled
                            className="bg-gray-300 text-gray-500 px-6 py-3 rounded-lg cursor-not-allowed font-medium mb-2"
                          >
                            Создать рулетку
                          </button>
                          <p className="text-sm text-red-600 mb-2">
                            Достигнут лимит бесплатного плана
                          </p>
                          <Link 
                            href="/dashboard/subscription"
                            className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                          >
                            Обновить до PRO
                          </Link>
                        </div>
                      ) : (
                        <Link
                          href="/dashboard/create"
                          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium inline-block"
                        >
                          Создать рулетку
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h1 className="text-3xl font-bold text-gray-900">Настройки профиля</h1>
                
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Личная информация</h2>
                  <form className="space-y-4" onSubmit={handleUpdateProfile}>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Имя</label>
                      <input
                        type="text"
                        name="name"
                        value={profileForm.name}
                        onChange={handleProfileFormChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={profileForm.email}
                        onChange={handleProfileFormChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Сохранить изменения
                    </button>
                  </form>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Смена пароля</h2>
                  <form className="space-y-4" onSubmit={handleChangePassword}>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Текущий пароль</label>
                      <input
                        type="password"
                        name="currentPassword"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Новый пароль</label>
                      <input
                        type="password"
                        name="newPassword"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                        required
                        minLength={6}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Подтвердите новый пароль</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                        required
                        minLength={6}
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Изменить пароль
                    </button>
                  </form>
                </div>
              </div>
            )}

            {activeTab === 'subscription' && (
              <div className="space-y-6">
                <h1 className="text-3xl font-bold text-gray-900">Управление подпиской</h1>
                
                {/* Current Plan Status */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Текущий план: {user.plan === 'free' ? 'Бесплатный' : 'PRO'}
                      </h3>
                      <p className="text-gray-600">
                        {user.plan === 'free' 
                          ? 'Базовая функциональность с ограничениями'
                          : 'Полный доступ ко всем функциям'
                        }
                      </p>
                    </div>
                    <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                      user.plan === 'pro' 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {user.plan === 'free' ? 'FREE' : 'PRO'}
                    </div>
                  </div>
                </div>

                {/* Plan Comparison */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Free Plan Features */}
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Бесплатный план</h3>
                    <ul className="space-y-3">
                      <li className="flex items-center">
                        <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-700">До 3 рулеток</span>
                      </li>
                      <li className="flex items-center">
                        <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-700">До 6 сегментов</span>
                      </li>
                      <li className="flex items-center">
                        <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-700">Базовые настройки</span>
                      </li>
                    </ul>
                  </div>

                  {/* PRO Plan Features */}
                  <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-purple-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">PRO план</h3>
                      <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                        Рекомендуем
                      </span>
                    </div>
                    <ul className="space-y-3">
                      <li className="flex items-center">
                        <svg className="w-5 h-5 text-purple-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-700">Безлимитное создание рулеток</span>
                      </li>
                      <li className="flex items-center">
                        <svg className="w-5 h-5 text-purple-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-700">До 20 сегментов + изображения</span>
                      </li>
                      <li className="flex items-center">
                        <svg className="w-5 h-5 text-purple-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-700">Расширенные настройки дизайна</span>
                      </li>
                      <li className="flex items-center">
                        <svg className="w-5 h-5 text-purple-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-700">Вес призов, статистика</span>
                      </li>
                      <li className="flex items-center">
                        <svg className="w-5 h-5 text-purple-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-700">История розыгрышей</span>
                      </li>
                      <li className="flex items-center">
                        <svg className="w-5 h-5 text-purple-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-700">Экспорт результатов в CSV</span>
                      </li>
                      <li className="flex items-center">
                        <svg className="w-5 h-5 text-purple-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-700">Push-уведомления о новых участниках</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="text-center">
                    {user.plan === 'free' ? (
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">
                          Готовы перейти на PRO?
                        </h3>
                        <p className="text-gray-600 mb-6">
                          Получите доступ ко всем функциям и создавайте неограниченное количество рулеток
                        </p>
                        <Link
                          href="/dashboard/subscription"
                          className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium inline-block"
                        >
                          Обновить до PRO - от 400₽/мес
                        </Link>
                      </div>
                    ) : (
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">
                          Спасибо за использование PRO!
                        </h3>
                        <p className="text-gray-600 mb-6">
                          У вас есть доступ ко всем функциям платформы
                        </p>
                        <Link
                          href="/dashboard/subscription"
                          className="bg-gray-600 text-white px-8 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium inline-block"
                        >
                          Управление подпиской
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Модальные окна */}
      {showDrawHistory && (
        <DrawHistory
          wheelId={showDrawHistory.wheelId}
          wheelTitle={showDrawHistory.wheelTitle}
          onClose={() => setShowDrawHistory(null)}
        />
      )}

      <NotificationCenter
        isOpen={showNotifications}
        onClose={() => {
          setShowNotifications(false);
          // Обновляем счетчик непрочитанных уведомлений
          if (user) {
            const unread = getUnreadNotifications(user.id);
            setUnreadCount(unread.length);
          }
        }}
      />
    </div>
  );
}