'use client';

import { useState } from 'react';

export default function DebugEnvPage() {
  const [envCheck, setEnvCheck] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkEnvironment = async () => {
    setLoading(true);
    try {
      console.log('🔍 Проверяем переменные окружения...');
      
      const response = await fetch('/api/debug-env', {
        method: 'GET',
      });

      const result = await response.json();
      console.log('📥 Результат проверки env:', result);
      
      setEnvCheck(result);
    } catch (error) {
      console.error('❌ Ошибка проверки env:', error);
      setEnvCheck({
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
        success: false
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Диагностика переменных окружения</h1>
      
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Проверка переменных окружения</h2>
          <button
            onClick={checkEnvironment}
            disabled={loading}
            className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50 mb-4"
          >
            {loading ? 'Проверяем...' : 'Проверить переменные окружения'}
          </button>
          
          {envCheck && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Результат проверки:</h3>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
                {JSON.stringify(envCheck, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-yellow-800">Информация</h2>
          <p className="text-sm text-yellow-700">
            Эта страница проверяет, какие переменные окружения доступны на сервере.
            Если S3 переменные отсутствуют, нужно:
          </p>
          <ol className="list-decimal list-inside mt-2 space-y-1 text-sm text-yellow-700">
            <li>Убедиться, что они добавлены в .env.local</li>
            <li>Перезапустить dev сервер</li>
            <li>Проверить снова</li>
          </ol>
        </div>
      </div>
    </div>
  );
} 