import { useState, useEffect, useMemo } from "react";
import Papa from "papaparse";
import _ from "lodash";
import PortfolioOverview from "./components/PortfolioOverview";
import PropertyTable from "./components/PropertyTable";
import PropertyDetail from "./components/Propertydetail";
import UnansweredQueue from "./components/UnansweredQueue";
import ChatPanel from "./components/ChatPanel";
import MultiSelect from "./components/MultiSelect";
import { parseReviews } from "./utils/reviewParsers";
import { applyFilters } from "./utils/reviewFilters";
import {
  getPropertyStats,
  getUnansweredQueue,
} from "./utils/reviewStats";

const VIEWS = ["overview", "table", "queue", "chat"];
const VIEW_LABELS = {
  overview: "Overview",
  table: "Properties",
  queue: "Unanswered",
  chat: "Ask reviews",
};

const DEFAULT_FILTERS = {
  cities: [],
  channels: [],
  languages: [],
  properties: [],
  minRating: 1,
  maxRating: 5,
  dateFrom: "",
  dateTo: "",
};

export default function App() {
  const [allReviews, setAllReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("overview");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [themesCache, setThemesCache] = useState({});

  useEffect(() => {
    Papa.parse("/guest_reviews.csv", {
      download: true,
      header: true,
      dynamicTyping: true,
      complete: ({ data }) => {
        setAllReviews(parseReviews(data));
        setLoading(false);
      },
      error: (err) => {
        console.error("CSV parse error:", err);
        setLoading(false);
      },
    });
  }, []);

  const filtered = useMemo(
    () => applyFilters(allReviews, filters),
    [allReviews, filters]
  );

  const propertyStats = useMemo(() => getPropertyStats(filtered), [filtered]);

  const unansweredQueue = useMemo(() => getUnansweredQueue(filtered), [filtered]);

  const filterOptions = useMemo(() => {
    const cities = _.uniq(allReviews.map((r) => r.city)).sort();
    const channels = _.uniq(allReviews.map((r) => r.channel)).sort();
    const properties = _.uniqBy(allReviews, "property_id").map((r) => ({
      id: r.property_id,
      name: r.property_name,
    }));
    return { cities, channels, properties };
  }, [allReviews]);

  const cacheThemes = (property_id, themes) => {
    setThemesCache((prev) => ({ ...prev, [property_id]: themes }));
  };

  const updateFilter = (key, value) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  const openPropertyDetail = (property_id) => {
    setSelectedProperty(property_id);
  };

  const closePropertyDetail = () => setSelectedProperty(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-400 font-mono text-sm">
        Loading reviews…
      </div>
    );
  }

  const activeAnomaly = propertyStats.filter((p) => p.isAnomaly);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-zinc-500 tracking-widest uppercase">
            Premium Propiedades
          </span>
          <span className="text-zinc-700">·</span>
          <span className="text-sm text-zinc-400">
            {filtered.length} reviews
            {filtered.length !== allReviews.length && (
              <span className="text-zinc-600"> / {allReviews.length} total</span>
            )}
          </span>
          {activeAnomaly.length > 0 && (
            <span className="ml-2 inline-flex items-center gap-1 text-xs bg-red-950 text-red-400 border border-red-900 rounded px-2 py-0.5">
              ⚠ {activeAnomaly.length} propert{activeAnomaly.length === 1 ? "y" : "ies"} trending down
            </span>
          )}
        </div>

        <nav className="flex gap-1">
          {VIEWS.map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 text-sm rounded transition-colors ${
                view === v
                  ? "bg-zinc-800 text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 hover:cursor-pointer"
              }`}
            >
              {VIEW_LABELS[v]}
              {v === "queue" && unansweredQueue.length > 0 && (
                <span className="ml-1.5 text-xs bg-amber-900 text-amber-400 rounded-full px-1.5 py-0.5">
                  {unansweredQueue.length}
                </span>
              )}
            </button>
          ))}
        </nav>
      </header>

      <div className="border-b border-zinc-800 bg-zinc-900/50 px-6 py-3 flex flex-wrap items-center gap-3 text-xs text-zinc-400">
        <span className="text-zinc-600 font-mono uppercase tracking-wider">Filters</span>

        <MultiSelect
          label="Cities"
          options={filterOptions.cities}
          selected={filters.cities}
          onChange={(cities) => updateFilter("cities", cities)}
        />

        <MultiSelect
          label="Channels"
          options={filterOptions.channels}
          selected={filters.channels}
          onChange={(channels) => updateFilter("channels", channels)}
        />

        <MultiSelect
          label="Languages"
          options={["en", "es", "pt"]}
          selected={filters.languages}
          onChange={(languages) => updateFilter("languages", languages)}
        />

        <div className="flex items-center gap-1">
          <span>Rating</span>
          <input
            type="number" min="1" max="5" step="0.5"
            value={filters.minRating}
            onChange={(e) => updateFilter("minRating", Number(e.target.value))}
            className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 w-14 text-zinc-300"
          />
          <span>–</span>
          <input
            type="number" min="1" max="5" step="0.5"
            value={filters.maxRating}
            onChange={(e) => updateFilter("maxRating", Number(e.target.value))}
            className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 w-14 text-zinc-300"
          />
        </div>

        <input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => updateFilter("dateFrom", e.target.value)}
          className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-zinc-300"
        />
        <span>→</span>
        <input
          type="date"
          value={filters.dateTo}
          onChange={(e) => updateFilter("dateTo", e.target.value)}
          className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-zinc-300"
        />

        {JSON.stringify(filters) !== JSON.stringify(DEFAULT_FILTERS) && (
          <button
            onClick={resetFilters}
            className="text-zinc-500 hover:text-zinc-300 underline"
          >
            Reset
          </button>
        )}
      </div>

      <main className="px-6 py-6">
        {selectedProperty && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-start justify-center overflow-y-auto pt-8"
            onClick={closePropertyDetail}
          >
            <div 
              className="bg-zinc-950 border border-zinc-800 rounded-lg w-full max-w-3xl mx-4 mb-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="max-h-[calc(100vh-6rem)] overflow-y-auto w">
                <div className="px-6 py-4">
                  <PropertyDetail
                    reviews={filtered.filter((r) => r.property_id === selectedProperty)}
                    property={propertyStats.find((p) => p.property_id === selectedProperty)}
                    themes={themesCache[selectedProperty] ?? null}
                    onThemesCached={(themes) => cacheThemes(selectedProperty, themes)}
                    onClose={closePropertyDetail}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {!selectedProperty && view === "overview" && (
          <PortfolioOverview
            reviews={filtered}
            propertyStats={propertyStats}
            onSelectProperty={openPropertyDetail}
          />
        )}

        {!selectedProperty && view === "table" && (
          <PropertyTable
            propertyStats={propertyStats}
            onSelectProperty={openPropertyDetail}
          />
        )}

        {!selectedProperty && view === "queue" && (
          <UnansweredQueue queue={unansweredQueue} />
        )}

        {!selectedProperty && view === "chat" && (
          <ChatPanel reviews={filtered} />
        )}
      </main>
    </div>
  );
}
