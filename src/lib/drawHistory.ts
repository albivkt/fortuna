import { DrawHistory, CSVExportData } from '@/types';
import { getCurrentUser } from '@/lib/user';

// Ключ для localStorage с привязкой к пользователю
const getDrawHistoryKey = (userId: string) => `draw_history_${userId}`;

// Получить ID текущего пользователя
const getCurrentUserId = (): string | null => {
  const user = getCurrentUser();
  return user?.id || null;
};

// Получить историю розыгрышей для конкретной рулетки
export function getDrawHistory(wheelId: string, userId?: string): DrawHistory[] {
  try {
    const targetUserId = userId || getCurrentUserId();
    if (!targetUserId) return [];
    
    const userHistoryKey = getDrawHistoryKey(targetUserId);
    const allHistory = JSON.parse(localStorage.getItem(userHistoryKey) || '[]');
    return allHistory.filter((item: DrawHistory) => item.wheelId === wheelId);
  } catch (error) {
    console.error('Ошибка при загрузке истории розыгрышей:', error);
    return [];
  }
}

// Получить всю историю розыгрышей пользователя
export function getAllDrawHistory(userId?: string): DrawHistory[] {
  try {
    const targetUserId = userId || getCurrentUserId();
    if (!targetUserId) return [];
    
    const userHistoryKey = getDrawHistoryKey(targetUserId);
    return JSON.parse(localStorage.getItem(userHistoryKey) || '[]');
  } catch (error) {
    console.error('Ошибка при загрузке истории розыгрышей:', error);
    return [];
  }
}

// Добавить новую запись в историю
export function addDrawHistoryEntry(entry: Omit<DrawHistory, 'id' | 'createdAt'>, userId?: string): DrawHistory {
  try {
    const targetUserId = userId || getCurrentUserId();
    if (!targetUserId) {
      throw new Error('Пользователь не авторизован');
    }
    
    const userHistoryKey = getDrawHistoryKey(targetUserId);
    const allHistory = getAllDrawHistory(targetUserId);
    const newEntry: DrawHistory = {
      ...entry,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    
    allHistory.push(newEntry);
    localStorage.setItem(userHistoryKey, JSON.stringify(allHistory));
    
    return newEntry;
  } catch (error) {
    console.error('Ошибка при добавлении записи в историю:', error);
    throw error;
  }
}

// Очистить историю для конкретной рулетки
export function clearDrawHistory(wheelId: string, userId?: string): void {
  try {
    const targetUserId = userId || getCurrentUserId();
    if (!targetUserId) return;
    
    const userHistoryKey = getDrawHistoryKey(targetUserId);
    const allHistory = getAllDrawHistory(targetUserId);
    const filteredHistory = allHistory.filter(item => item.wheelId !== wheelId);
    localStorage.setItem(userHistoryKey, JSON.stringify(filteredHistory));
  } catch (error) {
    console.error('Ошибка при очистке истории:', error);
    throw error;
  }
}

// Очистить всю историю пользователя (при выходе из аккаунта)
export function clearAllUserHistory(userId?: string): void {
  try {
    const targetUserId = userId || getCurrentUserId();
    if (!targetUserId) return;
    
    const userHistoryKey = getDrawHistoryKey(targetUserId);
    localStorage.removeItem(userHistoryKey);
  } catch (error) {
    console.error('Ошибка при очистке истории пользователя:', error);
  }
}

// Экспорт в CSV (PRO функция)
export function exportDrawHistoryToCSV(wheelId: string, wheelTitle: string, userId?: string): string {
  const history = getDrawHistory(wheelId, userId);
  
  if (history.length === 0) {
    throw new Error('Нет данных для экспорта');
  }

  // Подготавливаем данные для CSV
  const csvData: CSVExportData[] = history.map(item => {
    const date = new Date(item.createdAt);
    return {
      date: date.toLocaleDateString('ru-RU'),
      time: date.toLocaleTimeString('ru-RU'),
      prize: item.prize,
      participant: item.participant || '',
      wheelTitle: wheelTitle,
    };
  });

  // Создаем CSV строку
  const headers = ['Дата', 'Время', 'Приз', 'Участник', 'Рулетка'];
  const csvContent = [
    headers.join(','),
    ...csvData.map(row => [
      row.date,
      row.time,
      `"${row.prize}"`, // Экранируем кавычками на случай запятых в названии приза
      `"${row.participant}"`,
      `"${row.wheelTitle}"`
    ].join(','))
  ].join('\n');

  return csvContent;
}

// Скачать CSV файл
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// Получить статистику по истории
export function getDrawHistoryStats(wheelId: string, userId?: string) {
  const history = getDrawHistory(wheelId, userId);
  
  if (history.length === 0) {
    return {
      totalDraws: 0,
      uniquePrizes: 0,
      mostFrequentPrize: null,
      lastDraw: null,
    };
  }

  // Подсчитываем частоту призов
  const prizeFrequency: Record<string, number> = {};
  history.forEach(item => {
    prizeFrequency[item.prize] = (prizeFrequency[item.prize] || 0) + 1;
  });

  // Находим самый частый приз
  const mostFrequentPrize = Object.entries(prizeFrequency)
    .sort(([,a], [,b]) => b - a)[0];

  return {
    totalDraws: history.length,
    uniquePrizes: Object.keys(prizeFrequency).length,
    mostFrequentPrize: mostFrequentPrize ? {
      prize: mostFrequentPrize[0],
      count: mostFrequentPrize[1]
    } : null,
    lastDraw: history[history.length - 1],
    prizeFrequency,
  };
}

// Миграция старых данных (если есть глобальная история)
export function migrateOldDrawHistory(): void {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    const oldHistoryKey = 'draw_history';
    const oldHistory = localStorage.getItem(oldHistoryKey);
    
    if (oldHistory) {
      const userHistoryKey = getDrawHistoryKey(currentUser.id);
      const existingUserHistory = localStorage.getItem(userHistoryKey);
      
      // Если у пользователя еще нет истории, переносим старую
      if (!existingUserHistory) {
        localStorage.setItem(userHistoryKey, oldHistory);
      }
      
      // Удаляем старую глобальную историю
      localStorage.removeItem(oldHistoryKey);
    }
  } catch (error) {
    console.error('Ошибка при миграции истории:', error);
  }
}

// Генерация ID
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
} 