"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { getOrCreateUserId } from "@/lib/userSession";
import { DEBATE_TOPICS } from "@/lib/worldcupData";

interface DebateMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export default function DebateArena() {
  const [messages, setMessages] = useState<DebateMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [showTopics, setShowTopics] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startDebate = useCallback(async (topic: string) => {
    setSelectedTopic(topic);
    setShowTopics(false);
    setIsLoading(true);

    const userMessage: DebateMessage = {
      id: Date.now().toString(),
      role: "user",
      content: topic,
      timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
    };

    const assistantId = (Date.now() + 1).toString();
    setMessages([
      userMessage,
      { id: assistantId, role: "assistant", content: "", timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }) },
    ]);

    try {
      const response = await fetch("/api/debate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": getOrCreateUserId(),
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: topic }],
          topic,
        }),
      });

      if (!response.ok) throw new Error("Debate request failed");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("No response body");

      let fullText = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
        setMessages(prev =>
          prev.map(m => m.id === assistantId ? { ...m, content: fullText } : m)
        );
      }

      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("walrus-memory-updated"));
      }, 3000);
    } catch (error) {
      console.error("Debate error:", error);
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantId ? { ...m, content: "⚠️ The Pundit refuses to debate. Connection to Walrus lost." } : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendReply = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: DebateMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    const assistantId = (Date.now() + 1).toString();
    setMessages(prev => [
      ...prev,
      { id: assistantId, role: "assistant", content: "", timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }) },
    ]);

    try {
      const response = await fetch("/api/debate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": getOrCreateUserId(),
        },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
          topic: selectedTopic,
        }),
      });

      if (!response.ok) throw new Error("Debate request failed");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("No response body");

      let fullText = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
        setMessages(prev =>
          prev.map(m => m.id === assistantId ? { ...m, content: fullText } : m)
        );
      }

      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("walrus-memory-updated"));
      }, 3000);
    } catch (error) {
      console.error("Debate error:", error);
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantId ? { ...m, content: "⚠️ Connection lost." } : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, selectedTopic]);

  const resetDebate = () => {
    setMessages([]);
    setSelectedTopic(null);
    setShowTopics(true);
    setInput("");
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#0a0a0c]">
      {/* Header */}
      <div className="p-4 md:p-6 shrink-0 border-b border-white/5 flex items-center justify-between">
        <div>
          <span className="font-mono text-[9px] tracking-widest text-[#cfa86e] uppercase block mb-1">
            World Cup Debate Arena
          </span>
          <h2 className="font-serif text-lg font-light text-white">
            Challenge <span className="italic font-bold text-[#cfa86e]">The Pundit</span>
          </h2>
        </div>
        {selectedTopic && (
          <button
            onClick={resetDebate}
            className="px-3 py-1.5 border border-white/10 hover:border-[#cfa86e]/40 text-white/50 hover:text-[#cfa86e] font-mono text-[10px] uppercase tracking-wider transition-all"
          >
            New Debate
          </button>
        )}
      </div>

      {/* Topic Selection */}
      {showTopics && (
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto">
            <div className="p-5 bg-[#080808] border border-white/5 border-l-2 border-l-[#cfa86e]/60 mb-6 light-glint">
              <h3 className="font-serif text-base text-white mb-2">Pick a topic to debate</h3>
              <p className="text-xs text-white/50 leading-relaxed">
                The Pundit will take the opposing position and challenge your arguments.
                Past debates are stored on Walrus — the AI will reference your previous positions.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DEBATE_TOPICS.map((topic, idx) => (
                <button
                  key={idx}
                  onClick={() => startDebate(topic)}
                  className="p-4 text-left bg-[#080808] border border-white/5 hover:border-[#cfa86e]/30 hover:bg-[#0a0a0c] transition-all duration-200 group cursor-pointer"
                >
                  <span className="text-xs text-white/70 group-hover:text-white leading-relaxed block">
                    {topic}
                  </span>
                  <span className="font-mono text-[8px] text-white/20 group-hover:text-[#cfa86e]/50 mt-2 block uppercase tracking-wider">
                    ⚔️ Debate this
                  </span>
                </button>
              ))}
            </div>

            {/* Custom topic */}
            <div className="mt-6">
              <span className="font-mono text-[9px] text-white/40 uppercase tracking-widest block mb-2">Or enter a custom topic</span>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (input.trim()) startDebate(input.trim());
                }}
                className="flex gap-3"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your debate topic..."
                  className="flex-1 px-4 py-3 bg-[#080808] border border-white/10 focus:border-[#cfa86e]/60 text-white text-xs outline-none rounded-none placeholder-white/20"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="px-5 bg-[#cfa86e] text-[#050505] font-mono text-xs uppercase tracking-widest font-bold disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                >
                  Start
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Debate Thread */}
      {!showTopics && (
        <>
          {/* Topic banner */}
          {selectedTopic && (
            <div className="px-6 py-2.5 bg-[#080808]/50 border-b border-white/5 font-mono text-[9px] text-white/30 tracking-widest uppercase flex items-center gap-2">
              <span className="text-[#cfa86e]">TOPIC:</span>
              <span className="truncate">{selectedTopic}</span>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
              >
                <div className="flex items-center gap-2 font-mono text-[8px] text-white/30 mb-1 px-1">
                  <span className={m.role === "user" ? "text-white/40" : "text-[#cfa86e]/60"}>
                    {m.role === "user" ? "YOU" : "THE PUNDIT"}
                  </span>
                  <span>•</span>
                  <span>{m.timestamp}</span>
                </div>
                <div
                  className={`max-w-[85%] px-4 py-3 border text-xs leading-relaxed ${
                    m.role === "user"
                      ? "bg-[#080808] border-white/10 text-white border-r-2 border-r-[#cfa86e]/40"
                      : "bg-white/[0.01] border-white/5 text-white/80 italic border-l border-l-[#cfa86e]/30"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {isLoading && messages[messages.length - 1]?.content === "" && (
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-2 font-mono text-[8px] text-[#cfa86e]/40 mb-1 px-1">
                  <span>THE PUNDIT</span>
                  <span>•</span>
                  <span className="animate-pulse">FORMULATING COUNTERARGUMENT</span>
                </div>
                <div className="max-w-[85%] px-4 py-3 bg-white/[0.01] border border-white/5 border-l border-l-[#cfa86e]/30 text-xs text-white/40 italic">
                  Analyzing your position and consulting the memory ledger...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Reply input */}
          <form onSubmit={sendReply} className="p-4 bg-[#080808] border-t border-white/10 flex gap-3">
            <input
              className="flex-1 px-4 py-3 bg-[#0a0a0c] border border-white/10 focus:border-[#cfa86e]/60 text-white text-xs placeholder-white/20 outline-none rounded-none"
              value={input}
              placeholder="Counter The Pundit's argument..."
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
            <button
              className="px-6 bg-[#cfa86e] text-[#050505] font-mono text-xs uppercase tracking-widest font-bold disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
              type="submit"
              disabled={isLoading || !input.trim()}
            >
              Reply
            </button>
          </form>
        </>
      )}
    </div>
  );
}
