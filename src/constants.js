export const TTL = {
  MIN_MS: 5 * 60 * 1000,
  DEFAULT_MS: 24 * 60 * 60 * 1000,
  MAX_MS: 7 * 24 * 60 * 60 * 1000,
};

export const LIMITS = {
  ENCRYPTED_MAX_CHARS: 1_400_000, // ~1MB base64url payload (includes overhead)
  ID_LEN: 16,
  ID_CHARS: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
};

export const RATE_LIMIT = {
  WINDOW_MS: 60 * 60 * 1000,
  CREATE_PER_WINDOW: 100,
  READ_PER_WINDOW: 1000,
  SHARDS: 256,
};
