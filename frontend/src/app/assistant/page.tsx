"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Bot,
  Send,
  Sparkles,
  User,
  ArrowRight,
  HelpCircle,
  Building2,
  RefreshCw,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  referencedProjects?: Array<{
    id: string;
    projectId: string;
    projectName: string;
    costCrore: number;
    costOverrun: number;
    delay: number;
    risk: string;
  }>;
}

const PROMPT_SUGGESTIONS = [
  "Show top high-risk National Highways projects with cost overrun > 20%",
  "Which Railway projects have delayed milestones exceeding 18 months?",
  "What are the primary root causes of delay across the infrastructure portfolio?",
  "Summarize critical infrastructure interventions required for Uttar Pradesh & Maharashtra",
  "Explain why multiple budget revisions increase cost risk in the ML model",
];

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `### 🇮🇳 Namaste. Welcome to PAIMAANA AI Policy Officer Desk.
I am your specialized intelligence assistant for the **Ministry of Statistics and Programme Implementation (MoSPI)** Infrastructure and Project Monitoring Division (IPMD).

I have full contextual awareness over all **1,981 Central Sector Infrastructure Projects (≥ ₹150 Crore)** tracked across 17 Central Ministries and 22 infrastructure sectors under the PAIMAANA framework.

How may I assist your portfolio review today?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const sendMessage = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    setInput("");
    const newMessages: Message[] = [...messages, { role: "user", content: query }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages([
          ...newMessages,
          {
            role: "assistant",
            content: data.reply,
            referencedProjects: data.referencedProjects,
          },
        ]);
      } else {
        setMessages([
          ...newMessages,
          {
            role: "assistant",
            content: "Sorry, I encountered an issue retrieving data from the repository. Please try again.",
          },
        ]);
      }
    } catch {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "Failed to connect to PAIMAANA intelligence core. Please check network status.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">PAIMAANA AI Policy Officer</h1>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono font-bold border border-slate-200">
                Institutional Desk
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Natural Language Infrastructure Analytics & Ministerial Policy Briefing Engine
            </p>
          </div>
        </div>
      </div>

      {/* Suggested Prompts Chips */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-orange-600" />
          <span>Recommended Portfolio Inquiries:</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {PROMPT_SUGGESTIONS.map((prompt, i) => (
            <button
              key={i}
              onClick={() => sendMessage(prompt)}
              className="text-xs px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 transition-all text-left shadow-sm font-medium"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="min-h-[460px] max-h-[580px] overflow-y-auto p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
        {messages.map((msg, idx) => {
          const isUser = msg.role === "user";

          return (
            <div
              key={idx}
              className={`flex gap-3.5 ${isUser ? "justify-end" : "justify-start"}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed space-y-3 ${
                  isUser
                    ? "bg-slate-900 text-white rounded-br-none shadow-sm font-medium"
                    : "bg-slate-50 border border-slate-200/80 text-slate-800 rounded-bl-none shadow-sm"
                }`}
              >
                {/* Formatted Content */}
                <div className="whitespace-pre-line max-w-none text-xs leading-relaxed font-sans">
                  {msg.content}
                </div>

                {/* Referenced Projects Cards if available */}
                {msg.referencedProjects && msg.referencedProjects.length > 0 && (
                  <div className="pt-3 border-t border-slate-200 space-y-2">
                    <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Referenced Project Dossiers:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {msg.referencedProjects.map((p) => (
                        <Link
                          key={p.projectId}
                          href={`/projects/${p.projectId}`}
                          className="p-2.5 rounded-lg bg-white border border-slate-200 hover:border-slate-400 transition-colors flex items-center justify-between group shadow-sm"
                        >
                          <div className="truncate mr-2">
                            <span className="font-mono text-[10px] text-slate-600 font-bold block">
                              {p.projectId}
                            </span>
                            <span className="text-slate-900 font-semibold truncate block text-[11px]">
                              {p.projectName}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              ₹{p.costCrore.toLocaleString()} Cr • +{p.costOverrun}%
                            </span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-800 shrink-0" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-lg bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-800 shrink-0 font-bold text-xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3.5 items-center text-slate-500 text-xs">
            <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
              <Bot className="w-4 h-4 animate-bounce" />
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-600 animate-ping" />
              <span>Analyzing projects across 47 indicators...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
        className="flex items-center gap-3 p-2 rounded-2xl bg-white border border-slate-200 shadow-sm"
      >
        <input
          type="text"
          placeholder="Ask about project delays, cost overruns, sector trends, or policy interventions..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          className="flex-1 bg-transparent px-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
