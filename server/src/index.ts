import dotenv from 'dotenv';
dotenv.config(); // Must be first — loads env before any other module reads process.env

import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import {
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginLandingPageLocalDefault,
} from 'apollo-server-core';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import { typeDefs } from './schema/typeDefs';
import { resolvers, createGraphQLContext } from './resolvers';
import { requestLogger, errorHandler } from './middleware/logger';
import { sequelize } from './models';
import { cacheService } from './config/redis';

const startServer = async (): Promise<void> => {
  const app = express();
  const httpServer = http.createServer(app);
  const PORT = parseInt(process.env.PORT || '4000', 10);

  // ─── Middleware ───────────────────────────────────────────────────────────

  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
    }),
  );
  app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
  app.use(express.json());
  app.use(requestLogger);

  // ─── Apollo Server ───────────────────────────────────────────────────────

  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    context: createGraphQLContext,
    introspection: process.env.NODE_ENV !== 'production',
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      ApolloServerPluginLandingPageLocalDefault({ embed: true }),
      {
        async requestDidStart() {
          const start = Date.now();
          return {
            async didResolveOperation(ctx: { request: { operationName?: string | null } }) {
              console.log(`[GraphQL] ▶ ${ctx.request.operationName || 'anonymous'}`);
            },
            async didEncounterErrors(ctx: { request: { operationName?: string | null }; errors: readonly Error[] }) {
              console.error(`[GraphQL] ✗ ${ctx.request.operationName || 'anonymous'}`, ctx.errors);
            },
            async willSendResponse(ctx: { request: { operationName?: string | null } }) {
              const duration = Date.now() - start;
              console.log(`[GraphQL] ✓ ${ctx.request.operationName || 'anonymous'} (${duration}ms)`);
            },
          };
        },
      },
    ],
  });

  await apolloServer.start();
  apolloServer.applyMiddleware({ app: app as any, path: '/graphql' });

  // ─── Health check ────────────────────────────────────────────────────────

  app.get('/health', (_req, res) => {
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  app.use(errorHandler);

  // ─── Bootstrap connections ───────────────────────────────────────────────

  await sequelize.authenticate();
  console.log('[DB] Connection established');

  // NOTE: We use migrations, NOT sync(). Run `npm run migrate` to create tables.

  try {
    await cacheService.connect();
  } catch (err) {
    console.warn('[Redis] Could not connect — running without cache:', (err as Error).message);
  }

  // ─── Start listening ─────────────────────────────────────────────────────

  httpServer.listen(PORT, () => {
    console.log(`[Server] Running on http://localhost:${PORT}`);
    console.log(`[Server] GraphQL at http://localhost:${PORT}${apolloServer.graphqlPath}`);
  });

  // ─── Graceful shutdown ───────────────────────────────────────────────────

  const shutdown = async (signal: string) => {
    console.log(`[Server] ${signal} received — shutting down`);
    await apolloServer.stop();
    await sequelize.close();
    await cacheService.disconnect();
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

startServer().catch((err) => {
  console.error('[Server] Failed to start:', err);
  process.exit(1);
});
