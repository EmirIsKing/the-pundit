import { google } from "@ai-sdk/google";
import { generateText, streamText } from "ai";
import { getMemWalClient } from "@/lib/memwal";

export const maxDuration = 60;

interface CustomMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function POST(req: Request) {
  const userId = req.headers.get("x-user-id") || "";
  const { messages, agentId, customSystemPrompt }: { messages: CustomMessage[], agentId?: string, customSystemPrompt?: string } = await req.json();

  const lastUserMessage = messages[messages.length - 1];
  const memwal = getMemWalClient(userId);

  // 1. RECALL: Fetch relevant memories to build context
  let contextText = "";
  let predictionsContext = "";
  try {
    const [interactionRecall, predictionRecall] = await Promise.all([
      memwal.recall({ query: lastUserMessage.content, limit: 10 }),
      memwal.recall({ query: "prediction", limit: 50 }),
    ]);

    if (interactionRecall?.results?.length > 0) {
      contextText = interactionRecall.results.map((m: any) => m.text).join("\n");
    }

    // Extract structured predictions from recall results
    const allResults = predictionRecall?.results || [];
    const structuredPreds = allResults
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
        } catch {}
        return null;
      })
      .filter(Boolean);

    if (structuredPreds.length > 0) {
      predictionsContext = structuredPreds
        .map(
          (p: any) =>
            `• ${p.made_on}: Predicted "${p.team}" to win "${p.stage}" (confidence: ${p.confidence})`
        )
        .join("\n");
    }
  } catch (error) {
    console.error("Failed to recall memories:", error);
  }

  let systemPromptBase = `You are "The Pundit," a supremely opinionated, dramatic, and knowledgeable AI football (soccer) analyst covering the FIFA World Cup 2026.
You are engaging, sarcastic, passionate — never neutral. You live for the drama of football.`;

  if (agentId === "scout") {
    systemPromptBase = `You are "Tactical Scout," a highly analytical, objective, and data-driven football scout. You analyze team formations (e.g. 4-3-3, 3-5-2), player roles, tactical strengths, and weakness vectors for the FIFA World Cup 2026.
You speak in a cold, professional, highly technical scout tone.`;
  } else if (agentId === "sentiment") {
    systemPromptBase = `You are "Sentiment Bot," an AI that tracks fan emotions, crowd atmosphere, social media hype, and prediction confidence waves for the FIFA World Cup 2026.
You speak in a highly energetic, trending, internet-slang-aware tone (e.g. using terms like Hype, Vibe, Overrated, Underrated).`;
  } else if (customSystemPrompt) {
    systemPromptBase = customSystemPrompt;
  }

  const systemPrompt = `${systemPromptBase}

You have a persistent, on-chain memory of this user's past predictions, stored on the Walrus decentralised network.

=== USER'S TRACKED PREDICTIONS (from Walrus Memory) ===
${predictionsContext || "No structured predictions recorded yet."}

=== RECENT INTERACTION CONTEXT (from Walrus Memory) ===
${contextText || "No prior interactions found."}

=== YOUR INSTRUCTIONS ===
1. You MUST reference the user's past predictions when relevant. If they contradict themselves, call it out.
2. If they have a prediction track record, use it (e.g., "You predicted Brazil last time, and now you want Argentina?").
3. Extract and acknowledge any NEW predictions they make in this message.
4. Keep responses concise: 1-3 punchy paragraphs.
5. End with a provocative question or challenge to keep them engaged.`;

  // 2. STREAM the response
  const result = streamText({
    model: google("gemini-2.5-flash"),
    system: systemPrompt,
    messages: messages as any,
    onFinish: async ({ text }) => {
      // 3. REMEMBER: Store raw interaction (truncated to fit under 128-byte limit to prevent relayer WAL exhaustion)
      try {
        const userContent = lastUserMessage.content.slice(0, 35);
        const punditContent = text.slice(0, 40);
        const interactionMemory = `[${new Date().toISOString().split("T")[0]}] U: "${userContent}" | P: "${punditContent}"`;
        await memwal.remember(interactionMemory);
        console.log("Interaction memory stored.");
      } catch (err) {
        console.error("Failed to store interaction memory:", err);
      }

      // 4. EXTRACT & STORE structured predictions
      try {
        const extraction = await generateText({
          model: google("gemini-2.5-flash"),
          prompt: `Analyse this football conversation message and extract any explicit predictions the user is making about the FIFA World Cup 2026.

User message: "${lastUserMessage.content}"

If the user made a clear prediction, respond with ONLY a valid JSON object in this exact format:
{
  "type": "prediction",
  "team": "<team name or 'Unknown'>",
  "stage": "<e.g. 'Winner', 'Semi-Finals', 'Group Stage exit'>",
  "confidence": "<'high', 'medium', or 'low'>",
  "made_on": "${new Date().toISOString().split("T")[0]}",
  "user_quote": "<exact short quote from user>"
}

If no clear prediction was made, respond with exactly: NO_PREDICTION`,
        });

        let extractedText = extraction.text.trim();
        console.log("[EXTRACTION] Gemini raw response:", extractedText);

        // Strip markdown code fences if present
        if (extractedText.startsWith("```")) {
          extractedText = extractedText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
          console.log("[EXTRACTION] After stripping markdown:", extractedText);
        }

        if (extractedText === "NO_PREDICTION") {
          console.log("[EXTRACTION] No prediction found in message.");
        } else {
          try {
            const parsed = JSON.parse(extractedText);
            if (parsed && parsed.type === "prediction") {
              // Map to compressed schema to save storage cost and WAL
              const compressed = {
                type: "p",
                t: (parsed.team || "Unknown").slice(0, 20),
                s: (parsed.stage || "Winner").slice(0, 20),
                c: parsed.confidence || "medium",
                d: parsed.made_on || new Date().toISOString().split("T")[0],
                q: (parsed.user_quote || "").slice(0, 30) // Truncate quote to keep size under 128
              };
              const jsonStr = JSON.stringify(compressed);
              await memwal.remember(jsonStr);
              console.log("[EXTRACTION] ✅ Structured prediction stored (compressed):", jsonStr);
            } else {
              console.warn("[EXTRACTION] JSON parsed but not a prediction type:", parsed);
            }
          } catch (parseErr) {
            console.error("[EXTRACTION] JSON parse failed. Raw text was:", JSON.stringify(extractedText));
            console.error("[EXTRACTION] Parse error:", parseErr);
          }
        }
      } catch (err) {
        console.error("[EXTRACTION] Gemini call failed:", err);
      }
    },
  });

  return result.toTextStreamResponse();
}
