'use client';

import { useState, useEffect } from 'react';
import { Notification as NotificationType, NotificationSettings } from '@/types';
import { 
  getNotifications,
  getUnreadNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getNotificationSettings,
  saveNotificationSettings,
  requestNotificationPermission
} from '@/lib/notifications';
import { getCurrentUser } from '@/lib/user';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [activeTab, setActiveTab] = useState<'notifications' | 'settings'>('notifications');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const user = getCurrentUser();
      if (user) {
        setCurrentUser(user);
        const userNotifications = getNotifications(user.id);
        const userSettings = getNotificationSettings(user.id);
        setNotifications(userNotifications);
        setSettings(userSettings);
      }
    } catch (error) {
      console.error('Ошибка при загрузке данных:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = (notificationId: string) => {
    try {
      markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
    } catch (error) {
      console.error('Ошибка при отметке уведомления:', error);
    }
  };

  const handleMarkAllAsRead = () => {
    if (!currentUser) return;
    
    try {
      markAllNotificationsAsRead(currentUser.id);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Ошибка при отметке всех уведомлений:', error);
    }
  };

  const handleDeleteNotification = (notificationId: string) => {
    try {
      deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Ошибка при удалении уведомления:', error);
    }
  };

  const handleSettingsChange = (key: keyof NotificationSettings, value: boolean) => {
    if (!currentUser || !settings) return;

    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    saveNotificationSettings(currentUser.id, newSettings);
  };

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      alert('Разрешение на уведомления получено!');
    } else {
      alert('Разрешение на уведомления отклонено. Вы можете изменить это в настройках браузера.');
    }
  };

  const getNotificationIcon = (type: NotificationType['type']) => {
    switch (type) {
      case 'NEW_PARTICIPANT':
        return (
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        );
      case 'DRAW_COMPLETED':
        return (
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'WHEEL_SHARED':
        return (
          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Только что';
    if (diffMins < 60) return `${diffMins} мин назад`;
    if (diffHours < 24) return `${diffHours} ч назад`;
    if (diffDays < 7) return `${diffDays} дн назад`;
    return date.toLocaleDateString('ru-RU');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Центр уведомлений</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-4 mt-4">
            <button
              onClick={() => setActiveTab('notifications')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'notifications'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Уведомления
              {notifications.filter(n => !n.isRead).length > 0 && (
                <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                  {notifications.filter(n => !n.isRead).length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'settings'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Настройки
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Загрузка...</p>
            </div>
          ) : activeTab === 'notifications' ? (
            <div className="p-6">
              {/* Actions */}
              {notifications.length > 0 && (
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-600">
                    {notifications.filter(n => !n.isRead).length} непрочитанных из {notifications.length}
                  </span>
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Отметить все как прочитанные
                  </button>
                </div>
              )}

              {/* Notifications List */}
              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-lg font-medium text-gray-900">Уведомлений нет</p>
                  <p className="text-sm text-gray-600">Здесь будут отображаться ваши уведомления</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-lg border transition-colors ${
                        notification.isRead
                          ? 'bg-gray-50 border-gray-200'
                          : 'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">{notification.title}</h4>
                              <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                              <p className="text-xs text-gray-500 mt-2">{formatDate(notification.createdAt)}</p>
                            </div>
                            <div className="flex space-x-2 ml-4">
                              {!notification.isRead && (
                                <button
                                  onClick={() => handleMarkAsRead(notification.id)}
                                  className="text-blue-600 hover:text-blue-800 transition-colors"
                                  title="Отметить как прочитанное"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteNotification(notification.id)}
                                className="text-red-600 hover:text-red-800 transition-colors"
                                title="Удалить"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            // Settings Tab
            <div className="p-6">
              {settings ? (
                <div className="space-y-6">
                  {/* Push Notifications */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Push-уведомления</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            Включить push-уведомления
                          </label>
                          <p className="text-xs text-gray-500">
                            Получать уведомления в браузере
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.pushEnabled}
                            onChange={(e) => handleSettingsChange('pushEnabled', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      {settings.pushEnabled && (
                        <button
                          onClick={handleRequestPermission}
                          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Запросить разрешение браузера
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Notification Types */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Типы уведомлений</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            Новые участники
                          </label>
                          <p className="text-xs text-gray-500">
                            Уведомления о присоединении новых участников к розыгрышу
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.newParticipants}
                            onChange={(e) => handleSettingsChange('newParticipants', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            Завершение розыгрышей
                          </label>
                          <p className="text-xs text-gray-500">
                            Уведомления о результатах розыгрышей
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.drawCompleted}
                            onChange={(e) => handleSettingsChange('drawCompleted', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            Публикация рулеток
                          </label>
                          <p className="text-xs text-gray-500">
                            Уведомления о публикации ваших рулеток
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.wheelShared}
                            onChange={(e) => handleSettingsChange('wheelShared', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p>Ошибка загрузки настроек</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 