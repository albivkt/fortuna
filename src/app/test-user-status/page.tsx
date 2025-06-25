'use client';

import { useMe } from '@/lib/graphql/hooks';
import { getCurrentUser } from '@/lib/user';
import { useState, useEffect } from 'react';

export default function TestUserStatusPage() {
  const { data: meData, loading: meLoading, error: meError, refetch } = useMe();
  const [localUser, setLocalUser] = useState<any>(null);

  useEffect(() => {
    const user = getCurrentUser();
    setLocalUser(user);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Тест статуса пользователя</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* GraphQL данные */}
          <div className="bg-gray-800/60 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50">
            <h2 className="text-xl font-semibold text-white mb-4">GraphQL данные (useMe)</h2>
            
            {meLoading && (
              <div className="text-yellow-400">Загрузка...</div>
            )}
            
            {meError && (
              <div className="text-red-400 mb-4">
                Ошибка: {meError.message}
              </div>
            )}
            
            {meData?.me ? (
              <div className="space-y-2 text-sm">
                <div className="text-green-400 font-semibold">✅ Пользователь авторизован</div>
                <div className="text-gray-300">ID: {meData.me.id}</div>
                <div className="text-gray-300">Имя: {meData.me.name}</div>
                <div className="text-gray-300">Email: {meData.me.email}</div>
                <div className="text-gray-300">
                  План: <span className={`font-semibold ${meData.me.plan === 'pro' ? 'text-yellow-400' : 'text-blue-400'}`}>
                    {meData.me.plan?.toUpperCase() || 'FREE'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-red-400">❌ Пользователь не авторизован</div>
            )}
            
            <button
              onClick={() => refetch()}
              className="mt-4 bg-blue-500/20 text-blue-400 border border-blue-400/30 px-4 py-2 rounded-lg hover:bg-blue-500/30 transition-all"
            >
              🔄 Обновить данные
            </button>
          </div>

          {/* localStorage данные */}
          <div className="bg-gray-800/60 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50">
            <h2 className="text-xl font-semibold text-white mb-4">localStorage данные</h2>
            
            {localUser ? (
              <div className="space-y-2 text-sm">
                <div className="text-green-400 font-semibold">✅ Данные найдены</div>
                <div className="text-gray-300">Имя: {localUser.name}</div>
                <div className="text-gray-300">Email: {localUser.email}</div>
                <div className="text-gray-300">ID: {localUser.id}</div>
              </div>
            ) : (
              <div className="text-red-400">❌ Данные не найдены</div>
            )}
            
            <button
              onClick={() => {
                const user = getCurrentUser();
                setLocalUser(user);
              }}
              className="mt-4 bg-green-500/20 text-green-400 border border-green-400/30 px-4 py-2 rounded-lg hover:bg-green-500/30 transition-all"
            >
              🔄 Обновить localStorage
            </button>
          </div>
        </div>

        {/* Действия */}
        <div className="mt-8 bg-gray-800/60 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50">
          <h2 className="text-xl font-semibold text-white mb-4">Действия</h2>
          
          <div className="space-y-4">
            <div className="text-gray-300 text-sm">
              Используйте эти кнопки для тестирования различных сценариев:
            </div>
            
            <div className="flex flex-wrap gap-4">
              <a
                href="/dashboard"
                className="bg-blue-500/20 text-blue-400 border border-blue-400/30 px-4 py-2 rounded-lg hover:bg-blue-500/30 transition-all"
              >
                📊 Дашборд
              </a>
              
              <a
                href="/dashboard/subscription"
                className="bg-yellow-500/20 text-yellow-400 border border-yellow-400/30 px-4 py-2 rounded-lg hover:bg-yellow-500/30 transition-all"
              >
                💳 Подписка
              </a>
              
              <a
                href="/login"
                className="bg-green-500/20 text-green-400 border border-green-400/30 px-4 py-2 rounded-lg hover:bg-green-500/30 transition-all"
              >
                🔑 Логин
              </a>
              
              <a
                href="/register"
                className="bg-purple-500/20 text-purple-400 border border-purple-400/30 px-4 py-2 rounded-lg hover:bg-purple-500/30 transition-all"
              >
                📝 Регистрация
              </a>
            </div>
          </div>
        </div>

        {/* Raw данные */}
        <div className="mt-8 bg-gray-800/60 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50">
          <h2 className="text-xl font-semibold text-white mb-4">Raw данные</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-300 mb-2">meData:</h3>
              <pre className="bg-gray-900/50 p-4 rounded-lg text-xs text-gray-300 overflow-auto">
                {JSON.stringify(meData, null, 2)}
              </pre>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-300 mb-2">localUser:</h3>
              <pre className="bg-gray-900/50 p-4 rounded-lg text-xs text-gray-300 overflow-auto">
                {JSON.stringify(localUser, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 