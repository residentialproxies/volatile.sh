import React, { useState, useEffect } from "react";
import {
  Skull,
  AlertTriangle,
  Eye,
  EyeOff,
  FileWarning,
  Lock,
} from "lucide-react";
import { TerminalButton } from "./TerminalButton";
import { importKeyFromB64Url, b64UrlToBytes } from "../utils/crypto";
import { API_BASE } from "../constants";

interface ReadViewProps {
  id: string;
}

export const ReadView: React.FC<ReadViewProps> = ({ id }) => {
  const [status, setStatus] = useState<
    "IDLE" | "FETCHING" | "DECRYPTING" | "REVEALED" | "ERROR" | "BURNED"
  >("IDLE");
  const [secretText, setSecretText] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [burnTimer, setBurnTimer] = useState(0);

  useEffect(() => {
    // Check if Hash Key exists immediately
    const hash = window.location.hash.substring(1);
    if (!hash) {
      setStatus("ERROR");
      setErrorMsg("MISSING DECRYPTION KEY IN URL FRAGMENT");
    }
  }, []);

  const handleBurnAndReveal = async () => {
    setStatus("FETCHING");

    try {
      // 1. Fetch from API
      const response = await fetch(`${API_BASE}/secrets/${id}`);

      if (response.status === 404) {
        setStatus("BURNED");
        return;
      }

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const json = await response.json();

      setStatus("DECRYPTING");

      // 2. Get Key from Hash
      const hash = window.location.hash.substring(1);
      const key = await importKeyFromB64Url(hash);

      // 3. Decrypt
      const decrypted = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: b64UrlToBytes(json.iv) },
        key,
        b64UrlToBytes(json.encrypted),
      );
      const plaintext = new TextDecoder().decode(decrypted);

      setSecretText(plaintext);
      setStatus("REVEALED");

      // Start a local timer to hide/clear UI just for effect (Server data is already gone)
      let timeLeft = 60;
      setBurnTimer(timeLeft);
      const interval = setInterval(() => {
        timeLeft -= 1;
        setBurnTimer(timeLeft);
        if (timeLeft <= 0) {
          clearInterval(interval);
          // Optional: Auto-clear from screen logic if desired
        }
      }, 1000);

      // Remove key from URL (keep query id so UI stays on this view)
      try {
        const clean = `${window.location.origin}${window.location.pathname}${window.location.search}`;
        history.replaceState(null, "", clean);
      } catch {}
    } catch (e) {
      console.error(e);
      setStatus("ERROR");
      setErrorMsg("DECRYPTION FAILED. DATA CORRUPTED OR KEY INVALID.");
    }
  };

  // b64UrlToBytes imported from ../utils/crypto (DRY - no duplication)

  if (status === "BURNED") {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-red-500 bg-red-900/10 p-6 animate-pulse glow-border shadow-red-500/20">
        <Skull className="w-16 h-16 text-red-500 mb-4" />
        <h2
          className="text-3xl font-bold text-red-500 mb-2 glow-text"
          style={{ textShadow: "0 0 5px rgba(239, 68, 68, 0.7)" }}
        >
          404 - BURNED
        </h2>
        <p className="text-red-400 font-mono">
          &gt; THE SECRET HAS BEEN VAPORIZED.
          <br />
          &gt; IT NO LONGER EXISTS IN THIS UNIVERSE.
        </p>
      </div>
    );
  }

  if (status === "ERROR") {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-red-500 p-6 glow-border shadow-red-500/20">
        <FileWarning className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-red-500 mb-2">SYSTEM FAILURE</h2>
        <p className="text-red-400 font-mono">&gt; {errorMsg}</p>
        <button
          onClick={() => (window.location.href = "/")}
          className="mt-6 text-term-green underline hover:text-white"
        >
          [ RETURN TO BASE ]
        </button>
      </div>
    );
  }

  if (status === "REVEALED") {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-end border-b-2 border-term-green pb-2">
          <h2 className="text-xl font-bold flex items-center gap-2 glow-text">
            <Eye className="w-5 h-5" />
            DECRYPTED_PAYLOAD
          </h2>
          <span className="text-xs text-red-500 animate-pulse font-bold">
            LOCAL RAM CLEAR IN {burnTimer}s
          </span>
        </div>

        <div className="p-4 border border-term-green bg-term-green/5 min-h-[200px] whitespace-pre-wrap break-words font-mono text-lg glow-border">
          {secretText}
        </div>

        <div className="bg-red-900/20 border-l-4 border-red-500 p-4 text-sm text-red-400">
          <p className="font-bold flex items-center gap-2">
            <AlertTriangle size={16} />
            SERVER STATUS: DESTROYED
          </p>
          <p className="opacity-80 mt-1">
            The ciphertext has been deleted from the remote Volatile Vault.
            Reloading this page will result in a 404.
          </p>
        </div>

        <TerminalButton
          variant="danger"
          onClick={() => (window.location.href = "/")}
        >
          WIPE LOCAL MEMORY
        </TerminalButton>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] space-y-8 text-center">
      <div className="relative">
        <div className="absolute inset-0 bg-term-green blur-xl opacity-20 animate-pulse"></div>
        <Lock className="w-20 h-20 text-term-green relative z-10 glow-text" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-wider glow-text">
          ENCRYPTED SIGNAL DETECTED
        </h2>
        <p className="text-sm opacity-70 max-w-md mx-auto">
          &gt; You have received a secure volatile packet.
          <br />
          &gt; Proceeding will fetch the data and{" "}
          <span className="text-red-500 font-bold">PERMANENTLY DESTROY</span> it
          from the server.
        </p>
      </div>

      <div className="p-4 border border-red-500/50 bg-red-900/10 max-w-md glow-border shadow-red-500/10">
        <div className="flex items-start gap-3 text-left">
          <AlertTriangle className="text-red-500 w-6 h-6 shrink-0 mt-0.5" />
          <div className="text-red-400 text-xs">
            <strong className="block text-sm mb-1">
              WARNING: ONE-TIME ACCESS
            </strong>
            There is no undo. Once you click reveal, the server burns the data.
            Do not refresh the page after revealing.
          </div>
        </div>
      </div>

      <TerminalButton
        onClick={handleBurnAndReveal}
        isLoading={status === "FETCHING" || status === "DECRYPTING"}
      >
        {status === "FETCHING"
          ? "ACCESSING VAULT..."
          : status === "DECRYPTING"
            ? "DECRYPTING..."
            : "INITIATE BURN & REVEAL"}
      </TerminalButton>
    </div>
  );
};
