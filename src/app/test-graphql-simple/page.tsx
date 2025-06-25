'use client';

import { useQuery, gql } from '@apollo/client';

const SIMPLE_WHEELS_QUERY = gql`
  query SimpleWheels {
    wheels {
      id
      title
      isPublic
    }
  }
`;

export default function TestGraphQLSimplePage() {
  const { data, loading, error } = useQuery(SIMPLE_WHEELS_QUERY, {
    errorPolicy: 'all',
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Simple GraphQL Test</h1>
      
      {loading && <p>Loading...</p>}
      
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded mb-4">
          <h3 className="font-bold text-red-800">GraphQL Error:</h3>
          <p className="text-red-600">{error.message}</p>
          {error.graphQLErrors.map((err, i) => (
            <div key={i} className="mt-2 text-sm text-red-500">
              <strong>GraphQL Error {i + 1}:</strong> {err.message}
            </div>
          ))}
          {error.networkError && (
            <div className="mt-2 text-sm text-red-500">
              <strong>Network Error:</strong> {error.networkError.message}
            </div>
          )}
        </div>
      )}
      
      {data && (
        <div className="bg-green-50 border border-green-200 p-4 rounded">
          <h3 className="font-bold text-green-800">Success!</h3>
          <p className="text-green-600">Found {data.wheels?.length || 0} wheels</p>
          {data.wheels?.map((wheel: any) => (
            <div key={wheel.id} className="mt-2 p-2 bg-white rounded border">
              <div><strong>ID:</strong> {wheel.id}</div>
              <div><strong>Title:</strong> {wheel.title}</div>
              <div><strong>Public:</strong> {wheel.isPublic ? 'Yes' : 'No'}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 