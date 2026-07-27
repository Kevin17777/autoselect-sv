import { useState, useRef, useEffect } from 'react';

type Props<T> = {
  items: T[];
  value: string;
  onChange: (value: string) => void;
  onSelect: (item: T) => void;
  placeholder?: string;
  renderItem: (item: T, highlight: boolean) => React.ReactNode;
  getLabel: (item: T) => string;
  filter?: (item: T, search: string) => boolean;
  excludeId?: string;
  getId?: (item: T) => string;
};

export default function AutocompleteInput<T>({ items, value, onChange, onSelect, placeholder, renderItem, getLabel, filter, excludeId, getId }: Props<T>) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = open
    ? items.filter((item) => {
        if (excludeId && getId && getId(item) === excludeId) return false;
        if (!value) return true;
        return filter ? filter(item, value) : getLabel(item).toLowerCase().includes(value.toLowerCase());
      })
    : [];

  const selectItem = (item: T) => {
    onSelect(item);
    setOpen(false);
  };

  const toggleOpen = () => setOpen((p) => { if (!p) setHighlight(0); return !p; });

  useEffect(() => {
    const el = listRef.current?.children[highlight] as HTMLElement | undefined;
    el?.scrollIntoView({ block: 'nearest' });
  }, [highlight]);

  return (
    <div className="relative">
      <div className="relative">
        <input ref={inputRef} type="text" value={value}
          placeholder={placeholder || 'Escribe para buscar...'}
          onChange={(e) => { onChange(e.target.value); setOpen(true); }}
          onFocus={() => { setOpen(true); setHighlight(0); }}
          onBlur={() => setOpen(false)}
          onKeyDown={(e) => {
            if (!open || filtered.length === 0) { if (e.key === 'Escape') setOpen(false); return; }
            if (e.key === 'ArrowDown') { e.preventDefault(); setHighlight((i) => Math.min(i + 1, filtered.length - 1)); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlight((i) => Math.max(i - 1, 0)); }
            else if (e.key === 'Tab') { e.preventDefault(); setHighlight((i) => (i + 1 >= filtered.length ? 0 : i + 1)); }
            else if (e.key === 'Enter') { e.preventDefault(); selectItem(filtered[highlight]); }
            else if (e.key === 'Escape') { setOpen(false); }
          }}
          className="input-premium w-full" />
        <button type="button" tabIndex={-1}
          onMouseDown={(e) => { e.preventDefault(); toggleOpen(); }}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors p-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      {open && filtered.length > 0 && (
        <div ref={listRef} className="absolute z-50 top-full left-0 right-0 mt-1 bg-graphite border border-white/10 rounded-xl overflow-hidden shadow-2xl max-h-60 overflow-y-auto">
          {filtered.map((item, i) => (
            <button key={i} type="button" onMouseDown={() => selectItem(item)}
              onMouseEnter={() => setHighlight(i)}
              className={`w-full text-left px-4 py-3 text-sm transition-colors border-b border-white/5 last:border-0 ${
                i === highlight ? 'bg-white/10 text-white' : 'text-white/80 hover:bg-white/5 hover:text-white'
              }`}>
              {renderItem(item, i === highlight)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
