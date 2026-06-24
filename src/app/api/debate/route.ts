import { google } from "@ai-sdk/google";
import { streamText, generateText } from "ai";
import { getMemWalClient } from "@/lib/memwal";

export const maxDuration = 60;

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function POST(req: Request) {
  const userId = req.headers.get("x-user-id") || "";
  const { messages, topic }: { messages: Message[]; topic: string } = await req.json();

  const lastUserMessage = messages[messages.length - 1];
  const memwal = getMemWalClient(userId);

  // 1. RECALL: Fetch past debates and user predictions/profile for context
  let debateContext = "";
  let predictionsContext = "";

  try {
    const [debateRecall, predictionRecall, profileRecall] = await Promise.all([
      memwal.recall({ query: `debate ${topic}`, limit: 5 }),
      memwal.recall({ query: "{\"type\":\"p\"", limit: 30 }),
      memwal.recall({ query: "{\"type\":\"prof\"", limit: 5 }),
    ]);

    // Parse past debates
    if (debateRecall?.results?.length > 0) {
      const pastDebates = debateRecall.results
        .map((m: any) => {
          try {
            const parsed = JSON.parse(m.text);
            if (parsed.type === "db") {
              return `Topic: "${parsed.topic}" | User argued: "${parsed.u}" | Pundit: "${parsed.a}"`;
            }
          } catch {}
          return m.text;
        })
        .filter(Boolean);

      if (pastDebates.length > 0) {
        debateContext = pastDebates.join("\n");
      }
    }

    // Parse predictions
    if (predictionRecall?.results?.length > 0) {
      const structuredPreds = predictionRecall.results
        .map((m: any) => {
          try {
            const parsed = JSON.parse(m.text);
            if (parsed.type === "p") {
              return `Predicted ${parsed.t} for ${parsed.s} (${parsed.c} confidence)`;
            }
          } catch {}
          return null;
        })
        .filter(Boolean);

      if (structuredPreds.length > 0) {
        predictionsContext = structuredPreds.join("\n");
      }
    }
  } catch (error) {
    console.error("Failed to recall debate context:", error);
  }

  // Define system prompt that forces the AI to take the opposing side
  const systemPrompt = `You are "The Pundit" in the World Cup Debate Arena.
Your sole job is to take the OPPOSING position of whatever the user claims about the World Cup 2026 topic: "${topic}".
You are brutally opinionated, energetic, sarcastic, and highly theatrical. You MUST debate vigorously. Never agree with the user.

Here is the user's historical context from Walrus Memory:
=== PAST DEBATES ON THIS TOPIC ===
${debateContext || "No prior debate history found on this topic."}

=== USER'S PREDICTIONS ===
${predictionsContext || "No prediction record found."}

DEBATE INSTRUCTIONS:
1. Identify the user's point of view and IMMEDIATELY take the counter-position.
2. If they have argued this or related topics before, refer back to it (e.g., "Last time we debated this, you said X, now you're claiming Y?").
3. Use their predictions to call out any bias (e.g., if they support Argentina but are claiming Brazil is unbeatable, mock their inconsistency).
4. Keep your argument concise: 1-2 punchy paragraphs, rich with football terminology and banter.
5. End with a sharp, provocative rebuttal question.`;

  // 2. Stream the debate response
  const result = streamText({
    model: google("gemini-2.5-flash"),
    system: systemPrompt,
    messages: messages as any,
    onFinish: async ({ text }) => {
      // 3. REMEMBER: Store debate summary in Walrus
      try {
        const userContent = lastUserMessage.content.slice(0, 35);
        const assistantContent = text.slice(0, 40);
        const debateMemory = {
          type: "db",
          topic: topic.slice(0, 40),
          u: userContent,
          a: assistantContent,
          d: new Date().toISOString().split("T")[0],
        };
        const jsonStr = JSON.stringify(debateMemory);
        await memwal.remember(jsonStr);
        console.log("[DEBATE] Stored debate memory:", jsonStr);
      } catch (err) {
        console.error("[DEBATE] Failed to store debate memory:", err);
      }
    },
  });

  return result.toTextStreamResponse();
}
