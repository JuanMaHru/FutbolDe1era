"use client";
import { useMemo, useRef, useState } from "react";
import type { Entity } from "@/lib/game/types";
import { search } from "@/lib/game/text";

export function GuessInput<T extends Entity>({
  items,
  used,
  placeholder,
  onPick,
}: {
  items: T[];
  used: Set<string>;
  placeholder: string;
  onPick: (item: T) => void;
}) {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const results = useMemo(() => search(items, q, used), [items, q, used]);

  const pick = (item: T) => {
    onPick(item);
    setQ("");
    setActive(0);
    inputRef.current?.focus();
  };

  return (
    <div className="search">
      <input
        ref={inputRef}
        className="input"
        value={q}
        placeholder={placeholder}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        role="combobox"
        aria-expanded={q.length > 0}
        aria-controls="guess-suggestions"
        onChange={(e) => {
          setQ(e.target.value);
          setActive(0);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
          else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
          else if (e.key === "Enter" && results[active]) { e.preventDefault(); pick(results[active]); }
          else if (e.key === "Escape") setQ("");
        }}
      />
      {q.trim() && (
        <ul className="suggestions" id="guess-suggestions" role="listbox">
          {results.length === 0 ? (
            <li className="empty">No está en la base (todavía).</li>
          ) : (
            results.map((r, i) => (
              <li key={r.id} role="option" aria-selected={i === active}>
                <button type="button" className={i === active ? "active" : ""} onMouseEnter={() => setActive(i)} onClick={() => pick(r)}>
                  {r.name}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
