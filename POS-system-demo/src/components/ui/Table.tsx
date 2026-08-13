import React from 'react';

export function TableWrap({
  children,
  className = '',
  maxHeight = 'max-h-[640px]'




}: {children: React.ReactNode;className?: string;maxHeight?: string;}) {
  return (
    <div className={`overflow-auto thin-scroll ${maxHeight} ${className}`}>
      <table className="w-full min-w-full border-collapse text-sm">{children}</table>
    </div>);

}

export function Th({
  children,
  align = 'left',
  className = ''




}: {children?: React.ReactNode;align?: 'left' | 'right' | 'center';className?: string;}) {
  const alignClass =
  align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';
  return (
    <th
      scope="col"
      className={`sticky top-0 z-10 whitespace-nowrap border-b border-slate-200 bg-slate-50/95 px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-slate-500 backdrop-blur ${alignClass} ${className}`}>
      
      {children}
    </th>);

}

export function Td({
  children,
  align = 'left',
  className = '',
  colSpan,
}: {
  children?: React.ReactNode;
  align?: 'left' | 'right' | 'center';
  className?: string;
  colSpan?: number;
}) {
  const alignClass =
    align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';
  return (
    <td colSpan={colSpan} className={`border-b border-slate-100 px-4 py-3.5 align-middle ${alignClass} ${className}`}>
      {children}
    </td>
  );
}

export function Tr({
  children,
  className = '',
  ...props
}: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className={`transition-colors hover:bg-slate-50/70 ${className}`} {...props}>
      {children}
    </tr>);

}