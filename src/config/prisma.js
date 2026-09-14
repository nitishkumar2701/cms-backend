const { PrismaClient } = require("@prisma/client");

// Reuse a single PrismaClient instance across the app (recommended by Prisma
// docs) to avoid exhausting database connections, especially important with
// Prisma Postgres / serverless-style deployments.
const basePrisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
});

// Prisma error codes that indicate a transient connection problem rather
// than a real query/data problem — these are worth a quick automatic retry.
const RETRYABLE_ERROR_CODES = new Set([
  "P1001", // Can't reach database server
  "P1002", // Database server reached but the connection timed out
  "P1017", // Server closed the connection
  "P2024", // Timed out fetching a connection from the pool
]);

function isRetryableError(err) {
  if (err && RETRYABLE_ERROR_CODES.has(err.code)) return true;
  // Serverless/auto-suspending Postgres (e.g. Prisma Postgres) can also
  // surface a cold-start as a generic connection-reset style message
  // without a structured Prisma error code, so match on message too.
  const message = String((err && err.message) || "");
  return /connection|ECONNRESET|starting up|timed out|timeout/i.test(message);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Wrap every query with a small automatic retry. This exists specifically to
// smooth over the "database is waking up from idle" cold-start you get with
// serverless Postgres providers (Prisma Postgres, Neon, etc.) — the very
// first query after a period of inactivity can time out while the database
// resumes, and an immediate retry a few hundred ms later succeeds. Real
// query errors (bad data, constraint violations, etc.) are NOT retried and
// are thrown immediately.
const prisma = basePrisma.$extends({
  query: {
    async $allOperations({ operation, model, args, query }) {
      const maxAttempts = 3;
      let attempt = 0;
      for (;;) {
        attempt += 1;
        try {
          return await query(args);
        } catch (err) {
          if (attempt >= maxAttempts || !isRetryableError(err)) {
            throw err;
          }
          const delay = attempt * 300; // 300ms, then 600ms
          console.warn(
            `[prisma] ${model}.${operation} failed on attempt ${attempt} (likely DB cold start), retrying in ${delay}ms: ${err.message}`
          );
          await sleep(delay);
        }
      }
    },
  },
});

module.exports = prisma;