"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { getOrCreateUserId } from "@/lib/userSession";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [recallLatency, setRecallLatency] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    // Create a placeholder for the assistant response
    const assistantId = (Date.now() + 1).toString();
    setMessages(prev => [
      ...prev,
      {
        id: assistantId,
        role: "assistant",
        content: "",
        timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
      },
    ]);

    const startTime = performance.now();

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": getOrCreateUserId(),
        },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) throw new Error("Chat request failed");

      // Record latency for telemetry
      setRecallLatency(Math.round(performance.now() - startTime));

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error("No response body");

      let fullText = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;

        // Update the assistant message in place with streamed text
        setMessages(prev =>
          prev.map(m => m.id === assistantId ? { ...m, content: fullText } : m)
        );
      }

      // Dispatch event after 3 seconds to let backend complete extraction & write to Walrus
      setTimeout(() => {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("walrus-memory-updated"));
        }
      }, 3000);

    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantId
            ? {
                ...m,
                content: "⚠️ Sync connection lost. Unable to retrieve prompt parameters from Walrus memory matrix.",
              }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#0a0a0c]">
      {/* Telemetry sub-header */}
      <div className="h-10 border-b border-white/5 px-6 flex items-center justify-between bg-[#080808]/50 font-mono text-[9px] text-white/30 uppercase tracking-widest">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#cfa86e] animate-pulse"></span>
          <span>ORACLE PORT: CONSOLE_INPUT</span>
        </div>
        <div className="flex gap-4">
          <span>LATENCY: {recallLatency ? `${recallLatency}ms` : "SYNCED"}</span>
          <span>EMBEDDINGS: COHERENT</span>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
        {messages.length === 0 && (
          <div className="p-6 bg-[#080808] border border-white/5 border-l-2 border-l-[#cfa86e] light-glint">
            <span className="font-mono text-[9px] tracking-widest text-[#cfa86e] uppercase block mb-1">
              [ Agent Greeting ]
            </span>
            <h3 className="font-serif text-lg text-white mb-2 font-normal">
              Welcome. I am <span className="italic font-bold text-[#cfa86e]">The Pundit</span>.
            </h3>
            <p className="text-xs text-white/60 leading-relaxed font-sans">
              I track your FIFA World Cup 2026 predictions directly on the Walrus decentralized network. 
              State your predicted winners, critique squads, or make bold predictions. I will remember them—and I will hold you to them.
            </p>
          </div>
        )}

        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${
              m.role === "user" ? "items-end" : "items-start"
            }`}
          >
            {/* Meta row */}
            <div className="flex items-center gap-2 font-mono text-[8px] text-white/30 mb-1 px-1">
              <span className={m.role === "user" ? "text-white/40" : "text-[#cfa86e]/60"}>
                {m.role === "user" ? "USER_ID" : "PUNDIT_AI"}
              </span>
              <span>•</span>
              <span>{m.timestamp}</span>
            </div>

            {/* Message bubble */}
            <div
              className={`max-w-[85%] px-4 py-3 border text-xs leading-relaxed font-sans ${
                m.role === "user"
                  ? "bg-[#080808] border-white/10 text-white rounded-none border-r-[#cfa86e]/40 border-r-2"
                  : "bg-white/[0.01] border-white/5 text-white/80 rounded-none italic border-l-[#cfa86e]/30 border-l"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}

        {isLoading && messages[messages.length - 1]?.content === "" && (
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-2 font-mono text-[8px] text-[#cfa86e]/40 mb-1 px-1">
              <span>PUNDIT_AI</span>
              <span>•</span>
              <span className="animate-pulse">THINKING</span>
            </div>
            <div className="max-w-[85%] px-4 py-3 bg-white/[0.01] border border-white/5 border-l-[#cfa86e]/30 border-l rounded-none text-xs text-white/40 italic">
              Analyzing predictions ledger & formulating rebuttal...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-4 bg-[#080808] border-t border-white/10 flex gap-3">
        <input
          className="flex-1 px-4 py-3 bg-[#0a0a0c] border border-white/10 focus:border-[#cfa86e]/60 focus:bg-[#050505] text-white text-xs font-sans placeholder-white/20 transition-all duration-200 outline-none rounded-none"
          value={input}
          placeholder="Predict the World Cup winner, roast a team, or assert an opinion..."
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
        />
        <button
          className="px-6 bg-[#cfa86e] text-[#050505] hover:bg-[#cfa86e]/95 transition-all duration-200 font-mono text-xs uppercase tracking-widest font-bold disabled:opacity-30 disabled:hover:bg-[#cfa86e] cursor-pointer disabled:cursor-not-allowed rounded-none"
          type="submit"
          disabled={isLoading || !input.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
}
