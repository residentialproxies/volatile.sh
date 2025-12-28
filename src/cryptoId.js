import { LIMITS } from "./constants.js";

export function generateId() {
  const bytes = new Uint8Array(LIMITS.ID_LEN);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => LIMITS.ID_CHARS[b % LIMITS.ID_CHARS.length])
    .join("");
}
