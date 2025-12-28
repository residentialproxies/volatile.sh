import React, { useEffect, useState } from "react";
import { CreateView } from "./components/CreateView";
import { ReadView } from "./components/ReadView";
import { Terminal, Github } from "lucide-react";

const App: React.FC = () => {
  const [viewId, setViewId] = useState<string | null>(null);

  useEffect(() => {
    // Simple routing based on query parameter `id`
    // We avoid HashRouter because the key is stored in the hash
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (id) {
      setViewId(id);
    }
  }, []);

  return (
    <div className="min-h-screen bg-term-bg text-term-green font-mono p-4 sm:p-8 flex flex-col items-center">
      <div className="w-full max-w-3xl relative">
        {/* Terminal Header */}
        <header className="mb-8 border-b-2 border-term-green pb-4 flex items-center justify-between glow-border border-t-0 border-l-0 border-r-0 shadow-[0_10px_20px_-10px_rgba(51,255,0,0.2)]">
          <div className="flex items-center gap-3">
            <div className="bg-term-green text-black p-1">
              <Terminal size={24} strokeWidth={3} />
            </div>
            <div>
              <h1 className="text-3xl font-bold leading-none tracking-tighter glow-text">
                volatile.sh<span className="animate-blink">_</span>
              </h1>
              <p className="text-xs opacity-70 tracking-widest">
                ZERO DISK. ZERO LOGS. 100% RAM.
              </p>
            </div>
          </div>
          <div className="hidden sm:block text-right text-xs opacity-50">
            <div>STATUS: ONLINE</div>
            <div>ENCRYPTION: AES-GCM-256</div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="border-2 border-term-green bg-term-panel glow-border relative overflow-hidden">
          {/* Decorative Matrix/Grid Background inside panel */}
          <div
            className="absolute inset-0 opacity-5 pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(0deg, transparent 24%, rgba(51, 255, 0, .3) 25%, rgba(51, 255, 0, .3) 26%, transparent 27%, transparent 74%, rgba(51, 255, 0, .3) 75%, rgba(51, 255, 0, .3) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(51, 255, 0, .3) 25%, rgba(51, 255, 0, .3) 26%, transparent 27%, transparent 74%, rgba(51, 255, 0, .3) 75%, rgba(51, 255, 0, .3) 76%, transparent 77%, transparent)",
              backgroundSize: "30px 30px",
            }}
          ></div>

          <div className="relative z-10 p-6 sm:p-10">
            {viewId ? <ReadView id={viewId} /> : <CreateView />}
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-8 text-center text-xs opacity-40 flex flex-col items-center gap-2">
          <p>
            &gt; SYSTEM OUTPUT: VOLATILE_MEMORY_VAULT_V1.0 <br />
            &gt; ALL DATA IS EPHEMERAL. TRUST THE CODE, NOT THE SERVER.
          </p>
          <p className="opacity-60">
            <a
              href="/faq.html"
              className="hover:text-term-green hover:opacity-100 transition-opacity"
            >
              [ FAQ ]
            </a>{" "}
            ·{" "}
            <a
              href="/docs.html"
              className="hover:text-term-green hover:opacity-100 transition-opacity"
            >
              [ DOCS ]
            </a>{" "}
            ·{" "}
            <a
              href="/security.html"
              className="hover:text-term-green hover:opacity-100 transition-opacity"
            >
              [ SECURITY ]
            </a>{" "}
            ·{" "}
            <a
              href="/privacy.html"
              className="hover:text-term-green hover:opacity-100 transition-opacity"
            >
              [ PRIVACY ]
            </a>{" "}
            ·{" "}
            <a
              href="/terms.html"
              className="hover:text-term-green hover:opacity-100 transition-opacity"
            >
              [ TERMS ]
            </a>
          </p>
          <a
            href="https://github.com/yourusername/volatile.sh"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 hover:text-term-green hover:opacity-100 transition-opacity mt-2 border-b border-transparent hover:border-term-green"
          >
            <Github size={12} />[ SOURCE CODE / GITHUB ]
          </a>
        </footer>
      </div>
    </div>
  );
};

export default App;
