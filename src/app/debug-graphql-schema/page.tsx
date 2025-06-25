'use client';

import { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';

// Простой тест схемы
const TEST_SCHEMA = gql`
  query TestSchema {
    __schema {
      types {
        name
        kind
      }
    }
  }
`;

// Тест wheels query
const TEST_WHEELS = gql`
  query TestWheels {
    wheels {
      id
      title
      publicSlug
      allowGuestSpin
    }
  }
`;

// Тест создания публичной ссылки
const TEST_GENERATE_LINK = gql`
  mutation TestGenerateLink($input: GeneratePublicLinkInput!) {
    generatePublicLink(input: $input) {
      id
      title
      publicSlug
      allowGuestSpin
    }
  }
`;

export default function DebugGraphQLSchemaPage() {
  const [testWheelId, setTestWheelId] = useState('');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // Тест схемы
  const { data: schemaData, loading: schemaLoading, error: schemaError } = useQuery(TEST_SCHEMA, {
    onCompleted: () => addLog('✅ Schema query completed'),
    onError: (error) => addLog(`❌ Schema query error: ${error.message}`),
  });

  // Тест wheels
  const { data: wheelsData, loading: wheelsLoading, error: wheelsError, refetch: refetchWheels } = useQuery(TEST_WHEELS, {
    onCompleted: () => addLog('✅ Wheels query completed'),
    onError: (error) => addLog(`❌ Wheels query error: ${error.message}`),
  });

  // Тест генерации ссылки
  const [generateLink, { loading: generateLoading }] = useMutation(TEST_GENERATE_LINK, {
    onCompleted: (data) => {
      addLog(`✅ Generate link completed: ${data.generatePublicLink.publicSlug}`);
      refetchWheels();
    },
    onError: (error) => addLog(`❌ Generate link error: ${error.message}`),
  });

  const handleGenerateLink = () => {
    if (!testWheelId) {
      addLog('❌ Please enter wheel ID');
      return;
    }
    
    addLog(`🔄 Generating link for wheel: ${testWheelId}`);
    generateLink({
      variables: {
        input: { wheelId: testWheelId }
      }
    });
  };

  const clearLogs = () => setLogs([]);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">GraphQL Schema Debug</h1>

      {/* Logs */}
      <div className="bg-black text-green-400 p-4 rounded-lg mb-8 h-64 overflow-y-auto font-mono text-sm">
        <div className="flex justify-between items-center mb-2">
          <span className="text-white font-bold">Debug Logs:</span>
          <button 
            onClick={clearLogs}
            className="text-red-400 hover:text-red-300 text-xs"
          >
            Clear
          </button>
        </div>
        {logs.length === 0 ? (
          <div className="text-gray-500">No logs yet...</div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="mb-1">{log}</div>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Schema Test */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Schema Test</h2>
          
          {schemaLoading && <p className="text-blue-600">Loading schema...</p>}
          {schemaError && (
            <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
              <p className="text-red-800 font-semibold">Schema Error:</p>
              <p className="text-red-600 text-sm">{schemaError.message}</p>
            </div>
          )}
          
          {schemaData && (
            <div className="bg-green-50 border border-green-200 rounded p-4">
              <p className="text-green-800 font-semibold">Schema loaded successfully!</p>
              <p className="text-green-600 text-sm">
                Found {schemaData.__schema.types.length} types
              </p>
              
              <details className="mt-2">
                <summary className="cursor-pointer text-green-700 hover:text-green-800">
                  Show types
                </summary>
                <div className="mt-2 max-h-32 overflow-y-auto text-xs">
                  {schemaData.__schema.types
                    .filter((type: any) => !type.name.startsWith('__'))
                    .map((type: any) => (
                      <div key={type.name} className="text-gray-600">
                        {type.name} ({type.kind})
                      </div>
                    ))}
                </div>
              </details>
            </div>
          )}
        </div>

        {/* Wheels Test */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Wheels Query Test</h2>
          
          {wheelsLoading && <p className="text-blue-600">Loading wheels...</p>}
          {wheelsError && (
            <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
              <p className="text-red-800 font-semibold">Wheels Error:</p>
              <p className="text-red-600 text-sm">{wheelsError.message}</p>
            </div>
          )}
          
          {wheelsData && (
            <div className="bg-green-50 border border-green-200 rounded p-4">
              <p className="text-green-800 font-semibold">Wheels loaded successfully!</p>
              <p className="text-green-600 text-sm">
                Found {wheelsData.wheels.length} wheels
              </p>
              
              {wheelsData.wheels.length > 0 && (
                <div className="mt-2 space-y-2">
                  {wheelsData.wheels.map((wheel: any) => (
                    <div key={wheel.id} className="text-xs bg-white p-2 rounded border">
                      <div><strong>ID:</strong> {wheel.id}</div>
                      <div><strong>Title:</strong> {wheel.title}</div>
                      <div><strong>Public Slug:</strong> {wheel.publicSlug || 'None'}</div>
                      <div><strong>Allow Guest Spin:</strong> {wheel.allowGuestSpin ? 'Yes' : 'No'}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Generate Link Test */}
        <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Generate Public Link Test</h2>
          
          <div className="flex gap-4 items-center mb-4">
            <input
              type="text"
              value={testWheelId}
              onChange={(e) => setTestWheelId(e.target.value)}
              placeholder="Enter wheel ID"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
            />
            <button
              onClick={handleGenerateLink}
              disabled={generateLoading || !testWheelId}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {generateLoading ? 'Generating...' : 'Generate Link'}
            </button>
          </div>
          
          {wheelsData?.wheels.length > 0 && (
            <div className="text-sm text-gray-600">
              <p>Available wheel IDs:</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {wheelsData.wheels.map((wheel: any) => (
                  <button
                    key={wheel.id}
                    onClick={() => setTestWheelId(wheel.id)}
                    className="bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-xs"
                  >
                    {wheel.title} ({wheel.id.slice(0, 8)}...)
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 