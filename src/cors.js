const DEFAULT_ALLOWED_ORIGINS = [
  "https://volatile.sh",
  "https://www.volatile.sh",
  "http://localhost:8787",
  "http://127.0.0.1:8787",
];

export function corsHeadersFor(
  request,
  env,
  { allowMethods, allowHeaders } = {},
) {
  const origin = request.headers.get("origin");
  const allowed = parseAllowedOrigins(env);

  const base = {
    "Access-Control-Allow-Methods": allowMethods || "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": allowHeaders || "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };

  // Non-browser clients won't send Origin. Allow for DX.
  if (!origin) return { ...base, "Access-Control-Allow-Origin": "*" };

  if (!allowed.has(origin)) return null;
  return { ...base, "Access-Control-Allow-Origin": origin };
}

function parseAllowedOrigins(env) {
  const raw = env?.ALLOWED_ORIGINS;
  if (typeof raw !== "string" || !raw.trim())
    return new Set(DEFAULT_ALLOWED_ORIGINS);
  return new Set(
    raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  );
}
