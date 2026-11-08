import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import config from "@/lib/config";

// Reuse the pool across HMR reloads in dev; on serverless each instance
// gets its own pool which Neon handles via its pooler endpoint.
const globalForDb = globalThis as unknown as { neonPool?: Pool };

const pool =
  globalForDb.neonPool ??
  new Pool({
    connectionString: config.env.databaseUrl,
    // Keep connections short-lived so idle lambdas don't hold them open
    idleTimeoutMillis: 10_000,
    max: 5,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.neonPool = pool;
}

export const db = drizzle({ client: pool });
