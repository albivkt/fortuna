import { addDrawHistoryEntry } from './drawHistory';
import { addNotification } from './notifications';

// Инициализация демо-данных для истории розыгрышей
export function initializeDemoDrawHistory(userId: string) {
  const existingHistory = localStorage.getItem('draw_history');
  if (existingHistory && JSON.parse(existingHistory).length > 0) {
    return; // Уже есть данные
  }

  // Демо-рулетка ID (предполагаем, что есть демо-рулетка)
  const demoWheelId = 'demo-wheel-1';

  // Создаем несколько записей истории
  const demoHistory = [
    {
      wheelId: demoWheelId,
      prize: 'iPhone 15 Pro',
      participant: 'Алексей Петров',
      metadata: {
        color: '#FF6B6B',
        segmentIndex: 0,
      }
    },
    {
      wheelId: demoWheelId,
      prize: 'Скидка 50%',
      participant: 'Мария Иванова',
      metadata: {
        color: '#4ECDC4',
        segmentIndex: 2,
      }
    },
    {
      wheelId: demoWheelId,
      prize: 'Подарочная карта 5000₽',
      participant: 'Дмитрий Сидоров',
      metadata: {
        color: '#45B7D1',
        segmentIndex: 1,
      }
    },
    {
      wheelId: demoWheelId,
      prize: 'iPhone 15 Pro',
      participant: 'Анна Козлова',
      metadata: {
        color: '#FF6B6B',
        segmentIndex: 0,
      }
    },
    {
      wheelId: demoWheelId,
      prize: 'Бесплатная доставка',
      metadata: {
        color: '#96CEB4',
        segmentIndex: 3,
      }
    }
  ];

  // Добавляем записи с разными датами
  demoHistory.forEach((entry, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (demoHistory.length - index));
    date.setHours(Math.floor(Math.random() * 24));
    date.setMinutes(Math.floor(Math.random() * 60));

    try {
      const historyEntry = addDrawHistoryEntry(entry);
      // Обновляем дату создания
      const allHistory = JSON.parse(localStorage.getItem('draw_history') || '[]');
      const updatedHistory = allHistory.map((item: any) => 
        item.id === historyEntry.id 
          ? { ...item, createdAt: date.toISOString() }
          : item
      );
      localStorage.setItem('draw_history', JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Ошибка при создании демо-истории:', error);
    }
  });
}

// Инициализация демо-уведомлений
export function initializeDemoNotifications(userId: string) {
  const existingNotifications = localStorage.getItem('notifications');
  if (existingNotifications && JSON.parse(existingNotifications).length > 0) {
    return; // Уже есть данные
  }

  const demoNotifications = [
    {
      userId,
      type: 'NEW_PARTICIPANT' as const,
      title: 'Новый участник!',
      message: 'Алексей Петров присоединился к розыгрышу "Новогодние призы"',
      isRead: false,
      metadata: {
        wheelId: 'demo-wheel-1',
        participantName: 'Алексей Петров',
      },
    },
    {
      userId,
      type: 'DRAW_COMPLETED' as const,
      title: 'Розыгрыш завершен!',
      message: 'Розыгрыш "Новогодние призы" завершен! Победитель: Мария Иванова, приз: Скидка 50%',
      isRead: true,
      metadata: {
        wheelId: 'demo-wheel-1',
        prize: 'Скидка 50%',
        participantName: 'Мария Иванова',
      },
    },
    {
      userId,
      type: 'WHEEL_SHARED' as const,
      title: 'Рулетка опубликована!',
      message: 'Ваша рулетка "Новогодние призы" теперь доступна для участников',
      isRead: false,
      metadata: {
        wheelId: 'demo-wheel-1',
      },
    },
    {
      userId,
      type: 'NEW_PARTICIPANT' as const,
      title: 'Новый участник!',
      message: 'Дмитрий Сидоров присоединился к розыгрышу "Новогодние призы"',
      isRead: false,
      metadata: {
        wheelId: 'demo-wheel-1',
        participantName: 'Дмитрий Сидоров',
      },
    }
  ];

  // Добавляем уведомления с разными датами
  demoNotifications.forEach((notification, index) => {
    const date = new Date();
    date.setHours(date.getHours() - (demoNotifications.length - index) * 2);

    try {
      const newNotification = addNotification(notification);
      // Обновляем дату создания
      const allNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
      const updatedNotifications = allNotifications.map((item: any) => 
        item.id === newNotification.id 
          ? { ...item, createdAt: date.toISOString() }
          : item
      );
      localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
    } catch (error) {
      console.error('Ошибка при создании демо-уведомления:', error);
    }
  });
}

// Общая функция инициализации всех демо-данных
export function initializeAllDemoData(userId: string) {
  initializeDemoDrawHistory(userId);
  initializeDemoNotifications(userId);
} 