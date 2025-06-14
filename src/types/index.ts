// Типы для истории розыгрышей
export interface DrawHistory {
  id: string;
  prize: string;
  participant?: string;
  metadata?: {
    color?: string;
    probability?: number;
    segmentIndex?: number;
  };
  createdAt: string;
  wheelId: string;
}

// Типы для уведомлений
export interface Notification {
  id: string;
  type: 'NEW_PARTICIPANT' | 'DRAW_COMPLETED' | 'WHEEL_SHARED' | 'SYSTEM';
  title: string;
  message: string;
  isRead: boolean;
  metadata?: {
    wheelId?: string;
    participantName?: string;
    prize?: string;
  };
  createdAt: string;
  userId: string;
}

// Расширенный тип пользователя
export interface User {
  id: string;
  email: string;
  name: string;
  plan: 'FREE' | 'PRO';
  createdAt: string;
  updatedAt: string;
}

// Тип для экспорта CSV
export interface CSVExportData {
  date: string;
  time: string;
  prize: string;
  participant?: string;
  wheelTitle: string;
}

// Настройки уведомлений
export interface NotificationSettings {
  pushEnabled: boolean;
  emailEnabled: boolean;
  newParticipants: boolean;
  drawCompleted: boolean;
  wheelShared: boolean;
} 