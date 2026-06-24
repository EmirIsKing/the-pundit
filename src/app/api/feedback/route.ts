import { NextResponse } from "next/server";
import { getMemWalClient } from "@/lib/memwal";

export const maxDuration = 60;

export async function GET(req: Request) {
  const userId = req.headers.get("x-user-id") || "";
  const memwal = getMemWalClient(userId);

  try {
    const recallResult = await memwal.recall({
      query: "feedback",
      limit: 100,
    });

    const allResults = recallResult?.results || [];
    console.log(`[FEEDBACK] Recalled ${allResults.length} raw results`);

    const feedbackList = allResults
      .map((m: any) => {
        try {
          const parsed = JSON.parse(m.text);
          if (parsed.type === "f") {
            return {
              type: "feedback",
              subject: parsed.s || "General",
              rating: parsed.r || 5,
              body: parsed.b || "",
              user: parsed.u || "Anonymous"
            };
          }
        } catch {}
        return null;
      })
      .filter(Boolean);

    return NextResponse.json({ feedback: feedbackList });
  } catch (error) {
    console.error("Failed to fetch feedback:", error);
    return NextResponse.json({ feedback: [] }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const userId = req.headers.get("x-user-id") || "";
  const memwal = getMemWalClient(userId);

  try {
    const { subject, rating, body, handle } = await req.json();

    if (!subject || !rating || !body) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const compressed = {
      type: "f",
      s: String(subject).slice(0, 20),
      r: Number(rating),
      b: String(body).slice(0, 45),
      u: String(handle || "Anonymous").slice(0, 15)
    };

    const textToStore = JSON.stringify(compressed);
    const accepted = await memwal.remember(textToStore);
    console.log("[FEEDBACK] Submitted on Walrus:", textToStore, "Job ID:", accepted.job_id);

    return NextResponse.json({ success: true, jobId: accepted.job_id });
  } catch (error) {
    console.error("Failed to store feedback:", error);
    return NextResponse.json({ error: "Storage failed" }, { status: 500 });
  }
}
