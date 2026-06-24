"use client";

import { useState, useEffect } from "react";
import DeployAgentModal from "./DeployAgentModal";
import { getOrCreateUserId } from "@/lib/userSession";

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
}

export default function Sidebar({ activeAgentId, onSelectAgent }: SidebarProps) {
  const [agents, setAgents] = useState<Agent[]>(DEFAULT_AGENTS);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);

  useEffect(() => {
    fetchCustomAgents();
  }, []);

  const fetchCustomAgents = async () => {
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
        }
      }
    } catch (e) {
      console.error("Failed to fetch agents", e);
    }
  };

  const handleAgentCreated = () => {
    setIsDeployModalOpen(false);
    // Slight delay to allow backend walrus time, though it might not be immediately available
    setTimeout(fetchCustomAgents, 2000);
  };

  return (
    <aside className="w-72 shrink-0 bg-[#080808] border-r border-white/10 flex flex-col p-6 overflow-y-auto justify-between">
      <div className="flex flex-col gap-6">
        <div>
          <span className="font-mono text-[10px] tracking-widest text-white/40 uppercase block mb-3">
            Active AI Agents
          </span>

          {agents.map((agent) => {
            const isActive = activeAgentId === agent.id;
            return (
              <div
                key={agent.id}
                onClick={() => onSelectAgent(agent)}
                className={`p-4 cursor-pointer transition-all duration-200 mb-3 ${
                  isActive
                    ? "bg-[#0a0a0c] border border-white/10 border-l-2 border-l-[#cfa86e] light-glint opacity-100"
                    : "bg-[#0a0a0c]/40 border border-white/5 opacity-50 hover:opacity-75"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className={`font-serif text-sm font-bold ${isActive ? "text-white tracking-wide" : "text-white/80"}`}>
                    {agent.name}
                  </h4>
                  <span
                    className={`font-mono text-[9px] px-1.5 py-0.5 tracking-wider uppercase ${
                      isActive
                        ? "bg-[#cfa86e]/10 text-[#cfa86e] border border-[#cfa86e]/20 font-semibold"
                        : "bg-white/5 text-white/40 border border-white/10"
                    }`}
                  >
                    {isActive ? "ACTIVE" : agent.role || "STBY"}
                  </span>
                </div>
                <p className={`text-[11px] mb-3 ${isActive ? "text-white/60 leading-relaxed" : "text-white/50"}`}>
                  {agent.description}
                </p>
                <div className="flex justify-between font-mono text-[9px] text-white/30">
                  <span>{agent.isCustom ? "CUSTOM AGENT" : "SYSTEM AGENT"}</span>
                  <span>{isActive ? "SYNC: LIVE" : "SYNC: --"}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={() => setIsDeployModalOpen(true)}
        className="w-full py-2.5 border border-[#cfa86e]/30 text-[#cfa86e] hover:bg-[#cfa86e] hover:text-[#050505] transition-all duration-300 font-mono text-xs uppercase tracking-widest rounded-none hover:shadow-[0_0_12px_rgba(207,168,110,0.2)]"
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
