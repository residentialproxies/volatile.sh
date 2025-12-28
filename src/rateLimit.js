import { RATE_LIMIT } from "./constants.js";
import { json } from "./http.js";
import { base64Url, getClientIp, sha256Bytes } from "./ip.js";

export async function checkRateLimit(request, env, scope) {
  if (!env?.RATE_LIMIT) {
    return { ok: true };
  }

  const ip = getClientIp(request) || "unknown";
  const digest = await sha256Bytes(ip);
  const shard = digest[0].toString(16).padStart(2, "0");
  const keyHash = base64Url(digest);

  const windowMs = Number(env.RATE_LIMIT_WINDOW_MS || RATE_LIMIT.WINDOW_MS);
  const limit =
    scope === "create"
      ? Number(env.RATE_LIMIT_CREATE_PER_WINDOW || RATE_LIMIT.CREATE_PER_WINDOW)
      : Number(env.RATE_LIMIT_READ_PER_WINDOW || RATE_LIMIT.READ_PER_WINDOW);

  const doId = env.RATE_LIMIT.idFromName(`rl:${shard}`);
  const stub = env.RATE_LIMIT.get(doId);

  const res = await stub.fetch("http://do/check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      key: `${scope}:${keyHash}`,
      limit,
      windowMs,
    }),
  });

  const data = await res.json();
  const headers = {
    "X-RateLimit-Limit": String(data.limit ?? limit),
    "X-RateLimit-Remaining": String(data.remaining ?? 0),
    "X-RateLimit-Reset": String(data.resetAt ?? 0),
  };

  if (!data.allowed) {
    const retryAfterSec = Math.max(
      1,
      Math.ceil((data.resetAt - Date.now()) / 1000),
    );
    return {
      ok: false,
      response: json(
        {
          error: "RATE_LIMITED",
          message: "Too many requests. Try again later.",
        },
        {
          status: 429,
          headers: { ...headers, "Retry-After": String(retryAfterSec) },
        },
      ),
    };
  }

  return { ok: true, headers };
}
