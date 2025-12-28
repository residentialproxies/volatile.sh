import { LIMITS, TTL } from "./constants.js";
import { corsHeadersFor } from "./cors.js";
import {
  HttpError,
  isBase64Url,
  json,
  noStore,
  securityHeaders,
  withHeaders,
  readJson,
} from "./http.js";
import { generateId } from "./cryptoId.js";
import { checkRateLimit } from "./rateLimit.js";

export async function handleApi(request, env, url) {
  const cors = corsHeadersFor(request, env);
  if (request.method === "OPTIONS") {
    if (!cors)
      return securityHeaders(
        json({ error: "CORS_FORBIDDEN" }, { status: 403 }),
      );
    return securityHeaders(
      withHeaders(new Response(null, { status: 204 }), cors),
    );
  }

  if (!cors)
    return securityHeaders(
      noStore(json({ error: "CORS_FORBIDDEN" }, { status: 403 })),
    );

  try {
    if (url.pathname === "/api/health" && request.method === "GET") {
      return finalize(json({ ok: true }, { status: 200 }), cors);
    }

    if (url.pathname === "/api/secrets" && request.method === "POST") {
      const rl = await checkRateLimit(request, env, "create");
      if (!rl.ok) return finalize(rl.response, cors);
      const res = await createSecret(request, env);
      return finalize(withHeaders(res, rl.headers || {}), cors);
    }

    const match = url.pathname.match(/^\/api\/secrets\/([a-zA-Z0-9]+)$/);
    if (match && request.method === "GET") {
      const rl = await checkRateLimit(request, env, "read");
      if (!rl.ok) return finalize(rl.response, cors);
      const res = await readSecret(match[1], env);
      return finalize(withHeaders(res, rl.headers || {}), cors);
    }

    return finalize(json({ error: "NOT_FOUND" }, { status: 404 }), cors);
  } catch (err) {
    if (err instanceof HttpError) {
      return finalize(
        json(
          { error: err.code, message: err.message },
          { status: err.status, headers: err.headers },
        ),
        cors,
      );
    }
    console.error("API error:", err);
    return finalize(json({ error: "INTERNAL_ERROR" }, { status: 500 }), cors);
  }
}

function finalize(response, corsHeaders) {
  return securityHeaders(noStore(withHeaders(response, corsHeaders)));
}

async function createSecret(request, env) {
  const body = await readJson(request);
  const encrypted = body?.encrypted;
  const iv = body?.iv;
  const ttl = body?.ttl;

  if (!encrypted || !iv)
    throw new HttpError(400, "MISSING_FIELDS", "Missing encrypted data or IV");
  if (!isBase64Url(encrypted) || !isBase64Url(iv)) {
    throw new HttpError(
      400,
      "INVALID_ENCODING",
      "Encrypted data and IV must be base64url",
    );
  }

  // IV must decode to exactly 12 bytes for AES-GCM-256
  // 16 base64url chars = 12 bytes (after padding)
  if (iv.length < 16 || iv.length > 24) {
    throw new HttpError(
      400,
      "INVALID_IV_LENGTH",
      "IV must be 12 bytes (16-22 base64url chars)",
    );
  }

  if (encrypted.length > LIMITS.ENCRYPTED_MAX_CHARS) {
    throw new HttpError(
      413,
      "SECRET_TOO_LARGE",
      "Secret too large (max ~1MB encrypted)",
    );
  }

  const ttlMs = clampTtl(ttl);
  const expiresAt = Date.now() + ttlMs;

  for (let attempt = 0; attempt < 5; attempt++) {
    const id = generateId();

    const doId = env.SECRETS.idFromName(id);
    const stub = env.SECRETS.get(doId);
    const storeRes = await stub.fetch("http://do/store", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ encrypted, iv, expiresAt }),
    });

    if (storeRes.status === 409) continue;
    if (!storeRes.ok) {
      const msg = await safeReadError(storeRes);
      throw new HttpError(500, "STORE_FAILED", msg || "Failed to store secret");
    }

    return json({ id, expiresAt }, { status: 201 });
  }

  throw new HttpError(
    500,
    "ID_GENERATION_FAILED",
    "Failed to allocate a unique secret ID",
  );
}

async function readSecret(id, env) {
  if (!/^[A-Za-z0-9]{8,64}$/.test(id))
    throw new HttpError(400, "INVALID_ID", "Invalid secret ID");

  const doId = env.SECRETS.idFromName(id);
  const stub = env.SECRETS.get(doId);
  const res = await stub.fetch("http://do/read");

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const error = data?.error || "Secret not found";
    return json({ error }, { status: res.status });
  }

  return json({ encrypted: data.encrypted, iv: data.iv }, { status: 200 });
}

function clampTtl(ttl) {
  const n = Number(ttl);
  const candidate = Number.isFinite(n) ? n : TTL.DEFAULT_MS;
  return Math.min(Math.max(candidate, TTL.MIN_MS), TTL.MAX_MS);
}

async function safeReadError(res) {
  try {
    const data = await res.json();
    return data?.error || data?.message;
  } catch {
    return null;
  }
}
