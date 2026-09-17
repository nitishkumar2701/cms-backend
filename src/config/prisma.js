const { PrismaClient } = require("@prisma/client");

const basePrisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
});

const RETRYABLE_ERROR_CODES = new Set([
  "P1001", // Can't reach database server
  "P1002", // Database server reached but the connection timed out
  "P1017", // Server closed the connection
  "P2024", // Timed out fetching a connection from the pool
]);

function isRetryableError(err) {
  if (err && RETRYABLE_ERROR_CODES.has(err.code)) return true;
  const message = String((err && err.message) || "");
  return /connection|ECONNRESET|starting up|timed out|timeout/i.test(message);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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
          const delay = attempt * 300;
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