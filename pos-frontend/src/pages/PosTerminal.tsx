import React, { useMemo, useRef, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { ScanBarcodeIcon, XIcon, WifiOffIcon, KeyboardIcon } from 'lucide-react';
import { PosTopBar } from '../components/pos/PosTopBar';
import { ProductTile } from '../components/pos/ProductTile';
import { CartPanel } from '../components/pos/CartPanel';
import { ReceiptModal } from '../components/pos/ReceiptModal';
import { useStore } from '../contexts/StoreContext';
import { formatCurrency } from '../utils/currency';
import { Product } from '../types';
import { useWebSocket } from '../hooks/useWebSocket';
import salesApi from '../api/salesApi';

export function PosTerminal() {
  const { products, branch, addToCart, inCartQty, lastSale, clearLastSale, online, queued } =
    useStore();
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  const catalogue = useMemo(() => products.filter((p) => p.active), [products]);

  const { connected: mobileAppConnected, sendPrint } = useWebSocket(branch, (barcode) => {
    const term = barcode.trim().toLowerCase();
    if (!term) return;

    const exact = catalogue.find(
      (p) => (p.barcode && p.barcode.toLowerCase() === term) || p.sku.toLowerCase() === term
    );
    
    if (exact) {
      const added = addToCart(exact);
      const price = exact.unitPrice ?? exact.price ?? 0;
      if (added) {
        toast.success(`${exact.name} added (Scan)`, {
          description: formatCurrency(price),
          duration: 1600
        });
      } else {
        toast.error('Not enough stock', {
          description: `${exact.name} is out of stock.`
        });
      }
    } else {
      toast.error('Scan failed', { description: `Barcode ${barcode} not found.` });
    }
  });

  const handlePrintToMobile = async (saleId: string) => {
    try {
      const res = await salesApi.getPrintReceiptData(saleId);
      if (res?.success && res.data) {
        const sent = sendPrint(res.data);
        if (sent) {
          toast.success('Print command sent to mobile app');
        } else {
          toast.error('Mobile app not connected');
        }
      }
    } catch (err) {
      toast.error('Failed to generate mobile receipt');
    }
  };

  const filterChips = useMemo(() => {
    const cats = new Set(
      catalogue
        .map((p) => (typeof p.category === 'object' ? p.category?.name : p.category))
        .filter(Boolean)
    );
    return ['All', ...Array.from(cats).sort()];
  }, [catalogue]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'F3') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const visibleProducts = useMemo(() => {
    const term = query.trim().toLowerCase();
    return catalogue.filter((product) => {
      const catName = typeof product.category === 'object' ? product.category?.name : product.category;
      const matchesCategory = category === 'All' || catName === category;
      const matchesTerm =
        term.length === 0 ||
        product.name.toLowerCase().includes(term) ||
        product.sku.toLowerCase().includes(term) ||
        (product.barcode && product.barcode.includes(term));
      return matchesCategory && matchesTerm;
    });
  }, [catalogue, category, query]);

  function handleAdd(product: Product) {
    const added = addToCart(product);
    const price = product.unitPrice ?? product.price ?? 0;
    const currentStock = product.stock?.[branch] ?? 0;
    if (added) {
      toast.success(`${product.name} added`, {
        description: formatCurrency(price),
        duration: 1600
      });
    } else {
      toast.error('Not enough stock', {
        description: `${product.name} has ${currentStock} units at this branch.`
      });
    }
  }

  function handleScan(event: React.FormEvent) {
    event.preventDefault();
    const term = query.trim().toLowerCase();
    if (!term) return;

    const exact = catalogue.find(
      (p) => (p.barcode && p.barcode === term) || p.sku.toLowerCase() === term
    );
    const match = exact ?? (visibleProducts.length > 0 ? visibleProducts[0] : undefined);

    if (!match) {
      toast.error('No product found', { description: `Nothing matches “${query}”.` });
      return;
    }

    handleAdd(match);
    setQuery('');
    searchRef.current?.focus();
  }

  return (
    <div className="flex h-full min-h-full w-full flex-col bg-slate-50">
      <PosTopBar />

      {!online && (
        <div className="flex items-center gap-2 border-b border-amber-200 bg-amber-50 px-6 py-2 text-xs font-medium text-amber-800">
          <WifiOffIcon className="h-3.5 w-3.5" aria-hidden="true" />
          Offline mode — {queued} sale{queued === 1 ? '' : 's'} queued locally and will sync when the
          connection returns.
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <section aria-label="Product entry" className="flex min-h-0 w-full flex-col lg:w-[65%]">
          <div className="shrink-0 space-y-4 px-6 pb-4 pt-5">
            <form onSubmit={handleScan} className="relative">
              <ScanBarcodeIcon
                className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-brand-500"
                aria-hidden="true"
              />

              <input
                ref={searchRef}
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Scan barcode or search product..."
                aria-label="Scan barcode or search product"
                className="h-14 w-full rounded-xl border-2 border-brand-400 bg-white pl-12 pr-24 text-base text-slate-900 shadow-[0_0_0_4px_rgba(59,91,255,0.10)] placeholder:text-slate-400 focus:border-brand-500 focus:shadow-[0_0_0_5px_rgba(59,91,255,0.16)] focus:outline-none"
              />

              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    searchRef.current?.focus();
                  }}
                  aria-label="Clear search"
                  className="absolute right-16 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              )}
              <kbd className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-[10px] font-medium text-slate-500">
                F3 to search
              </kbd>
            </form>

            <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Category filter">
              {filterChips.map((chip) => {
                const active = chip === category;
                return (
                  <button
                    key={chip}
                    aria-pressed={active}
                    onClick={() => setCategory(chip)}
                    className={`h-10 rounded-full px-4 text-sm font-medium transition-colors ${
                      active
                        ? 'bg-brand-500 text-white'
                        : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {chip}
                  </button>
                );
              })}
              <span className="ml-auto font-mono text-xs tabular text-slate-400">
                {visibleProducts.length} item{visibleProducts.length === 1 ? '' : 's'}
              </span>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 thin-scroll">
            {visibleProducts.length === 0 ? (
              <div className="rounded-card border border-dashed border-slate-300 bg-white py-16 text-center">
                <p className="text-sm font-medium text-slate-700">No matching products</p>
                <p className="mt-1 text-xs text-slate-500">
                  Try a different barcode, name, or category.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {visibleProducts.map((product) => (
                  <ProductTile
                    key={product.id}
                    product={product}
                    stock={product.stock?.[branch] ?? 0}
                    inCart={inCartQty(product.id)}
                    onAdd={handleAdd}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        <div className="min-h-0 w-full lg:w-[35%]">
          <CartPanel />
        </div>
      </div>

      <ReceiptModal 
        sale={lastSale} 
        onClose={clearLastSale} 
        onPrintToMobile={mobileAppConnected ? handlePrintToMobile : undefined}
      />
    </div>
  );
}