"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  X,
  Send,
  Maximize2,
  RotateCcw,
  Sparkles,
  ExternalLink,
} from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "officer";
  text: string;
  timestamp: string;
  referencedProjects?: Array<{
    id?: string;
    projectId: string;
    projectName: string;
    costCrore: number;
    costOverrun: number;
    delay: number;
    risk: string;
  }>;
}

const QUICK_PROMPTS = [
  "Portfolio Overview",
  "Top CRITICAL Overruns",
  "Railways Delays",
  "NHAI Highway Performance",
];

export default function ChatWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial-1",
      sender: "officer",
      text: "Namaste! I am the **NIRMAAN AI Officer**. How can I assist you with Central Sector infrastructure monitoring today?",
      timestamp: "Just now",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Don't render floating widget on the full-page assistant route to avoid duplicate UI
  const isAssistantPage = pathname === "/assistant";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to query AI Officer");
      }

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "officer",
        text: data.reply || "No response received.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        referencedProjects: data.referencedProjects || [],
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "officer",
          text: `⚠️ **Notice:** ${err.message || "Failed to connect to AI Officer service."}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        sender: "officer",
        text: "Chat cleared. Ask me anything about project delays, cost variances, or implementing agencies.",
        timestamp: "Just now",
      },
    ]);
  };

  if (isAssistantPage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 select-none font-sans">
      {/* Circular Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative w-14 h-14 rounded-full bg-[#173f5f] hover:bg-[#122e47] text-white shadow-xl hover:shadow-2xl border-2 border-white flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 group"
          title="Ask NIRMAAN AI Officer"
          aria-label="Open NIRMAAN AI Chatbot"
        >
          <Bot className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />

          {/* Green online pulse status dot */}
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white" />
          </span>

          {/* Saffron pulse accent */}
          <span className="absolute -bottom-1 -left-1 w-2.5 h-2.5 rounded-full bg-orange-500 border border-white" />
        </button>
      )}

      {/* Expanded Floating Chat Widget (Consistent with NIRMAAN AI Light Institutional Theme) */}
      {isOpen && (
        <div className="w-[92vw] sm:w-[410px] h-[580px] max-h-[85vh] bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-slate-800">
          {/* Header */}
          <div className="px-4 py-3 bg-white border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#173f5f] text-white flex items-center justify-center font-serif font-bold text-sm shadow-xs">
                N
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-serif font-bold text-slate-900 tracking-tight">
                    NIRMAAN AI Officer
                  </h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <p className="text-[10px] text-slate-500 font-medium">
                  MoSPI PAIMANA Portfolio Assistant
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-slate-500">
              <button
                onClick={handleResetChat}
                className="p-1.5 rounded-lg hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Reset conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <Link
                href="/assistant"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:text-slate-900 hover:bg-slate-100 transition-colors"
                title="Expand to Full Page Assistant"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Minimize widget"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Area (Light Gray Institutional Canvas) */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs bg-[#f8fafc]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[88%] p-3.5 rounded-2xl leading-relaxed whitespace-pre-line text-xs ${
                    msg.sender === "user"
                      ? "bg-[#173f5f] text-white rounded-br-xs shadow-xs"
                      : "bg-white border border-slate-200 text-slate-800 rounded-bl-xs shadow-xs"
                  }`}
                >
                  {msg.text}
                </div>

                {/* Referenced Projects Cards */}
                {msg.referencedProjects && msg.referencedProjects.length > 0 && (
                  <div className="w-full mt-2 space-y-1.5">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                      Referenced Central Sector Assets:
                    </span>
                    <div className="space-y-1.5">
                      {msg.referencedProjects.slice(0, 3).map((p) => (
                        <Link
                          key={p.projectId}
                          href={`/projects/${p.projectId}`}
                          className="p-2.5 rounded-lg bg-white border border-slate-200 hover:border-slate-400 transition-colors flex items-center justify-between block group shadow-2xs"
                        >
                          <div className="min-w-0 pr-2">
                            <p className="text-[11px] font-semibold text-slate-900 truncate group-hover:text-orange-600 transition-colors">
                              {p.projectName}
                            </p>
                            <p className="text-[10px] font-mono text-slate-500">
                              {p.projectId} • ₹{p.costCrore?.toLocaleString()} Cr
                            </p>
                          </div>
                          <div className="text-right shrink-0 flex items-center gap-1.5">
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                                p.costOverrun > 20
                                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              }`}
                            >
                              {p.costOverrun > 0 ? `+${p.costOverrun}%` : `${p.costOverrun}%`}
                            </span>
                            <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-slate-700 transition-colors" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                <span className="text-[9px] text-slate-400 mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs w-fit shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-orange-600 animate-spin" />
                <span>AI Officer querying live database...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          {messages.length <= 2 && (
            <div className="px-4 py-2 bg-white border-t border-slate-200 flex flex-wrap gap-1.5">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSendMessage(prompt)}
                  className="px-2.5 py-1 rounded-md bg-slate-50 hover:bg-slate-100 text-[10px] font-medium text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about projects, delays, or agencies..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-400 transition-colors"
            />
            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="p-2 rounded-xl bg-[#173f5f] hover:bg-slate-800 disabled:opacity-40 text-white transition-colors cursor-pointer"
              title="Send message"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
