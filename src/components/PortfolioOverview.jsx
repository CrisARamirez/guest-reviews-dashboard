import { useMemo } from "react";
import { getPortfolioStats } from "../utils/reviewStats";
import { starString } from "../utils/helpers";

function TrendIndicator({ value }) {
  if (value == null) return <span className="text-zinc-600 text-xs">—</span>;
  if (value > 0.05)
    return <span className="text-emerald-400 text-xs font-medium">▲ +{value.toFixed(2)}</span>;
  if (value < -0.05)
    return <span className="text-red-400 text-xs font-medium">▼ {value.toFixed(2)}</span>;
  return <span className="text-zinc-500 text-xs">→ flat</span>;
}

function RatingBar({ count, max, star }) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  const color =
    star >= 4 ? "bg-emerald-500" : star === 3 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2 mb-1.5">
      <span className="text-zinc-500 text-xs w-3 text-right">{star}</span>
      <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-zinc-600 text-xs w-6 text-right">{count}</span>
    </div>
  );
}

export default function PortfolioOverview({ reviews, propertyStats, onSelectProperty }) {
  const stats = useMemo(() => getPortfolioStats(reviews), [reviews]);

  const anomalies = useMemo(
    () => propertyStats.filter((p) => p.isAnomaly),
    [propertyStats]
  );

  const bottom5 = useMemo(
    () => propertyStats.filter((p) => p.avgRating != null).slice(0, 5),
    [propertyStats]
  );

  const maxDist = Math.max(...Object.values(stats.ratingDist));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        {[
          {
            label: "Total reviews",
            value: stats.total,
            sub: `${[...new Set(reviews.map((r) => r.property_id))].length} properties`,
          },
          {
            label: "Avg overall rating",
            value: stats.avgRating != null ? `${starString(stats.avgRating)} ${stats.avgRating}` : "—",
            sub: <TrendIndicator value={stats.portfolioTrend} />,
            mono: false,
          },
          {
            label: "Response rate",
            value: `${stats.responseRate}%`,
            sub: `${stats.total - stats.withResponse} unanswered`,
            alert: stats.responseRate < 50,
          },
          {
            label: "Flagged properties",
            value: anomalies.length,
            sub: "rating drop >0.5★ vs 6mo prior",
            alert: anomalies.length > 0,
          },
        ].map(({ label, value, sub, alert }) => (
          <div key={label} className="bg-zinc-900 rounded-lg p-3 border border-zinc-800">
            <p className="text-xs text-zinc-500 mb-1">{label}</p>
            <p className={`text-2xl font-medium leading-none ${alert ? "text-red-400" : ""}`}>
              {value}
            </p>
            <p className="text-xs text-zinc-600 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <p className="text-xs font-medium uppercase tracking-widest text-zinc-500 mb-3">
            Rating distribution
          </p>
          {[5, 4, 3, 2, 1].map((s) => (
            <RatingBar key={s} star={s} count={stats.ratingDist[s]} max={maxDist} />
          ))}
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <p className="text-xs font-medium uppercase tracking-widest text-zinc-500 mb-3">
            Attention needed
          </p>
          {anomalies.length === 0 ? (
            <p className="text-xs text-zinc-600">No properties trending down in current filter ✓</p>
          ) : (
            <ul className="space-y-2">
              {anomalies.map((p) => (
                <li key={p.property_id}>
                  <button
                    onClick={() => onSelectProperty(p.property_id)}
                    className="text-xs text-sky-400 hover:underline hover:cursor-pointer font-medium"
                  >
                    {p.property_name}
                  </button>
                  <span className="text-xs text-red-400 ml-2">
                    ▼ -{Math.abs(p.trend).toFixed(2)}★ vs prior 6mo
                  </span>
                  <span className="text-xs text-zinc-600 ml-2">{p.city}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        <div className="px-4 pt-3 pb-2 border-b border-zinc-800">
          <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
            Bottom 5 properties · avg rating
          </p>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-zinc-800">
              {["Property", "City", "Avg ★", "Reviews", "Response rate", "Trend"].map((h) => (
                <th key={h} className="text-left px-4 py-2 text-zinc-600 font-medium uppercase tracking-wider text-[10px]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bottom5.map((p) => (
              <tr
                key={p.property_id}
                className={`border-b border-zinc-800 last:border-0 hover:bg-zinc-800/50 transition-colors ${
                  p.isAnomaly ? "bg-red-950/20" : ""
                }`}
              >
                <td className="px-4 py-2">
                  {p.isAnomaly && (
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5 align-middle" />
                  )}
                  <button
                    onClick={() => onSelectProperty(p.property_id)}
                    className="text-sky-400 hover:underline hover:cursor-pointer font-medium"
                  >
                    {p.property_name}
                  </button>
                </td>
                <td className="px-4 py-2 text-zinc-500">{p.city}</td>
                <td className="px-4 py-2">
                  <span className="text-amber-400">{starString(p.avgRating)}</span>
                  <span className="ml-1 text-zinc-400">{p.avgRating?.toFixed(2)}</span>
                </td>
                <td className="px-4 py-2 text-zinc-500">{p.reviewCount}</td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${p.responseRate}%` }}
                      />
                    </div>
                    <span className="text-zinc-500">{p.responseRate}%</span>
                  </div>
                </td>
                <td className="px-4 py-2">
                  <TrendIndicator value={p.trend} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}