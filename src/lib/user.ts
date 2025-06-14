export interface User {
  id: string;
  name: string;
  email: string;
  plan: 'free' | 'pro';
  createdAt: string;
}

const USER_KEY = 'gifty_user';
const USER_PLAN_KEY = 'gifty_user_plan';
const PERMANENT_USER_ID_KEY = 'gifty_permanent_user_id';

// Получить или создать постоянный ID пользователя
const getPermanentUserId = (): string => {
  if (typeof window === 'undefined') return 'default_user';
  
  try {
    let permanentId = localStorage.getItem(PERMANENT_USER_ID_KEY);
    if (!permanentId) {
      permanentId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem(PERMANENT_USER_ID_KEY, permanentId);
    }
    return permanentId;
  } catch (error) {
    console.error('Error getting permanent user ID:', error);
    return 'default_user';
  }
};

// Получить данные текущего пользователя
export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error loading user:', error);
    return null;
  }
};

// Сохранить данные пользователя
export const saveUser = (user: User): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    // Также сохраняем план отдельно
    localStorage.setItem(USER_PLAN_KEY, user.plan);
  } catch (error) {
    console.error('Error saving user:', error);
  }
};

// Получить сохраненный план пользователя
export const getSavedUserPlan = (): 'free' | 'pro' => {
  if (typeof window === 'undefined') return 'free';
  
  try {
    const savedPlan = localStorage.getItem(USER_PLAN_KEY);
    return (savedPlan as 'free' | 'pro') || 'free';
  } catch (error) {
    console.error('Error loading user plan:', error);
    return 'free';
  }
};

// Обновить данные пользователя
export const updateUser = (updates: Partial<Omit<User, 'id' | 'createdAt'>>): User | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) return null;
    
    const updatedUser = { ...currentUser, ...updates };
    saveUser(updatedUser);
    return updatedUser;
  } catch (error) {
    console.error('Error updating user:', error);
    return null;
  }
};

// Создать пользователя при регистрации
export const createUser = (userData: { name: string; email: string }, isNewRegistration: boolean = false): User => {
  // Для новой регистрации всегда используем free план
  // Для существующих пользователей получаем сохраненный план
  const plan = isNewRegistration ? 'free' : getSavedUserPlan();
  
  const user: User = {
    id: getPermanentUserId(), // Используем постоянный ID
    name: userData.name || 'Пользователь',
    email: userData.email,
    plan: plan,
    createdAt: new Date().toISOString()
  };
  
  saveUser(user);
  
  // Мигрируем существующие рулетки к новой системе ID
  migrateExistingRoulettes();
  
  return user;
};

// Создать нового пользователя при регистрации (всегда с бесплатным планом)
export const createNewUser = (userData: { name: string; email: string }): User => {
  // Генерируем новый уникальный ID для каждого нового пользователя
  const newUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const user: User = {
    id: newUserId, // Используем новый уникальный ID
    name: userData.name || 'Пользователь',
    email: userData.email,
    plan: 'free', // Всегда бесплатный план для новых пользователей
    createdAt: new Date().toISOString()
  };
  
  // Обновляем постоянный ID для этого пользователя
  localStorage.setItem(PERMANENT_USER_ID_KEY, newUserId);
  
  saveUser(user);
  
  // Очищаем рулетки предыдущих пользователей
  try {
    const { cleanupOtherUsersRoulettes } = require('@/lib/roulettes');
    cleanupOtherUsersRoulettes(newUserId);
  } catch (error) {
    console.error('Error cleaning up other users roulettes:', error);
  }
  
  return user;
};

// Полная очистка всех данных (для смены аккаунта)
export const clearAllUserData = (): void => {
  if (typeof window === 'undefined') return;
  
  try {
    // Удаляем все данные пользователя
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('token');
    localStorage.removeItem(USER_PLAN_KEY);
    localStorage.removeItem(PERMANENT_USER_ID_KEY);
    
    // Очищаем рулетки
    localStorage.removeItem('gifty_roulettes');
    
    // Очищаем уведомления
    localStorage.removeItem('notifications');
    
    // Очищаем историю розыгрышей (все ключи, начинающиеся с draw_history_)
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('draw_history_')) {
        localStorage.removeItem(key);
      }
    });
    
    console.log('Все данные пользователя очищены');
  } catch (error) {
    console.error('Error clearing all user data:', error);
  }
};

// Инициализировать пользователя при входе (с миграцией данных)
export const initializeUser = (user: User): User => {
  // Используем постоянный ID вместо переданного
  const userWithPermanentId = {
    ...user,
    id: getPermanentUserId()
  };
  
  saveUser(userWithPermanentId);
  
  // Мигрируем существующие рулетки к новой системе ID
  migrateExistingRoulettes();
  
  // Мигрируем старую историю розыгрышей, если есть
  try {
    const { migrateOldDrawHistory } = require('@/lib/drawHistory');
    migrateOldDrawHistory();
  } catch (error) {
    console.error('Error migrating draw history:', error);
  }
  
  return userWithPermanentId;
};

// Удалить данные пользователя (при выходе)
export const clearUser = (): void => {
  if (typeof window === 'undefined') return;
  
  try {
    // Удаляем данные пользователя
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('token'); // Удаляем токен авторизации
    localStorage.removeItem(USER_PLAN_KEY); // Удаляем сохраненный план
    
    // НЕ удаляем постоянный ID - он нужен для возможности входа обратно
    // НЕ удаляем рулетки и историю - они привязаны к userId и останутся для этого пользователя
  } catch (error) {
    console.error('Error clearing user:', error);
  }
};

// Мигрировать существующие рулетки к новой системе постоянных ID
export const migrateExistingRoulettes = (): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const permanentId = getPermanentUserId();
    const stored = localStorage.getItem('gifty_roulettes');
    
    if (stored) {
      const roulettes = JSON.parse(stored);
      let needsUpdate = false;
      
      // Обновляем рулетки с временными ID на постоянный ID
      const updatedRoulettes = roulettes.map((roulette: any) => {
        if (roulette.userId === '1' || roulette.userId.startsWith('user_temp_')) {
          needsUpdate = true;
          return { ...roulette, userId: permanentId };
        }
        return roulette;
      });
      
      if (needsUpdate) {
        localStorage.setItem('gifty_roulettes', JSON.stringify(updatedRoulettes));
        console.log('Рулетки успешно мигрированы к новой системе ID');
      }
    }
  } catch (error) {
    console.error('Error migrating existing roulettes:', error);
  }
}; 