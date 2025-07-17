'use client';

import { useState } from 'react';

export default function TestNewSpinPage() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testSpin = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation SpinWheel($input: SpinWheelInput!) {
              spinWheel(input: $input) {
                id
                result
                participant
                createdAt
                user {
                  id
                  name
                }
              }
            }
          `,
          variables: {
            input: {
              wheelId: 'cmc8uuxii0001vepg1qt4y1b6',
              result: 'Тестовый приз',
              participant: 'Тестовый участник'
            }
          }
        })
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
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Тест создания нового спина</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <button
            onClick={testSpin}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Создание спина...' : 'Создать тестовый спин'}
          </button>
        </div>

        {result && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Результат:</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {result}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
} 