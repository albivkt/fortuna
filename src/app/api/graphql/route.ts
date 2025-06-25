import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { typeDefs } from '@/lib/graphql/typeDefs';
import { resolvers } from '@/lib/graphql/resolvers';
import { headers } from 'next/headers';

const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError: (err) => {
    console.error('❌ GraphQL Error:', err);
    return err;
  },
  plugins: [
    {
      async requestDidStart() {
        return {
          async didResolveOperation(requestContext: any) {
            console.log('🚀 GraphQL Operation:', requestContext.request.operationName);
          },
          async didEncounterErrors(requestContext: any) {
            console.error('💥 GraphQL Errors:', requestContext.errors);
          },
        };
      },
    },
  ],
});

const handler = startServerAndCreateNextHandler(server, {
  context: async (req, res) => {
    console.log('🔍 GraphQL Context created for:', req.method);
    
    // В Next.js App Router нужно использовать headers() из next/headers
    const headersList = await headers();
    const allHeaders: Record<string, string> = {};
    
    // Собираем все заголовки
    for (const [key, value] of headersList.entries()) {
      allHeaders[key.toLowerCase()] = value;
    }
    
    console.log('📋 ALL Headers received:', allHeaders);
    console.log('🔐 Auth headers specifically:', {
      authorization: allHeaders.authorization,
      'x-session-id': allHeaders['x-session-id'],
      'X-Session-Id': allHeaders['x-session-id'], // Нормализуем к lowercase
    });
    
    // Создаем объект req с правильными заголовками
    const contextReq = {
      ...req,
      headers: allHeaders
    };
    
    console.log('🆔 Session ID found:', allHeaders['x-session-id']);
    
    return { req: contextReq };
  },
});

export { handler as GET, handler as POST }; 