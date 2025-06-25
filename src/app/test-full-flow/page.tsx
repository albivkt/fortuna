'use client';

import { useState, useEffect } from 'react';
import { useCreateWheel, useWheels } from '@/lib/graphql/hooks';
import Link from 'next/link';

export default function TestFullFlowPage() {
  const [createWheel, { loading: creating, error: createError }] = useCreateWheel();
  const { data: wheelsData, loading: wheelsLoading, error: wheelsError, refetch } = useWheels();
  const [title, setTitle] = useState('');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev]);
    console.log(message);
  };

  useEffect(() => {
    addLog('🚀 Компонент загружен');
    addLog(`📊 Начальное состояние: ${wheelsData?.wheels.length || 0} рулеток`);
  }, []);

  useEffect(() => {
    if (wheelsData) {
      addLog(`📊 Обновлен список рулеток: ${wheelsData.wheels.length} штук`);
    }
  }, [wheelsData]);

  const handleCreate = async () => {
    if (!title.trim()) {
      addLog('❌ Название не может быть пустым');
      return;
    }

    addLog(`🎡 Начинаем создание рулетки: "${title}"`);
    
    try {
      const result = await createWheel({
        variables: {
          input: {
            title: title,
            segments: [
              { option: 'Приз 1', style: { backgroundColor: '#EC4899', textColor: 'white' } },
              { option: 'Приз 2', style: { backgroundColor: '#3B82F6', textColor: 'white' } },
              { option: 'Приз 3', style: { backgroundColor: '#10B981', textColor: 'white' } }
            ],
            isPublic: false
          }
        }
      });

      addLog(`✅ GraphQL ответ получен`);
      
      if (result.data?.createWheel) {
        addLog(`🎉 Рулетка создана: ID=${result.data.createWheel.id}, Title="${result.data.createWheel.title}"`);
        setTitle(''); // Очищаем поле
      } else {
        addLog(`❌ Рулетка не создана, данные отсутствуют`);
      }

      if (result.errors) {
        addLog(`⚠️ GraphQL ошибки: ${result.errors.map(e => e.message).join(', ')}`);
      }
    } catch (error) {
      addLog(`❌ Ошибка создания: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  };

  const handleRefresh = () => {
    addLog('🔄 Принудительное обновление списка рулеток');
    refetch();
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Полное тестирование создания рулеток</h1>
        
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Левая колонка - Создание */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Создание рулетки</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Название:</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    placeholder="Введите название рулетки"
                  />
                </div>
                
                <button
                  onClick={handleCreate}
                  disabled={creating || !title.trim()}
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {creating ? 'Создается...' : 'Создать рулетку'}
                </button>
                
                {createError && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <strong>Ошибка создания:</strong> {createError.message}
                  </div>
                )}
              </div>
            </div>

            {/* Список рулеток */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Мои рулетки ({wheelsData?.wheels.length || 0})</h2>
                <button
                  onClick={handleRefresh}
                  disabled={wheelsLoading}
                  className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 disabled:opacity-50"
                >
                  {wheelsLoading ? 'Загрузка...' : 'Обновить'}
                </button>
              </div>
              
              {wheelsError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  <strong>Ошибка загрузки:</strong> {wheelsError.message}
                </div>
              )}
              
              {wheelsLoading ? (
                <p className="text-gray-500">Загрузка рулеток...</p>
              ) : wheelsData?.wheels.length === 0 ? (
                <p className="text-gray-500">Рулеток пока нет. Создайте первую!</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {wheelsData?.wheels.map((wheel, index) => (
                    <div key={wheel.id} className="border rounded p-3 bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{wheel.title}</h3>
                          <p className="text-sm text-gray-600">
                            Создана: {new Date(wheel.createdAt).toLocaleString('ru-RU')}
                          </p>
                          <p className="text-sm text-gray-600">
                            Сегментов: {wheel.segments.length}
                          </p>
                          <p className="text-xs text-gray-500">ID: {wheel.id}</p>
                        </div>
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          #{index + 1}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Правая колонка - Логи */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Логи отладки</h2>
              <button
                onClick={clearLogs}
                className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
              >
                Очистить
              </button>
            </div>
            
            <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm h-96 overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-gray-500">Логи появятся здесь...</p>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="mb-1">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/dashboard" className="text-blue-500 hover:underline mr-4">
            ← Дашборд
          </Link>
          <Link href="/dashboard/create" className="text-blue-500 hover:underline">
            Создать рулетку →
          </Link>
        </div>
      </div>
    </div>
  );
} 