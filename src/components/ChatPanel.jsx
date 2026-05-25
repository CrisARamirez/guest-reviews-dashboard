import { useEffect, useMemo, useRef, useState } from "react";
import _ from "lodash";

import { chatWithPortfolio } from "../lib/agent";
import { getPortfolioStats } from "../utils/reviewStats";

function MessageBubble({
  role,
  children,
}) {
  const isUser = role === "user";

  return (
    <div
      className={`flex ${
        isUser
          ? "justify-end"
          : "justify-start"
      }`}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm border shadow-sm ${
          isUser
            ? "bg-sky-950 border-sky-900 text-sky-100"
            : "bg-zinc-900 border-zinc-800 text-zinc-300"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function SuggestedPrompt({
  children,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className="text-xs px-2.5 py-1.5 rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 hover:cursor-pointer transition-all"
    >
      {children}
    </button>
  );
}

function ProviderBadge({
  provider,
}) {
  if (!provider) return null;

  return (
    <div className="mb-2 flex items-center gap-2">
      <span className="text-[10px] uppercase tracking-widest text-violet-400 bg-violet-950/40 border border-violet-900 px-2 py-1 rounded">
        {provider}
      </span>
    </div>
  );
}

export default function ChatPanel({
  reviews = [],
}) {
  const [input, setInput] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [messages, setMessages] =
    useState([
      {
        role: "assistant",
        text:
          "Ask questions about your reviews, trends, complaints, or recurring guest issues.",
        provider: "System",
      },
    ]);

  const messagesEndRef =
    useRef(null);

  const portfolioStats = useMemo(
    () =>
      getPortfolioStats(reviews),
    [reviews]
  );

  const properties = useMemo(
    () =>
      _.uniqBy(
        reviews,
        "property_id"
      ).length,
    [reviews]
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView(
      {
        behavior: "smooth",
      }
    );
  }, [messages, loading]);

  async function handleAsk(
    forcedQuestion
  ) {
    const question = (
      forcedQuestion ?? input
    ).trim();

    if (!question || loading)
      return;

    const userMessage = {
      role: "user",
      text: question,
    };

    const updatedMessages = [
      ...messages,
      userMessage,
    ];

    setMessages(updatedMessages);

    setLoading(true);

    try {
      const historyForLLM =
        updatedMessages.map((m) => ({
          role: m.role,
          content: m.text,
        }));

      const result =
        await chatWithPortfolio(
          question,
          reviews,
          historyForLLM,
          portfolioStats
        );

      const assistantMessage = {
        role: "assistant",

        text:
          result?.text ??
          "No response received.",

        provider:
          result?.provider ??
          "Unknown",
      };

      setMessages((prev) => [
        ...prev,
        assistantMessage,
      ]);
    } catch (e) {
      console.error(e);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",

          text:
            e?.message ??
            "Failed to query AI provider.",

          provider: "Error",

          error: true,
        },
      ]);
    } finally {
      setLoading(false);
      setInput("");
    }
  }

  return (
    <div className="grid grid-cols-[320px_1fr] gap-4 h-[calc(100vh-180px)]">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 overflow-y-auto">
        <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-4">
          Portfolio context
        </p>

        <div className="space-y-3">
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3">
            <p className="text-xs text-zinc-500 mb-1">
              Reviews loaded
            </p>

            <p className="text-2xl font-medium">
              {
                portfolioStats?.total ??
                0
              }
            </p>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3">
            <p className="text-xs text-zinc-500 mb-1">
              Properties
            </p>

            <p className="text-2xl font-medium">
              {properties}
            </p>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3">
            <p className="text-xs text-zinc-500 mb-1">
              Avg rating
            </p>

            <p className="text-2xl font-medium text-amber-400">
              ★{" "}
              {portfolioStats?.avgRating ??
                "—"}
            </p>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3">
            <p className="text-xs text-zinc-500 mb-1">
              Response rate
            </p>

            <p className="text-2xl font-medium">
              {
                portfolioStats?.responseRate
              }
              %
            </p>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">
            Suggested prompts
          </p>

          <div className="flex flex-wrap gap-2">
            {[
              "What are the most common complaints?",
              "Which properties are trending down?",
              "Summarize negative reviews",
              "What do guests praise the most?",
              "Which amenities create complaints?",
              "Are response rates affecting ratings?",
            ].map((prompt) => (
              <SuggestedPrompt
                key={prompt}
                onClick={() =>
                  handleAsk(prompt)
                }
              >
                {prompt}
              </SuggestedPrompt>
            ))}
          </div>
        </div>

        <div className="mt-6 text-xs text-zinc-600 leading-relaxed">
          The AI receives:
          <ul className="mt-2 space-y-1 list-disc list-inside">
            <li>
              Portfolio metrics
            </li>

            <li>
              Filtered review samples
            </li>

            <li>
              Conversation context
            </li>
          </ul>
        </div>
      </div>

      <div className="flex flex-col bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-zinc-500">
              AI portfolio assistant
            </p>

            <p className="text-xs text-zinc-600 mt-1">
              Analyze review
              trends, complaints,
              and guest sentiment
            </p>
          </div>

          <div className="text-[10px] uppercase tracking-widest text-emerald-400 bg-emerald-950/40 border border-emerald-900 px-2 py-1 rounded">
            Multi-provider AI
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m, i) => (
            <MessageBubble
              key={i}
              role={m.role}
            >
              <ProviderBadge
                provider={
                  m.provider
                }
              />

              <div
                className={`leading-relaxed whitespace-pre-wrap ${
                  m.error
                    ? "text-red-300"
                    : ""
                }`}
              >
                {m.text}
              </div>
            </MessageBubble>
          ))}

          {loading && (
            <MessageBubble role="assistant">
              <div className="flex items-center gap-2 text-zinc-400">
                <span className="w-3 h-3 border border-zinc-600 border-t-zinc-300 rounded-full animate-spin" />

                Analyzing
                reviews...
              </div>
            </MessageBubble>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-zinc-800 p-3 flex gap-2 bg-zinc-900">
          <input
            value={input}
            onChange={(e) =>
              setInput(
                e.target.value
              )
            }
            onKeyDown={(e) => {
              if (
                e.key ===
                  "Enter" &&
                !e.shiftKey
              ) {
                e.preventDefault();

                handleAsk();
              }
            }}
            placeholder="Ask about trends, complaints, sentiment, properties..."
            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-violet-700 transition-colors"
          />

          <button
            onClick={() =>
              handleAsk()
            }
            disabled={
              loading ||
              !input.trim()
            }
            className="px-4 py-2 rounded-lg bg-violet-900 hover:bg-violet-800 hover:cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            {loading
              ? "..."
              : "Ask"}
          </button>
        </div>
      </div>
    </div>
  );
}