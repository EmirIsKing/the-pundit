"use client";

import { useState } from "react";
import { getOrCreateUserId } from "@/lib/userSession";

interface FeedbackModalProps {
  onClose: () => void;
}

export default function FeedbackModal({ onClose }: FeedbackModalProps) {
  const [subject, setSubject] = useState("");
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  const [handle, setHandle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !body) {
      setError("Subject and body are required.");
      return;
    }
    
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": getOrCreateUserId(),
        },
        body: JSON.stringify({ subject, rating, body, handle }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit feedback");
      }
      
      setSuccess(true);
      setTimeout(onClose, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to submit feedback");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-md bg-[#080808] border border-white/10 shadow-[0_0_40px_rgba(207,168,110,0.1)] p-6">
        <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
          <div>
            <h2 className="font-serif text-xl text-white">Community Feedback</h2>
            <p className="font-mono text-[9px] text-white/40 tracking-widest mt-1">
              STORED ON WALRUS MEMORY
            </p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            ✕
          </button>
        </div>

        {success ? (
          <div className="py-8 text-center border border-emerald-500/20 bg-emerald-500/5">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#4ade80]/10 flex items-center justify-center border border-[#4ade80]/30">
              <span className="text-[#4ade80] text-xl">✓</span>
            </div>
            <h3 className="font-serif text-lg text-white mb-1">Feedback Submitted</h3>
            <p className="text-xs text-white/60 font-sans">Stored on Walrus Network</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="text-red-400 text-xs font-mono">{error}</div>}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-[10px] text-white/60 uppercase tracking-widest mb-1.5">
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0a0a0c] border border-white/10 focus:border-[#cfa86e]/60 focus:bg-[#050505] text-white text-sm font-sans placeholder-white/20 transition-all duration-200 outline-none rounded-none"
                  placeholder="UI, Agent, bug..."
                  maxLength={20}
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] text-white/60 uppercase tracking-widest mb-1.5">
                  Rating (1-5)
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={rating}
                  onChange={(e) => setRating(parseInt(e.target.value))}
                  className="w-full px-4 py-2.5 bg-[#0a0a0c] border border-white/10 focus:border-[#cfa86e]/60 focus:bg-[#050505] text-white text-sm font-sans placeholder-white/20 transition-all duration-200 outline-none rounded-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-[10px] text-white/60 uppercase tracking-widest mb-1.5">
                Feedback Body
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#0a0a0c] border border-white/10 focus:border-[#cfa86e]/60 focus:bg-[#050505] text-white text-sm font-sans placeholder-white/20 transition-all duration-200 outline-none rounded-none h-20 resize-none"
                placeholder="What's on your mind?"
                maxLength={45}
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] text-white/60 uppercase tracking-widest mb-1.5">
                Handle (Optional)
              </label>
              <input
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#0a0a0c] border border-white/10 focus:border-[#cfa86e]/60 focus:bg-[#050505] text-white text-sm font-sans placeholder-white/20 transition-all duration-200 outline-none rounded-none"
                placeholder="@username"
                maxLength={15}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 mt-4 bg-[#cfa86e] text-[#050505] hover:bg-[#cfa86e]/95 transition-all duration-200 font-mono text-xs uppercase tracking-widest font-bold disabled:opacity-50"
            >
              {isSubmitting ? "Submitting to Walrus..." : "Submit Feedback"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
