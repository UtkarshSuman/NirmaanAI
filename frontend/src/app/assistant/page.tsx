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
      content: `### 🇮🇳 Namaste. Welcome to NIRMAAN AI Officer Desk.
I am your specialized intelligence assistant for national capital execution monitoring and predictive portfolio analysis.

I have full contextual awareness over all Central Sector Infrastructure Projects (≥ ₹150 Crore) tracked across 17 Central Ministries and 22 infrastructure sectors under the NIRMAAN AI framework.

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
          content: "Failed to connect to NIRMAAN AI intelligence core. Please check network status.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Editorial Intelligence Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-gov-blue">
            Institutional Intelligence
          </span>
          <span className="text-slate-300">/</span>
          <span className="text-xs text-slate-500">
            Natural Language Policy Desk
          </span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-serif text-slate-900 tracking-tight">
              NIRMAAN AI Officer
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Institutional briefing memo engine and conversational query interface for
              central-sector infrastructure portfolio monitoring.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
              Coverage: Central Sector
            </span>
            <span className="text-xs text-gov-navy bg-slate-100 px-2.5 py-1 rounded border border-slate-200 font-semibold">
              [Current Analytical Dataset + ML Model Context]
            </span>
          </div>
        </div>
      </div>

      {/* Suggested Prompts Chips */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-gov-saffron" />
          <span>Recommended Portfolio Inquiries:</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {PROMPT_SUGGESTIONS.map((prompt, i) => (
            <button
              key={i}
              onClick={() => sendMessage(prompt)}
              className="text-xs px-3 py-1.5 rounded bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 transition-colors text-left font-medium"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="min-h-[460px] max-h-[580px] overflow-y-auto p-5 rounded border border-slate-200 bg-white space-y-5">
        {messages.map((msg, idx) => {
          const isUser = msg.role === "user";

          return (
            <div
              key={idx}
              className={`flex gap-3.5 ${isUser ? "justify-end" : "justify-start"}`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded p-4 text-xs leading-relaxed space-y-3 ${
                  isUser
                    ? "bg-gov-navy text-white font-medium"
                    : "bg-slate-50 border border-slate-200 text-slate-800"
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
                          className="p-2.5 rounded bg-white border border-slate-200 hover:border-slate-400 transition-colors flex items-center justify-between group"
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
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-800 shrink-0" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-7 h-7 rounded bg-orange-100 border border-orange-200 flex items-center justify-center text-gov-saffron shrink-0 font-bold text-xs mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3.5 items-center text-slate-500 text-xs">
            <div className="w-7 h-7 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
              <Bot className="w-3.5 h-3.5 animate-bounce" />
            </div>
            <div className="p-3 rounded bg-slate-50 border border-slate-200 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gov-saffron animate-ping" />
              <span>Querying portfolio repository across 47 indicators...</span>
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
        className="flex items-center gap-2 p-1.5 rounded bg-white border border-slate-300"
      >
        <input
          type="text"
          placeholder="Ask about project delays, cost overruns, sector trends, or policy interventions..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          className="flex-1 bg-transparent px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="px-4 py-2 rounded bg-gov-navy hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <span>Send Query</span>
          <Send className="w-3 h-3" />
        </button>
      </form>
    </div>
  );
}
