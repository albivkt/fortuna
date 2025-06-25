'use client';

import { useState } from 'react';

export default function DebugDbDirectPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const checkDatabase = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/debug-db-direct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(`Ошибка: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Прямая проверка базы данных</h1>
        
        <button
          onClick={checkDatabase}
          disabled={loading}
          className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? '⏳ Проверка...' : '🔍 Проверить базу данных'}
        </button>
        
        {result && (
          <div className="mt-6 bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Результат:</h2>
            <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto max-h-96">
              {result}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
} 