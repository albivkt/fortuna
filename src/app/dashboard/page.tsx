'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useWheels, useDeleteWheel, useGeneratePublicLink, useRemovePublicLink, useMe, usePlanLimits } from '@/lib/graphql/hooks';
import { useQuery, useLazyQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { GET_WHEEL, GENERATE_PUBLIC_LINK, REMOVE_PUBLIC_LINK } from '@/lib/graphql/queries';
import { getNotifications, markNotificationAsRead } from '@/lib/notifications';
import { getCurrentUser, clearAllUserData } from '@/lib/user';
import { type DrawHistory, type Notification } from '@/types';
import { formatDateSafely } from '@/lib/dateUtils';



// Генерация session ID для временных пользователей
const getOrCreateSessionId = () => {
  let sessionId = localStorage.getItem('gifty_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('gifty_session_id', sessionId);
  }
  return sessionId;
};

// Интерфейс для пользователя дашборда
interface DashboardUser {
  id: string;
  name: string;
  email: string;
  plan: 'free' | 'pro';
}

export default function DashboardPage() {
  const router = useRouter();
  
  // GraphQL запросы
  const { data: wheelsData, loading: wheelsLoading, error: wheelsError, refetch } = useWheels();
  const [deleteWheel] = useDeleteWheel();
  const [generatePublicLink] = useGeneratePublicLink();
  const [removePublicLink] = useRemovePublicLink();
  
  // Получаем информацию о пользователе через GraphQL
  const { data: meData, loading: meLoading, error: meError, refetch: refetchMe } = useMe();
  const { data: planData, loading: planLoading, refetch: refetchPlan } = usePlanLimits();
  


  const [user, setUser] = useState<DashboardUser | null>(null);
  const [showDrawHistory, setShowDrawHistory] = useState<{ wheelId: string; wheelTitle: string } | null>(null);
  const [drawHistory, setDrawHistory] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const [getWheelHistory, { loading: historyLoading }] = useLazyQuery(GET_WHEEL, {
    onCompleted: (data) => {
      if (data?.wheel?.spins) {
        setDrawHistory(data.wheel.spins);
      }
    },
    onError: (error) => {
      console.error('❌ Error loading wheel history:', error);
      alert('Ошибка при загрузке истории вращений');
    },
  });

  useEffect(() => {
    // Если пользователь авторизован через GraphQL
    if (meData?.me) {
      const authenticatedUser = meData.me;
      // Приоритет: planData.me.plan > meData.me.plan > 'free'
      const userPlan = (planData?.me?.plan || authenticatedUser.plan)?.toLowerCase() || 'free';
      
      const dashboardUser: DashboardUser = {
        id: authenticatedUser.id,
        name: authenticatedUser.name || 'Пользователь',
        email: authenticatedUser.email,
        plan: userPlan as 'free' | 'pro'
      };
      setUser(dashboardUser);
      
      // Загружаем уведомления для авторизованного пользователя
      const userNotifications = getNotifications(authenticatedUser.id);
      setNotifications(userNotifications);
      
      console.log('👤 Authenticated user:', dashboardUser);
      console.log('📋 User plan from meData:', authenticatedUser.plan);
      console.log('📋 User plan from planData:', planData?.me?.plan);
      console.log('📋 Final user plan:', userPlan);
    } else if (!meLoading && !meData?.me) {
      // Если пользователь не авторизован, создаем временного пользователя
      const sessionId = getOrCreateSessionId();
      if (sessionId) {
        // Пытаемся получить данные пользователя из localStorage
        const localUser = getCurrentUser();
        
        const dashboardUser: DashboardUser = {
          id: sessionId,
          name: localUser?.name || 'Гость', // Используем имя из localStorage или "Гость" как fallback
          email: localUser?.email || `temp_${sessionId}@gifty.local`,
          plan: 'free' // Неавторизованные пользователи всегда имеют free план
        };
        setUser(dashboardUser);
        
        // Загружаем уведомления для временного пользователя
        const userNotifications = getNotifications(sessionId);
        setNotifications(userNotifications);
        
        console.log('👤 Guest user created:', dashboardUser);
        console.log('📋 Local user data:', localUser);
      }
    }
  }, [meData, meLoading, planData]);

  // Обновляем данные пользователя при монтировании компонента
  useEffect(() => {
    console.log('🔄 Dashboard mounted, refreshing user data');
    if (!meLoading && !planLoading) {
      Promise.all([refetchMe(), refetchPlan()]);
    }
  }, []); // Выполняется только при монтировании

  // Обновляем данные пользователя при фокусе на странице (например, после возвращения со страницы подписки)
  useEffect(() => {
    const handleFocus = () => {
      console.log('🔄 Refreshing user data on page focus');
      Promise.all([refetchMe(), refetchPlan()]);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('🔄 Refreshing user data on visibility change');
        Promise.all([refetchMe(), refetchPlan()]);
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refetchMe, refetchPlan]);

  // Дополнительный эффект для принудительного обновления при изменении данных пользователя
  useEffect(() => {
    if (meData?.me) {
      console.log('🔄 User data changed, updating local state');
      const authenticatedUser = meData.me;
      // Приоритет: planData.me.plan > meData.me.plan > 'free'
      const userPlan = (planData?.me?.plan || authenticatedUser.plan)?.toLowerCase() || 'free';
      
      setUser(prev => {
        const newUser = {
          id: authenticatedUser.id,
          name: authenticatedUser.name || 'Пользователь',
          email: authenticatedUser.email,
          plan: userPlan as 'free' | 'pro'
        };
        
        // Проверяем, изменился ли план
        if (prev?.plan !== newUser.plan) {
          console.log('📋 Plan changed from', prev?.plan, 'to', newUser.plan);
        }
        
        return newUser;
      });
    }
  }, [meData, planData]);

  // Закрытие модального окна по Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showDrawHistory) {
        setShowDrawHistory(null);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showDrawHistory]);

  const wheels = wheelsData?.wheels || [];

  const handleOpenRoulette = (id: string) => {
    router.push(`/roulette/${id}`);
  };

  const handleEditRoulette = (id: string) => {
    router.push(`/dashboard/edit/${id}`);
  };

  const handleDeleteRoulette = async (id: string, title: string) => {
    if (confirm(`Вы уверены, что хотите удалить рулетку "${title}"?`)) {
      try {
        await deleteWheel({
          variables: { id }
        });
        // Обновляем список рулеток
        refetch();
      } catch (error) {
        console.error('Ошибка при удалении рулетки:', error);
        alert('Ошибка при удалении рулетки');
      }
    }
  };

  const handleShowDrawHistory = (wheelId: string, wheelTitle: string) => {
    setShowDrawHistory({ wheelId, wheelTitle });
    getWheelHistory({
      variables: { id: wheelId }
    });
  };

  const handleMarkNotificationAsRead = (notificationId: string) => {
    markNotificationAsRead(notificationId);
    if (user) {
      const updatedNotifications = getNotifications(user.id);
      setNotifications(updatedNotifications);
    }
  };

  const handleGeneratePublicLink = async (wheelId: string) => {
    try {
      await generatePublicLink({
        variables: {
          input: { wheelId }
        }
      });
    } catch (error) {
      console.error('Error generating public link:', error);
    }
  };

  const handleRemovePublicLink = async (wheelId: string) => {
    if (confirm('Вы уверены, что хотите удалить публичную ссылку? Гости больше не смогут получить доступ к рулетке.')) {
      try {
        await removePublicLink({
          variables: { wheelId }
        });
      } catch (error) {
        console.error('Error removing public link:', error);
      }
    }
  };

  const handleCopyPublicLink = (slug: string) => {
    const publicUrl = `${window.location.origin}/public/${slug}`;
    navigator.clipboard.writeText(publicUrl).then(() => {
      alert('Публичная ссылка скопирована в буфер обмена!');
    }).catch(() => {
      prompt('Скопируйте эту публичную ссылку:', publicUrl);
    });
  };

  const handleSwitchAccount = () => {
    if (confirm('Вы уверены, что хотите сменить аккаунт? Все несохраненные данные будут потеряны.')) {
      clearAllUserData();
      window.location.href = '/login';
    }
  };

  const handleRefreshUserData = async () => {
    console.log('🔄 Manually refreshing user data');
    try {
      await Promise.all([refetchMe(), refetchPlan()]);
      alert('Данные пользователя обновлены!');
    } catch (error) {
      console.error('Error refreshing user data:', error);
      alert('Ошибка при обновлении данных');
    }
  };

  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <Link href="/" className="text-2xl font-bold text-white">
                GIFTY
              </Link>
              <span className="text-sm text-gray-400 hidden sm:block">панель управления</span>
            </div>
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-gray-300 hover:text-white transition-colors rounded-lg hover:bg-gray-700/50"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM11 19H6.5A2.5 2.5 0 014 16.5v-9A2.5 2.5 0 016.5 5h11A2.5 2.5 0 0120 7.5v3.5" />
                  </svg>
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadNotificationsCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700/50 z-50">
                    <div className="p-4 border-b border-gray-700/50">
                      <h3 className="font-semibold text-white">Уведомления</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-400">
                          Нет уведомлений
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 border-b border-gray-700/30 hover:bg-gray-700/30 cursor-pointer transition-colors ${
                              !notification.isRead ? 'bg-orange-500/10' : ''
                            }`}
                            onClick={() => handleMarkNotificationAsRead(notification.id)}
                          >
                            <div className="flex items-start space-x-3">
                              <div className="text-2xl">🔔</div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-white">
                                  {notification.title}
                                </p>
                                <p className="text-sm text-gray-300 mt-1">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-400 mt-2">
                                  {new Date(notification.createdAt).toLocaleString('ru-RU')}
                                </p>
                              </div>
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <div className="text-sm text-gray-300 flex items-center space-x-2">
                  <div>
                  План: <span className="font-semibold text-white">{user.plan === 'pro' ? 'PRO' : 'Бесплатный'}</span>
                  </div>
                  <button
                    onClick={handleRefreshUserData}
                    className="p-1 text-gray-400 hover:text-white transition-colors rounded"
                    title="Обновить данные пользователя"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>
                {user.plan !== 'pro' && (
                  <Link
                    href="/pricing"
                    className="bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 px-4 py-2 rounded-lg hover:from-yellow-500 hover:to-orange-500 transition-all font-medium shadow-lg"
                  >
                    Обновить до PRO
                  </Link>
                )}
                <button
                  onClick={handleSwitchAccount}
                  className="bg-gray-700/50 border border-gray-600/50 text-gray-300 px-3 py-2 rounded-lg hover:bg-gray-600/50 hover:text-white transition-all font-medium backdrop-blur-sm"
                  title="Сменить аккаунт"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Добро пожаловать, {user.name}!
          </h1>
          <p className="text-gray-300 text-lg">
            Управляйте своими рулетками и создавайте новые
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800/60 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-gray-700/50">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center border border-blue-400/30">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Всего рулеток</p>
                <p className="text-2xl font-bold text-white">{wheels.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/60 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-gray-700/50">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center border border-green-400/30">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Публичных</p>
                <p className="text-2xl font-bold text-white">
                  {wheels.filter(w => w.isPublic).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/60 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-gray-700/50">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center border border-purple-400/30">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Всего вращений</p>
                <p className="text-2xl font-bold text-white">
                  {wheels.reduce((total, wheel) => total + wheel.spins.length, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Link
            href="/dashboard/create"
            className="bg-gradient-to-r from-orange-400 to-pink-400 text-white px-6 py-3 rounded-xl hover:from-orange-500 hover:to-pink-500 transition-all font-medium text-center shadow-lg transform hover:scale-105"
          >
            Создать новую рулетку
          </Link>
          <Link 
            href="/"
            className="bg-gray-700/50 border border-gray-600/50 text-gray-300 px-6 py-3 rounded-xl hover:bg-gray-600/50 hover:text-white transition-all font-medium text-center backdrop-blur-sm"
          >
            Посмотреть публичные рулетки
          </Link>
        </div>

        {/* Roulettes List */}
        <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl shadow-xl border border-gray-700/50">
          <div className="p-6 border-b border-gray-700/50">
            <h2 className="text-xl font-semibold text-white">Мои рулетки</h2>
          </div>
          
          {wheelsLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400 mx-auto mb-4"></div>
              <p className="text-gray-300">Загрузка рулеток...</p>
            </div>
          ) : wheelsError ? (
            <div className="p-8 text-center">
              <p className="text-red-400">Ошибка загрузки рулеток</p>
            </div>
          ) : wheels.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-600/30">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Нет рулеток</h3>
              <p className="text-gray-400 mb-4">Создайте свою первую рулетку, чтобы начать</p>
              <Link
                href="/dashboard/create"
                className="bg-gradient-to-r from-orange-400 to-pink-400 text-white px-6 py-3 rounded-xl hover:from-orange-500 hover:to-pink-500 transition-all font-medium shadow-lg inline-block"
              >
                Создать рулетку
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-700/30">
              {wheels.map((wheel, index) => (
                <div key={wheel.id} className="p-6 hover:bg-gray-700/20 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {wheel.title}
                      </h3>
                      {wheel.description && (
                        <p className="text-gray-300 mb-3">{wheel.description}</p>
                      )}
                      
                      <div className="space-y-2 text-sm text-gray-400">
                        <p>Сегментов: {wheel.segments.length}</p>
                        <p>Создана: {formatDateSafely(wheel.createdAt)}</p>
                        <p>Статус: {wheel.isPublic ? 'Публичная' : 'Приватная'}</p>
                        <p>Вращений: {wheel.spins.length}</p>
                        {wheel.publicSlug && (
                          <p className="text-green-400 font-medium">
                            🔗 Публичная ссылка: активна
                          </p>
                        )}
                      </div>
                      
                      <div className="mt-4 space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <button 
                            onClick={() => handleOpenRoulette(wheel.id)}
                            className="bg-blue-500/20 text-blue-400 border border-blue-400/30 px-4 py-2 rounded-lg hover:bg-blue-500/30 transition-all text-sm font-medium backdrop-blur-sm"
                          >
                            Открыть
                          </button>
                          <button
                            onClick={() => handleShowDrawHistory(wheel.id, wheel.title)}
                            className="bg-green-500/20 text-green-400 border border-green-400/30 px-4 py-2 rounded-lg hover:bg-green-500/30 transition-all text-sm font-medium backdrop-blur-sm"
                          >
                            📜 История
                          </button>
                        </div>

                        {/* Публичная ссылка */}
                        {wheel.publicSlug ? (
                          <div className="space-y-2">
                            <button
                              onClick={() => handleCopyPublicLink(wheel.publicSlug!)}
                              className="w-full bg-blue-500/20 text-blue-400 border border-blue-400/30 px-4 py-2 rounded-lg hover:bg-blue-500/30 transition-all text-sm font-medium backdrop-blur-sm"
                            >
                              🔗 Скопировать публичную ссылку
                            </button>
                            <button
                              onClick={() => handleRemovePublicLink(wheel.id)}
                              className="w-full bg-orange-500/20 text-orange-400 border border-orange-400/30 px-4 py-2 rounded-lg hover:bg-orange-500/30 transition-all text-sm font-medium backdrop-blur-sm"
                            >
                              🗑️ Удалить публичную ссылку
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleGeneratePublicLink(wheel.id)}
                            className="w-full bg-purple-500/20 text-purple-400 border border-purple-400/30 px-4 py-2 rounded-lg hover:bg-purple-500/30 transition-all text-sm font-medium backdrop-blur-sm"
                          >
                            🌐 Создать публичную ссылку
                          </button>
                        )}

                        <div className="grid grid-cols-2 gap-2">
                          <button 
                            onClick={() => handleEditRoulette(wheel.id)}
                            className="bg-yellow-500/20 text-yellow-400 border border-yellow-400/30 px-4 py-2 rounded-lg hover:bg-yellow-500/30 transition-all text-sm font-medium backdrop-blur-sm"
                          >
                            Редактировать
                          </button>
                          <button
                            onClick={() => handleDeleteRoulette(wheel.id, wheel.title)}
                            className="bg-red-500/20 text-red-400 border border-red-400/30 px-4 py-2 rounded-lg hover:bg-red-500/30 transition-all text-sm font-medium backdrop-blur-sm"
                          >
                            Удалить
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="ml-6 flex-shrink-0">
                      <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-lg">
                          {index + 1}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Draw History Modal */}
      {showDrawHistory && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowDrawHistory(null)}
        >
          <div 
            className="bg-gray-800/90 backdrop-blur-sm rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl border border-gray-700/50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-700/50">
              <div className="flex items-center justify-between">
                <div>
                <h3 className="text-xl font-semibold text-white">
                  История вращений: {showDrawHistory.wheelTitle}
                </h3>
                  {user?.plan === 'pro' && drawHistory.length > 0 && (
                    <p className="text-sm text-gray-400 mt-1">
                      Доступно для экспорта: {drawHistory.length} записей
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  {user?.plan === 'pro' && drawHistory.length > 0 && (
                <button
                  onClick={() => {
                        try {
                          // Подготавливаем данные для CSV
                          const csvData = drawHistory.map(spin => {
                            const date = new Date(spin.createdAt);
                            return {
                              date: date.toLocaleDateString('ru-RU'),
                              time: date.toLocaleTimeString('ru-RU'),
                              result: spin.result,
                              participant: spin.participant || '',
                              userName: spin.user?.name || 'Гость',
                            };
                          });

                          // Создаем CSV строку с BOM для корректного отображения кириллицы
                          const headers = ['Дата', 'Время', 'Результат', 'Участник', 'Пользователь'];
                          const csvContent = [
                            headers.join(','),
                            ...csvData.map(row => [
                              row.date,
                              row.time,
                              `"${row.result}"`, // Экранируем кавычками на случай запятых
                              `"${row.participant}"`,
                              `"${row.userName}"`
                            ].join(','))
                          ].join('\n');

                          // Создаем и скачиваем файл
                          const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
                          const link = document.createElement('a');
                          
                          if (link.download !== undefined) {
                            const url = URL.createObjectURL(blob);
                            link.setAttribute('href', url);
                            const filename = `История_вращений_${showDrawHistory.wheelTitle.replace(/[^a-zA-Z0-9]/g, '_')}.csv`;
                            link.setAttribute('download', filename);
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }
                        } catch (error) {
                          console.error('Error exporting draw history:', error);
                          alert('Ошибка при экспорте истории вращений');
                        }
                      }}
                      className="bg-blue-500/20 text-blue-400 border border-blue-400/30 px-4 py-2 rounded-lg hover:bg-blue-500/30 transition-all text-sm font-medium backdrop-blur-sm"
                    >
                      Экспортировать в CSV
                </button>
                  )}
                  <button
                    onClick={() => setShowDrawHistory(null)}
                    className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-700/50"
                    title="Закрыть"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {historyLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400 mx-auto mb-4"></div>
                  <p className="text-gray-300">Загрузка истории вращений...</p>
                </div>
              ) : drawHistory.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-600/30">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">История вращений пуста</h3>
                  <p className="text-gray-400 mb-4">Вы еще не совершали вращений на этой рулетке</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-700/30">
                  {drawHistory.map((spin, index) => (
                    <div key={spin.id} className="p-4 hover:bg-gray-700/20 transition-colors">
                      <div className="flex items-start space-x-3">
                        <div className="text-2xl">🔔</div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">
                            {spin.result}
                          </p>
                          <p className="text-sm text-gray-300 mt-1">
                            {spin.participant}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            {new Date(spin.createdAt).toLocaleString('ru-RU')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}