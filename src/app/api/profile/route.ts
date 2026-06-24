import { NextResponse } from "next/server";
import { getMemWalClient } from "@/lib/memwal";

export const maxDuration = 60;

// Hardcoded "actual results" for the WC 2026 to compute accuracy dynamically
const ACTUAL_RESULTS: Record<string, string> = {
  "Tournament Winner": "Argentina",
  "Group A Winner": "Argentina",
  "Group B Winner": "Ecuador",
  "Group C Winner": "United States",
  "Group D Winner": "Brazil",
  "Group E Winner": "England",
  "Group F Winner": "France",
  "Group G Winner": "Spain",
  "Group H Winner": "Germany",
  "Group I Winner": "Netherlands",
  "Group J Winner": "Belgium",
  "Group K Winner": "Croatia",
  "Group L Winner": "Nigeria",
  "Golden Boot": "Kylian Mbappé",
  "Golden Glove": "Emiliano Martínez",
  "Dark Horse": "Morocco",
};

export async function GET(req: Request) {
  const userId = req.headers.get("x-user-id") || "";
  const memwal = getMemWalClient(userId);

  try {
    // 1. Recall profile and predictions in parallel
    const [profileRecall, predictionsRecall] = await Promise.all([
      memwal.recall({ query: "profile", limit: 20 }),
      memwal.recall({ query: "prediction", limit: 100 }),
    ]);

    // Parse user profile
    const profileResults = profileRecall?.results || [];
    let profileData = {
      team: "",
      players: "",
      joined: new Date().toISOString().split("T")[0],
    };

    // Find the latest valid profile entry
    for (const item of profileResults) {
      try {
        const parsed = JSON.parse(item.text);
        if (parsed.type === "prof") {
          profileData = {
            team: parsed.team || parsed.t || "",
            players: parsed.players || parsed.p || "",
            joined: parsed.joined || parsed.j || new Date().toISOString().split("T")[0],
          };
          break; // Since recall is sorted by relevance/recency, first one is typically the best
        }
      } catch {}
    }

    // Parse predictions
    const predictionResults = predictionsRecall?.results || [];
    const predictions = predictionResults
      .map((m: any) => {
        try {
          const parsed = JSON.parse(m.text);
          if (parsed.type === "prediction") return parsed;
          if (parsed.type === "p") {
            return {
              type: "prediction",
              team: parsed.t,
              stage: parsed.s,
              confidence: parsed.c,
              made_on: parsed.d,
              user_quote: parsed.q || "",
            };
          }
        } catch {}
        return null;
      })
      .filter(Boolean);

    // Compute accuracy score
    let correctCount = 0;
    let gradedCount = 0;

    predictions.forEach((p: any) => {
      const stage = p.stage;
      const predictedValue = p.team; // For Golden Boot, team is the player name in our PredictionPanel mapping

      if (ACTUAL_RESULTS[stage]) {
        gradedCount++;
        if (predictedValue.toLowerCase() === ACTUAL_RESULTS[stage].toLowerCase()) {
          correctCount++;
        }
      }
    });

    const accuracyScore = gradedCount > 0 ? Math.round((correctCount / gradedCount) * 100) : 100; // start at 100

    return NextResponse.json({
      profile: {
        ...profileData,
        predictionCount: predictions.length,
        accuracyScore,
      },
    });
  } catch (error) {
    console.error("Failed to fetch user profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const userId = req.headers.get("x-user-id") || "";
  const memwal = getMemWalClient(userId);

  try {
    const { team, players } = await req.json();

    const profileEntry = {
      type: "prof",
      team: String(team || "").slice(0, 30),
      players: String(players || "").slice(0, 50),
      joined: new Date().toISOString().split("T")[0],
    };

    const textToStore = JSON.stringify(profileEntry);
    const accepted = await memwal.remember(textToStore);
    console.log("[PROFILE] Updated on Walrus:", textToStore, "Job ID:", accepted.job_id);

    return NextResponse.json({ success: true, jobId: accepted.job_id });
  } catch (error) {
    console.error("Failed to store user profile:", error);
    return NextResponse.json({ error: "Storage failed" }, { status: 500 });
  }
}
