"use client";

import { useEffect, useState, useCallback } from "react";
import styles from "@/app/page.module.css";

interface Prediction {
  type: "prediction";
  team: string;
  stage: string;
  confidence: "high" | "medium" | "low";
  made_on: string;
  user_quote: string;
}

const confidenceColors: Record<string, string> = {
  high: "#caff00",
  medium: "#ffb300",
  low: "#ff5252",
};

export default function MemoryPanel() {
  const [activeTab, setActiveTab] = useState<"ledger" | "roast">("ledger");
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoadingLedger, setIsLoadingLedger] = useState(true);
  const [roastText, setRoastText] = useState<string>("");
  const [isLoadingRoast, setIsLoadingRoast] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchPredictions = useCallback(async () => {
    try {
      const res = await fetch("/api/predictions");
      if (res.ok) {
        const data = await res.json();
        setPredictions(data.predictions || []);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error("Failed to fetch predictions", error);
    } finally {
      setIsLoadingLedger(false);
    }
  }, []);

  useEffect(() => {
    fetchPredictions();
    const interval = setInterval(fetchPredictions, 15000);
    return () => clearInterval(interval);
  }, [fetchPredictions]);

  const handleRoast = async () => {
    setIsLoadingRoast(true);
    setRoastText("");
    try {
      const res = await fetch("/api/memories?mode=roast");
      if (res.ok) {
        const data = await res.json();
        setRoastText(data.roast || "The Pundit had nothing to say. Suspicious.");
      }
    } catch {
      setRoastText("Failed to generate roast. The Pundit is temporarily speechless.");
    } finally {
      setIsLoadingRoast(false);
    }
  };

  return (
    <div className={`${styles.memoryPanel} glass-panel`}>
      {/* Header */}
      <div className={styles.memoryHeader}>
        <div className={styles.pulseIndicator}></div>
        <div>
          <h3>Walrus Memory</h3>
          {lastUpdated && (
            <p className={styles.lastUpdated}>
              Last synced {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.memoryTabs}>
        <button
          className={`${styles.memoryTab} ${activeTab === "ledger" ? styles.memoryTabActive : ""}`}
          onClick={() => setActiveTab("ledger")}
        >
          📋 Prediction Ledger
        </button>
        <button
          className={`${styles.memoryTab} ${activeTab === "roast" ? styles.memoryTabActive : ""}`}
          onClick={() => setActiveTab("roast")}
        >
          🔥 The Roast
        </button>
      </div>

      {/* Ledger Tab */}
      {activeTab === "ledger" && (
        <div className={styles.memoryList}>
          {isLoadingLedger && (
            <div className={styles.memoryEmpty}>
              <div className={styles.syncSpinner}></div>
              <p>Syncing with Walrus Mainnet...</p>
            </div>
          )}
          {!isLoadingLedger && predictions.length === 0 && (
            <div className={styles.memoryEmpty}>
              <span style={{ fontSize: "2.5rem" }}>⚽</span>
              <p>No predictions on-chain yet.</p>
              <p style={{ fontSize: "0.85rem", marginTop: "0.25rem" }}>
                Make a bold claim in chat to start your ledger.
              </p>
            </div>
          )}
          {predictions.map((p, idx) => (
            <div key={idx} className={styles.predictionCard}>
              <div className={styles.predictionCardTop}>
                <span className={styles.predictionTeam}>{p.team}</span>
                <span
                  className={styles.confidenceBadge}
                  style={{ color: confidenceColors[p.confidence] || "#fff", borderColor: confidenceColors[p.confidence] || "#fff" }}
                >
                  {p.confidence}
                </span>
              </div>
              <p className={styles.predictionStage}>{p.stage}</p>
              <blockquote className={styles.predictionQuote}>
                &ldquo;{p.user_quote}&rdquo;
              </blockquote>
              <p className={styles.predictionDate}>
                🗓 {new Date(p.made_on).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </div>
          ))}
          {predictions.length > 0 && (
            <button className={styles.refreshBtn} onClick={fetchPredictions}>
              ↻ Refresh from Walrus
            </button>
          )}
        </div>
      )}

      {/* Roast Tab */}
      {activeTab === "roast" && (
        <div className={styles.roastContainer}>
          <p className={styles.roastIntro}>
            The Pundit will forensically analyse your on-chain prediction record and pass judgement. Brace yourself.
          </p>
          <button
            className={styles.roastButton}
            onClick={handleRoast}
            disabled={isLoadingRoast}
          >
            {isLoadingRoast ? "The Pundit is loading up..." : "🔥 Roast My Record"}
          </button>
          {roastText && (
            <div className={styles.roastResult}>
              <div className={styles.roastAvatar}>The Pundit</div>
              <p>{roastText}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
