import { NextResponse } from "next/server";
import { getMemWalClient } from "@/lib/memwal";

export const maxDuration = 60;

export async function GET(req: Request) {
  const userId = req.headers.get("x-user-id") || "";
  const memwal = getMemWalClient(userId);

  try {
    const recallResult = await memwal.recall({
      query: "prediction",
      limit: 100,
    });

    const allResults = recallResult?.results || [];
    console.log(`[PREDICTIONS] Walrus recalled ${allResults.length} raw results for userId="${userId ? userId.slice(-8) : 'none'}"`)

    // Parse structured prediction entries
    const predictions = allResults
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
              user_quote: parsed.q
            };
          }
          // Log non-prediction JSON for debugging
          console.log("[PREDICTIONS] Skipping non-prediction entry, type:", parsed.type || "unknown");
        } catch {
          // Log raw text to help debug
          const preview = String(m.text || "").slice(0, 80);
          console.log("[PREDICTIONS] Skipping non-JSON entry:", preview);
        }
        return null;
      })
      .filter(Boolean)
      .sort((a: any, b: any) =>
        new Date(b.made_on).getTime() - new Date(a.made_on).getTime()
      );

    console.log(`[PREDICTIONS] Returning ${predictions.length} structured predictions`);
    return NextResponse.json({ predictions });
  } catch (error) {
    console.error("Failed to fetch predictions:", error);
    return NextResponse.json({ predictions: [] }, { status: 500 });
  }
}
