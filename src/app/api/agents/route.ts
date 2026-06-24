import { NextResponse } from "next/server";
import { getMemWalClient } from "@/lib/memwal";

export const maxDuration = 60;

export async function GET(req: Request) {
  const userId = req.headers.get("x-user-id") || "";
  const memwal = getMemWalClient(userId);

  try {
    const recallResult = await memwal.recall({
      query: "agent",
      limit: 50,
    });

    const allResults = recallResult?.results || [];
    console.log(`[AGENTS] Recalled ${allResults.length} raw results`);

    const customAgents = allResults
      .map((m: any) => {
        try {
          const parsed = JSON.parse(m.text);
          if (parsed.type === "a") {
            return {
              id: parsed.n ? parsed.n.toLowerCase().replace(/\s+/g, "-") : "custom-agent",
              name: parsed.n || "Custom Agent",
              description: parsed.d || "",
              role: "CUSTOM",
              systemPrompt: parsed.s || ""
            };
          }
        } catch {}
        return null;
      })
      .filter(Boolean);

    return NextResponse.json({ agents: customAgents });
  } catch (error) {
    console.error("Failed to fetch custom agents:", error);
    return NextResponse.json({ agents: [] }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const userId = req.headers.get("x-user-id") || "";
  const memwal = getMemWalClient(userId);

  try {
    const { name, description, systemPrompt } = await req.json();

    if (!name || !systemPrompt) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const compressed = {
      type: "a",
      n: String(name).slice(0, 15),
      d: String(description || "").slice(0, 30),
      s: String(systemPrompt).slice(0, 50)
    };

    const textToStore = JSON.stringify(compressed);
    const accepted = await memwal.remember(textToStore);
    console.log("[AGENTS] Created on Walrus:", textToStore, "Job ID:", accepted.job_id);

    return NextResponse.json({ success: true, jobId: accepted.job_id });
  } catch (error) {
    console.error("Failed to store custom agent:", error);
    return NextResponse.json({ error: "Storage failed" }, { status: 500 });
  }
}
