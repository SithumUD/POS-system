import React from 'react';
import {
  CupSodaIcon,
  CookieIcon,
  MilkIcon,
  SprayCanIcon,
  CroissantIcon,
  SnowflakeIcon
} from 'lucide-react';
import { Product, CategoryName } from '../../types';
import { categoryColors, stockState } from '../../data/products';
import { formatCurrency } from '../../utils/currency';

const categoryIcons: Record<CategoryName, React.ComponentType<{ className?: string }>> = {
  Beverages: CupSodaIcon,
  Snacks: CookieIcon,
  Dairy: MilkIcon,
  Household: SprayCanIcon,
  Bakery: CroissantIcon,
  Frozen: SnowflakeIcon
};

interface ProductTileProps {
  product: Product;
  stock: number;
  inCart: number;
  onAdd: (product: Product) => void;
}

export function ProductTile({ product, stock, inCart, onAdd }: ProductTileProps) {
  const remaining = stock - inCart;
  const thresh = product.reorderThreshold ?? product.threshold ?? 0;
  const state = stockState(stock, thresh);
  const catName = (typeof product.category === 'object' ? product.category?.name : product.category) as CategoryName || 'Household';
  const price = product.unitPrice ?? product.price ?? 0;
  const Icon = categoryIcons[catName] || CupSodaIcon;
  const colors = categoryColors[catName] || categoryColors['Household'];
  const disabled = state === 'out-of-stock' || remaining <= 0;

  const stockLabel =
    state === 'out-of-stock'
      ? 'Out of stock'
      : state === 'low-stock'
      ? `${stock} left`
      : `${stock} in stock`;

  const stockClass =
    state === 'out-of-stock'
      ? 'bg-red-50 text-red-700 ring-red-200'
      : state === 'low-stock'
      ? 'bg-amber-50 text-amber-700 ring-amber-200'
      : 'bg-emerald-50 text-emerald-700 ring-emerald-200';

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onAdd(product)}
      aria-label={`${product.name}, ${formatCurrency(price)}, ${stockLabel}`}
      className={`relative flex flex-col rounded-card border bg-white p-3 text-left transition-all ${
        disabled
          ? 'cursor-not-allowed border-slate-200 opacity-55'
          : 'border-slate-200 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-pop active:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500'
      } ${inCart > 0 ? 'ring-1 ring-brand-400' : ''}`}
    >
      {inCart > 0 && (
        <span className="absolute right-2 top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-brand-500 px-1.5 font-mono text-xs font-semibold text-white">
          {inCart}
        </span>
      )}
      <span
        className={`mb-3 flex h-16 w-full items-center justify-center rounded-lg ${colors.block}`}
        aria-hidden="true"
      >
        <Icon className="h-7 w-7" />
      </span>
      <span className="line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-snug text-slate-900">
        {product.name}
      </span>
      <span className="mt-1.5 font-mono text-base font-semibold tabular text-slate-900">
        {formatCurrency(price)}
      </span>
      <span
        className={`mt-2 inline-flex w-fit items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${stockClass}`}
      >
        {stockLabel}
      </span>
    </button>
  );
}