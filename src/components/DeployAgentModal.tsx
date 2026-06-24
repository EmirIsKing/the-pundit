"use client";

import { useState } from "react";
import { getOrCreateUserId } from "@/lib/userSession";

interface DeployAgentModalProps {
  onClose: () => void;
  onCreated: () => void;
}

export default function DeployAgentModal({ onClose, onCreated }: DeployAgentModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !systemPrompt) {
      setError("Name and system prompt are required.");
      return;
    }
    
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": getOrCreateUserId(),
        },
        body: JSON.stringify({ name, description, systemPrompt }),
      });

      if (!res.ok) {
        throw new Error("Failed to deploy agent");
      }
      
      onCreated();
    } catch (err: any) {
      setError(err.message || "Failed to deploy agent");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-md bg-[#080808] border border-white/10 shadow-[0_0_40px_rgba(207,168,110,0.1)] p-6">
        <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
          <div>
            <h2 className="font-serif text-xl text-white">Deploy Custom Agent</h2>
            <p className="font-mono text-[9px] text-white/40 tracking-widest mt-1">
              STORED ON WALRUS MEMORY
            </p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            ✕
          </button>
        </div>

        {error && <div className="mb-4 text-red-400 text-xs font-mono">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-mono text-[10px] text-white/60 uppercase tracking-widest mb-1.5">
              Agent Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#0a0a0c] border border-white/10 focus:border-[#cfa86e]/60 focus:bg-[#050505] text-white text-sm font-sans placeholder-white/20 transition-all duration-200 outline-none rounded-none"
              placeholder="e.g. Penalty Expert"
              maxLength={15}
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] text-white/60 uppercase tracking-widest mb-1.5">
              Short Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#0a0a0c] border border-white/10 focus:border-[#cfa86e]/60 focus:bg-[#050505] text-white text-sm font-sans placeholder-white/20 transition-all duration-200 outline-none rounded-none"
              placeholder="Focuses on penalty shootout statistics."
              maxLength={30}
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] text-white/60 uppercase tracking-widest mb-1.5">
              System Prompt
            </label>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#0a0a0c] border border-white/10 focus:border-[#cfa86e]/60 focus:bg-[#050505] text-white text-sm font-sans placeholder-white/20 transition-all duration-200 outline-none rounded-none h-24 resize-none"
              placeholder="You are an expert on penalty shootouts..."
              maxLength={50}
            />
            <p className="text-[9px] font-mono text-white/30 mt-1">
              Max 50 chars to prevent Walrus limit.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 mt-4 bg-[#cfa86e] text-[#050505] hover:bg-[#cfa86e]/95 transition-all duration-200 font-mono text-xs uppercase tracking-widest font-bold disabled:opacity-50"
          >
            {isSubmitting ? "Deploying to Walrus..." : "Deploy Agent"}
          </button>
        </form>
      </div>
    </div>
  );
}
