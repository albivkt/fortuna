'use client';

import { useQuery, gql } from '@apollo/client';

const TEST_QUERY = gql`
  query {
    publicWheels {
      id
      title
    }
  }
`;

export default function TestApolloPage() {
  const { loading, error, data } = useQuery(TEST_QUERY);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Apollo Client Test</h1>
        
        {loading && <p>Loading...</p>}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <h3 className="font-bold">Error:</h3>
            <p>{error.message}</p>
            <pre className="mt-2 text-sm">{JSON.stringify(error, null, 2)}</pre>
          </div>
        )}
        
        {data && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <h3 className="font-bold">Success!</h3>
            <pre className="mt-2 text-sm">{JSON.stringify(data, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
} 