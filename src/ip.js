export function getClientIp(request) {
  const cf = request.headers.get("CF-Connecting-IP");
  if (cf) return cf;

  const real = request.headers.get("X-Real-IP");
  if (real) return real;

  const fwd = request.headers.get("X-Forwarded-For");
  if (fwd) return fwd.split(",")[0].trim();

  return null;
}

export async function sha256Bytes(text) {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return new Uint8Array(digest);
}

export function base64Url(bytes) {
  let binary = "";
  for (let i = 0; i < bytes.length; i++)
    binary += String.fromCharCode(bytes[i]);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}
