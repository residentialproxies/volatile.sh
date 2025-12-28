import React, { useState } from "react";
import { Lock, Copy, Check, Terminal, Flame } from "lucide-react";
import { TerminalButton } from "./TerminalButton";
import {
  generateKey,
  encryptMessage,
  exportKeyToB64Url,
  MAX_PLAINTEXT_CHARS,
} from "../utils/crypto";
import { API_BASE } from "../constants";

// Maximum encrypted size (base64url encoded ~1MB)
const MAX_ENCRYPTED_CHARS = 1_400_000;

export const CreateView: React.FC = () => {
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resultLink, setResultLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ttlMs, setTtlMs] = useState<number>(24 * 60 * 60 * 1000);

  // Get user-friendly error message from error
  const getErrorMessage = (err: unknown): string => {
    if (err instanceof Error) {
      const msg = err.message.toLowerCase();
      if (msg.includes("network") || msg.includes("fetch")) {
        return "Network error - please check your connection";
      }
      if (msg.includes("413") || msg.includes("too large")) {
        return "Secret too large - please reduce the text size";
      }
      if (msg.includes("429") || msg.includes("rate")) {
        return "Too many requests - please wait a moment";
      }
      if (msg.includes("500")) {
        return "Server error - please try again";
      }
    }
    return "Failed to create secure link. Please try again.";
  };

  const handleEncrypt = async () => {
    if (!text.trim()) return;
    setIsLoading(true);
    setError(null);

    try {
      // 1. Validate size before encryption
      if (text.length > MAX_PLAINTEXT_CHARS) {
        setError(
          `Text too large (${text.toLocaleString()} chars). Maximum is ${MAX_PLAINTEXT_CHARS.toLocaleString()} chars.`,
        );
        setIsLoading(false);
        return;
      }

      // 2. Generate Key
      const key = await generateKey();

      // 3. Encrypt Locally
      const encryptedPayload = await encryptMessage(text, key);

      // 4. Check encrypted size
      if (encryptedPayload.content.length > MAX_ENCRYPTED_CHARS) {
        setError(`Encrypted data too large. Please reduce input text.`);
        setIsLoading(false);
        return;
      }

      // 5. Send to Server
      const response = await fetch(`${API_BASE}/secrets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          encrypted: encryptedPayload.content,
          iv: encryptedPayload.iv,
          ttl: ttlMs,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        if (data.error === "SECRET_TOO_LARGE") {
          throw new Error("Secret too large - please reduce the text size");
        }
        if (data.error === "RATE_LIMITED") {
          throw new Error("Too many requests - please wait a moment");
        }
        throw new Error(`Server error: ${response.status}`);
      }

      const { id } = await response.json();

      // 6. Export Key for URL
      const hash = await exportKeyToB64Url(key);

      // 7. Construct Link
      const link = `${window.location.origin}/?id=${id}#${hash}`;
      setResultLink(link);
    } catch (err) {
      console.error(err);
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (resultLink) {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard
          .writeText(resultLink)
          .then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          })
          .catch(() => fallbackCopy(resultLink));
        return;
      }
      fallbackCopy(resultLink);
    }
  };

  const fallbackCopy = (value: string) => {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = value;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.top = "-1000px";
      textarea.style.left = "-1000px";
      document.body.appendChild(textarea);
      textarea.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(textarea);
      if (ok) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        window.prompt("Copy this link:", value);
      }
    } catch {
      window.prompt("Copy this link:", value);
    }
  };

  if (resultLink) {
    return (
      <div className="space-y-6 animate-crt-flicker">
        <div className="border-2 border-term-green p-4 bg-term-green/5 glow-border">
          <div className="flex items-center gap-2 mb-4 text-term-green glow-text">
            <Check className="w-6 h-6" />
            <h2 className="text-xl font-bold tracking-wider">
              SECURE LINK GENERATED
            </h2>
          </div>

          <div className="mb-4 text-sm font-mono space-y-1 opacity-90">
            <p>&gt; PAYLOAD ENCRYPTED IN RAM.</p>
            <p>&gt; DECRYPTION KEY EMBEDDED IN FRAGMENT.</p>
            <p className="text-red-500 font-bold bg-red-900/10 inline-block px-1 mt-1 border border-red-500/30">
              ⚠️ WARNING: LINK WILL SELF-DESTRUCT AFTER ONE VIEW.
            </p>
          </div>

          <div className="space-y-3">
            <textarea
              readOnly
              value={resultLink}
              onClick={(e) => e.currentTarget.select()}
              className="w-full h-16 bg-black border border-term-green/50 p-3 text-term-green/70 font-mono text-xs resize-none focus:outline-none focus:ring-1 focus:ring-term-green mb-2"
            />

            <TerminalButton
              onClick={copyToClipboard}
              className={`w-full flex items-center justify-center gap-2 text-lg py-4 ${copied ? "bg-term-green text-black" : ""}`}
            >
              {copied ? (
                <>
                  <Check size={20} />
                  COPIED_TO_CLIPBOARD
                </>
              ) : (
                <>
                  <Copy size={20} />
                  &gt; COPY_SECURE_LINK_
                </>
              )}
            </TerminalButton>
          </div>
        </div>

        <div className="flex justify-center pt-4">
          <button
            onClick={() => window.location.reload()}
            className="text-xs text-term-green/50 hover:text-term-green hover:underline flex items-center gap-1 transition-colors"
          >
            [ ENCRYPT NEW PAYLOAD ]
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-bold flex items-center gap-2 glow-text">
          <Terminal size={16} />
          INPUT_PAYLOAD_
          <span className="animate-blink block w-2 h-4 bg-term-green"></span>
        </label>
        <span className="text-xs text-term-green/60">
          {text.length.toLocaleString()} /{" "}
          {MAX_PLAINTEXT_CHARS.toLocaleString()} chars
          {text.length > MAX_PLAINTEXT_CHARS * 0.9 && (
            <span className="text-red-500 ml-1">⚠️</span>
          )}
        </span>
      </div>

      <textarea
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="> INPUT_PAYLOAD_"
        className="w-full h-64 bg-black border-2 border-term-green p-4 text-term-green font-mono text-lg resize-none placeholder-term-green/20 focus:outline-none focus:shadow-[0_0_15px_rgba(51,255,0,0.3)] transition-shadow glow-border"
      />

      {error && (
        <div className="p-3 border border-red-500 text-red-500 bg-red-900/10 text-sm font-bold glow-border shadow-red-900/20">
          &gt; ERROR: {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center pt-4">
        <div className="text-xs max-w-xs opacity-70">
          <div className="flex items-center gap-1 mb-1">
            <Lock size={12} />
            <span>Client-side Encryption</span>
          </div>
          <div className="flex items-center gap-1">
            <Flame size={12} />
            <span>Volatile Memory Storage</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs opacity-70 flex items-center gap-2">
            EXPIRES_IN
            <select
              value={ttlMs}
              onChange={(e) => setTtlMs(parseInt(e.target.value, 10))}
              className="bg-black border border-term-green/50 px-2 py-1 text-term-green text-xs focus:outline-none focus:ring-1 focus:ring-term-green"
            >
              <option value={5 * 60 * 1000}>5 MIN</option>
              <option value={60 * 60 * 1000}>1 HOUR</option>
              <option value={24 * 60 * 60 * 1000}>24 HOURS</option>
              <option value={7 * 24 * 60 * 60 * 1000}>7 DAYS</option>
            </select>
          </label>
        </div>
        <TerminalButton
          onClick={handleEncrypt}
          disabled={!text || isLoading}
          isLoading={isLoading}
        >
          GENERATE LINK
        </TerminalButton>
      </div>
    </div>
  );
};
