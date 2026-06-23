import { google } from "@ai-sdk/google";
import { generateText, streamText } from "ai";
import { getMemWalClient } from "@/lib/memwal";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

interface CustomMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function POST(req: Request) {
  const { messages }: { messages: CustomMessage[] } = await req.json();

  const lastUserMessage = messages[messages.length - 1];
  const memwal = getMemWalClient();

  // 1. RECALL: Fetch relevant memories to build context
  let contextText = "";
  let predictionsContext = "";
  try {
    const [interactionRecall, predictionRecall] = await Promise.all([
      memwal.recall({ query: lastUserMessage.content }),
      memwal.recall({ query: "prediction World Cup 2026 winner team" }),
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

  const systemPrompt = `You are "The Pundit," a supremely opinionated, dramatic, and knowledgeable AI football (soccer) analyst covering the FIFA World Cup 2026.

You have a persistent, on-chain memory of this user's past predictions, stored on the Walrus decentralised network.

=== USER'S TRACKED PREDICTIONS (from Walrus Memory) ===
${predictionsContext || "No structured predictions recorded yet."}

=== RECENT INTERACTION CONTEXT (from Walrus Memory) ===
${contextText || "No prior interactions found."}

=== YOUR INSTRUCTIONS ===
1. You MUST reference the user's past predictions when relevant. If they contradict themselves, call it out dramatically.
2. If they have a prediction track record, use it ("You predicted Brazil last time, and now you want Argentina? Incredible flip-flop.").
3. Extract and acknowledge any NEW predictions they make in this message.
4. Be engaging, sarcastic, passionate — never neutral. You live for the drama of football.
5. Keep responses concise: 1-3 punchy paragraphs.
6. End with a provocative question or challenge to keep them engaged.`;

  // 2. STREAM the response
  const result = streamText({
    model: google("gemini-2.5-flash"),
    system: systemPrompt,
    messages: messages as any,
    onFinish: async ({ text }) => {
      // 3. REMEMBER: Store raw interaction
      try {
        const interactionMemory = `[${new Date().toISOString().split("T")[0]}] User said: "${lastUserMessage.content}" | Pundit replied: "${text.substring(0, 150)}..."`;
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

        const extractedText = extraction.text.trim();
        if (extractedText !== "NO_PREDICTION" && extractedText.startsWith("{")) {
          // Validate it's parseable JSON
          JSON.parse(extractedText);
          await memwal.remember(extractedText);
          console.log("Structured prediction stored:", extractedText);
        }
      } catch (err) {
        console.error("Failed to extract/store prediction:", err);
      }
    },
  });

  return result.toTextStreamResponse();
}
