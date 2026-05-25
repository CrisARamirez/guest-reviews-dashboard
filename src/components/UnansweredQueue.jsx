import { useState } from "react";
import { fmtDate, starString, langLabel } from "../utils/helpers";
import { generateDraftResponse } from "../lib/agent";

const LANG_BADGE = {
  en: "bg-sky-950 text-sky-300",
  es: "bg-amber-950 text-amber-300",
  pt: "bg-emerald-950 text-emerald-300",
};

function PriorityDot({ rating }) {
  if (rating <= 2) return <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 mt-1" />;
  if (rating === 3) return <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 mt-1" />;
  return <span className="w-2 h-2 rounded-full bg-zinc-700 shrink-0 mt-1" />;
}

function ReviewCard({ review }) {
  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [now] = useState(() => Date.now());

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      const text = await generateDraftResponse(review);
      setDraft(text);
      setEditing(true);
    } catch (e) {
      setError(e.message ?? "Failed to generate draft");
    } finally {
      setLoading(false);
    }
  }

  const borderColor =
    review.rating_overall <= 2
      ? "border-l-red-600"
      : review.rating_overall === 3
      ? "border-l-amber-600"
      : "border-l-zinc-700";

  const daysAgo = Math.floor((now - new Date(review.review_date).getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div
      className={`bg-zinc-900 border border-zinc-800 border-l-2 ${borderColor} rounded-lg p-3`}
    >
      <div className="flex items-start gap-2 mb-2">
        <PriorityDot rating={review.rating_overall} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap text-xs text-zinc-500 mb-1">
            {review.rating_overall != null && (
              <span className="text-amber-400">{starString(review.rating_overall)}</span>
            )}
            <span
              className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                LANG_BADGE[review.language] ?? "bg-zinc-800 text-zinc-400"
              }`}
            >
              {langLabel(review.language)}
            </span>
            <span className="font-medium text-zinc-400">{review.property_name}</span>
            <span>·</span>
            <span>{review.city}</span>
            <span className="ml-auto flex items-center gap-2">
              <span>{fmtDate(review.review_date)}</span>
              <span className="text-zinc-700">·</span>
              <span>{daysAgo}d ago</span>
              <span className="text-zinc-700">·</span>
              <span>{review.channel}</span>
            </span>
          </div>

          <p className="text-xs text-zinc-300 leading-relaxed mb-2">
            "{review.review_text}"
          </p>

          <div className="flex items-center gap-2">
            {!draft && (
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="text-xs px-3 py-1.5 border border-violet-800 bg-violet-950/50 text-violet-300 rounded hover:bg-violet-900/50 hover:cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                {loading ? (
                  <>
                    <span className="w-3 h-3 border border-violet-600 border-t-violet-300 rounded-full animate-spin" />
                    Generating…
                  </>
                ) : (
                  <>✦ Generate draft response</>
                )}
              </button>
            )}
            {draft && (
              <button
                onClick={() => { setDraft(null); setEditing(false); }}
                className="text-xs text-zinc-600 hover:text-zinc-400 underline"
              >
                Regenerate
              </button>
            )}
            {error && (
              <span className="text-xs text-red-400">{error}</span>
            )}
          </div>

          {/* Draft textarea */}
          {draft && editing && (
            <div className="mt-2">
              <p className="text-[10px] uppercase tracking-widest text-zinc-600 mb-1">
                Draft response — review and edit before sending
              </p>
              <textarea
                defaultValue={draft}
                rows={4}
                className="w-full text-xs bg-zinc-800 border border-zinc-700 rounded p-2.5 text-zinc-200 font-sans leading-relaxed resize-y focus:outline-none focus:border-zinc-500"
              />
              <p className="text-[10px] text-zinc-700 mt-1">
                Copy this text and paste it into your hosting platform. Never sent automatically.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function UnansweredQueue({ queue }) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? queue : queue.slice(0, 20);

  if (queue.length === 0) {
    return (
      <div className="text-center py-16 text-zinc-600 text-sm">
        No unanswered reviews in the current filter ✓
      </div>
    );
  }

  const critical = queue.filter((r) => r.rating_overall <= 2).length;
  const warning = queue.filter((r) => r.rating_overall === 3).length;

  return (
    <div>
      <div className="flex items-center gap-4 mb-4 text-xs text-zinc-500">
        <span>{queue.length} unanswered · sorted by priority</span>
        {critical > 0 && (
          <span className="text-red-400">{critical} critical (1-2 ★)</span>
        )}
        {warning > 0 && (
          <span className="text-amber-400">{warning} moderate (3 ★)</span>
        )}
      </div>

      <div className="flex items-center gap-4 mb-3 text-[10px] text-zinc-600">
        <span>Priority score = (5 − rating) × 2 + days without response × 0.1</span>
      </div>

      <div className="space-y-2">
        {visible.map((r) => (
          <ReviewCard key={r.review_id} review={r} />
        ))}
      </div>

      {!showAll && queue.length > 20 && (
        <button
          onClick={() => setShowAll(true)}
          className="mt-4 w-full text-xs text-zinc-500 hover:text-zinc-300 border border-zinc-800 rounded-lg py-2.5 hover:border-zinc-700 transition-colors"
        >
          Show {queue.length - 20} more
        </button>
      )}
    </div>
  );
}