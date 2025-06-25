'use client';

import { useState } from 'react';
import { apolloClient } from '@/lib/graphql/client';
import { gql } from '@apollo/client';

const GET_WHEELS = gql`
  query GetWheels {
    wheels {
      id
      title
    }
  }
`;

export default function DebugHeaders() {
  const [result, setResult] = useState<string>('');

  const testHeaders = async () => {
    try {
      // Проверяем что в localStorage
      const sessionId = localStorage.getItem('fortuna_session_id');
      const authToken = localStorage.getItem('auth_token');
      
      setResult(prev => prev + `📋 localStorage sessionId: ${sessionId}\n`);
      setResult(prev => prev + `🔐 localStorage authToken: ${authToken}\n`);
      
      // Делаем запрос и смотрим что отправляется
      const response = await apolloClient.query({
        query: GET_WHEELS,
        fetchPolicy: 'network-only'
      });
      
      setResult(prev => prev + `✅ GraphQL запрос выполнен\n`);
      setResult(prev => prev + `📊 Результат: ${JSON.stringify(response.data, null, 2)}\n`);
      
    } catch (error: any) {
      setResult(prev => prev + `❌ Ошибка: ${error.message}\n`);
      setResult(prev => prev + `📄 Детали: ${JSON.stringify(error, null, 2)}\n`);
    }
  };

  const clearStorage = () => {
    localStorage.clear();
    setResult(prev => prev + `🧹 localStorage очищен\n`);
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">🔍 Диагностика заголовков</h1>
      
      <div className="space-y-4">
        <button
          onClick={testHeaders}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Тестировать заголовки
        </button>
        
        <button
          onClick={clearStorage}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 ml-4"
        >
          Очистить localStorage
        </button>
      </div>
      
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Результат:</h2>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
          {result}
        </pre>
      </div>
    </div>
  );
} 