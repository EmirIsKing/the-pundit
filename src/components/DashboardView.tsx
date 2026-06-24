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

interface DashboardStats {
  totalPredictions: number;
  highConfidence: number;
  mediumConfidence: number;
  lowConfidence: number;
  teamCounts: Record<string, number>;
  stageCounts: Record<string, number>;
  firstPrediction: string;
  lastPrediction: string;
}

function computeStats(predictions: Prediction[]): DashboardStats {
  const teamCounts: Record<string, number> = {};
  const stageCounts: Record<string, number> = {};
  let high = 0, medium = 0, low = 0;

  predictions.forEach((p) => {
    teamCounts[p.team] = (teamCounts[p.team] || 0) + 1;
    stageCounts[p.stage] = (stageCounts[p.stage] || 0) + 1;
    if (p.confidence === "high") high++;
    else if (p.confidence === "medium") medium++;
    else low++;
  });

  const dates = predictions.map(p => p.made_on).sort();
  return {
    totalPredictions: predictions.length,
    highConfidence: high,
    mediumConfidence: medium,
    lowConfidence: low,
    teamCounts,
    stageCounts,
    firstPrediction: dates[0] || "—",
    lastPrediction: dates[dates.length - 1] || "—",
  };
}

function StatCard({ label, value, subtext, accent }: { label: string; value: string | number; subtext?: string; accent?: boolean }) {
  return (
    <div className="p-4 bg-[#080808] border border-white/5 light-glint">
      <span className="font-mono text-[9px] tracking-widest text-white/40 uppercase block mb-1">{label}</span>
      <div className={`font-serif text-2xl font-bold ${accent ? "text-[#cfa86e]" : "text-white"}`}>{value}</div>
      {subtext && <span className="font-mono text-[9px] text-white/30">{subtext}</span>}
    </div>
  );
}

function DonutChart({ high, medium, low }: { high: number; medium: number; low: number }) {
  const total = high + medium + low;
  if (total === 0) return null;

  const hPct = (high / total) * 100;
  const mPct = (medium / total) * 100;
  const lPct = (low / total) * 100;

  // SVG donut using stroke-dasharray
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const hDash = (hPct / 100) * circumference;
  const mDash = (mPct / 100) * circumference;
  const lDash = (lPct / 100) * circumference;

  return (
    <div className="flex items-center gap-6">
      <svg width="100" height="100" viewBox="0 0 100 100" className="shrink-0">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#050505" strokeWidth="12" />
        {/* High */}
        <circle
          cx="50" cy="50" r={radius} fill="none" stroke="#4ade80" strokeWidth="12"
          strokeDasharray={`${hDash} ${circumference - hDash}`}
          strokeDashoffset={circumference * 0.25}
          className="transition-all duration-700"
        />
        {/* Medium */}
        <circle
          cx="50" cy="50" r={radius} fill="none" stroke="#cfa86e" strokeWidth="12"
          strokeDasharray={`${mDash} ${circumference - mDash}`}
          strokeDashoffset={circumference * 0.25 - hDash}
          className="transition-all duration-700"
        />
        {/* Low */}
        <circle
          cx="50" cy="50" r={radius} fill="none" stroke="#ef4444" strokeWidth="12"
          strokeDasharray={`${lDash} ${circumference - lDash}`}
          strokeDashoffset={circumference * 0.25 - hDash - mDash}
          className="transition-all duration-700"
        />
        <text x="50" y="50" textAnchor="middle" dominantBaseline="central" fill="white" fontSize="14" fontWeight="bold" fontFamily="serif">
          {total}
        </text>
      </svg>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-[#4ade80] rounded-sm" />
          <span className="text-xs text-white/60">High ({high})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-[#cfa86e] rounded-sm" />
          <span className="text-xs text-white/60">Medium ({medium})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-red-500 rounded-sm" />
          <span className="text-xs text-white/60">Low ({low})</span>
        </div>
      </div>
    </div>
  );
}

function TeamBar({ team, count, maxCount }: { team: string; count: number; maxCount: number }) {
  const widthPct = maxCount > 0 ? (count / maxCount) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="w-24 text-xs text-white/60 truncate text-right shrink-0">{team}</span>
      <div className="flex-1 h-5 bg-[#050505] border border-white/5 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#cfa86e]/60 to-[#cfa86e] transition-all duration-700"
          style={{ width: `${widthPct}%` }}
        />
      </div>
      <span className="font-mono text-[10px] text-[#cfa86e] font-semibold w-6 text-right">{count}</span>
    </div>
  );
}

export default function DashboardView() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [aiSummary, setAiSummary] = useState("");
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  const fetchPredictions = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/predictions", {
        headers: { "x-user-id": getOrCreateUserId() },
      });
      if (res.ok) {
        const data = await res.json();
        setPredictions(data.predictions || []);
      }
    } catch (e) {
      console.error("Dashboard fetch failed:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPredictions();
    const handler = () => fetchPredictions();
    window.addEventListener("walrus-memory-updated", handler);
    return () => window.removeEventListener("walrus-memory-updated", handler);
  }, [fetchPredictions]);

  const generateSummary = async () => {
    if (predictions.length === 0) return;
    setIsLoadingSummary(true);
    try {
      const res = await fetch("/api/memories?mode=roast", {
        headers: { "x-user-id": getOrCreateUserId() },
      });
      if (res.ok) {
        const data = await res.json();
        setAiSummary(data.roast || "No summary available.");
      }
    } catch {
      setAiSummary("Failed to generate summary.");
    } finally {
      setIsLoadingSummary(false);
    }
  };

  const stats = computeStats(predictions);
  const sortedTeams = Object.entries(stats.teamCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const maxTeamCount = sortedTeams.length > 0 ? sortedTeams[0][1] : 1;

  if (isLoading && predictions.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0a0a0c]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#cfa86e]/20 border-t-[#cfa86e] rounded-full animate-spin mx-auto mb-4" />
          <p className="font-mono text-[10px] text-white/40 uppercase tracking-widest">Loading memory dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#0a0a0c]">
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <span className="font-mono text-[9px] tracking-widest text-[#cfa86e] uppercase block mb-1">
            Memory Intelligence Dashboard
          </span>
          <h2 className="font-serif text-lg font-light text-white">
            Your <span className="italic font-bold text-[#cfa86e]">Prediction</span> Profile
          </h2>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Total Predictions" value={stats.totalPredictions} accent />
          <StatCard label="High Confidence" value={stats.highConfidence} subtext={`${stats.totalPredictions > 0 ? Math.round((stats.highConfidence / stats.totalPredictions) * 100) : 0}%`} />
          <StatCard label="First Prediction" value={stats.firstPrediction} />
          <StatCard label="Latest" value={stats.lastPrediction} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Confidence Breakdown */}
          <div className="p-5 bg-[#080808] border border-white/5 light-glint">
            <span className="font-mono text-[9px] tracking-widest text-[#cfa86e] uppercase block mb-4">
              Confidence Breakdown
            </span>
            {stats.totalPredictions > 0 ? (
              <DonutChart
                high={stats.highConfidence}
                medium={stats.mediumConfidence}
                low={stats.lowConfidence}
              />
            ) : (
              <p className="text-xs text-white/40 italic">No predictions yet</p>
            )}
          </div>

          {/* Team Distribution */}
          <div className="p-5 bg-[#080808] border border-white/5 light-glint">
            <span className="font-mono text-[9px] tracking-widest text-[#cfa86e] uppercase block mb-4">
              Most Predicted Teams
            </span>
            {sortedTeams.length > 0 ? (
              <div className="space-y-2">
                {sortedTeams.map(([team, count]) => (
                  <TeamBar key={team} team={team} count={count} maxCount={maxTeamCount} />
                ))}
              </div>
            ) : (
              <p className="text-xs text-white/40 italic">No predictions yet</p>
            )}
          </div>
        </div>

        {/* AI Summary */}
        <div className="p-5 bg-[#080808] border border-white/5 border-l-2 border-l-[#cfa86e]/60 light-glint">
          <div className="flex justify-between items-center mb-3">
            <span className="font-mono text-[9px] tracking-widest text-[#cfa86e] uppercase">
              AI Analysis
            </span>
            <button
              onClick={generateSummary}
              disabled={isLoadingSummary || predictions.length === 0}
              className="font-mono text-[9px] text-[#cfa86e] hover:text-white transition-colors disabled:text-white/20 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoadingSummary ? "GENERATING..." : "↻ GENERATE SUMMARY"}
            </button>
          </div>
          {aiSummary ? (
            <p className="text-xs text-white/70 leading-relaxed italic font-serif">
              &ldquo;{aiSummary}&rdquo;
            </p>
          ) : (
            <p className="text-xs text-white/40">
              Click &quot;Generate Summary&quot; for an AI-powered analysis of your prediction personality.
            </p>
          )}
        </div>

        {/* Prediction Timeline */}
        <div className="p-5 bg-[#080808] border border-white/5 light-glint">
          <span className="font-mono text-[9px] tracking-widest text-[#cfa86e] uppercase block mb-4">
            Memory Timeline
          </span>
          {predictions.length > 0 ? (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-3 top-0 bottom-0 w-px bg-gradient-to-b from-[#cfa86e]/40 via-[#cfa86e]/20 to-transparent" />

              <div className="space-y-4">
                {predictions.map((p, idx) => (
                  <div key={idx} className="flex gap-4 items-start pl-1">
                    {/* Dot */}
                    <div className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center border ${
                      p.confidence === "high"
                        ? "border-[#4ade80]/30 bg-[#4ade80]/10"
                        : p.confidence === "medium"
                        ? "border-[#cfa86e]/30 bg-[#cfa86e]/10"
                        : "border-red-500/30 bg-red-500/10"
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        p.confidence === "high" ? "bg-[#4ade80]" : p.confidence === "medium" ? "bg-[#cfa86e]" : "bg-red-500"
                      }`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-serif text-sm font-bold text-white">{p.team}</span>
                        <span className="font-mono text-[8px] text-white/30 uppercase">{p.stage}</span>
                      </div>
                      {p.user_quote && (
                        <p className="text-[11px] text-white/50 italic truncate">&ldquo;{p.user_quote}&rdquo;</p>
                      )}
                      <span className="font-mono text-[8px] text-white/25 mt-1 block">{p.made_on}</span>
                    </div>

                    {/* Confidence badge */}
                    <span className={`shrink-0 font-mono text-[8px] px-1.5 py-0.5 border uppercase tracking-wider ${
                      p.confidence === "high"
                        ? "border-[#4ade80]/20 text-[#4ade80]"
                        : p.confidence === "medium"
                        ? "border-[#cfa86e]/20 text-[#cfa86e]"
                        : "border-red-500/20 text-red-400"
                    }`}>{p.confidence}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <span className="text-2xl block mb-2 opacity-40">⚽</span>
              <p className="text-xs text-white/40 italic">No predictions recorded yet. Head to the Chat or Predict tab to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
