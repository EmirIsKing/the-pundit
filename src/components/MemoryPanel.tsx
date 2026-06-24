"use client";

import { useEffect, useState, useCallback } from "react";
import { getOrCreateUserId } from "@/lib/userSession";

interface Prediction {
  type: "prediction";
  team: string;
  stage: string;
  confidence: "high" | "medium" | "low";
  made_on: string;
  user_quote: string;
}

export default function MemoryPanel() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [filteredPredictions, setFilteredPredictions] = useState<Prediction[]>([]);
  const [filter, setFilter] = useState<"ALL" | "TACTICAL" | "SENTIMENT">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [isLoadingLedger, setIsLoadingLedger] = useState(true);
  const [roastText, setRoastText] = useState<string>("");
  const [isLoadingRoast, setIsLoadingRoast] = useState(false);
  const [lastSynced, setLastSynced] = useState<string>("NEVER");
  const [epochCount, setEpochCount] = useState<number>(318);
  const [blockCount, setBlockCount] = useState<number>(10482);

  const fetchPredictions = useCallback(async () => {
    setIsLoadingLedger(true);
    try {
      const res = await fetch("/api/predictions", {
        headers: {
          "x-user-id": getOrCreateUserId(),
        },
      });
      if (res.ok) {
        const data = await res.json();
        const list = data.predictions || [];
        setPredictions(list);
        setFilteredPredictions(list);
        setLastSynced(new Date().toLocaleTimeString("en-US", { hour12: false }));
        
        // Randomly simulate block & epoch increments for telemetry feel
        setEpochCount(prev => prev + Math.floor(Math.random() * 2));
        setBlockCount(prev => prev + Math.floor(Math.random() * 8) + 1);
      }
    } catch (error) {
      console.error("Failed to fetch predictions", error);
    } finally {
      setIsLoadingLedger(false);
    }
  }, []);

  // Poll predictions every 20s
  useEffect(() => {
    fetchPredictions();
    const interval = setInterval(fetchPredictions, 20000);
    return () => clearInterval(interval);
  }, [fetchPredictions]);

  // Listen to custom event dispatched by ChatInterface
  useEffect(() => {
    const handleUpdate = () => {
      fetchPredictions();
    };
    window.addEventListener("walrus-memory-updated", handleUpdate);
    return () => window.removeEventListener("walrus-memory-updated", handleUpdate);
  }, [fetchPredictions]);

  // Apply search query filter
  useEffect(() => {
    let result = predictions;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = predictions.filter(
        (p) =>
          p.team.toLowerCase().includes(query) ||
          p.stage.toLowerCase().includes(query) ||
          p.user_quote.toLowerCase().includes(query)
      );
    }
    setFilteredPredictions(result);
  }, [searchQuery, predictions]);

  const handleRoast = async () => {
    setIsLoadingRoast(true);
    setRoastText("");
    try {
      const res = await fetch("/api/memories?mode=roast", {
        headers: {
          "x-user-id": getOrCreateUserId(),
        },
      });
      if (res.ok) {
        const data = await res.json();
        setRoastText(data.roast || "The Pundit is unimpressed, but silent. Check your connection.");
      }
    } catch {
      setRoastText("The Pundit refused to formulate a roast. The Walrus node is overloaded with garbage opinions.");
    } finally {
      setIsLoadingRoast(false);
    }
  };

  const getShiftIndicator = (confidence: string) => {
    if (confidence === "high") {
      return <span className="text-[#4ade80] ml-2 font-mono text-[9px] font-semibold">▲ +14.2%</span>;
    } else if (confidence === "medium") {
      return <span className="text-[#4ade80] ml-2 font-mono text-[9px] font-semibold">▲ +4.8%</span>;
    } else {
      return <span className="text-red-400 ml-2 font-mono text-[9px] font-semibold">▼ -3.1%</span>;
    }
  };

  const mockHash = (index: number) => {
    // Deterministic visual tx hash
    const chars = "abcdef0123456789";
    let hash = "";
    for (let i = 0; i < 6; i++) {
      hash += chars[Math.floor((index + i * 3) % chars.length)];
    }
    return `0x${hash}...f8`;
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#080808]">
      {/* 1. SECTION HEADER */}
      <div className="p-6 shrink-0 border-b border-white/5 flex items-center justify-between">
        <div>
          <span className="font-mono text-[9px] tracking-widest text-[#cfa86e] uppercase block mb-1">
            Persistent Memory Stream
          </span>
          <h2 className="font-serif text-lg font-light text-white leading-tight">
            Walrus <span className="italic font-bold text-[#cfa86e]">Memory</span> Ledger
          </h2>
        </div>
        <div className="flex gap-2">
          <span className="font-mono text-[9px] bg-white/5 border border-white/10 px-2 py-1 text-white/50">
            EPOCH: {epochCount}
          </span>
          <span className="font-mono text-[9px] bg-white/5 border border-white/10 px-2 py-1 text-white/50">
            BLK: {blockCount}
          </span>
        </div>
      </div>

      {/* 2. FILTER BAR */}
      <div className="p-4 shrink-0 bg-[#0a0a0c] border-b border-white/10 flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Pills */}
        <div className="flex gap-2">
          {(["ALL", "TACTICAL", "SENTIMENT"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-3 py-1 font-mono text-[9px] tracking-widest uppercase transition-all duration-150 rounded-none border ${
                filter === t
                  ? "border-[#cfa86e] text-[#cfa86e] bg-[#cfa86e]/5 font-semibold"
                  : "border-transparent text-white/40 hover:text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Search */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="SEARCH EMULATED BLOCKS..."
          className="w-full sm:w-44 px-2 py-1 bg-[#050505] border border-white/10 focus:border-[#cfa86e]/60 outline-none text-[10px] font-mono text-white placeholder-white/20 uppercase rounded-none"
        />
      </div>

      {/* 3. SCROLLING DATA STREAM */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {isLoadingLedger && predictions.length === 0 && (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="w-6 h-6 border-2 border-[#cfa86e]/20 border-t-[#cfa86e] rounded-full animate-spin mb-3"></div>
            <p className="font-mono text-[10px] text-white/40 uppercase tracking-widest">
              Resolving memory nodes on mainnet...
            </p>
          </div>
        )}

        {!isLoadingLedger && filteredPredictions.length === 0 && (
          <div className="py-16 text-center">
            <span className="text-xl block mb-2 opacity-50">⚽</span>
            <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest">
              {predictions.length === 0 
                ? "No on-chain state detected for this user." 
                : "No matching memory index."}
            </p>
            <p className="text-[11px] text-white/50 mt-1 max-w-[200px] mx-auto leading-relaxed">
              {predictions.length === 0 
                ? "Submit a clear World Cup prediction in the chat to store it on Walrus." 
                : "Try a different search parameter."}
            </p>
          </div>
        )}

        {filter === "ALL" ? (
          filteredPredictions.map((p, idx) => (
            <div
              key={idx}
              className="p-5 bg-[#0a0a0c] border border-white/5 border-l-2 border-l-[#cfa86e]/60 light-glint hover:border-white/15 transition-all duration-200"
            >
              {/* Card Meta telemetry row */}
              <div className="flex justify-between items-center mb-2.5 font-mono text-[8px] text-white/30 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <span className="text-[#cfa86e]">MEM_NODE</span>
                  <span>{mockHash(idx)}</span>
                </div>
                <span>SYNC_OK // R: 14ms</span>
              </div>

              {/* Prediction details */}
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-serif text-sm font-bold text-white tracking-wide">
                  {p.team} <span className="text-[10px] text-white/40 font-mono font-light ml-1">{p.stage}</span>
                </h3>
                <div className="flex items-center">
                  <span
                    className={`font-mono text-[8px] px-1.5 py-0.5 border tracking-widest uppercase font-semibold ${
                      p.confidence === "high"
                        ? "border-[#4ade80]/20 text-[#4ade80] bg-[#4ade80]/5"
                        : p.confidence === "medium"
                        ? "border-[#cfa86e]/20 text-[#cfa86e] bg-[#cfa86e]/5"
                        : "border-red-500/20 text-red-400 bg-red-500/5"
                    }`}
                  >
                    {p.confidence}
                  </span>
                  {getShiftIndicator(p.confidence)}
                </div>
              </div>

              <blockquote className="text-[11px] text-white/60 pl-3 border-l border-white/10 italic mb-2 leading-relaxed">
                &ldquo;{p.user_quote}&rdquo;
              </blockquote>

              <div className="flex justify-between items-center font-mono text-[8px] text-white/30 pt-1">
                <span>COMMITTED: {p.made_on}</span>
                <span>NAMESPACE: ...{getOrCreateUserId().slice(-6)}</span>
              </div>
            </div>
          ))
        ) : (
          /* Placeholder screens for other filter categories to preserve aesthetic integrity */
          <div className="py-16 text-center">
            <span className="text-xl block mb-2 opacity-30">📊</span>
            <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest">
              No matching records in this stream class.
            </p>
            <p className="text-[11px] text-white/40 mt-1 max-w-[200px] mx-auto">
              Feed channel only monitors structured prediction ledger indices currently.
            </p>
          </div>
        )}

        {/* Sync telemetry info */}
        {predictions.length > 0 && (
          <div className="flex items-center justify-between font-mono text-[8px] text-white/30 px-1 shrink-0">
            <span>LAST SYNC: {lastSynced}</span>
            <button
              onClick={fetchPredictions}
              className="text-[#cfa86e] hover:text-white transition-colors duration-150 cursor-pointer"
            >
              ↻ FORCE BLOCK RESYNC
            </button>
          </div>
        )}
      </div>

      {/* 4. ROAST & RESONANCE CONSOLE (Bottom wide visualization card) */}
      <div className="p-6 shrink-0 bg-[#0a0a0c] border-t border-white/10 relative overflow-hidden min-h-[190px] flex flex-col justify-between">
        {/* Glowing sine-wave SVG background representing "Memory Wave Resonance" */}
        <div className="absolute inset-0 w-full h-full opacity-10 pointer-events-none z-0">
          <svg className="w-full h-full" viewBox="0 0 400 120" preserveAspectRatio="none">
            <path
              d="M0,60 C40,40 80,80 120,60 C160,40 200,80 240,60 C280,40 320,80 360,60 C400,40 440,80 480,60 L480,120 L0,120 Z"
              fill="url(#goldGrad)"
            />
            <path
              d="M0,60 C40,40 80,80 120,60 C160,40 200,80 240,60 C280,40 320,80 360,60 C400,40 440,80 480,60"
              fill="none"
              stroke="#cfa86e"
              strokeWidth="1"
            />
            <defs>
              <linearGradient id="goldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#cfa86e" />
                <stop offset="100%" stopColor="#050505" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-between">
          <div className="mb-2">
            <div className="flex justify-between items-center mb-2">
              <span className="font-mono text-[9px] tracking-widest text-[#cfa86e] uppercase">
                Roast & Analysis Console
              </span>
              <span className="font-mono text-[8px] text-white/30">MODULE: PUNDIT_SAVAGE_v1.0</span>
            </div>
            
            {roastText ? (
              <div className="p-3 bg-[#050505]/80 border border-[#cfa86e]/20 max-h-[85px] overflow-y-auto">
                <span className="font-serif italic text-xs text-[#cfa86e] font-light leading-relaxed block">
                  The Pundit: &ldquo;{roastText}&rdquo;
                </span>
              </div>
            ) : (
              <p className="text-[11px] text-white/50 leading-relaxed font-light">
                Generate an intelligence summary and savage critique of your recorded prediction pattern on the Walrus mainnet.
              </p>
            )}
          </div>

          <button
            onClick={handleRoast}
            disabled={isLoadingRoast || predictions.length === 0}
            className="w-full py-2 bg-transparent border border-[#cfa86e] hover:bg-[#cfa86e] hover:text-[#050505] disabled:border-white/10 disabled:text-white/20 transition-all duration-300 font-mono text-[10px] uppercase tracking-widest text-[#cfa86e] cursor-pointer disabled:cursor-not-allowed hover:shadow-[0_0_12px_rgba(207,168,110,0.15)] rounded-none"
          >
            {isLoadingRoast ? "Compiling Roast metrics..." : predictions.length === 0 ? "NO PREDICTIONS TO ROAST" : "🔥 ROAST MY PREDICTION RECORD"}
          </button>
        </div>
      </div>
    </div>
  );
}
