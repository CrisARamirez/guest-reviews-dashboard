import { useState, useMemo } from "react";
import { fmtDate, starString, langLabel } from "../utils/helpers";
import ThemePanel from "./ThemePanel";

function SubRatingRow({ label, data }) {
  if (!data) return null;
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-zinc-600 w-28 shrink-0">{label}</span>
      <div className="w-20 h-1 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-500 rounded-full"
          style={{ width: `${(data.avg / 5) * 100}%` }}
        />
      </div>
      <span className="text-zinc-400">{data.avg.toFixed(1)}</span>
      <span className="text-zinc-700">n={data.n}</span>
    </div>
  );
}

const SUB_LABELS = {
  rating_cleanliness: "Cleanliness",
  rating_communication: "Communication",
  rating_checkin: "Check-in",
  rating_accuracy: "Accuracy",
  rating_location: "Location",
  rating_value: "Value",
};

const LANG_BADGE = {
  en: "bg-sky-950 text-sky-300",
  es: "bg-amber-950 text-amber-300",
  pt: "bg-emerald-950 text-emerald-300",
};

export default function PropertyDetail({
  reviews,
  property,
  themes,
  onThemesCached,
  onClose,
}) {
  const [sortBy, setSortBy] = useState("date_desc");
  const [filterRating, setFilterRating] = useState("all");
  const [showThemes, setShowThemes] = useState(false);

  const filtered = useMemo(() => {
    let list = [...reviews];
    if (filterRating !== "all") {
      list = list.filter((r) => Math.floor(r.rating_overall) === parseInt(filterRating));
    }
    list.sort((a, b) => {
      if (sortBy === "rating_asc") return (a.rating_overall ?? 0) - (b.rating_overall ?? 0);
      if (sortBy === "rating_desc") return (b.rating_overall ?? 0) - (a.rating_overall ?? 0);
      if (sortBy === "date_asc") return a.review_date - b.review_date;
      return b.review_date - a.review_date;
    });
    return list;
  }, [reviews, sortBy, filterRating]);

  const unansweredCount = reviews.filter((r) => !r.host_response).length;

  return (
    <div>
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <button
          onClick={onClose}
          className="text-xs text-zinc-500 hover:text-zinc-300 underline hover:cursor-pointer"
        >
          ← All properties
        </button>
        <span className="text-zinc-700">·</span>
        <span className="text-sm font-medium">{property?.property_name}</span>
        <span className="text-xs text-zinc-500">{property?.city}</span>
        {property?.avgRating != null && (
          <>
            <span className="text-amber-400 text-xs">{starString(property.avgRating)}</span>
            <span className="text-xs font-medium">{property.avgRating.toFixed(2)}</span>
          </>
        )}
        <span className="text-xs text-zinc-600">{reviews.length} reviews</span>
        {unansweredCount > 0 && (
          <span className="text-xs bg-amber-950 text-amber-400 border border-amber-900 rounded px-2 py-0.5">
            {unansweredCount} unanswered
          </span>
        )}
        <button
          onClick={() => setShowThemes((v) => !v)}
          className={`ml-auto text-xs px-3 py-1.5 border rounded transition-colors ${
            showThemes
              ? "bg-violet-950 border-violet-800 text-violet-300 hover:bg-violet-900 hover:border-violet-700 hover:cursor-pointer hover:text-white"
              : "border-zinc-700 text-zinc-500 hover:text-zinc-300 hover:border-zinc-500 hover:bg-zinc-900 hover:cursor-pointer"
          }`}
        >
          ✦ {showThemes ? "Hide themes" : "Show themes"}
        </button>
      </div>

      {property?.subRatings && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 mb-4">
          <p className="text-[10px] font-medium uppercase tracking-widest text-zinc-600 mb-3">
            Sub-ratings
          </p>
          <div className="grid grid-cols-3 gap-x-8 gap-y-2">
            {Object.entries(SUB_LABELS).map(([key, label]) => (
              <SubRatingRow key={key} label={label} data={property.subRatings[key]} />
            ))}
          </div>
        </div>
      )}

      {showThemes && (
        <ThemePanel
          property={property}
          reviews={reviews}
          cachedThemes={themes}
          onThemesCached={onThemesCached}
        />
      )}

      <div className="flex items-center gap-3 mb-3 text-xs">
        <select
          value={filterRating}
          onChange={(e) => setFilterRating(e.target.value)}
          className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-zinc-300 hover:bg-zinc-700"
        >
          <option value="all">All ratings</option>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>{n} ★</option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-zinc-300 hover:bg-zinc-700"
        >
          <option value="date_desc">Newest first</option>
          <option value="date_asc">Oldest first</option>
          <option value="rating_asc">Rating: low to high</option>
          <option value="rating_desc">Rating: high to low</option>
        </select>
        <span className="text-zinc-600">{filtered.length} reviews</span>
      </div>

      <div className="space-y-2">
        {filtered.map((r) => (
          <div
            key={r.review_id}
            className="bg-zinc-900 border border-zinc-800 rounded-lg p-3"
          >
            <div className="flex items-center gap-2 mb-2 text-xs text-zinc-500 flex-wrap">
              {r.rating_overall != null && (
                <span className="text-amber-400">{starString(r.rating_overall)}</span>
              )}
              <span
                className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                  LANG_BADGE[r.language] ?? "bg-zinc-800 text-zinc-400"
                }`}
              >
                {langLabel(r.language)}
              </span>
              <span>{r.channel}</span>
              <span className="ml-auto">{fmtDate(r.review_date)}</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">{r.review_text}</p>
            {r.host_response ? (
              <p className="text-xs text-zinc-600 mt-2 pt-2 border-t border-zinc-800 italic">
                Host: {r.host_response}
              </p>
            ) : (
              <p className="text-xs text-amber-600 mt-1.5">No host response</p>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-center py-8 text-zinc-600 text-sm">
            No reviews match the current filter.
          </p>
        )}
      </div>
    </div>
  );
}