import { ApolloServer } from "@apollo/server";
import { loadSchemaAndResolvers } from "./schema-loader";
import { EventStore } from "@event-driven-io/emmett";

interface ServerContext {
  eventStore: EventStore;
}

interface ServerConfig {
  port: number;
  slicesDir: string;
  context: ServerContext;
}

export async function createServer(config: ServerConfig) {
  const { typeDefs, resolvers } = await loadSchemaAndResolvers(
    config.slicesDir
  );
  const server = new ApolloServer<ServerContext>({
    typeDefs,
    resolvers,
    csrfPrevention: false,
  });

  return { server };
}
