"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import styles from "@/app/page.module.css";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    // Create a placeholder for the assistant response
    const assistantId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: assistantId, role: "assistant", content: "" }]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) throw new Error("Chat request failed");

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
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantId
            ? { ...m, content: "⚠️ Something went wrong. Please try again." }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages]);

  return (
    <div className={`${styles.chatBox} glass-panel`}>
      <div className={styles.chatMessages}>
        {messages.length === 0 && (
          <div className={`${styles.message} ${styles.agentMessage}`}>
            <strong>The Pundit:</strong> Welcome. I&apos;m The Pundit. Let&apos;s talk World Cup 2026. Who do you think is taking the trophy home? Be prepared to defend your answer.
          </div>
        )}

        {messages.map((m) => (
          <div
            key={m.id}
            className={`${styles.message} ${m.role === "user" ? styles.userMessage : styles.agentMessage}`}
          >
            <strong>{m.role === "user" ? "You" : "The Pundit"}:</strong>{" "}
            {m.content}
          </div>
        ))}
        {isLoading && messages[messages.length - 1]?.content === "" && (
          <div className={`${styles.message} ${styles.agentMessage}`}>
            <em>The Pundit is thinking (and probably judging you)...</em>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className={styles.inputArea}>
        <input
          className={styles.inputField}
          value={input}
          placeholder="Predict the winner, critique a player, make a bold claim..."
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
        />
        <button
          className={styles.sendButton}
          type="submit"
          disabled={isLoading || !input.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
}
