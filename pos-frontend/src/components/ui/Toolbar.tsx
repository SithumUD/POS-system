import React from 'react';
import { ChevronDownIcon, SearchIcon } from 'lucide-react';

export function ToolbarSelect({
  label,
  className = ''



}: {label: string;className?: string;}) {
  return (
    <button
      className={`inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 ${className}`}>
      
      {label}
      <ChevronDownIcon className="h-4 w-4 text-slate-400" aria-hidden="true" />
    </button>);

}

export function SearchInput({
  placeholder,
  className = ''



}: {placeholder: string;className?: string;}) {
  return (
    <div className={`relative ${className}`}>
      <SearchIcon
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        aria-hidden="true" />
      
      <input
        type="search"
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
      
    </div>);

}

interface SegmentedProps {
  options: {label: string;count?: number;}[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function Segmented({ options, value, onChange, className = '' }: SegmentedProps) {
  return (
    <div
      role="tablist"
      className={`inline-flex flex-wrap items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 ${className}`}>
      
      {options.map((opt) => {
        const active = opt.label === value;
        return (
          <button
            key={opt.label}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.label)}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            active ?
            'bg-white text-slate-900 shadow-card ring-1 ring-slate-200' :
            'text-slate-500 hover:text-slate-700'}`
            }>
            
            {opt.label}
            {typeof opt.count === 'number' &&
            <span
              className={`rounded-full px-1.5 text-[11px] tabular ${
              active ? 'bg-brand-50 text-brand-700' : 'bg-slate-200/70 text-slate-500'}`
              }>
              
                {opt.count}
              </span>
            }
          </button>);

      })}
    </div>);

}