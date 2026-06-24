import ChatInterface from "@/components/ChatInterface";
import MemoryPanel from "@/components/MemoryPanel";

export default function Home() {
  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-[#050505] text-[#e5e7eb] font-sans selection:bg-[#cfa86e]/30 selection:text-white">
      {/* 1. TOP HEADER (h-20) */}
      <header className="h-20 shrink-0 bg-[#080808] border-b border-white/10 flex items-center justify-between px-6 z-10">
        <div className="flex items-center gap-3">
          {/* Golden gradient brand logo */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#8a6d3b] via-[#cfa86e] to-[#fff] flex items-center justify-center shadow-[0_0_12px_rgba(207,168,110,0.3)] border border-[#cfa86e]/50">
            <span className="font-serif text-[#050505] font-black text-sm">P</span>
          </div>
          <h1 className="font-serif text-2xl tracking-wide font-light text-white">
            THE <span className="italic font-bold text-[#cfa86e]">PUNDIT</span>
            <span className="text-[10px] align-super tracking-widest text-white/30 font-mono ml-2">v2.6</span>
          </h1>
        </div>

        <div className="flex items-center gap-6">
          {/* Network status */}
          <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-sm bg-emerald-500/5 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-[#4ade80] shadow-[0_0_8px_#4ade80] emerald-pulse"></span>
            <span className="font-mono text-xs text-[#4ade80] tracking-wider uppercase font-semibold">Mainnet Live</span>
          </div>
          
          {/* Squared action button */}
          <a
            href="https://github.com/EmirIsKing/the-pundit"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 border border-white/10 hover:border-[#cfa86e]/60 hover:text-white font-mono text-xs tracking-wider uppercase transition-all duration-200 bg-[#0a0a0c] hover:shadow-[0_0_10px_rgba(207,168,110,0.1)] rounded-none"
          >
            Source Code
          </a>
        </div>
      </header>

      {/* 2. CORE WORKSPACE */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT SIDEBAR (w-72) */}
        <aside className="w-72 shrink-0 bg-[#080808] border-r border-white/10 flex flex-col p-6 overflow-y-auto justify-between">
          <div className="flex flex-col gap-6">
            <div>
              <span className="font-mono text-[10px] tracking-widest text-white/40 uppercase block mb-3">
                Active AI Agents
              </span>
              
              {/* Agent Card 1: Active */}
              <div className="p-4 bg-[#0a0a0c] border border-white/10 border-l-2 border-l-[#cfa86e] mb-3 light-glint">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-serif text-sm font-bold text-white tracking-wide">The Pundit</h4>
                  <span className="font-mono text-[9px] px-1.5 py-0.5 bg-[#cfa86e]/10 text-[#cfa86e] border border-[#cfa86e]/20 tracking-wider uppercase font-semibold">
                    ROASTING
                  </span>
                </div>
                <p className="text-[11px] text-white/60 mb-3 leading-relaxed">
                  Opinionated analyst tracking predictions on Walrus.
                </p>
                <div className="flex justify-between font-mono text-[9px] text-white/40">
                  <span>MEM: 8.2 KB</span>
                  <span>SYNC: LIVE</span>
                </div>
              </div>

              {/* Agent Card 2: Inactive */}
              <div className="p-4 bg-[#0a0a0c]/40 border border-white/5 opacity-50 mb-3 hover:opacity-75 transition-opacity duration-200">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-serif text-sm font-bold text-white/80">Tactical Scout</h4>
                  <span className="font-mono text-[9px] px-1.5 py-0.5 bg-white/5 text-white/40 border border-white/10 tracking-wider uppercase">
                    STBY
                  </span>
                </div>
                <p className="text-[11px] text-white/50 mb-3">
                  Undergoing model compilation for tactics matching.
                </p>
                <div className="flex justify-between font-mono text-[9px] text-white/30">
                  <span>MEM: 0.0 KB</span>
                  <span>SYNC: --</span>
                </div>
              </div>

              {/* Agent Card 3: Inactive */}
              <div className="p-4 bg-[#0a0a0c]/40 border border-white/5 opacity-50 mb-3 hover:opacity-75 transition-opacity duration-200">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-serif text-sm font-bold text-white/80">Sentiment Bot</h4>
                  <span className="font-mono text-[9px] px-1.5 py-0.5 bg-white/5 text-white/40 border border-white/10 tracking-wider uppercase">
                    STBY
                  </span>
                </div>
                <p className="text-[11px] text-white/50 mb-3">
                  Real-time sentiment analyzer for fan reaction streams.
                </p>
                <div className="flex justify-between font-mono text-[9px] text-white/30">
                  <span>MEM: 0.0 KB</span>
                  <span>SYNC: --</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom pinned deploy button */}
          <button className="w-full py-2.5 border border-[#cfa86e]/30 text-[#cfa86e] hover:bg-[#cfa86e] hover:text-[#050505] transition-all duration-300 font-mono text-xs uppercase tracking-widest rounded-none hover:shadow-[0_0_12px_rgba(207,168,110,0.2)]">
            + Deploy New Agent
          </button>
        </aside>

        {/* CENTER CONTENT AREA */}
        <main className="flex-1 bg-[#0a0a0c] flex flex-col overflow-hidden">
          {/* Split Panel: Chat on Left, Memory Stream on Right */}
          <div className="flex-1 flex overflow-hidden border-b border-white/5">
            {/* Chat Column (w-7/12) */}
            <section className="w-7/12 flex flex-col border-r border-white/10 h-full overflow-hidden">
              <ChatInterface />
            </section>

            {/* Memory Stream Column (w-5/12) */}
            <section className="w-5/12 flex flex-col h-full overflow-hidden">
              <MemoryPanel />
            </section>
          </div>
        </main>
      </div>

      {/* 3. BOTTOM FOOTER BAR (h-8) */}
      <footer className="h-8 shrink-0 bg-[#080808] border-t border-white/10 px-6 flex items-center justify-between font-mono text-[9px] tracking-wider text-white/40 z-10">
        <div className="flex items-center gap-6">
          <span>SECURE // AUDITED BY HALBORN</span>
          <span className="w-1 h-1 rounded-full bg-white/20"></span>
          <span>PROTOCOL VERSION: v2.6.0-MAINNET</span>
        </div>
        <div className="font-serif italic font-light tracking-wide text-white/50">
          WALRUS <span className="font-normal text-[#cfa86e]">MEMORY</span> // PERSISTENT DATA ORACLE
        </div>
      </footer>
    </div>
  );
}
