import { useState } from "react";
import { extractThemes } from "../lib/agent";

const SENTIMENT_STYLE = {
  negative: "bg-red-950 text-red-300 border-red-900",
  positive: "bg-emerald-950 text-emerald-300 border-emerald-900",
  mixed: "bg-amber-950 text-amber-300 border-amber-900",
};

function ThemeChip({ theme, count, sentiment, onClick, active }) {
  const style = SENTIMENT_STYLE[sentiment] ?? "bg-zinc-800 text-zinc-400 border-zinc-700";
  return (
    <button
      onClick={onClick}
      className={`text-xs px-3 py-1.5 rounded border transition-all ${style} ${
        active ? "ring-1 ring-white/20 scale-[1.02]" : "hover:brightness-110 hover:cursor-pointer"
      }`}
    >
      {theme}
      <span className="ml-1.5 opacity-60">{count}</span>
    </button>
  );
}

export default function ThemePanel({ property, reviews, cachedThemes, onThemesCached }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTheme, setActiveTheme] = useState(null);

  const themes = cachedThemes;

  async function handleExtract() {
    setLoading(true);
    setError(null);
    setActiveTheme(null);
    try {
      const texts = reviews.map((r) => r.review_text).filter(Boolean);
      const result = await extractThemes(property.property_name, texts);
      onThemesCached(result);
    } catch (e) {
      setError(e.message ?? "Failed to extract themes");
    } finally {
      setLoading(false);
    }
  }

  const matchingReviews =
    activeTheme != null && themes
      ? (themes[activeTheme]?.reviewIndexes ?? []).map((i) => reviews[i]).filter(Boolean)
      : [];

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 mb-4">
      <div className="flex items-center gap-3 mb-3">
        <p className="text-[10px] font-medium uppercase tracking-widest text-zinc-500">
          Recurring themes · {property.property_name}
        </p>
        <button
          onClick={handleExtract}
          disabled={loading}
          className="ml-auto text-xs px-3 py-1 border border-violet-800 bg-violet-950/50 text-violet-300 rounded hover:bg-violet-900/50 hover:cursor-pointer hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
        >
          {loading ? (
            <>
              <span className="w-3 h-3 border border-violet-600 border-t-violet-300 rounded-full animate-spin" />
              Analyzing {reviews.length} reviews…
            </>
          ) : themes ? (
            "↻ Re-analyze"
          ) : (
            <>✦ Analyze {reviews.length} reviews</>
          )}
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-400 mb-2">{error}</p>
      )}

      {!themes && !loading && (
        <p className="text-xs text-zinc-600">
          Click "Analyze" to extract recurring themes from this property's reviews using AI.
          Results are cached — won't re-run unless you click again.
        </p>
      )}

      {themes && themes.length === 0 && (
        <p className="text-xs text-zinc-600">
          No recurring themes found (need 2+ reviews mentioning the same topic).
        </p>
      )}

      {themes && themes.length > 0 && (
        <>
          <div className="flex flex-wrap gap-2 mb-3">
            {themes.map((t, i) => (
              <ThemeChip
                key={i}
                theme={t.theme}
                count={t.reviewIndexes?.length ?? 0}
                sentiment={t.sentiment}
                active={activeTheme === i}
                onClick={() => setActiveTheme(activeTheme === i ? null : i)}
              />
            ))}
          </div>

          {activeTheme != null && matchingReviews.length > 0 && (
            <div className="border-t border-zinc-800 pt-3 space-y-2">
              <p className="text-[10px] uppercase tracking-widest text-zinc-600">
                {matchingReviews.length} review{matchingReviews.length > 1 ? "s" : ""} mentioning "{themes[activeTheme]?.theme}"
              </p>
              {matchingReviews.map((r) => (
                <div key={r.review_id} className="text-xs bg-zinc-800 rounded p-2.5">
                  <div className="flex items-center gap-2 mb-1 text-zinc-500">
                    <span className="text-amber-400">{"★".repeat(r.rating_overall ?? 0)}</span>
                    <span>{r.channel}</span>
                    <span className="ml-auto text-zinc-600">{r.review_date?.toLocaleDateString()}</span>
                  </div>
                  <p className="text-zinc-300 leading-relaxed">{r.review_text}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}