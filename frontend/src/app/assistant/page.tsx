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
      content: `### 🇮🇳 Namaste. Welcome to PAIMANA AI Policy Officer Desk.
I am your specialized intelligence assistant for the **Ministry of Statistics and Programme Implementation (MoSPI)** Infrastructure and Project Monitoring Division (IPMD).

I have full contextual awareness over all **1,981 Central Sector Infrastructure Projects (≥ ₹150 Crore)** tracked across 17 Central Ministries and 22 infrastructure sectors under the PAIMANA framework.

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
          content: "Failed to connect to PAIMANA intelligence core. Please check network status.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0d1627] via-[#101b33] to-[#0a1222] border border-[#1e2e4a] shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>PAIMANA AI Policy Officer</span>
              <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">
                RAG Engine
              </span>
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Natural Language Project Intelligence & Ministerial Briefing Generator
            </p>
          </div>
        </div>
      </div>

      {/* Suggested Prompts Chips */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Recommended Inquiries:</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {PROMPT_SUGGESTIONS.map((prompt, i) => (
            <button
              key={i}
              onClick={() => sendMessage(prompt)}
              className="text-xs px-3 py-1.5 rounded-lg bg-[#0f172a] hover:bg-[#182338] border border-[#1e293b] text-gray-300 hover:text-white transition-all text-left"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="min-h-[440px] max-h-[580px] overflow-y-auto p-6 rounded-2xl bg-[#0a0f1d]/90 border border-[#1e293b] space-y-6">
        {messages.map((msg, idx) => {
          const isUser = msg.role === "user";

          return (
            <div
              key={idx}
              className={`flex gap-3.5 ${isUser ? "justify-end" : "justify-start"}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed space-y-3 ${
                  isUser
                    ? "bg-blue-600 text-white rounded-br-none shadow-md shadow-blue-600/20 font-medium"
                    : "bg-[#11192a] border border-[#1f2d48] text-gray-200 rounded-bl-none shadow-lg"
                }`}
              >
                {/* Formatted Content */}
                <div className="whitespace-pre-line prose prose-invert max-w-none text-xs">
                  {msg.content}
                </div>

                {/* Referenced Projects Cards if available */}
                {msg.referencedProjects && msg.referencedProjects.length > 0 && (
                  <div className="pt-3 border-t border-[#1e293b] space-y-2">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      Referenced Project Dossiers:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {msg.referencedProjects.map((p) => (
                        <Link
                          key={p.projectId}
                          href={`/projects/${p.projectId}`}
                          className="p-2.5 rounded-lg bg-[#0c1220] border border-[#1a2538] hover:border-blue-500/50 transition-colors flex items-center justify-between group"
                        >
                          <div className="truncate mr-2">
                            <span className="font-mono text-[10px] text-blue-400 font-semibold block">
                              {p.projectId}
                            </span>
                            <span className="text-white font-medium truncate block text-[11px]">
                              {p.projectName}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              ₹{p.costCrore.toLocaleString()} Cr • +{p.costOverrun}%
                            </span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-blue-400 shrink-0" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-300 shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3.5 items-center text-gray-400 text-xs">
            <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
              <Bot className="w-4 h-4 animate-bounce" />
            </div>
            <div className="p-3.5 rounded-2xl bg-[#11192a] border border-[#1f2d48] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
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
        className="flex items-center gap-3 p-2 rounded-xl bg-[#0f172a] border border-[#1e293b]"
      >
        <input
          type="text"
          placeholder="Ask about project delays, cost overruns, sector trends, or policy interventions..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          className="flex-1 bg-transparent px-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-blue-500/20"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
