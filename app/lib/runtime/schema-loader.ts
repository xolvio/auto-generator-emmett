import { resolve, join } from "path";
import { promises as fs } from "fs";
import { mergeTypeDefs } from "@graphql-tools/merge";
import { print } from "graphql";

const runtimeDir = resolve(__dirname);

// Define a type for resolver functions
export type ResolverFn = (
  parent: unknown,
  args: unknown,
  context: unknown,
  info: unknown
) => unknown;

// Define a type for resolver objects
export interface ResolverMap {
  [key: string]: ResolverFn | Record<string, ResolverFn>;
}

async function findGraphQLFiles(dir: string): Promise<string[]> {
  const graphqlFiles: string[] = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      graphqlFiles.push(...(await findGraphQLFiles(path)));
    } else if (entry.isFile() && entry.name.endsWith(".graphql")) {
      graphqlFiles.push(path);
    }
  }

  return graphqlFiles;
}

async function findResolverFiles(dir: string): Promise<string[]> {
  const resolverFiles: string[] = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      resolverFiles.push(...(await findResolverFiles(path)));
    } else if (
      entry.isFile() &&
      (entry.name.endsWith(".resolver.ts") ||
        entry.name.endsWith(".resolver.js"))
    ) {
      resolverFiles.push(path);
    }
  }

  return resolverFiles;
}

async function loadSchemas(slicesDir: string): Promise<string[]> {
  // First load base types
  const baseSchema = await loadBaseGraphql(runtimeDir);
  // Then load all slice schemas
  const schemaFiles = await findGraphQLFiles(slicesDir);
  const sliceSchemas = await Promise.all(
    schemaFiles.map((file) => fs.readFile(file, "utf-8"))
  );

  return [baseSchema, ...sliceSchemas];
}

async function loadResolvers(slicesDir: string) {
  const resolverFiles = await findResolverFiles(slicesDir);

  const combinedResolvers: ResolverMap = {};

  const { baseResolvers } = await loadBaseResolvers(runtimeDir);
  // const {baseResolvers} = await import(join(runtimeDir, "base.resolver.js"));
  Object.assign(combinedResolvers, baseResolvers);

  for (const file of resolverFiles) {
    const module = await import(file);
    const resolvers = module.resolvers;

    Object.entries(resolvers).forEach(([key, value]) => {
      if (typeof value === "object") {
        combinedResolvers[key] = {
          ...(combinedResolvers[key] || {}),
          ...value,
        };
      }
    });
  }

  return combinedResolvers;
}

async function loadBaseResolvers(runtimeDir: string) {
  try {
    // Attempt to load the TypeScript file first
    return await import(join(runtimeDir, "base.resolver.ts"));
    //     TODO proper type
  } catch (error: any) {
    if (error.code === "ERR_MODULE_NOT_FOUND") {
      // If the .ts file is not found, attempt to load the JavaScript file
      return await import(
        join(runtimeDir, "..", "lib", "runtime", "base.resolver.js")
      );
    }
    // Re-throw any other error
    throw error;
  }
}

async function loadBaseGraphql(runtimeDir: string) {
  try {
    return await fs.readFile(join(runtimeDir, "base.graphql"), "utf-8");
  } catch (error: any) {
    return await fs.readFile(
      join(runtimeDir, "..", "lib", "runtime", "base.graphql"),
      "utf-8"
    );
  }
}

export async function loadSchemaAndResolvers(slicesDir: string) {
  const schemas = await loadSchemas(slicesDir);
  const typeDefs = print(mergeTypeDefs(schemas));
  const resolvers = await loadResolvers(slicesDir);
  return { typeDefs, resolvers };
}
