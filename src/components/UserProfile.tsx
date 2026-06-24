"use client";

import { useState, useEffect, useCallback } from "react";
import { getOrCreateUserId } from "@/lib/userSession";
import { WC_TEAMS, NOTABLE_PLAYERS } from "@/lib/worldcupData";

interface ProfileData {
  team: string;
  players: string;
  joined: string;
  predictionCount?: number;
  accuracyScore?: number;
}

export default function UserProfile() {
  const [profile, setProfile] = useState<ProfileData>({
    team: "",
    players: "",
    joined: "",
  });
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState<string>("");

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/profile", {
        headers: { "x-user-id": getOrCreateUserId() },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          setProfile(data.profile);
          if (data.profile.players) {
            setSelectedPlayers(data.profile.players.split(",").filter(Boolean));
          }
        }
      }
    } catch (e) {
      console.error("Failed to load profile", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setUserId(getOrCreateUserId());
    fetchProfile();
    const handler = () => fetchProfile();
    window.addEventListener("walrus-memory-updated", handler);
    return () => window.removeEventListener("walrus-memory-updated", handler);
  }, [fetchProfile]);

  const handleSave = async () => {
    setIsSaving(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": getOrCreateUserId(),
        },
        body: JSON.stringify({
          team: profile.team,
          players: selectedPlayers.join(","),
        }),
      });

      if (!res.ok) throw new Error("Failed to save profile");

      setSuccess(true);
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("walrus-memory-updated"));
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePlayerToggle = (playerName: string) => {
    if (selectedPlayers.includes(playerName)) {
      setSelectedPlayers(selectedPlayers.filter(p => p !== playerName));
    } else {
      if (selectedPlayers.length >= 3) {
        setError("You can choose up to 3 favorite players");
        return;
      }
      setSelectedPlayers([...selectedPlayers, playerName]);
    }
    setError("");
  };

  // Compute pundit grade based on accuracy and prediction count
  const getPunditGrade = (count: number = 0, score: number = 100) => {
    if (count === 0) return { title: "Rookie Bystander", color: "text-white/40", desc: "Make some predictions to earn your rank." };
    if (score >= 90) return { title: "Time Traveler", color: "text-[#4ade80]", desc: "Supernatural prediction accuracy. You know the future." };
    if (score >= 70) return { title: "Football Pundit", color: "text-[#cfa86e]", desc: "Highly analytical. You understand the tactical nuances." };
    if (score >= 50) return { title: "Tactician", color: "text-[#cfa86e]/80", desc: "A respectable track record, but room to grow." };
    return { title: "Casual Bystander", color: "text-red-400", desc: "The Pundit is roasitng you for a reason." };
  };

  const grade = getPunditGrade(profile.predictionCount, profile.accuracyScore);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0a0a0c]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#cfa86e]/20 border-t-[#cfa86e] rounded-full animate-spin mx-auto mb-4" />
          <p className="font-mono text-[10px] text-white/40 uppercase tracking-widest font-semibold">Retrieving profile...</p>
        </div>
      </div>
    );
  }

  const selectedTeamData = WC_TEAMS.find(t => t.name === profile.team);

  return (
    <div className="flex-1 overflow-y-auto bg-[#0a0a0c]">
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <span className="font-mono text-[9px] tracking-widest text-[#cfa86e] uppercase block mb-1">
            User Persona Configuration
          </span>
          <h2 className="font-serif text-lg font-light text-white">
            Pundit <span className="italic font-bold text-[#cfa86e]">Identity Card</span>
          </h2>
        </div>

        {/* Profile Card Summary */}
        <div className="p-5 bg-[#080808] border border-white/5 border-l-2 border-l-[#cfa86e]/60 light-glint grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#8a6d3b] via-[#cfa86e] to-[#fff] flex items-center justify-center border border-[#cfa86e]/40 shadow-[0_0_12px_rgba(207,168,110,0.2)]">
                <span className="font-serif text-black font-black text-lg">
                  {profile.team ? selectedTeamData?.flag || "⚽" : "⚽"}
                </span>
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-white leading-tight">
                  {profile.team || "Anonymous Supporter"}
                </h3>
                <span className="font-mono text-[9px] text-white/30 uppercase">
                  ID: {userId ? userId.slice(-12) : "..."}
                </span>
              </div>
            </div>
            <div className="mt-4 space-y-1">
              <span className="font-mono text-[8px] tracking-wider text-white/40 uppercase block">Joined Network</span>
              <span className="font-mono text-xs text-white/80">{profile.joined}</span>
            </div>
          </div>

          <div className="flex flex-col justify-between border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-6">
            <div>
              <span className="font-mono text-[8px] tracking-wider text-[#cfa86e] uppercase block mb-1">Pundit Rank</span>
              <div className={`font-serif text-base font-bold ${grade.color} leading-snug`}>{grade.title}</div>
              <p className="text-[10px] text-white/50 leading-relaxed mt-1">{grade.desc}</p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="p-2 bg-[#050505] border border-white/5">
                <span className="font-mono text-[8px] text-white/30 uppercase block">Predictions</span>
                <span className="font-mono text-sm text-white font-bold">{profile.predictionCount || 0}</span>
              </div>
              <div className="p-2 bg-[#050505] border border-white/5">
                <span className="font-mono text-[8px] text-white/30 uppercase block">Accuracy</span>
                <span className="font-mono text-sm text-[#cfa86e] font-bold">{profile.accuracyScore || 0}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Configuration Section */}
        <div className="p-6 bg-[#080808] border border-white/5 space-y-6">
          {/* Favorite Team */}
          <div>
            <label className="block font-mono text-[10px] text-white/60 uppercase tracking-widest mb-2">
              Favorite National Team
            </label>
            <select
              value={profile.team}
              onChange={(e) => setProfile({ ...profile, team: e.target.value })}
              className="w-full px-4 py-3 bg-[#050505] border border-white/10 focus:border-[#cfa86e]/60 text-white text-sm outline-none rounded-none appearance-none cursor-pointer"
            >
              <option value="">Select Team...</option>
              {WC_TEAMS.map((t) => (
                <option key={t.code} value={t.name}>
                  {t.flag} {t.name} ({t.confederation})
                </option>
              ))}
            </select>
            <p className="text-[9px] text-white/30 font-mono mt-1">
              Used by AI agents to customize responses and detect bias in arguments.
            </p>
          </div>

          {/* Favorite Players */}
          <div>
            <label className="block font-mono text-[10px] text-white/60 uppercase tracking-widest mb-2">
              Favorite Players (Select up to 3)
            </label>
            <div className="max-h-48 overflow-y-auto border border-white/10 bg-[#050505] p-3 grid grid-cols-1 sm:grid-cols-2 gap-2 scrollbar-thin">
              {NOTABLE_PLAYERS.map((p) => {
                const isSelected = selectedPlayers.includes(p.name);
                return (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => handlePlayerToggle(p.name)}
                    className={`flex items-center justify-between p-2 border text-left text-xs transition-all ${
                      isSelected
                        ? "border-[#cfa86e] bg-[#cfa86e]/5 text-[#cfa86e]"
                        : "border-white/5 text-white/60 hover:border-white/15"
                    }`}
                  >
                    <div>
                      <div className="font-bold">{p.name}</div>
                      <div className="text-[9px] text-white/30 font-mono">{p.team} — {p.position}</div>
                    </div>
                    {isSelected && <span className="text-xs">✓</span>}
                  </button>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {selectedPlayers.map(pName => (
                <span key={pName} className="font-mono text-[9px] px-2 py-1 bg-[#cfa86e]/10 border border-[#cfa86e]/20 text-[#cfa86e]">
                  {pName}
                </span>
              ))}
              {selectedPlayers.length === 0 && (
                <span className="text-[10px] text-white/30 italic">No players selected</span>
              )}
            </div>
          </div>

          {/* Save Status Alert */}
          {error && (
            <div className="p-3 border border-red-500/20 bg-red-500/5 text-red-400 text-xs font-mono">
              ⚠️ {error}
            </div>
          )}
          {success && (
            <div className="p-3 border border-[#4ade80]/20 bg-[#4ade80]/5 text-[#4ade80] text-xs font-mono">
              ✓ Persona successfully updated in Walrus decentralized memory!
            </div>
          )}

          {/* Action button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full py-3 bg-[#cfa86e] text-black font-mono text-xs uppercase tracking-widest font-bold hover:bg-[#cfa86e]/95 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition-all duration-200"
          >
            {isSaving ? "Synchronizing with Walrus..." : "✓ Update Persona Ledger"}
          </button>
        </div>
      </div>
    </div>
  );
}
