"use client";

import { useState } from "react";
import ChatInterface from "@/components/ChatInterface";
import MemoryPanel from "@/components/MemoryPanel";
import Sidebar from "@/components/Sidebar";
import FeedbackModal from "@/components/FeedbackModal";
import PredictionPanel from "@/components/PredictionPanel";
import DashboardView from "@/components/DashboardView";
import DebateArena from "@/components/DebateArena";
import UserProfile from "@/components/UserProfile";

type MainView = "chat" | "predictions" | "dashboard" | "debate" | "profile";

export default function DashboardPage() {
  const [activeAgent, setActiveAgent] = useState({
    id: "pundit",
    name: "The Pundit",
    description: "Opinionated analyst tracking predictions on Walrus.",
    role: "ROASTING",
    systemPrompt: undefined as string | undefined,
  });
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [activeView, setActiveView] = useState<MainView>("chat");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const viewTabs: { id: MainView; label: string; icon: string }[] = [
    { id: "chat", label: "Chat", icon: "💬" },
    { id: "predictions", label: "Predict", icon: "🏆" },
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "debate", label: "Debate", icon: "⚔️" },
    { id: "profile", label: "Profile", icon: "👤" },
  ];

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-[#050505] text-[#e5e7eb] font-sans selection:bg-[#cfa86e]/30 selection:text-white">
      {/* TOP HEADER */}
      <header className="h-14 md:h-16 shrink-0 bg-[#080808] border-b border-white/10 flex items-center justify-between px-4 md:px-6 z-20">
        <div className="flex items-center gap-3">
          {/* Mobile hamburger */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden w-8 h-8 flex items-center justify-center text-white/60 hover:text-white"
          >
            <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
              <path d="M0 1h18M0 7h18M0 13h18" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
          <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-tr from-[#8a6d3b] via-[#cfa86e] to-[#fff] flex items-center justify-center shadow-[0_0_12px_rgba(207,168,110,0.3)] border border-[#cfa86e]/50">
            <span className="font-serif text-[#050505] font-black text-xs md:text-sm">P</span>
          </div>
          <h1 className="font-serif text-lg md:text-2xl tracking-wide font-light text-white">
            THE <span className="italic font-bold text-[#cfa86e]">PUNDIT</span>
            <span className="text-[10px] align-super tracking-widest text-white/30 font-mono ml-2 hidden sm:inline">v2.6</span>
          </h1>
        </div>

        <div className="flex items-center gap-3 md:gap-6">
          <div className="hidden sm:flex items-center gap-2.5 px-3.5 py-1.5 rounded-sm bg-emerald-500/5 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-[#4ade80] shadow-[0_0_8px_#4ade80] emerald-pulse"></span>
            <span className="font-mono text-xs text-[#4ade80] tracking-wider uppercase font-semibold">Mainnet</span>
          </div>
          <button
            onClick={() => setIsFeedbackOpen(true)}
            className="hidden md:block px-4 py-2 border border-white/10 hover:border-[#cfa86e]/60 hover:text-[#cfa86e] font-mono text-xs tracking-wider uppercase transition-all duration-200 bg-[#0a0a0c] hover:shadow-[0_0_10px_rgba(207,168,110,0.1)] rounded-none"
          >
            Feedback
          </button>
          <a
            href="https://github.com/EmirIsKing/the-pundit"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:block px-4 py-2 border border-white/10 hover:border-[#cfa86e]/60 hover:text-white font-mono text-xs tracking-wider uppercase transition-all duration-200 bg-[#0a0a0c] hover:shadow-[0_0_10px_rgba(207,168,110,0.1)] rounded-none"
          >
            Source
          </a>
        </div>
      </header>

      {/* VIEW TABS — visible on all sizes */}
      <div className="h-10 shrink-0 bg-[#080808] border-b border-white/10 flex items-center px-2 md:px-6 gap-1 overflow-x-auto">
        {viewTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id)}
            className={`px-3 md:px-4 py-1.5 font-mono text-[10px] md:text-xs tracking-wider uppercase transition-all duration-200 whitespace-nowrap flex items-center gap-1.5 ${
              activeView === tab.id
                ? "text-[#cfa86e] border-b-2 border-[#cfa86e] bg-[#cfa86e]/5 font-bold"
                : "text-white/40 hover:text-white/70 border-b-2 border-transparent"
            }`}
          >
            <span className="text-sm">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* CORE WORKSPACE */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* SIDEBAR */}
        <div className={`
          fixed md:relative z-40 md:z-auto
          w-64 md:w-64 h-full
          transition-transform duration-300 ease-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}>
          <Sidebar
            activeAgentId={activeAgent.id}
            onSelectAgent={(agent: any) => {
              setActiveAgent(agent);
              setSidebarOpen(false);
            }}
            activeView={activeView}
            onSelectView={(view) => {
              setActiveView(view);
              setSidebarOpen(false);
            }}
          />
        </div>

        {/* CENTER CONTENT AREA */}
        <main className="flex-1 bg-[#0a0a0c] flex flex-col overflow-hidden min-w-0">
          {activeView === "chat" && (
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden border-b border-white/5">
              <section className="flex-1 md:w-7/12 flex flex-col border-r border-white/10 h-full overflow-hidden min-w-0">
                <ChatInterface agentId={activeAgent.id} customSystemPrompt={activeAgent.systemPrompt} onSelectView={setActiveView} />
              </section>
              <section className="hidden md:flex md:w-5/12 flex-col h-full overflow-hidden">
                <MemoryPanel />
              </section>
            </div>
          )}

          {activeView === "predictions" && (
            <div className="flex-1 overflow-hidden">
              <PredictionPanel />
            </div>
          )}

          {activeView === "dashboard" && (
            <div className="flex-1 overflow-hidden">
              <DashboardView />
            </div>
          )}

          {activeView === "debate" && (
            <div className="flex-1 overflow-hidden">
              <DebateArena />
            </div>
          )}

          {activeView === "profile" && (
            <div className="flex-1 overflow-hidden">
              <UserProfile />
            </div>
          )}
        </main>
      </div>

      {/* BOTTOM FOOTER */}
      <footer className="h-7 md:h-8 shrink-0 bg-[#080808] border-t border-white/10 px-4 md:px-6 flex items-center justify-between font-mono text-[8px] md:text-[9px] tracking-wider text-white/40 z-10">
        <div className="flex items-center gap-4 md:gap-6">
          <span className="hidden sm:inline">SECURE // AUDITED</span>
          <span className="w-1 h-1 rounded-full bg-white/20 hidden sm:block"></span>
          <span>PROTOCOL v2.6.0-MAINNET</span>
        </div>
        <div className="font-serif italic font-light tracking-wide text-white/50">
          WALRUS <span className="font-normal text-[#cfa86e]">MEMORY</span>
        </div>
      </footer>

      {isFeedbackOpen && <FeedbackModal onClose={() => setIsFeedbackOpen(false)} />}
    </div>
  );
}
