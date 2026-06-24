import Link from "next/link";

function HeroBg() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Large gradient orbs */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-[#cfa86e]/[0.04] blur-[120px] animate-float-slow" />
      <div className="absolute -bottom-60 -right-40 w-[500px] h-[500px] rounded-full bg-[#cfa86e]/[0.03] blur-[100px] animate-float-slow-reverse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-[#4ade80]/[0.02] blur-[80px]" />

      {/* Grid lines */}
      <div className="absolute inset-0" style={{
        backgroundImage: `linear-gradient(rgba(207,168,110,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(207,168,110,0.03) 1px, transparent 1px)`,
        backgroundSize: '80px 80px',
      }} />

      {/* Diagonal accent line */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.04]" viewBox="0 0 1200 800" preserveAspectRatio="none">
        <line x1="0" y1="800" x2="1200" y2="0" stroke="#cfa86e" strokeWidth="1" />
        <line x1="200" y1="800" x2="1200" y2="200" stroke="#cfa86e" strokeWidth="0.5" />
      </svg>
    </div>
  );
}

function MemoryTerminal() {
  const lines = [
    { delay: "0s", text: '> memwal.recall({ query: "World Cup predictions" })', color: "text-[#cfa86e]" },
    { delay: "0.8s", text: "  ⟳ Searching Walrus Memory (mainnet)...", color: "text-white/40" },
    { delay: "1.6s", text: '  ✓ Found 3 memories (latency: 142ms)', color: "text-[#4ade80]" },
    { delay: "2.4s", text: "", color: "" },
    { delay: "2.8s", text: '  [2026-06-15] "France will win the World Cup"', color: "text-white/70" },
    { delay: "3.2s", text: '  [2026-06-18] "I changed my mind — Argentina"', color: "text-white/70" },
    { delay: "3.6s", text: '  [2026-06-22] "Actually, Brazil looks unstoppable"', color: "text-white/70" },
    { delay: "4.4s", text: "", color: "" },
    { delay: "4.8s", text: '> The Pundit: "You have changed your winner', color: "text-[#cfa86e]" },
    { delay: "5.0s", text: '  prediction 3 times. Classic indecisive fan."', color: "text-[#cfa86e]" },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto bg-[#0a0a0c] border border-white/10 rounded-sm overflow-hidden shadow-[0_0_60px_rgba(207,168,110,0.05)]">
      {/* Terminal header */}
      <div className="h-8 bg-[#080808] border-b border-white/10 flex items-center px-4 gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#4ade80]/60" />
        <span className="ml-3 font-mono text-[9px] text-white/30 tracking-widest uppercase">walrus-memory-console</span>
      </div>
      {/* Terminal body */}
      <div className="p-5 font-mono text-xs leading-relaxed min-h-[220px]">
        {lines.map((line, i) => (
          <div
            key={i}
            className={`${line.color} opacity-0 animate-terminal-line`}
            style={{ animationDelay: line.delay, animationFillMode: "forwards" }}
          >
            {line.text || "\u00A0"}
          </div>
        ))}
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="group p-6 bg-[#080808] border border-white/5 hover:border-[#cfa86e]/30 transition-all duration-300 light-glint hover:shadow-[0_0_30px_rgba(207,168,110,0.05)]">
      <div className="text-2xl mb-3">{icon}</div>
      <h3 className="font-serif text-base font-bold text-white mb-2 group-hover:text-[#cfa86e] transition-colors">{title}</h3>
      <p className="text-xs text-white/50 leading-relaxed">{description}</p>
    </div>
  );
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center text-center p-6">
      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#8a6d3b] to-[#cfa86e] flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(207,168,110,0.2)]">
        <span className="font-mono text-[#050505] font-black text-sm">{number}</span>
      </div>
      <h3 className="font-serif text-sm font-bold text-white mb-2">{title}</h3>
      <p className="text-xs text-white/50 leading-relaxed max-w-[200px]">{description}</p>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-[#e5e7eb] font-sans selection:bg-[#cfa86e]/30 selection:text-white overflow-x-hidden">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 md:px-12">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#8a6d3b] via-[#cfa86e] to-[#fff] flex items-center justify-center shadow-[0_0_12px_rgba(207,168,110,0.3)] border border-[#cfa86e]/50">
            <img className="rounded-full" src="/logo-pundit.jpg" alt="logo" />
          </div>
          <span className="font-serif text-lg tracking-wide font-light text-white">
            THE <span className="italic font-bold text-[#cfa86e]">PUNDIT</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-emerald-500/5 border border-emerald-500/20 rounded-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] shadow-[0_0_6px_#4ade80] emerald-pulse" />
            <span className="font-mono text-[10px] text-[#4ade80] tracking-wider uppercase font-semibold">Live on Mainnet</span>
          </div>
          <Link
            href="/dashboard"
            className="px-5 py-2 bg-[#cfa86e] text-[#050505] font-mono text-xs uppercase tracking-widest font-bold hover:bg-[#cfa86e]/90 transition-all duration-200 shadow-[0_0_20px_rgba(207,168,110,0.2)] hover:shadow-[0_0_30px_rgba(207,168,110,0.3)]"
          >
            Launch App
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-16">
        <HeroBg />

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#cfa86e]/5 border border-[#cfa86e]/20 mb-8 rounded-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#cfa86e] animate-pulse" />
            <span className="font-mono text-[10px] text-[#cfa86e] tracking-widest uppercase">Walrus Memory World Cup Hackathon</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl font-light text-white leading-[1.1] mb-6">
            The AI That{" "}
            <span className="italic font-bold text-gold-gradient">Remembers</span>
            <br />
            Your World Cup Takes
          </h1>

          <p className="text-base md:text-lg text-white/50 max-w-xl mx-auto leading-relaxed mb-10 font-light">
            Predict winners. Debate tactics. Get roasted for bad calls.
            Every opinion is stored forever on{" "}
            <span className="text-[#cfa86e] font-medium">Walrus Memory</span> — and The Pundit will hold you to them.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/dashboard"
              className="px-8 py-3.5 bg-[#cfa86e] text-[#050505] font-mono text-sm uppercase tracking-widest font-bold hover:bg-[#cfa86e]/90 transition-all duration-200 shadow-[0_0_30px_rgba(207,168,110,0.2)] hover:shadow-[0_0_40px_rgba(207,168,110,0.35)]"
            >
              Start Predicting →
            </Link>
            <a
              href="https://github.com/EmirIsKing/the-pundit"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3.5 border border-white/10 text-white/70 hover:text-white hover:border-white/30 font-mono text-sm uppercase tracking-widest transition-all duration-200"
            >
              View Source
            </a>
          </div>

          {/* Live memory demo terminal */}
          <MemoryTerminal />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="font-mono text-[10px] tracking-widest text-[#cfa86e] uppercase block mb-3">How It Works</span>
            <h2 className="font-serif text-3xl md:text-4xl font-light text-white">
              Powered by <span className="italic font-bold text-[#cfa86e]">Persistent Memory</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StepCard number="01" title="Predict" description="Share your World Cup predictions — tournament winners, group toppers, Golden Boot, hot takes." />
            <StepCard number="02" title="Remember" description="Every opinion is encrypted and stored on the Walrus decentralized network. Permanently." />
            <StepCard number="03" title="Evolve" description="The AI becomes smarter about you. It recalls past predictions, spots contradictions, and roasts bad calls." />
          </div>
        </div>
      </section>

      {/* FEATURE SHOWCASE */}
      <section className="py-24 px-6 bg-[#080808] border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="font-mono text-[10px] tracking-widest text-[#cfa86e] uppercase block mb-3">Feature Showcase</span>
            <h2 className="font-serif text-3xl md:text-4xl font-light text-white">
              More Than Just <span className="italic font-bold text-[#cfa86e]">Predictions</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <FeatureCard icon="🏆" title="Structured Predictions" description="Predict tournament winners, group stages, Golden Boot, Golden Glove. All stored on-chain." />
            <FeatureCard icon="🔥" title="Roast Mode" description="Get savagely roasted by The Pundit for your worst predictions and contradictions." />
            <FeatureCard icon="⚔️" title="Debate Arena" description="Argue football topics with AI that remembers your previous positions and calls you out." />
            <FeatureCard icon="📊" title="Memory Dashboard" description="Visual timeline of all your predictions, accuracy scores, team biases, and memory events." />
            <FeatureCard icon="🧠" title="Walrus Memory" description="Persistent, encrypted, decentralized storage. Your data survives browser refreshes, logouts, and time." />
            <FeatureCard icon="🤖" title="Custom Agents" description="Deploy custom AI analysts with unique personalities, stored and recalled from Walrus." />
          </div>
        </div>
      </section>

      {/* LEADERBOARD PREVIEW */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <span className="font-mono text-[10px] tracking-widest text-[#cfa86e] uppercase block mb-3">Community</span>
            <h2 className="font-serif text-3xl md:text-4xl font-light text-white">
              Prediction <span className="italic font-bold text-[#cfa86e]">Leaderboard</span>
            </h2>
          </div>

          <div className="bg-[#080808] border border-white/10 overflow-hidden">
            <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 px-6 py-3 border-b border-white/10 font-mono text-[9px] text-white/40 tracking-widest uppercase">
              <span>Rank</span>
              <span>User</span>
              <span>Predictions</span>
              <span>Accuracy</span>
            </div>
            {[
              { rank: 1, name: "The Oracle", preds: 47, acc: "78%" },
              { rank: 2, name: "FootballGuru", preds: 34, acc: "71%" },
              { rank: 3, name: "TacticalMind", preds: 29, acc: "69%" },
              { rank: 4, name: "PredictorX", preds: 22, acc: "64%" },
              { rank: 5, name: "WalrusFan", preds: 18, acc: "61%" },
            ].map((row) => (
              <div
                key={row.rank}
                className="grid grid-cols-[auto_1fr_auto_auto] gap-4 px-6 py-3 border-b border-white/5 hover:bg-white/[0.02] transition-colors items-center"
              >
                <span className={`font-mono text-xs font-bold ${row.rank <= 3 ? "text-[#cfa86e]" : "text-white/40"}`}>
                  #{row.rank}
                </span>
                <span className="text-sm text-white/80">{row.name}</span>
                <span className="font-mono text-xs text-white/50">{row.preds}</span>
                <span className={`font-mono text-xs font-semibold ${parseInt(row.acc) >= 70 ? "text-[#4ade80]" : "text-[#cfa86e]"
                  }`}>{row.acc}</span>
              </div>
            ))}
          </div>
          <p className="text-center text-[10px] text-white/30 font-mono mt-4 tracking-widest uppercase">
            Demo data — Leaderboard populates as users make predictions
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-[#080808] border-t border-white/5 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl font-light text-white mb-4">
            Ready to Put Your <span className="italic font-bold text-[#cfa86e]">Predictions</span> on Record?
          </h2>
          <p className="text-sm text-white/50 mb-8 leading-relaxed">
            The Pundit is watching. Every prediction, every hot take, every flip-flop — stored forever on Walrus.
          </p>
          <Link
            href="/dashboard"
            className="inline-block px-10 py-4 bg-[#cfa86e] text-[#050505] font-mono text-sm uppercase tracking-widest font-bold hover:bg-[#cfa86e]/90 transition-all duration-200 shadow-[0_0_40px_rgba(207,168,110,0.2)] hover:shadow-[0_0_50px_rgba(207,168,110,0.35)]"
          >
            Launch World Cup Oracle →
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 px-6 border-t border-white/10">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#8a6d3b] to-[#cfa86e] flex items-center justify-center">
              <span className="font-serif text-[#050505] font-black text-[8px]">P</span>
            </div>
            <span className="font-serif text-sm text-white/60">
              THE <span className="italic font-bold text-[#cfa86e]">PUNDIT</span>
            </span>
          </div>
          <div className="font-mono text-[9px] text-white/30 tracking-widest uppercase flex items-center gap-4">
            <span>Built for the Walrus Memory World Cup Hackathon</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span>Powered by Walrus Memory</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
