import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export default function MultiSelect({ label, options, selected, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const handleToggle = (value) => {
    const newSelected = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];
    onChange(newSelected);
  };

  const selectAll = () => {
    onChange(options);
  };

  const clearAll = () => {
    onChange([]);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen]);

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-zinc-300 text-xs flex items-center gap-2 hover:bg-zinc-700 transition-colors whitespace-nowrap"
      >
        <span>
          {selected.length === 0
            ? `All ${label}`
            : selected.length === options.length
              ? `All ${label}`
              : `${selected.length} ${label}`}
        </span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-zinc-800 border border-zinc-700 rounded shadow-lg z-50 min-w-48">
          <div className="p-2 border-b border-zinc-700 flex gap-2">
            <button
              onClick={selectAll}
              className="text-xs text-zinc-400 hover:text-zinc-200 flex-1 px-2 py-1 bg-zinc-700 rounded hover:bg-zinc-600 transition-colors"
            >
              Select All
            </button>
            <button
              onClick={clearAll}
              className="text-xs text-zinc-400 hover:text-zinc-200 flex-1 px-2 py-1 bg-zinc-700 rounded hover:bg-zinc-600 transition-colors"
            >
              Clear
            </button>
          </div>

          <div className="max-h-56 overflow-y-auto">
            {options.map((option) => (
              <label
                key={option}
                className="flex items-center gap-2 px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-700 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(option)}
                  onChange={() => handleToggle(option)}
                  className="w-3.5 h-3.5 cursor-pointer accent-sky-500"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
