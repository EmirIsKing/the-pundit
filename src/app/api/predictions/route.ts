import { NextResponse } from "next/server";
import { getMemWalClient } from "@/lib/memwal";

export async function GET(req: Request) {
  const userId = req.headers.get("x-user-id") || "";
  const memwal = getMemWalClient(userId);

  try {
    const recallResult = await memwal.recall({
      query: "prediction",
      limit: 100,
    });

    const allResults = recallResult?.results || [];

    // Parse structured prediction entries
    const predictions = allResults
      .map((m: any) => {
        try {
          const parsed = JSON.parse(m.text);
          if (parsed.type === "prediction") return parsed;
        } catch {}
        return null;
      })
      .filter(Boolean)
      // Sort newest first
      .sort((a: any, b: any) =>
        new Date(b.made_on).getTime() - new Date(a.made_on).getTime()
      );

    return NextResponse.json({ predictions });
  } catch (error) {
    console.error("Failed to fetch predictions:", error);
    return NextResponse.json({ predictions: [] }, { status: 500 });
  }
}
