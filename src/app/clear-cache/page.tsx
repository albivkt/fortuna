'use client';

import { useApolloClient } from '@apollo/client';
import { useRouter } from 'next/navigation';

export default function ClearCachePage() {
  const client = useApolloClient();
  const router = useRouter();

  const handleClearCache = async () => {
    try {
      console.log('🗑️ Очистка кэша Apollo...');
      await client.clearStore();
      console.log('✅ Кэш очищен');
      alert('Кэш Apollo очищен!');
    } catch (error) {
      console.error('❌ Ошибка очистки кэша:', error);
      alert('Ошибка очистки кэша');
    }
  };

  const handleResetStore = async () => {
    try {
      console.log('🔄 Сброс хранилища Apollo...');
      await client.resetStore();
      console.log('✅ Хранилище сброшено');
      alert('Хранилище Apollo сброшено!');
    } catch (error) {
      console.error('❌ Ошибка сброса хранилища:', error);
      alert('Ошибка сброса хранилища');
    }
  };

  const handleClearLocalStorage = () => {
    if (typeof window !== 'undefined') {
      console.log('🗑️ Очистка localStorage...');
      localStorage.clear();
      console.log('✅ localStorage очищен');
      alert('localStorage очищен! Перезагрузите страницу.');
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Очистка кэша и данных</h1>
      
      <div className="space-y-4">
        <div className="bg-white border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-2">Apollo Client</h2>
          <div className="space-y-2">
            <button
              onClick={handleClearCache}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Очистить кэш Apollo
            </button>
            <button
              onClick={handleResetStore}
              className="w-full bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
            >
              Сбросить хранилище Apollo
            </button>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-2">Локальные данные</h2>
          <button
            onClick={handleClearLocalStorage}
            className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Очистить localStorage
          </button>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-2">Навигация</h2>
          <div className="space-y-2">
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Перейти к дашборду
            </button>
            <button
              onClick={() => router.push('/test-wheels-issue')}
              className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Диагностика рулеток
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 