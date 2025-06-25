'use client';

import { useState } from 'react';
import { 
  useWheels, 
  useCreateWheel, 
  useSpinWheel, 
  useDeleteWheel,
  useRegister,
  useLogin,
  useAuth,
  useLogout,
  type CreateWheelInput 
} from '@/lib/graphql/hooks';

export default function TestBackendPage() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('Тестовый пользователь');

  // Хуки
  const { data: wheelsData, loading: wheelsLoading, error: wheelsError, refetch: refetchWheels } = useWheels();
  const [createWheel] = useCreateWheel();
  const [spinWheel] = useSpinWheel();
  const [deleteWheel] = useDeleteWheel();
  const [register] = useRegister();
  const [login] = useLogin();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const logout = useLogout();

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  // Тест регистрации
  const testRegister = async () => {
    try {
      const result = await register({
        variables: {
          input: { email, password, name }
        }
      });
      
      if (result.data) {
        addResult(`✅ Регистрация успешна: ${result.data.register.user.email}`);
      }
    } catch (error: any) {
      addResult(`❌ Ошибка регистрации: ${error.message}`);
    }
  };

  // Тест входа
  const testLogin = async () => {
    try {
      const result = await login({
        variables: {
          input: { email, password }
        }
      });
      
      if (result.data) {
        addResult(`✅ Вход успешен: ${result.data.login.user.email}`);
      }
    } catch (error: any) {
      addResult(`❌ Ошибка входа: ${error.message}`);
    }
  };

  // Тест создания рулетки
  const testCreateWheel = async () => {
    const wheelInput: CreateWheelInput = {
      title: `Тестовая рулетка ${Date.now()}`,
      description: 'Создана через GraphQL бэкенд',
      segments: [
        {
          option: 'Вариант 1',
          style: { backgroundColor: '#FF6B6B', textColor: 'white' }
        },
        {
          option: 'Вариант 2', 
          style: { backgroundColor: '#4ECDC4', textColor: 'white' }
        },
        {
          option: 'Вариант 3',
          style: { backgroundColor: '#45B7D1', textColor: 'white' }
        }
      ],
      isPublic: true
    };

    try {
      const result = await createWheel({
        variables: { input: wheelInput }
      });
      
      if (result.data) {
        addResult(`✅ Рулетка создана: ${result.data.createWheel.title} (ID: ${result.data.createWheel.id})`);
        return result.data.createWheel.id;
      }
    } catch (error: any) {
      addResult(`❌ Ошибка создания рулетки: ${error.message}`);
    }
    return null;
  };

  // Тест вращения рулетки
  const testSpinWheel = async (wheelId: string) => {
    try {
      const result = await spinWheel({
        variables: {
          input: {
            wheelId,
            result: 'Вариант 1',
            participant: 'Тестовый участник'
          }
        }
      });
      
      if (result.data) {
        addResult(`✅ Вращение записано: ${result.data.spinWheel.result} (ID: ${result.data.spinWheel.id})`);
      }
    } catch (error: any) {
      addResult(`❌ Ошибка вращения: ${error.message}`);
    }
  };

  // Тест удаления рулетки
  const testDeleteWheel = async (wheelId: string) => {
    try {
      const result = await deleteWheel({
        variables: { id: wheelId }
      });
      
      if (result.data?.deleteWheel) {
        addResult(`✅ Рулетка удалена: ${wheelId}`);
      }
    } catch (error: any) {
      addResult(`❌ Ошибка удаления: ${error.message}`);
    }
  };

  // Полный тест
  const runFullTest = async () => {
    clearResults();
    addResult('🚀 Начинаем полное тестирование GraphQL бэкенда...');
    
    // 1. Тест создания рулетки (без авторизации)
    addResult('📝 Тест 1: Создание рулетки без авторизации');
    const wheelId = await testCreateWheel();
    
    if (wheelId) {
      // 2. Тест вращения
      addResult('🎯 Тест 2: Вращение рулетки');
      await testSpinWheel(wheelId);
      
      // 3. Обновляем список рулеток
      addResult('🔄 Тест 3: Обновление списка рулеток');
      await refetchWheels();
      addResult('✅ Список рулеток обновлен');
      
      // 4. Тест удаления (может не сработать без авторизации)
      addResult('🗑️ Тест 4: Удаление рулетки');
      await testDeleteWheel(wheelId);
    }
    
    addResult('🏁 Тестирование завершено!');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Тестирование GraphQL Бэкенда
        </h1>

        {/* Статус аутентификации */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Статус аутентификации</h2>
          {authLoading ? (
            <p>Загрузка...</p>
          ) : isAuthenticated ? (
            <div className="text-green-600">
              <p>✅ Авторизован как: {user?.email}</p>
              <p>Имя: {user?.name || 'Не указано'}</p>
              <p>План: {user?.plan}</p>
              <button
                onClick={logout}
                className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Выйти
              </button>
            </div>
          ) : (
            <div className="text-gray-600">
              <p>❌ Не авторизован (работает с временной сессией)</p>
            </div>
          )}
        </div>

        {/* Форма аутентификации */}
        {!isAuthenticated && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Аутентификация</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="px-3 py-2 border rounded"
              />
              <input
                type="password"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="px-3 py-2 border rounded"
              />
              <input
                type="text"
                placeholder="Имя"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="px-3 py-2 border rounded"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={testRegister}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Регистрация
              </button>
              <button
                onClick={testLogin}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Вход
              </button>
            </div>
          </div>
        )}

        {/* Кнопки тестирования */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Тестирование функций</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={runFullTest}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              🚀 Полный тест
            </button>
            <button
              onClick={testCreateWheel}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              📝 Создать рулетку
            </button>
            <button
              onClick={() => refetchWheels()}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              🔄 Обновить список
            </button>
            <button
              onClick={clearResults}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              🧹 Очистить результаты
            </button>
          </div>
        </div>

        {/* Результаты тестов */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Результаты тестов</h2>
          <div className="bg-gray-100 p-4 rounded max-h-96 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-gray-500">Результаты тестов появятся здесь...</p>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className="mb-1 font-mono text-sm">
                  {result}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Список рулеток */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            Рулетки из базы данных
            {wheelsLoading && <span className="text-sm text-gray-500 ml-2">(загрузка...)</span>}
          </h2>
          
          {wheelsError && (
            <div className="text-red-600 mb-4">
              Ошибка загрузки: {wheelsError.message}
            </div>
          )}
          
          {wheelsData?.wheels && wheelsData.wheels.length > 0 ? (
            <div className="grid gap-4">
              {wheelsData.wheels.map((wheel) => (
                <div key={wheel.id} className="border rounded p-4">
                  <h3 className="font-semibold">{wheel.title}</h3>
                  <p className="text-sm text-gray-600">{wheel.description}</p>
                  <p className="text-xs text-gray-500">
                    ID: {wheel.id} | 
                    Создано: {new Date(wheel.createdAt).toLocaleString()} |
                    Сегментов: {wheel.segments.length} |
                    Вращений: {wheel.spins.length} |
                    {wheel.isPublic ? 'Публичная' : 'Приватная'}
                  </p>
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => testSpinWheel(wheel.id)}
                      className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                    >
                      🎯 Вращать
                    </button>
                    <button
                      onClick={() => testDeleteWheel(wheel.id)}
                      className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                    >
                      🗑️ Удалить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Рулетки не найдены</p>
          )}
        </div>
      </div>
    </div>
  );
} 