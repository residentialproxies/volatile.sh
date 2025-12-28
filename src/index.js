import { handleRequest } from "./worker.js";
import { RateLimiter } from "./do/RateLimiter.js";
import { SecretStore } from "./do/SecretStore.js";

/**
 * Structured logging helper
 */
function log(level, message, context = {}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...context,
  };
  console.log(JSON.stringify(logEntry));
}

export default {
  async fetch(request, env, ctx) {
    const start = Date.now();
    const requestId = crypto.randomUUID();
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    try {
      const res = await handleRequest(request, env, ctx);
      const duration = Date.now() - start;
      const status = res.status;

      res.headers.set("X-Request-ID", requestId);
      res.headers.set("X-Response-Time", String(duration));

      // Log successful requests (info level)
      if (status < 400) {
        log("info", "Request completed", {
          requestId,
          method,
          path,
          status,
          duration,
        });
      } else {
        // Log client errors (warn level)
        log("warn", "Request failed", {
          requestId,
          method,
          path,
          status,
          duration,
        });
      }

      return res;
    } catch (err) {
      const duration = Date.now() - start;

      // Log server errors (error level)
      log("error", "Unhandled error", {
        requestId,
        method,
        path,
        duration,
        error: err.message,
        stack: err.stack,
      });

      const res = new Response(JSON.stringify({ error: "INTERNAL_ERROR" }), {
        status: 500,
        headers: { "Content-Type": "application/json; charset=utf-8" },
      });
      res.headers.set("X-Request-ID", requestId);
      res.headers.set("X-Response-Time", String(duration));
      return res;
    }
  },
};

export { SecretStore, RateLimiter };
