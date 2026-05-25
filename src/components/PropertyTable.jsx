import { useState } from "react";
import { fmtDate, starString } from "../utils/helpers";

const COLUMNS = [
  { key: "property_name", label: "Property" },
  { key: "city", label: "City" },
  { key: "channel", label: "Channel" },
  { key: "avgRating", label: "Avg ★" },
  { key: "reviewCount", label: "Reviews" },
  { key: "responseRate", label: "Response %" },
  { key: "trend", label: "Trend" },
  { key: "lastReview", label: "Last review" },
];

function SortIcon({ active, asc }) {
  if (!active) return <span className="text-zinc-700 ml-1">↕</span>;
  return <span className="text-zinc-300 ml-1">{asc ? "↑" : "↓"}</span>;
}

function TrendCell({ value }) {
  if (value == null) return <span className="text-zinc-700">—</span>;
  if (value > 0.05)
    return <span className="text-emerald-400 font-medium">+{value.toFixed(2)}</span>;
  if (value < -0.05)
    return <span className="text-red-400 font-medium">{value.toFixed(2)}</span>;
  return <span className="text-zinc-600">flat</span>;
}

export default function PropertyTable({ propertyStats, onSelectProperty }) {
  const [sortKey, setSortKey] = useState("avgRating");
  const [sortAsc, setSortAsc] = useState(true);

  function handleSort(key) {
    if (key === sortKey) setSortAsc((a) => !a);
    else { setSortKey(key); setSortAsc(true); }
  }

  const sorted = [...propertyStats].sort((a, b) => {
    const va = a[sortKey] ?? (sortAsc ? Infinity : -Infinity);
    const vb = b[sortKey] ?? (sortAsc ? Infinity : -Infinity);
    if (typeof va === "string") return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
    return sortAsc ? va - vb : vb - va;
  });

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-zinc-800">
            {COLUMNS.map(({ key, label }) => (
              <th
                key={key}
                onClick={() => handleSort(key)}
                className="text-left px-4 py-2.5 text-zinc-600 font-medium uppercase tracking-wider text-[10px] cursor-pointer hover:text-zinc-400 select-none whitespace-nowrap"
              >
                {label}
                <SortIcon active={sortKey === key} asc={sortAsc} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((p) => (
            <tr
              key={p.property_id}
              className={`border-b border-zinc-800/60 last:border-0 hover:bg-zinc-800/40 transition-colors ${
                p.isAnomaly ? "bg-red-950/20" : ""
              }`}
            >
              <td className="px-4 py-2.5">
                {p.isAnomaly && (
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5 align-middle" />
                )}
                <button
                  onClick={() => onSelectProperty(p.property_id)}
                  className="text-sky-400 hover:underline hover:cursor-pointer font-medium text-left"
                >
                  {p.property_name}
                </button>
              </td>
              <td className="px-4 py-2.5 text-zinc-500">{p.city}</td>
              <td className="px-4 py-2.5 text-zinc-500">{p.channel}</td>
              <td className="px-4 py-2.5">
                {p.avgRating != null ? (
                  <>
                    <span className="text-amber-400 text-[10px]">{starString(p.avgRating)}</span>
                    <span className="ml-1 text-zinc-300">{p.avgRating.toFixed(2)}</span>
                  </>
                ) : (
                  <span className="text-zinc-700">—</span>
                )}
              </td>
              <td className="px-4 py-2.5 text-zinc-400">{p.reviewCount}</td>
              <td className="px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-14 h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${p.responseRate >= 60 ? "bg-emerald-500" : p.responseRate >= 40 ? "bg-amber-500" : "bg-red-500"}`}
                      style={{ width: `${p.responseRate}%` }}
                    />
                  </div>
                  <span className="text-zinc-500">{p.responseRate}%</span>
                </div>
              </td>
              <td className="px-4 py-2.5 text-xs">
                <TrendCell value={p.trend} />
              </td>
              <td className="px-4 py-2.5 text-zinc-600 whitespace-nowrap">
                {p.lastReview ? fmtDate(p.lastReview) : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {sorted.length === 0 && (
        <p className="text-center py-10 text-zinc-600 text-sm">
          No properties match the current filters.
        </p>
      )}
    </div>
  );
}