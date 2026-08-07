import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  PlusIcon,
  UploadIcon,
  MoreVerticalIcon,
  LayoutGridIcon,
  ListIcon,
  ChevronDownIcon,
  PackageIcon,
  SearchIcon,
  Trash2Icon,
  CopyIcon,
  PencilIcon,
  PowerIcon
} from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge, StatusDot } from '../components/ui/Badge';
import { Th, Td, Tr } from '../components/ui/Table';
import { ProductDetailPanel } from '../components/products/ProductDetailPanel';
import { ProductFormModal } from '../components/products/ProductFormModal';
import { CategoryFormModal } from '../components/products/CategoryFormModal';
import { categories, categoryColors, categoryTree, stockState, totalStock } from '../data/products';
import { useStore } from '../contexts/StoreContext';
import productsApi from '../api/productsApi';
import { formatCurrency } from '../utils/currency';
import { CategoryName, Product } from '../types';

const PAGE_SIZE = 10;

function getCatName(p: Product): CategoryName {
  const cat = typeof p.category === 'object' ? p.category?.name : p.category;
  return (cat as CategoryName) || 'Household';
}

const normalizeProduct = (p: any): Product => {
  const stock: Record<string, number> = {};
  if (Array.isArray(p.branchStock) && p.branchStock.length > 0) {
    p.branchStock.forEach((bs: any) => {
      const q = bs.quantity ?? 0;
      if (bs.branchSlug) {
        stock[bs.branchSlug] = q;
        stock[bs.branchSlug.toLowerCase()] = q;
      }
      if (bs.branchId) {
        stock[bs.branchId] = q;
      }
    });
  } else if (p.stock && typeof p.stock === 'object' && Object.keys(p.stock).length > 0) {
    Object.assign(stock, p.stock);
  } else if (typeof p.totalQuantity === 'number' && p.totalQuantity > 0) {
    stock['colombo'] = p.totalQuantity;
  }

  const categoryName =
    typeof p.category === 'object' && p.category !== null
      ? p.category.name || p.category.slug
      : p.category || 'Beverages';

  return {
    id: p.id,
    sku: p.sku || '',
    barcode: p.barcode || '',
    name: p.name || '',
    category: categoryName as any,
    unitPrice: p.unitPrice ?? p.price ?? 0,
    costPrice: p.costPrice ?? p.cost ?? 0,
    taxRate: p.taxRate ?? 0.1,
    reorderThreshold: p.reorderThreshold ?? p.threshold ?? 0,
    unitOfMeasure: (p.unitOfMeasure || p.unit || 'EACH') as any,
    unitLabel: p.unitLabel || p.unit || 'Each',
    stock,
    supplier: p.supplier || (typeof p.preferredSupplier === 'object' ? p.preferredSupplier?.name : p.preferredSupplier) || undefined,
    preferredSupplier: typeof p.preferredSupplier === 'object' ? p.preferredSupplier : (p.supplierId ? { id: p.supplierId, name: p.supplier || '' } : null),
    active: p.active ?? true,
    imageUrl: p.imageUrl || null,
    updatedAt: p.updatedAt || new Date().toISOString(),
    createdAt: p.createdAt || new Date().toISOString(),
  };
};

export function Products() {
  const { products, branches, categories: storeCategories, categoryTree: storeCategoryTree, duplicateProduct, toggleActive, deleteProduct } = useStore();
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  
  const displayTree = useMemo(() => {
    if (storeCategoryTree && storeCategoryTree.length > 0) {
      return storeCategoryTree.map((item) => ({
        name: item.name,
        slug: item.slug,
        children: (item.children || []).map((c) => ({
          name: c.name,
          slug: c.slug,
          count: products.filter((p) => {
            const cat = typeof p.category === 'object' ? (p.category as any)?.slug : p.category;
            return cat === c.slug || cat === c.name;
          }).length
        })),
        count: products.filter((p) => {
          const cat = typeof p.category === 'object' ? (p.category as any)?.slug : p.category;
          return cat === item.slug || cat === item.name;
        }).length
      }));
    }
    return categoryTree;
  }, [storeCategoryTree, products]);

  const activeCategories = useMemo(() => {
    if (storeCategories && storeCategories.length > 0) {
      return storeCategories.map((c) => c.name as CategoryName);
    }
    return categories;
  }, [storeCategories]);
  const [view, setView] = useState<'table' | 'grid'>('table');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<'All' | CategoryName>('All');
  const [status, setStatus] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [page, setPage] = useState(1);
  const [localDeletedIds, setLocalDeletedIds] = useState<Set<string>>(new Set());
  const [serverProducts, setServerProducts] = useState<Product[]>([]);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch paginated products from backend endpoint: GET /api/v1/products
  const fetchProductsFromBackend = async () => {
    setLoading(true);
    try {
      const activeParam = status === 'All' ? undefined : status === 'Active';
      const activeOnlyParam = status === 'Active';
      const categorySlugParam = category === 'All' ? undefined : category.toLowerCase().replace(/\s+/g, '-');
      const searchParam = query.trim() || undefined;

      const res = await productsApi.getProducts({
        page: page - 1,
        size: PAGE_SIZE,
        search: searchParam,
        categorySlug: categorySlugParam,
        active: activeParam,
        activeOnly: activeOnlyParam,
      });

      if (res?.success && res.data) {
        const normalized = (res.data.content || [])
          .filter((p: any) => !localDeletedIds.has(p.id))
          .map(normalizeProduct);
        setServerProducts(normalized);
        setTotalElements(res.data.totalElements || res.data.content?.length || 0);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to fetch paginated products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsFromBackend();
  }, [query, category, status, page, products]);

  const displayedProducts = serverProducts.length > 0 ? serverProducts : products;

  const filtered = useMemo(() => {
    if (serverProducts.length > 0) return serverProducts;
    const term = query.trim().toLowerCase();
    return products.filter((product) => {
      const catName = getCatName(product);
      const matchesTerm =
        term.length === 0 ||
        product.name.toLowerCase().includes(term) ||
        product.sku.toLowerCase().includes(term) ||
        (product.barcode && product.barcode.includes(term));
      const matchesCategory = category === 'All' || catName === category;
      const matchesStatus =
        status === 'All' || (status === 'Active' ? product.active : !product.active);
      return matchesTerm && matchesCategory && matchesStatus;
    });
  }, [serverProducts, products, query, category, status]);

  const pageCount = Math.max(Math.ceil(filtered.length / PAGE_SIZE), 1);

  useEffect(() => {
    setPage(1);
  }, [query, category, status]);

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  const start = (page - 1) * PAGE_SIZE;
  const rows = filtered.slice(start, start + PAGE_SIZE);
  const selected = products.find((p) => p.id === selectedId) ?? null;

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      const c = getCatName(p);
      counts[c] = (counts[c] ?? 0) + 1;
    });
    return counts;
  }, [products]);

  return (
    <AppShell
      title="Products"
      actions={
        <>
          <Button
            variant="secondary"
            onClick={() =>
              toast.info('CSV import', {
                description: 'Drop a supplier price list here to bulk-create or update products.'
              })
            }
          >
            <UploadIcon className="h-4 w-4" aria-hidden="true" />
            Import CSV
          </Button>
          <Button variant="primary" onClick={() => setAddOpen(true)}>
            <PlusIcon className="h-4 w-4" aria-hidden="true" />
            Add Product
          </Button>
        </>
      }
    >
      <div className="flex gap-5">
        <Card className="hidden w-60 shrink-0 self-start p-4 xl:block">
          <h2 className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500">
            Categories
          </h2>
          <button
            onClick={() => setCategory('All')}
            className={`mb-1 flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors ${
              category === 'All'
                ? 'bg-brand-50 font-medium text-brand-700'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            All products
            <span className="font-mono text-xs tabular text-slate-400">{products.length}</span>
          </button>
          <ul className="space-y-1">
            {displayTree.map((group) => (
              <li key={group.name}>
                <button
                  onClick={() => setCategory(group.name as CategoryName)}
                  className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors ${
                    category === group.name
                      ? 'bg-brand-50 font-medium text-brand-700'
                      : 'font-medium text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <span className="inline-flex items-center gap-1.5">
                    <ChevronDownIcon className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                    {group.name}
                  </span>
                  <span className="font-mono text-xs tabular text-slate-400">
                    {categoryCounts[group.name] ?? 0}
                  </span>
                </button>
                <ul className="ml-4 border-l border-slate-100 pl-2">
                  {group.children.map((child) => (
                    <li key={child.name}>
                      <button
                        onClick={() => {
                          setCategory(group.name as CategoryName);
                          setQuery('');
                        }}
                        className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                      >
                        <span className="truncate">{child.name}</span>
                        <span className="font-mono text-xs tabular text-slate-400">
                          {child.count}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
          <button
            onClick={() => setCategoryModalOpen(true)}
            className="mt-3 inline-flex items-center gap-1.5 px-2 text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            <PlusIcon className="h-3.5 w-3.5" aria-hidden="true" />
            Add Category
          </button>
        </Card>

        <div className="min-w-0 flex-1 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[260px] flex-1">
              <SearchIcon
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, SKU, or barcode"
                aria-label="Search products"
                className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as 'All' | CategoryName)}
              aria-label="Filter by category"
              className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 focus:border-brand-500 focus:outline-none"
            >
              <option value="All">All categories</option>
              {activeCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'All' | 'Active' | 'Inactive')}
              aria-label="Filter by status"
              className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 focus:border-brand-500 focus:outline-none"
            >
              <option value="All">All statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <div className="inline-flex items-center rounded-lg border border-slate-200 bg-white p-0.5">
              <button
                onClick={() => setView('table')}
                aria-pressed={view === 'table'}
                aria-label="Table view"
                className={`rounded-md p-1.5 transition-colors ${
                  view === 'table' ? 'bg-slate-100 text-slate-900' : 'text-slate-400'
                }`}
              >
                <ListIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setView('grid')}
                aria-pressed={view === 'grid'}
                aria-label="Grid view"
                className={`rounded-md p-1.5 transition-colors ${
                  view === 'grid' ? 'bg-slate-100 text-slate-900' : 'text-slate-400'
                }`}
              >
                <LayoutGridIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          <Card className="overflow-hidden">
            {filtered.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-sm font-medium text-slate-700">No products match your filters</p>
                <button
                  onClick={() => {
                    setQuery('');
                    setCategory('All');
                    setStatus('All');
                  }}
                  className="mt-2 text-sm font-medium text-brand-600 hover:text-brand-700"
                >
                  Clear all filters
                </button>
              </div>
            ) : view === 'table' ? (
              <div className="max-h-[620px] overflow-auto thin-scroll">
                <table className="w-full min-w-[1040px] border-collapse text-sm">
                  <thead>
                    <tr>
                      <Th className="w-14" />
                      <Th>Product</Th>
                      <Th>Category</Th>
                      <Th>Barcode</Th>
                      <Th align="right">Unit Price</Th>
                      <Th align="right">Cost Price</Th>
                      <Th align="right">Stock</Th>
                      <Th>Status</Th>
                      <Th className="w-12" />
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((product) => {
                      const total = totalStock(product, branches);
                      const thresh = product.reorderThreshold ?? product.threshold ?? 0;
                      const state = stockState(total, thresh);
                      const dot =
                        state === 'out-of-stock' ? 'red' : state === 'low-stock' ? 'amber' : 'green';
                      const catName = getCatName(product);
                      const colors = categoryColors[catName] || categoryColors['Household'];
                      const price = product.unitPrice ?? product.price ?? 0;
                      const cost = product.costPrice ?? product.cost ?? 0;

                      return (
                        <Tr
                          key={product.id}
                          className="cursor-pointer"
                          onClick={() => setSelectedId(product.id)}
                        >
                          <Td>
                            <span
                              className={`flex h-9 w-9 items-center justify-center rounded-lg ${colors.block}`}
                              aria-hidden="true"
                            >
                              <PackageIcon className="h-4 w-4" />
                            </span>
                          </Td>
                          <Td>
                            <p className="font-medium text-slate-900">{product.name}</p>
                            <p className="font-mono text-xs text-slate-400">{product.sku}</p>
                          </Td>
                          <Td>
                            <span
                              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${colors.bg} ${colors.text}`}
                            >
                              {catName}
                            </span>
                          </Td>
                          <Td className="font-mono text-xs text-slate-500">{product.barcode || '—'}</Td>
                          <Td align="right" className="font-mono tabular text-slate-900">
                            {formatCurrency(price)}
                          </Td>
                          <Td align="right" className="font-mono tabular text-slate-500">
                            {formatCurrency(cost)}
                          </Td>
                          <Td align="right">
                            <span className="inline-flex items-center gap-2">
                              <StatusDot tone={dot} />
                              <span className="font-mono tabular font-medium text-slate-900">
                                {total}
                              </span>
                            </span>
                          </Td>
                          <Td>
                            <Badge tone={product.active ? 'green' : 'slate'}>
                              {product.active ? 'Active' : 'Inactive'}
                            </Badge>
                          </Td>
                          <Td align="right">
                            <RowMenu
                              product={product}
                              onEdit={() => setSelectedId(product.id)}
                              onDuplicate={() => {
                                duplicateProduct(product.id);
                                toast.success(`${product.name} duplicated`, {
                                  description: 'The copy is inactive until you review it.'
                                });
                              }}
                              onToggle={() => {
                                toggleActive(product.id);
                                toast.success(
                                  `${product.name} ${product.active ? 'deactivated' : 'activated'}`
                                );
                              }}
                               onDelete={async () => {
                                 setLocalDeletedIds((prev) => new Set(prev).add(product.id));
                                 setServerProducts((prev) => prev.filter((p) => p.id !== product.id));
                                 await deleteProduct(product.id);
                               }}
                            />
                          </Td>
                        </Tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3">
                {rows.map((product) => {
                  const catName = getCatName(product);
                  const colors = categoryColors[catName] || categoryColors['Household'];
                  const price = product.unitPrice ?? product.price ?? 0;
                  return (
                    <button
                      key={product.id}
                      onClick={() => setSelectedId(product.id)}
                      className="rounded-card border border-slate-200 p-4 text-left transition-colors hover:border-brand-300"
                    >
                      <span
                        className={`mb-3 flex h-20 w-full items-center justify-center rounded-lg ${colors.block}`}
                        aria-hidden="true"
                      >
                        <PackageIcon className="h-6 w-6" />
                      </span>
                      <p className="text-sm font-medium text-slate-900">{product.name}</p>
                      <p className="font-mono text-xs text-slate-400">{product.sku}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <p className="font-mono text-sm font-semibold tabular text-slate-900">
                          {formatCurrency(price)}
                        </p>
                        <span className="font-mono text-xs tabular text-slate-500">
                          {totalStock(product)} in stock
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {filtered.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-3">
                <p className="text-xs text-slate-500">
                  Showing{' '}
                  <span className="font-mono tabular">
                    {start + 1}–{Math.min(start + PAGE_SIZE, filtered.length)}
                  </span>{' '}
                  of <span className="font-mono tabular">{filtered.length}</span> products
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  >
                    Previous
                  </Button>
                  {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      aria-current={p === page ? 'page' : undefined}
                      className={`h-8 min-w-8 rounded-lg px-2 text-xs font-medium transition-colors ${
                        p === page
                          ? 'bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-200'
                          : 'text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={page === pageCount}
                    onClick={() => setPage((p) => Math.min(p + 1, pageCount))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      <ProductDetailPanel product={selected} onClose={() => setSelectedId(null)} />
      <ProductFormModal open={addOpen} onClose={() => setAddOpen(false)} />
      <CategoryFormModal open={categoryModalOpen} onClose={() => setCategoryModalOpen(false)} />
    </AppShell>
  );
}

interface RowMenuProps {
  product: Product;
  onEdit: () => void;
  onDuplicate: () => void;
  onToggle: () => void;
  onDelete: () => void;
}

function RowMenu({ product, onEdit, onDuplicate, onToggle, onDelete }: RowMenuProps) {
  const [open, setOpen] = useState(false);

  const items = [
    { label: 'Edit', icon: PencilIcon, action: onEdit, tone: 'text-slate-700' },
    { label: 'Duplicate', icon: CopyIcon, action: onDuplicate, tone: 'text-slate-700' },
    {
      label: product.active ? 'Deactivate' : 'Activate',
      icon: PowerIcon,
      action: onToggle,
      tone: 'text-slate-700'
    },
    { label: 'Delete', icon: Trash2Icon, action: onDelete, tone: 'text-red-600' }
  ];

  return (
    <div className="relative inline-block" onClick={(e) => e.stopPropagation()}>
      <button
        aria-label={`Actions for ${product.name}`}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
      >
        <MoreVerticalIcon className="h-4 w-4" />
      </button>
      {open && (
        <>
          <button
            className="fixed inset-0 z-30 cursor-default"
            aria-hidden="true"
            tabIndex={-1}
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-40 mt-1 w-40 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-pop">
            {items.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  item.action();
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-slate-50 ${item.tone}`}
              >
                <item.icon className="h-3.5 w-3.5" aria-hidden="true" />
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}