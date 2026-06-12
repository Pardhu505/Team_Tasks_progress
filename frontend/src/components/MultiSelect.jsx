import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export const MultiSelect = ({ options, value = [], onChange, placeholder = 'Select…' }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = (opt) => {
    onChange(
      value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt]
    );
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="input flex items-center justify-between text-left"
      >
        <span className={value.length ? 'text-ink' : 'text-faint'}>
          {value.length ? `${value.length} selected` : placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-muted transition ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="absolute z-30 mt-2 max-h-60 w-full overflow-auto rounded-xl border border-line bg-surface p-1.5 shadow-card animate-fade-up">
          {options.map((opt) => {
            const active = value.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => toggle(opt)}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-ink transition hover:bg-surface-2"
              >
                {opt}
                {active && <Check className="h-4 w-4 text-signal" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
