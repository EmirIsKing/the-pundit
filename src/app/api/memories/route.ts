import { NextResponse } from "next/server";
import { getMemWalClient } from "@/lib/memwal";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("mode");

  const memwal = getMemWalClient();

  // Roast mode: generate a Pundit roast of the user's prediction record
  if (mode === "roast") {
    try {
      const recallResult = await memwal.recall({
        query: "prediction World Cup 2026 winner team stage",
      });

      const allMemories = recallResult?.results || [];
      const predictions = allMemories
        .map((m: any) => {
          try {
            const parsed = JSON.parse(m.text);
            if (parsed.type === "prediction") return parsed;
          } catch {}
          return null;
        })
        .filter(Boolean);

      if (predictions.length === 0) {
        return NextResponse.json({
          roast: "You haven't made any predictions yet. Come back when you're brave enough to put your football opinions on record.",
        });
      }

      const predSummary = predictions
        .map(
          (p: any) =>
            `- On ${p.made_on}: predicted "${p.team}" for "${p.stage}" (${p.confidence} confidence). Quote: "${p.user_quote}"`
        )
        .join("\n");

      const roastResult = await generateText({
        model: google("gemini-2.5-flash"),
        prompt: `You are "The Pundit," a brutally honest, funny, and dramatic football analyst. Based on this user's World Cup 2026 prediction history stored on the Walrus blockchain, write a SHORT (3-4 sentences) roast of their prediction record. Be savage but fun. Reference the specific predictions.

User's prediction record:
${predSummary}

Write the roast now (do not use quotation marks around it, write it as direct speech):`,
      });

      return NextResponse.json({ roast: roastResult.text });
    } catch (error) {
      console.error("Roast generation failed:", error);
      return NextResponse.json(
        { error: "Failed to generate roast" },
        { status: 500 }
      );
    }
  }

  // Default mode: return raw memories
  try {
    const query = searchParams.get("q") || "World Cup prediction";
    const recallResult = await memwal.recall({ query });
    return NextResponse.json({ memories: recallResult?.results || [] });
  } catch (error) {
    console.error("Failed to fetch memories:", error);
    return NextResponse.json({ memories: [] }, { status: 500 });
  }
}
