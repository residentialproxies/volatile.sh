export interface EncryptedPayload {
  iv: string; // base64url
  content: string; // base64url
}

export interface ApiCreateResponse {
  id: string;
  expiresAt: number;
}

export interface ApiReadResponse {
  encrypted: string; // base64url
  iv: string; // base64url
  error?: string;
}
