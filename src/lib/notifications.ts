import { type Notification as NotificationType, NotificationSettings } from '@/types';

// Ключи для localStorage
const NOTIFICATIONS_KEY = 'notifications';
const NOTIFICATION_SETTINGS_KEY = 'notification_settings';

// Получить все уведомления пользователя
export function getNotifications(userId: string): NotificationType[] {
  try {
    const allNotifications = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '[]');
    return allNotifications
      .filter((notification: NotificationType) => notification.userId === userId)
      .sort((a: NotificationType, b: NotificationType) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  } catch (error) {
    console.error('Ошибка при загрузке уведомлений:', error);
    return [];
  }
}

// Получить непрочитанные уведомления
export function getUnreadNotifications(userId: string): NotificationType[] {
  return getNotifications(userId).filter(notification => !notification.isRead);
}

// Добавить новое уведомление
export function addNotification(notification: Omit<NotificationType, 'id' | 'createdAt'>): NotificationType {
  try {
    const allNotifications = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '[]');
    const newNotification: NotificationType = {
      ...notification,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    
    allNotifications.push(newNotification);
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(allNotifications));
    
    // Отправляем push-уведомление если включено
    const settings = getNotificationSettings(notification.userId);
    if (settings.pushEnabled) {
      sendPushNotification(newNotification);
    }
    
    return newNotification;
  } catch (error) {
    console.error('Ошибка при добавлении уведомления:', error);
    throw error;
  }
}

// Отметить уведомление как прочитанное
export function markNotificationAsRead(notificationId: string): void {
  try {
    const allNotifications = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '[]');
    const updatedNotifications = allNotifications.map((notification: NotificationType) => 
      notification.id === notificationId 
        ? { ...notification, isRead: true }
        : notification
    );
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updatedNotifications));
  } catch (error) {
    console.error('Ошибка при отметке уведомления как прочитанного:', error);
    throw error;
  }
}

// Отметить все уведомления как прочитанные
export function markAllNotificationsAsRead(userId: string): void {
  try {
    const allNotifications = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '[]');
    const updatedNotifications = allNotifications.map((notification: NotificationType) => 
      notification.userId === userId 
        ? { ...notification, isRead: true }
        : notification
    );
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updatedNotifications));
  } catch (error) {
    console.error('Ошибка при отметке всех уведомлений как прочитанных:', error);
    throw error;
  }
}

// Удалить уведомление
export function deleteNotification(notificationId: string): void {
  try {
    const allNotifications = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '[]');
    const filteredNotifications = allNotifications.filter(
      (notification: NotificationType) => notification.id !== notificationId
    );
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(filteredNotifications));
  } catch (error) {
    console.error('Ошибка при удалении уведомления:', error);
    throw error;
  }
}

// Получить настройки уведомлений
export function getNotificationSettings(userId: string): NotificationSettings {
  try {
    const allSettings = JSON.parse(localStorage.getItem(NOTIFICATION_SETTINGS_KEY) || '{}');
    return allSettings[userId] || {
      pushEnabled: true,
      emailEnabled: false,
      newParticipants: true,
      drawCompleted: true,
      wheelShared: true,
    };
  } catch (error) {
    console.error('Ошибка при загрузке настроек уведомлений:', error);
    return {
      pushEnabled: true,
      emailEnabled: false,
      newParticipants: true,
      drawCompleted: true,
      wheelShared: true,
    };
  }
}

// Сохранить настройки уведомлений
export function saveNotificationSettings(userId: string, settings: NotificationSettings): void {
  try {
    const allSettings = JSON.parse(localStorage.getItem(NOTIFICATION_SETTINGS_KEY) || '{}');
    allSettings[userId] = settings;
    localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(allSettings));
  } catch (error) {
    console.error('Ошибка при сохранении настроек уведомлений:', error);
    throw error;
  }
}

// Отправить push-уведомление
export function sendPushNotification(notification: NotificationType): void {
  // Проверяем поддержку браузером
  if (!('Notification' in window)) {
    console.warn('Браузер не поддерживает уведомления');
    return;
  }

  // Проверяем разрешение
  if (Notification.permission === 'granted') {
    new Notification(notification.title, {
      body: notification.message,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: notification.id,
    });
  } else if (Notification.permission !== 'denied') {
    // Запрашиваем разрешение
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: notification.id,
        });
      }
    });
  }
}

// Запросить разрешение на уведомления
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

// Создать уведомление о новом участнике (PRO функция)
export function createNewParticipantNotification(
  userId: string, 
  participantName: string, 
  wheelTitle: string,
  wheelId: string
): void {
  const settings = getNotificationSettings(userId);
  if (!settings.newParticipants) return;

  addNotification({
    userId,
    type: 'NEW_PARTICIPANT',
    title: 'Новый участник!',
    message: `${participantName} присоединился к розыгрышу "${wheelTitle}"`,
    isRead: false,
    metadata: {
      wheelId,
      participantName,
    },
  });
}

// Создать уведомление о завершении розыгрыша
export function createDrawCompletedNotification(
  userId: string,
  prize: string,
  wheelTitle: string,
  wheelId: string,
  participant?: string
): void {
  const settings = getNotificationSettings(userId);
  if (!settings.drawCompleted) return;

  const message = participant 
    ? `Розыгрыш "${wheelTitle}" завершен! Победитель: ${participant}, приз: ${prize}`
    : `Розыгрыш "${wheelTitle}" завершен! Выпал приз: ${prize}`;

  addNotification({
    userId,
    type: 'DRAW_COMPLETED',
    title: 'Розыгрыш завершен!',
    message,
    isRead: false,
    metadata: {
      wheelId,
      prize,
      participantName: participant,
    },
  });
}

// Создать уведомление о публикации рулетки
export function createWheelSharedNotification(
  userId: string,
  wheelTitle: string,
  wheelId: string
): void {
  const settings = getNotificationSettings(userId);
  if (!settings.wheelShared) return;

  addNotification({
    userId,
    type: 'WHEEL_SHARED',
    title: 'Рулетка опубликована!',
    message: `Ваша рулетка "${wheelTitle}" теперь доступна для участников`,
    isRead: false,
    metadata: {
      wheelId,
    },
  });
}

// Генерация ID
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
} 