'use client';

import { useState } from 'react';

export default function DebugGraphQLPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testGraphQL = async (query: string, variables?: any) => {
    setLoading(true);
    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables
        }),
      });

      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(`Ошибка: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testQueries = [
    {
      name: 'Тест wheels query',
      query: `
        query GetWheels {
          wheels {
            id
            title
            description
            segments {
              option
              style {
                backgroundColor
                textColor
              }
            }
            isPublic
            createdAt
            user {
              id
              name
            }
          }
        }
      `
    },
    {
      name: 'Создать тестовую рулетку',
      query: `
        mutation CreateWheel($input: CreateWheelInput!) {
          createWheel(input: $input) {
            id
            title
            description
            segments {
              option
              style {
                backgroundColor
                textColor
              }
            }
            isPublic
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
          title: 'Тестовая рулетка из отладки',
          description: 'Создана для тестирования GraphQL',
          segments: [
            {
              option: 'Вариант 1',
              style: {
                backgroundColor: '#FF6B6B',
                textColor: 'white'
              }
            },
            {
              option: 'Вариант 2',
              style: {
                backgroundColor: '#4ECDC4',
                textColor: 'white'
              }
            }
          ],
          isPublic: true
        }
      }
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Отладка GraphQL
        </h1>

        <div className="space-y-4 mb-8">
          {testQueries.map((test, index) => (
            <button
              key={index}
              onClick={() => testGraphQL(test.query, test.variables)}
              disabled={loading}
              className="w-full text-left p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow disabled:opacity-50"
            >
              <h3 className="font-semibold text-lg">{test.name}</h3>
              <p className="text-gray-600 text-sm mt-1">
                Нажмите для выполнения запроса
              </p>
            </button>
          ))}
        </div>

        {loading && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Выполняется запрос...</p>
          </div>
        )}

        {result && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Результат:</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
              {result}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
} 