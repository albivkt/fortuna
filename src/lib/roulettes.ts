export interface Segment {
  id: string;
  text: string;
  color: string;
  weight: number;
  image?: string;
  imageUrl?: string; // URL изображения для PRO пользователей
}

export interface RouletteStats {
  totalSpins: number;
  segmentWins: { [segmentId: string]: number };
  lastSpinDate?: string;
  createdAt: string;
}

export interface Roulette {
  id: string;
  name: string;
  segments: Segment[];
  createdAt: string;
  isPublic: boolean;
  author: string;
  userId: string;
  // PRO функции
  customDesign?: {
    backgroundColor?: string;
    borderColor?: string;
    textColor?: string;
    centerImage?: string;
  };
  stats?: RouletteStats;
}

const ROULETTES_KEY = 'gifty_roulettes';

// Получить все рулетки пользователя
export const getUserRoulettes = (userId: string): Roulette[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(ROULETTES_KEY);
    const allRoulettes: Roulette[] = stored ? JSON.parse(stored) : [];
    return allRoulettes.filter(r => r.userId === userId);
  } catch (error) {
    console.error('Error loading roulettes:', error);
    return [];
  }
};

// Получить все рулетки
export const getAllRoulettes = (): Roulette[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(ROULETTES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading roulettes:', error);
    return [];
  }
};

// Получить рулетку по ID
export const getRouletteById = (id: string): Roulette | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(ROULETTES_KEY);
    const allRoulettes: Roulette[] = stored ? JSON.parse(stored) : [];
    return allRoulettes.find(r => r.id === id) || null;
  } catch (error) {
    console.error('Error loading roulette:', error);
    return null;
  }
};

// Сохранить новую рулетку
export const saveRoulette = (roulette: Omit<Roulette, 'id' | 'createdAt'>): Roulette => {
  if (typeof window === 'undefined') throw new Error('Cannot save on server');
  
  try {
    const stored = localStorage.getItem(ROULETTES_KEY);
    const allRoulettes: Roulette[] = stored ? JSON.parse(stored) : [];
    
    const newRoulette: Roulette = {
      ...roulette,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    
    allRoulettes.push(newRoulette);
    localStorage.setItem(ROULETTES_KEY, JSON.stringify(allRoulettes));
    
    return newRoulette;
  } catch (error) {
    console.error('Error saving roulette:', error);
    throw error;
  }
};

// Обновить существующую рулетку
export const updateRoulette = (id: string, updates: Partial<Omit<Roulette, 'id' | 'createdAt' | 'userId'>>): Roulette | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(ROULETTES_KEY);
    const allRoulettes: Roulette[] = stored ? JSON.parse(stored) : [];
    
    const index = allRoulettes.findIndex(r => r.id === id);
    if (index === -1) return null;
    
    allRoulettes[index] = { ...allRoulettes[index], ...updates };
    localStorage.setItem(ROULETTES_KEY, JSON.stringify(allRoulettes));
    
    return allRoulettes[index];
  } catch (error) {
    console.error('Error updating roulette:', error);
    return null;
  }
};

// Удалить рулетку
export const deleteRoulette = (id: string): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    const stored = localStorage.getItem(ROULETTES_KEY);
    const allRoulettes: Roulette[] = stored ? JSON.parse(stored) : [];
    
    const filteredRoulettes = allRoulettes.filter(r => r.id !== id);
    
    if (filteredRoulettes.length === allRoulettes.length) {
      return false; // Рулетка не найдена
    }
    
    localStorage.setItem(ROULETTES_KEY, JSON.stringify(filteredRoulettes));
    return true;
  } catch (error) {
    console.error('Error deleting roulette:', error);
    return false;
  }
};

// Обновить статистику рулетки после розыгрыша
export const updateRouletteStats = (rouletteId: string, winningSegmentId: string): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    const stored = localStorage.getItem(ROULETTES_KEY);
    const allRoulettes: Roulette[] = stored ? JSON.parse(stored) : [];
    
    const index = allRoulettes.findIndex(r => r.id === rouletteId);
    if (index === -1) return false;
    
    const roulette = allRoulettes[index];
    
    // Инициализируем статистику если её нет
    if (!roulette.stats) {
      roulette.stats = {
        totalSpins: 0,
        segmentWins: {},
        createdAt: new Date().toISOString()
      };
    }
    
    // Обновляем статистику
    roulette.stats.totalSpins += 1;
    roulette.stats.segmentWins[winningSegmentId] = (roulette.stats.segmentWins[winningSegmentId] || 0) + 1;
    roulette.stats.lastSpinDate = new Date().toISOString();
    
    allRoulettes[index] = roulette;
    localStorage.setItem(ROULETTES_KEY, JSON.stringify(allRoulettes));
    
    return true;
  } catch (error) {
    console.error('Error updating roulette stats:', error);
    return false;
  }
};

// Получить статистику рулетки
export const getRouletteStats = (rouletteId: string): RouletteStats | null => {
  const roulette = getRouletteById(rouletteId);
  return roulette?.stats || null;
};

// Очистить рулетки других пользователей (оставить только текущего пользователя)
export const cleanupOtherUsersRoulettes = (currentUserId: string): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const stored = localStorage.getItem(ROULETTES_KEY);
    if (!stored) return;
    
    const allRoulettes: Roulette[] = JSON.parse(stored);
    // Оставляем только рулетки текущего пользователя
    const userRoulettes = allRoulettes.filter(r => r.userId === currentUserId);
    localStorage.setItem(ROULETTES_KEY, JSON.stringify(userRoulettes));
    
    console.log(`Очищены рулетки других пользователей. Осталось: ${userRoulettes.length} рулеток`);
  } catch (error) {
    console.error('Error cleaning up other users roulettes:', error);
  }
};

// Инициализация с демо-данными (только если нет сохраненных данных)
export const initializeDemoData = (userId: string): void => {
  if (typeof window === 'undefined') return;
  
  const existing = getUserRoulettes(userId);
  if (existing.length > 0) return; // Уже есть данные
  
  const demoRoulettes: Roulette[] = [
    {
      id: `demo-1-${userId}`,
      name: 'Моя первая рулетка',
      segments: [
        { id: '1', text: 'Подарочная карта', color: '#EC4899', weight: 1 },
        { id: '2', text: 'Ноутбук', color: '#3B82F6', weight: 1 },
        { id: '3', text: 'Футболка', color: '#EF4444', weight: 1 },
        { id: '4', text: 'Путешествие', color: '#10B981', weight: 1 },
        { id: '5', text: 'Книга', color: '#F59E0B', weight: 1 },
        { id: '6', text: 'Гаджет', color: '#8B5CF6', weight: 1 },
      ],
      createdAt: '2024-01-15T10:00:00.000Z',
      isPublic: true,
      author: 'Пользователь',
      userId: userId
    },
    {
      id: `demo-2-${userId}`,
      name: 'Подарки на день рождения',
      segments: [
        { id: '1', text: 'Торт', color: '#EC4899', weight: 1 },
        { id: '2', text: 'Цветы', color: '#3B82F6', weight: 1 },
        { id: '3', text: 'Подарок', color: '#EF4444', weight: 1 },
        { id: '4', text: 'Сюрприз', color: '#10B981', weight: 1 },
        { id: '5', text: 'Поздравление', color: '#F59E0B', weight: 1 },
        { id: '6', text: 'Вечеринка', color: '#8B5CF6', weight: 1 },
      ],
      createdAt: '2024-01-10T15:30:00.000Z',
      isPublic: false,
      author: 'Пользователь',
      userId: userId
    }
  ];
  
  try {
    const stored = localStorage.getItem(ROULETTES_KEY);
    const allRoulettes: Roulette[] = stored ? JSON.parse(stored) : [];
    
    // Добавляем демо-данные только для этого пользователя
    const updatedRoulettes = [...allRoulettes, ...demoRoulettes];
    localStorage.setItem(ROULETTES_KEY, JSON.stringify(updatedRoulettes));
  } catch (error) {
    console.error('Error initializing demo data:', error);
  }
}; 