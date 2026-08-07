import React from 'react';

type Tone =
'green' |
'amber' |
'red' |
'blue' |
'slate' |
'indigo' |
'gray' |
'orange' |
'purple';

const tones: Record<Tone, string> = {
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  amber: 'bg-amber-50 text-amber-700 ring-amber-200',
  red: 'bg-red-50 text-red-700 ring-red-200',
  blue: 'bg-sky-50 text-sky-700 ring-sky-200',
  slate: 'bg-slate-100 text-slate-600 ring-slate-200',
  gray: 'bg-slate-50 text-slate-500 ring-slate-200',
  indigo: 'bg-brand-50 text-brand-700 ring-brand-200',
  orange: 'bg-orange-50 text-orange-700 ring-orange-200',
  purple: 'bg-violet-50 text-violet-700 ring-violet-200'
};

interface BadgeProps {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

export function Badge({ tone = 'slate', children, className = '', dot = false }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${tones[tone]} ${className}`}>
      
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />}
      {children}
    </span>);

}

export function StatusDot({ tone }: {tone: 'green' | 'amber' | 'red' | 'slate';}) {
  const map = {
    green: 'bg-emerald-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
    slate: 'bg-slate-400'
  };
  return <span className={`inline-block h-2 w-2 rounded-full ${map[tone]}`} aria-hidden="true" />;
}