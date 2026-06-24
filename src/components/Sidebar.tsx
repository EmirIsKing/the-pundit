"use client";

import { useState, useEffect, useCallback } from "react";
import DeployAgentModal from "./DeployAgentModal";
import { getOrCreateUserId } from "@/lib/userSession";
import { WC_TEAMS } from "@/lib/worldcupData";

interface Agent {
  id: string;
  name: string;
  description: string;
  role: string;
  systemPrompt?: string;
  isCustom?: boolean;
}

const DEFAULT_AGENTS: Agent[] = [
  {
    id: "pundit",
    name: "The Pundit",
    description: "Opinionated analyst tracking predictions on Walrus.",
    role: "ROASTING",
  },
  {
    id: "scout",
    name: "Tactical Scout",
    description: "Cold, professional tactical analyst.",
    role: "STBY",
  },
  {
    id: "sentiment",
    name: "Sentiment Bot",
    description: "Real-time sentiment analyzer for fan reaction streams.",
    role: "STBY",
  },
];

interface SidebarProps {
  activeAgentId: string;
  onSelectAgent: (agent: Agent) => void;
  activeView: string;
  onSelectView: (view: "chat" | "predictions" | "dashboard" | "debate" | "profile") => void;
}

export default function Sidebar({ activeAgentId, onSelectAgent, activeView, onSelectView }: SidebarProps) {
  const [agents, setAgents] = useState<Agent[]>(DEFAULT_AGENTS);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [profile, setProfile] = useState({
    team: "",
    accuracyScore: 100,
    predictionCount: 0,
  });
  const [userId, setUserId] = useState<string>("");

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/profile", {
        headers: { "x-user-id": getOrCreateUserId() },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          setProfile(data.profile);
        }
      }
    } catch (e) {
      console.error("Failed to fetch sidebar profile:", e);
    }
  }, []);

  const fetchCustomAgents = useCallback(async () => {
    try {
      const userId = getOrCreateUserId();

      const res = await fetch("/api/agents", {
        headers: { "x-user-id": userId },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.agents && data.agents.length > 0) {
          const customAgents = data.agents.map((a: any) => ({ ...a, isCustom: true }));
          setAgents([...DEFAULT_AGENTS, ...customAgents]);
        } else {
          setAgents(DEFAULT_AGENTS);
        }
      }
    } catch (e) {
      console.error("Failed to fetch agents", e);
    }
  }, []);

  useEffect(() => {
    setUserId(getOrCreateUserId());
    fetchProfile();
    fetchCustomAgents();

    const handler = () => {
      fetchProfile();
      fetchCustomAgents();
    };

    window.addEventListener("walrus-memory-updated", handler);
    return () => window.removeEventListener("walrus-memory-updated", handler);
  }, [fetchProfile, fetchCustomAgents]);

  const handleAgentCreated = () => {
    setIsDeployModalOpen(false);
    // Slight delay to allow backend walrus time, though it might not be immediately available
    setTimeout(fetchCustomAgents, 2000);
  };

  const selectedTeamData = WC_TEAMS.find((t) => t.name === profile.team);

  const navItems = [
    { id: "chat", label: "Chat Arena", icon: "💬" },
    { id: "predictions", label: "Predictions", icon: "🏆" },
    { id: "dashboard", label: "Stats & Timeline", icon: "📊" },
    { id: "debate", label: "Debate Arena", icon: "⚔️" },
  ] as const;

  return (
    <aside className="w-72 h-full shrink-0 bg-[#080808] border-r border-white/10 flex flex-col p-5 justify-between overflow-y-auto scrollbar-thin">
      <div className="space-y-6">
        {/* User Profile Header Card */}
        <div
          onClick={() => onSelectView("profile")}
          className={`p-3.5 bg-[#0a0a0c] border cursor-pointer transition-all duration-200 hover:border-[#cfa86e]/30 flex flex-col gap-2.5 ${
            activeView === "profile" ? "border-[#cfa86e] bg-[#cfa86e]/5" : "border-white/5"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#8a6d3b] via-[#cfa86e] to-[#fff] flex items-center justify-center border border-[#cfa86e]/20 text-sm">
              {profile.team ? selectedTeamData?.flag || "⚽" : "⚽"}
            </div>
            <div className="min-w-0">
              <h4 className="font-serif text-xs font-bold text-white truncate">
                {profile.team || "Select Favorite Team"}
              </h4>
              <span className="font-mono text-[8px] text-white/30 block uppercase tracking-wider">
                ID: {userId ? userId.slice(-8) : "..."}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center border-t border-white/5 pt-2 font-mono text-[8px] text-white/40">
            <span>PREDICTIONS: {profile.predictionCount}</span>
            <span>ACCURACY: {profile.accuracyScore}%</span>
          </div>
        </div>

        {/* View Navigation Links */}
        <div>
          <span className="font-mono text-[9px] tracking-widest text-white/40 uppercase block mb-2">
            Navigation
          </span>
          <div className="flex flex-col gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelectView(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 font-mono text-[10px] tracking-wider uppercase transition-all duration-150 border text-left rounded-none ${
                  activeView === item.id
                    ? "border-[#cfa86e]/40 text-[#cfa86e] bg-[#cfa86e]/5 font-bold"
                    : "border-transparent text-white/50 hover:text-white/80 hover:bg-white/[0.02]"
                }`}
              >
                <span className="text-sm shrink-0">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Active AI Agents Selection */}
        <div>
          <span className="font-mono text-[9px] tracking-widest text-white/40 uppercase block mb-2">
            AI Analysts
          </span>

          <div className="space-y-2.5">
            {agents.map((agent) => {
              const isActive = activeAgentId === agent.id && activeView === "chat";
              return (
                <div
                  key={agent.id}
                  onClick={() => {
                    onSelectAgent(agent);
                    onSelectView("chat");
                  }}
                  className={`p-3 cursor-pointer transition-all duration-200 border ${
                    isActive
                      ? "bg-[#0a0a0c] border-[#cfa86e] border-l-2 border-l-[#cfa86e] opacity-100"
                      : "bg-[#0a0a0c]/40 border-white/5 opacity-60 hover:opacity-85"
                  }`}
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <h5 className={`font-serif text-[11px] font-bold ${isActive ? "text-white" : "text-white/85"}`}>
                      {agent.name}
                    </h5>
                    <span
                      className={`font-mono text-[7px] px-1 py-0.2 tracking-wider uppercase ${
                        isActive
                          ? "bg-[#cfa86e]/10 text-[#cfa86e] border border-[#cfa86e]/20"
                          : "bg-white/5 text-white/35 border border-white/10"
                      }`}
                    >
                      {isActive ? "ACTIVE" : agent.role || "STBY"}
                    </span>
                  </div>
                  <p className={`text-[10px] leading-relaxed mb-2 truncate ${isActive ? "text-white/60" : "text-white/50"}`}>
                    {agent.description}
                  </p>
                  <div className="flex justify-between font-mono text-[7px] text-white/25">
                    <span>{agent.isCustom ? "CUSTOM" : "SYSTEM"}</span>
                    <span>{isActive ? "SYNC: LIVE" : "SYNC: --"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <button
        onClick={() => setIsDeployModalOpen(true)}
        className="w-full py-2.5 mt-4 border border-[#cfa86e]/30 text-[#cfa86e] hover:bg-[#cfa86e] hover:text-[#050505] transition-all duration-300 font-mono text-xs uppercase tracking-widest rounded-none hover:shadow-[0_0_12px_rgba(207,168,110,0.15)] cursor-pointer"
      >
        + Deploy New Agent
      </button>

      {isDeployModalOpen && (
        <DeployAgentModal
          onClose={() => setIsDeployModalOpen(false)}
          onCreated={handleAgentCreated}
        />
      )}
    </aside>
  );
}
