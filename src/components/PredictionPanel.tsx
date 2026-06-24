"use client";

import { useState, useCallback } from "react";
import { getOrCreateUserId } from "@/lib/userSession";
import { WC_TEAMS, NOTABLE_PLAYERS, WC_GROUPS, PREDICTION_CATEGORIES } from "@/lib/worldcupData";

type PredictionCategory = "tournament" | "group" | "golden_boot" | "golden_glove" | "dark_horse";

interface PredictionFormData {
  category: PredictionCategory;
  team: string;
  player: string;
  group: string;
  confidence: "high" | "medium" | "low";
  reasoning: string;
}

export default function PredictionPanel() {
  const [activeCategory, setActiveCategory] = useState<PredictionCategory>("tournament");
  const [formData, setFormData] = useState<PredictionFormData>({
    category: "tournament",
    team: "",
    player: "",
    group: "",
    confidence: "medium",
    reasoning: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleCategoryChange = (cat: PredictionCategory) => {
    setActiveCategory(cat);
    setFormData({ ...formData, category: cat, team: "", player: "", group: "" });
    setSuccess(false);
    setError("");
  };

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    setError("");
    setSuccess(false);

    try {
      let predictionText = "";
      let team = formData.team;
      let stage = "";

      switch (activeCategory) {
        case "tournament":
          if (!formData.team) { setError("Select a team"); setIsSubmitting(false); return; }
          stage = "Tournament Winner";
          predictionText = `I predict ${formData.team} will win the World Cup 2026. ${formData.reasoning}`;
          break;
        case "group":
          if (!formData.group || !formData.team) { setError("Select group and team"); setIsSubmitting(false); return; }
          stage = `Group ${formData.group} Winner`;
          predictionText = `I predict ${formData.team} will win Group ${formData.group}. ${formData.reasoning}`;
          break;
        case "golden_boot":
          if (!formData.player) { setError("Select a player"); setIsSubmitting(false); return; }
          team = formData.player;
          stage = "Golden Boot";
          predictionText = `I predict ${formData.player} will win the Golden Boot. ${formData.reasoning}`;
          break;
        case "golden_glove":
          if (!formData.player) { setError("Select a player"); setIsSubmitting(false); return; }
          team = formData.player;
          stage = "Golden Glove";
          predictionText = `I predict ${formData.player} will win the Golden Glove. ${formData.reasoning}`;
          break;
        case "dark_horse":
          if (!formData.team) { setError("Select a team"); setIsSubmitting(false); return; }
          stage = "Dark Horse";
          predictionText = `I predict ${formData.team} will be the dark horse of the tournament. ${formData.reasoning}`;
          break;
      }

      // Send as chat message for the AI to process and store
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": getOrCreateUserId(),
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: predictionText }],
          agentId: "pundit",
        }),
      });

      if (!response.ok) throw new Error("Failed to submit prediction");

      // Consume the stream
      const reader = response.body?.getReader();
      if (reader) {
        while (true) {
          const { done } = await reader.read();
          if (done) break;
        }
      }

      setSuccess(true);
      setFormData({ ...formData, team: "", player: "", group: "", reasoning: "" });

      // Dispatch memory update event
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("walrus-memory-updated"));
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Failed to submit");
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, activeCategory]);

  const groupTeams = formData.group ? WC_GROUPS[formData.group] || [] : [];
  const goalkeepers = NOTABLE_PLAYERS.filter(p => p.position === "Goalkeeper");
  const allPlayers = NOTABLE_PLAYERS;

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#0a0a0c]">
      {/* Header */}
      <div className="p-6 shrink-0 border-b border-white/5">
        <span className="font-mono text-[9px] tracking-widest text-[#cfa86e] uppercase block mb-1">
          Structured Prediction Engine
        </span>
        <h2 className="font-serif text-lg font-light text-white">
          Make Your <span className="italic font-bold text-[#cfa86e]">Call</span>
        </h2>
      </div>

      {/* Category Tabs */}
      <div className="px-4 py-3 shrink-0 border-b border-white/10 flex flex-wrap gap-2">
        {PREDICTION_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryChange(cat.id as PredictionCategory)}
            className={`flex items-center gap-1.5 px-3 py-2 font-mono text-[10px] tracking-wider uppercase transition-all duration-200 border ${
              activeCategory === cat.id
                ? "border-[#cfa86e] text-[#cfa86e] bg-[#cfa86e]/5 font-semibold"
                : "border-white/5 text-white/40 hover:text-white/70 hover:border-white/20"
            }`}
          >
            <span className="text-sm">{cat.icon}</span>
            <span className="hidden sm:inline">{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Form Area */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-lg mx-auto space-y-6">
          {/* Category description */}
          <div className="p-4 bg-[#080808] border border-white/5 border-l-2 border-l-[#cfa86e]/60">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{PREDICTION_CATEGORIES.find(c => c.id === activeCategory)?.icon}</span>
              <h3 className="font-serif text-base font-bold text-white">
                {PREDICTION_CATEGORIES.find(c => c.id === activeCategory)?.label}
              </h3>
            </div>
            <p className="text-xs text-white/50">
              {PREDICTION_CATEGORIES.find(c => c.id === activeCategory)?.description}
            </p>
          </div>

          {/* Team selector (tournament, dark_horse) */}
          {(activeCategory === "tournament" || activeCategory === "dark_horse") && (
            <div>
              <label className="block font-mono text-[10px] text-white/60 uppercase tracking-widest mb-2">
                Select Team
              </label>
              <select
                value={formData.team}
                onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                className="w-full px-4 py-3 bg-[#080808] border border-white/10 focus:border-[#cfa86e]/60 text-white text-sm outline-none rounded-none appearance-none cursor-pointer"
              >
                <option value="">Choose a team...</option>
                {WC_TEAMS.map((t) => (
                  <option key={t.code} value={t.name}>
                    {t.flag} {t.name} (Group {t.group})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Group selector */}
          {activeCategory === "group" && (
            <>
              <div>
                <label className="block font-mono text-[10px] text-white/60 uppercase tracking-widest mb-2">
                  Select Group
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {Object.keys(WC_GROUPS).map((g) => (
                    <button
                      key={g}
                      onClick={() => setFormData({ ...formData, group: g, team: "" })}
                      className={`py-2 font-mono text-xs border transition-all ${
                        formData.group === g
                          ? "border-[#cfa86e] text-[#cfa86e] bg-[#cfa86e]/5 font-bold"
                          : "border-white/10 text-white/40 hover:text-white hover:border-white/30"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              {formData.group && (
                <div>
                  <label className="block font-mono text-[10px] text-white/60 uppercase tracking-widest mb-2">
                    Group {formData.group} Winner
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {groupTeams.map((t) => {
                      const teamData = WC_TEAMS.find(wt => wt.name === t);
                      return (
                        <button
                          key={t}
                          onClick={() => setFormData({ ...formData, team: t })}
                          className={`py-3 px-4 text-left font-sans text-sm border transition-all flex items-center gap-2 ${
                            formData.team === t
                              ? "border-[#cfa86e] text-[#cfa86e] bg-[#cfa86e]/5"
                              : "border-white/10 text-white/70 hover:border-white/30"
                          }`}
                        >
                          <span>{teamData?.flag || "🏳️"}</span>
                          <span>{t}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Player selector (golden boot / golden glove) */}
          {(activeCategory === "golden_boot" || activeCategory === "golden_glove") && (
            <div>
              <label className="block font-mono text-[10px] text-white/60 uppercase tracking-widest mb-2">
                Select Player
              </label>
              <select
                value={formData.player}
                onChange={(e) => setFormData({ ...formData, player: e.target.value })}
                className="w-full px-4 py-3 bg-[#080808] border border-white/10 focus:border-[#cfa86e]/60 text-white text-sm outline-none rounded-none appearance-none cursor-pointer"
              >
                <option value="">Choose a player...</option>
                {(activeCategory === "golden_glove" ? goalkeepers : allPlayers).map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name} ({p.team}) — {p.position}
                  </option>
                ))}
              </select>
              <p className="text-[9px] text-white/30 font-mono mt-1">
                Or type a custom player name in the reasoning field
              </p>
            </div>
          )}

          {/* Confidence */}
          <div>
            <label className="block font-mono text-[10px] text-white/60 uppercase tracking-widest mb-2">
              Confidence Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["low", "medium", "high"] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setFormData({ ...formData, confidence: level })}
                  className={`py-2.5 font-mono text-xs uppercase tracking-wider border transition-all ${
                    formData.confidence === level
                      ? level === "high"
                        ? "border-[#4ade80] text-[#4ade80] bg-[#4ade80]/5 font-bold"
                        : level === "medium"
                        ? "border-[#cfa86e] text-[#cfa86e] bg-[#cfa86e]/5 font-bold"
                        : "border-red-400 text-red-400 bg-red-400/5 font-bold"
                      : "border-white/10 text-white/40 hover:text-white/70"
                  }`}
                >
                  {level === "high" ? "🔥 " : level === "low" ? "🤔 " : "⚡ "}{level}
                </button>
              ))}
            </div>
          </div>

          {/* Reasoning */}
          <div>
            <label className="block font-mono text-[10px] text-white/60 uppercase tracking-widest mb-2">
              Your Reasoning (optional)
            </label>
            <textarea
              value={formData.reasoning}
              onChange={(e) => setFormData({ ...formData, reasoning: e.target.value })}
              placeholder="Why do you believe this? The Pundit wants to know..."
              className="w-full px-4 py-3 bg-[#080808] border border-white/10 focus:border-[#cfa86e]/60 text-white text-sm outline-none rounded-none h-20 resize-none placeholder-white/20"
            />
          </div>

          {/* Error/Success */}
          {error && (
            <div className="p-3 border border-red-500/20 bg-red-500/5 text-red-400 text-xs font-mono">
              ⚠️ {error}
            </div>
          )}
          {success && (
            <div className="p-3 border border-[#4ade80]/20 bg-[#4ade80]/5 text-[#4ade80] text-xs font-mono">
              ✓ Prediction stored on Walrus Memory! The Pundit has taken note.
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full py-3.5 bg-[#cfa86e] text-[#050505] hover:bg-[#cfa86e]/95 transition-all duration-200 font-mono text-xs uppercase tracking-widest font-bold disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed shadow-[0_0_20px_rgba(207,168,110,0.1)] hover:shadow-[0_0_30px_rgba(207,168,110,0.2)]"
          >
            {isSubmitting ? "Storing on Walrus..." : "🏆 Submit Prediction"}
          </button>
        </div>
      </div>
    </div>
  );
}
