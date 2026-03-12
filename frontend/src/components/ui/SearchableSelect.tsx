'use client';

import { useState, useRef, useEffect, useId } from 'react';
import { clsx } from 'clsx';
import { ChevronDown, X, Search } from 'lucide-react';
import { normalize } from '@/lib/text';

export interface SearchableOption {
  value: number | string;
  label: string;
  sub?: string;
}

interface SearchableSelectProps {
  label?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  options: SearchableOption[];
  value: number | string | null;
  onChange: (value: number | string | null) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

export default function SearchableSelect({
  label,
  placeholder = '-- Chọn --',
  searchPlaceholder = 'Tìm kiếm...',
  options,
  value,
  onChange,
  error,
  required,
  disabled,
}: SearchableSelectProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.value === value) ?? null;

  const normalizedSearch = normalize(search.trim());

  const filtered = normalizedSearch
    ? options.filter(
        (o) =>
          normalize(o.label).includes(normalizedSearch) ||
          normalize(o.sub ?? '').includes(normalizedSearch)
      )
    : options;

  // Close when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (open) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [open]);

  const handleSelect = (opt: SearchableOption) => {
    onChange(opt.value);
    setOpen(false);
    setSearch('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    setSearch('');
  };

  return (
    <div className="flex flex-col gap-1" ref={containerRef}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      {/* Trigger button */}
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => { if (!disabled) setOpen((p) => !p); }}
        className={clsx(
          'flex items-center justify-between px-3 py-2 border rounded-lg text-sm text-left transition focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white',
          error ? 'border-red-400' : 'border-gray-300',
          disabled && 'opacity-50 cursor-not-allowed',
          open && 'ring-2 ring-emerald-500 border-transparent'
        )}
      >
        <span className={selected ? 'text-gray-900' : 'text-gray-400'}>
          {selected ? (
            <span>
              {selected.label}
              {selected.sub && <span className="ml-1.5 text-gray-400 text-xs">{selected.sub}</span>}
            </span>
          ) : placeholder}
        </span>
        <span className="flex items-center gap-1 ml-2 shrink-0">
          {selected && (
            <span
              onClick={handleClear}
              className="text-gray-400 hover:text-red-500 transition cursor-pointer p-0.5 rounded"
            >
              <X size={13} />
            </span>
          )}
          <ChevronDown
            size={15}
            className={clsx('text-gray-400 transition-transform', open && 'rotate-180')}
          />
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
          style={{ maxWidth: containerRef.current?.offsetWidth }}
        >
          {/* Search input */}
          <div className="px-3 py-2 border-b border-gray-100">
            <div className="flex items-center gap-2 px-2 py-1.5 bg-gray-50 rounded-lg">
              <Search size={13} className="text-gray-400 shrink-0" />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder:text-gray-400"
              />
              {search && (
                <button type="button" onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600">
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Options list */}
          <ul className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm text-gray-400 text-center">Không tìm thấy kết quả</li>
            ) : (
              filtered.map((opt) => (
                <li
                  key={opt.value}
                  onClick={() => handleSelect(opt)}
                  className={clsx(
                    'flex items-center justify-between px-4 py-2.5 cursor-pointer text-sm transition-colors',
                    opt.value === value
                      ? 'bg-emerald-50 text-emerald-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  )}
                >
                  <span>{opt.label}</span>
                  {opt.sub && <span className="text-xs text-gray-400 ml-2">{opt.sub}</span>}
                </li>
              ))
            )}
          </ul>

          <div className="px-3 py-1.5 border-t border-gray-100 text-xs text-gray-400 text-right">
            {filtered.length} / {options.length} kết quả
          </div>
        </div>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
