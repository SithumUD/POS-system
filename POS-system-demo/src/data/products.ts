import { Product, CategoryName, StockState, BranchId, UnitOfMeasure } from '../types';
import { minutesAgo } from '../utils/time';

export const TAX_RATE = 0.1;

export const categories: CategoryName[] = [
  'Beverages',
  'Snacks',
  'Dairy',
  'Household',
  'Bakery',
  'Frozen',
  'Personal Care',
  'Stationery',
  'Electronics'
];

export const units = ['Bottle', 'Can', 'Pack', 'Carton', 'Cup', 'Jar', 'Loaf', 'Bag', 'Block', 'Tube', 'Tub', 'Each', 'Box', 'Roll', 'Piece'];

export const categoryColors: Record<string, { bg: string; text: string; block: string }> = {
  Beverages: { bg: 'bg-sky-50', text: 'text-sky-700', block: 'bg-sky-100 text-sky-600' },
  Snacks: { bg: 'bg-amber-50', text: 'text-amber-700', block: 'bg-amber-100 text-amber-600' },
  Dairy: { bg: 'bg-indigo-50', text: 'text-indigo-700', block: 'bg-indigo-100 text-indigo-600' },
  Household: { bg: 'bg-teal-50', text: 'text-teal-700', block: 'bg-teal-100 text-teal-600' },
  Bakery: { bg: 'bg-orange-50', text: 'text-orange-700', block: 'bg-orange-100 text-orange-600' },
  Frozen: { bg: 'bg-cyan-50', text: 'text-cyan-700', block: 'bg-cyan-100 text-cyan-600' },
  'Personal Care': { bg: 'bg-pink-50', text: 'text-pink-700', block: 'bg-pink-100 text-pink-600' },
  Stationery: { bg: 'bg-violet-50', text: 'text-violet-700', block: 'bg-violet-100 text-violet-600' },
  Electronics: { bg: 'bg-emerald-50', text: 'text-emerald-700', block: 'bg-emerald-100 text-emerald-600' },
};

export function stockState(qty: number, threshold: number): StockState {
  if (qty <= 0) return 'out-of-stock';
  if (qty <= threshold) return 'low-stock';
  return 'in-stock';
}

export function totalStock(product: Product, branches?: { id: string; slug?: string }[]): number {
  if (!product) return 0;
  if (branches && branches.length > 0) {
    return branches.reduce((sum, b) => {
      const bKey = b.slug || b.id;
      const qty = product.stock?.[bKey] ?? product.stock?.[b.id] ?? (product.stock as any)?.[bKey.toLowerCase()] ?? 0;
      return sum + qty;
    }, 0);
  }
  if (!product.stock) return (product as any).totalQuantity ?? 0;
  const keys = Object.keys(product.stock);
  if (keys.length === 0) return (product as any).totalQuantity ?? 0;
  const slugKeys = keys.filter((k) => !k.includes('-'));
  if (slugKeys.length > 0) {
    return slugKeys.reduce((sum, k) => sum + (product.stock[k] || 0), 0);
  }
  return keys.reduce((sum, k) => sum + (product.stock[k] || 0), 0);
}

// colombo, kandy, galle, negombo, matara
function stock(colombo: number, kandy: number, galle: number, negombo: number, matara: number): Record<BranchId, number> {
  return { colombo, kandy, galle, negombo, matara };
}

function catSummary(name: string) {
  return { id: `cat-${name.toLowerCase().replace(/\s+/g, '-')}`, name, slug: name.toLowerCase().replace(/\s+/g, '-') };
}

function suppSummary(id: string, name: string) {
  return { id, name };
}

export const seedProducts: Product[] = [
  // ─────────────────────────── BEVERAGES (20 products) ───────────────────────────
  {
    id: 'p-001', name: 'Coca-Cola 400ml', sku: 'BEV-CC-400', barcode: '4792024011234',
    category: catSummary('Beverages'), unitPrice: 180, costPrice: 132, taxRate: 10,
    reorderThreshold: 12, unitOfMeasure: 'BOTTLE', unitLabel: 'Bottle',
    imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=300&q=80',
    preferredSupplier: suppSummary('s-1', 'Ceylon Beverages Distributors'),
    stock: stock(42, 28, 19, 34, 15), active: true,
    createdAt: '2025-01-10T09:00:00Z', updatedAt: minutesAgo(4)
  },
  {
    id: 'p-002', name: 'Elephant House Cream Soda 1L', sku: 'BEV-EH-1000', barcode: '4792024015571',
    category: catSummary('Beverages'), unitPrice: 320, costPrice: 244, taxRate: 10,
    reorderThreshold: 10, unitOfMeasure: 'BOTTLE', unitLabel: 'Bottle', imageUrl: null,
    preferredSupplier: suppSummary('s-1', 'Ceylon Beverages Distributors'),
    stock: stock(6, 14, 6, 18, 8), active: true,
    createdAt: '2025-01-10T09:00:00Z', updatedAt: minutesAgo(52)
  },
  {
    id: 'p-003', name: 'Nescafé Gold 200g', sku: 'BEV-NG-200', barcode: '7613036712095',
    category: catSummary('Beverages'), unitPrice: 2450, costPrice: 1980, taxRate: 10,
    reorderThreshold: 8, unitOfMeasure: 'PCS', unitLabel: 'Jar', imageUrl: null,
    preferredSupplier: suppSummary('s-3', 'Unilever Consumer Distribution'),
    stock: stock(18, 9, 4, 12, 6), active: true,
    createdAt: '2025-01-10T09:00:00Z', updatedAt: minutesAgo(180)
  },
  {
    id: 'p-004', name: 'Lipton Ceylon Tea 100 Bags', sku: 'BEV-LT-100', barcode: '4792085006618',
    category: catSummary('Beverages'), unitPrice: 890, costPrice: 705, taxRate: 10,
    reorderThreshold: 10, unitOfMeasure: 'PACK', unitLabel: 'Pack', imageUrl: null,
    preferredSupplier: suppSummary('s-3', 'Unilever Consumer Distribution'),
    stock: stock(27, 21, 12, 22, 14), active: true,
    createdAt: '2025-01-10T09:00:00Z', updatedAt: minutesAgo(320)
  },
  {
    id: 'p-017', name: 'Nestlé Milo 400g', sku: 'BEV-NM-400', barcode: '7613036519847',
    category: catSummary('Beverages'), unitPrice: 1290, costPrice: 1010, taxRate: 10,
    reorderThreshold: 10, unitOfMeasure: 'PACK', unitLabel: 'Pack', imageUrl: null,
    preferredSupplier: suppSummary('s-3', 'Unilever Consumer Distribution'),
    stock: stock(24, 15, 10, 20, 9), active: true,
    createdAt: '2025-01-10T09:00:00Z', updatedAt: minutesAgo(500)
  },
  {
    id: 'p-018', name: 'Smak Mixed Fruit Juice 1L', sku: 'BEV-SM-1000', barcode: '4791105002289',
    category: catSummary('Beverages'), unitPrice: 480, costPrice: 372, taxRate: 10,
    reorderThreshold: 10, unitOfMeasure: 'BOX', unitLabel: 'Carton', imageUrl: null,
    preferredSupplier: suppSummary('s-1', 'Ceylon Beverages Distributors'),
    stock: stock(17, 8, 3, 14, 5), active: true,
    createdAt: '2025-01-10T09:00:00Z', updatedAt: minutesAgo(560)
  },
  {
    id: 'p-025', name: 'Elephant House Ginger Beer 400ml', sku: 'BEV-GB-400', barcode: '4792024022341',
    category: catSummary('Beverages'), unitPrice: 160, costPrice: 118, taxRate: 10,
    reorderThreshold: 15, unitOfMeasure: 'BOTTLE', unitLabel: 'Bottle', imageUrl: null,
    preferredSupplier: suppSummary('s-1', 'Ceylon Beverages Distributors'),
    stock: stock(55, 32, 20, 40, 18), active: true,
    createdAt: '2025-01-12T09:00:00Z', updatedAt: minutesAgo(90)
  },
  {
    id: 'p-026', name: 'Red Bull Energy Drink 250ml', sku: 'BEV-RB-250', barcode: '9002490100070',
    category: catSummary('Beverages'), unitPrice: 590, costPrice: 450, taxRate: 10,
    reorderThreshold: 8, unitOfMeasure: 'BOTTLE', unitLabel: 'Can', imageUrl: null,
    preferredSupplier: suppSummary('s-8', 'Metro Imports (Pvt) Ltd'),
    stock: stock(30, 18, 10, 25, 8), active: true,
    createdAt: '2025-01-15T09:00:00Z', updatedAt: minutesAgo(210)
  },
  {
    id: 'p-027', name: 'Nestomalt 500g', sku: 'BEV-NM-500', barcode: '4792024066118',
    category: catSummary('Beverages'), unitPrice: 760, costPrice: 590, taxRate: 10,
    reorderThreshold: 8, unitOfMeasure: 'PACK', unitLabel: 'Pack', imageUrl: null,
    preferredSupplier: suppSummary('s-7', 'Cargills Food City Distributors'),
    stock: stock(20, 14, 9, 16, 7), active: true,
    createdAt: '2025-01-20T09:00:00Z', updatedAt: minutesAgo(340)
  },
  {
    id: 'p-028', name: 'Beli Mal Herbal Drink 330ml', sku: 'BEV-BM-330', barcode: '4791555009918',
    category: catSummary('Beverages'), unitPrice: 220, costPrice: 162, taxRate: 10,
    reorderThreshold: 10, unitOfMeasure: 'BOTTLE', unitLabel: 'Bottle', imageUrl: null,
    preferredSupplier: suppSummary('s-7', 'Cargills Food City Distributors'),
    stock: stock(38, 22, 14, 30, 12), active: true,
    createdAt: '2025-02-01T09:00:00Z', updatedAt: minutesAgo(420)
  },
  {
    id: 'p-029', name: 'Sprite 400ml', sku: 'BEV-SP-400', barcode: '4792024033412',
    category: catSummary('Beverages'), unitPrice: 180, costPrice: 132, taxRate: 10,
    reorderThreshold: 12, unitOfMeasure: 'BOTTLE', unitLabel: 'Bottle', imageUrl: null,
    preferredSupplier: suppSummary('s-1', 'Ceylon Beverages Distributors'),
    stock: stock(40, 25, 15, 32, 14), active: true,
    createdAt: '2025-02-05T09:00:00Z', updatedAt: minutesAgo(480)
  },
  {
    id: 'p-030', name: 'Fanta Orange 400ml', sku: 'BEV-FA-400', barcode: '4792024044523',
    category: catSummary('Beverages'), unitPrice: 180, costPrice: 132, taxRate: 10,
    reorderThreshold: 12, unitOfMeasure: 'BOTTLE', unitLabel: 'Bottle', imageUrl: null,
    preferredSupplier: suppSummary('s-1', 'Ceylon Beverages Distributors'),
    stock: stock(35, 20, 12, 28, 11), active: true,
    createdAt: '2025-02-10T09:00:00Z', updatedAt: minutesAgo(540)
  },
  {
    id: 'p-031', name: 'Dilmah Premium Tea 100 Bags', sku: 'BEV-DL-100', barcode: '4792033012345',
    category: catSummary('Beverages'), unitPrice: 1150, costPrice: 890, taxRate: 10,
    reorderThreshold: 8, unitOfMeasure: 'PACK', unitLabel: 'Pack', imageUrl: null,
    preferredSupplier: suppSummary('s-3', 'Unilever Consumer Distribution'),
    stock: stock(22, 16, 8, 18, 10), active: true,
    createdAt: '2025-02-15T09:00:00Z', updatedAt: minutesAgo(600)
  },
  {
    id: 'p-032', name: 'Kandos Hot Chocolate 400g', sku: 'BEV-KH-400', barcode: '4791234562233',
    category: catSummary('Beverages'), unitPrice: 1480, costPrice: 1140, taxRate: 10,
    reorderThreshold: 6, unitOfMeasure: 'PACK', unitLabel: 'Pack', imageUrl: null,
    preferredSupplier: suppSummary('s-7', 'Cargills Food City Distributors'),
    stock: stock(14, 9, 5, 11, 4), active: true,
    createdAt: '2025-03-01T09:00:00Z', updatedAt: minutesAgo(660)
  },
  {
    id: 'p-033', name: 'Kist Mango Nectar 1L', sku: 'BEV-KM-1000', barcode: '4791105011188',
    category: catSummary('Beverages'), unitPrice: 520, costPrice: 398, taxRate: 10,
    reorderThreshold: 10, unitOfMeasure: 'BOX', unitLabel: 'Carton', imageUrl: null,
    preferredSupplier: suppSummary('s-7', 'Cargills Food City Distributors'),
    stock: stock(28, 17, 9, 22, 8), active: true,
    createdAt: '2025-03-10T09:00:00Z', updatedAt: minutesAgo(720)
  },
  {
    id: 'p-034', name: 'Coke Zero 400ml', sku: 'BEV-CZ-400', barcode: '4792024055634',
    category: catSummary('Beverages'), unitPrice: 190, costPrice: 140, taxRate: 10,
    reorderThreshold: 10, unitOfMeasure: 'BOTTLE', unitLabel: 'Bottle', imageUrl: null,
    preferredSupplier: suppSummary('s-1', 'Ceylon Beverages Distributors'),
    stock: stock(28, 16, 8, 22, 9), active: true,
    createdAt: '2025-03-15T09:00:00Z', updatedAt: minutesAgo(780)
  },
  {
    id: 'p-035', name: 'Nescafé Classic 100g', sku: 'BEV-NC-100', barcode: '7613036519854',
    category: catSummary('Beverages'), unitPrice: 1290, costPrice: 990, taxRate: 10,
    reorderThreshold: 8, unitOfMeasure: 'PCS', unitLabel: 'Jar', imageUrl: null,
    preferredSupplier: suppSummary('s-3', 'Unilever Consumer Distribution'),
    stock: stock(16, 10, 6, 12, 5), active: true,
    createdAt: '2025-03-20T09:00:00Z', updatedAt: minutesAgo(840)
  },
  {
    id: 'p-036', name: 'Pepsi 400ml', sku: 'BEV-PE-400', barcode: '4897029300181',
    category: catSummary('Beverages'), unitPrice: 175, costPrice: 128, taxRate: 10,
    reorderThreshold: 12, unitOfMeasure: 'BOTTLE', unitLabel: 'Bottle', imageUrl: null,
    preferredSupplier: suppSummary('s-8', 'Metro Imports (Pvt) Ltd'),
    stock: stock(32, 18, 11, 26, 10), active: true,
    createdAt: '2025-04-01T09:00:00Z', updatedAt: minutesAgo(900)
  },
  {
    id: 'p-037', name: '7UP 400ml', sku: 'BEV-7U-400', barcode: '4897029300198',
    category: catSummary('Beverages'), unitPrice: 175, costPrice: 128, taxRate: 10,
    reorderThreshold: 10, unitOfMeasure: 'BOTTLE', unitLabel: 'Bottle', imageUrl: null,
    preferredSupplier: suppSummary('s-8', 'Metro Imports (Pvt) Ltd'),
    stock: stock(25, 14, 9, 20, 8), active: true,
    createdAt: '2025-04-05T09:00:00Z', updatedAt: minutesAgo(960)
  },
  {
    id: 'p-038', name: 'Sera Pineapple Drink 1L', sku: 'BEV-SR-1000', barcode: '4791105022277',
    category: catSummary('Beverages'), unitPrice: 460, costPrice: 352, taxRate: 10,
    reorderThreshold: 8, unitOfMeasure: 'BOX', unitLabel: 'Carton', imageUrl: null,
    preferredSupplier: suppSummary('s-7', 'Cargills Food City Distributors'),
    stock: stock(19, 12, 7, 15, 6), active: true,
    createdAt: '2025-04-10T09:00:00Z', updatedAt: minutesAgo(1020)
  },

  // ─────────────────────────── SNACKS (15 products) ───────────────────────────
  {
    id: 'p-005', name: 'Munchee Cream Crackers 190g', sku: 'SNK-MC-190', barcode: '4792063005029',
    category: catSummary('Snacks'), unitPrice: 240, costPrice: 178, taxRate: 10,
    reorderThreshold: 15, unitOfMeasure: 'PACK', unitLabel: 'Pack', imageUrl: null,
    preferredSupplier: suppSummary('s-4', 'Local Bakers Collective'),
    stock: stock(63, 40, 22, 50, 20), active: true,
    createdAt: '2025-01-10T09:00:00Z', updatedAt: minutesAgo(21)
  },
  {
    id: 'p-006', name: 'Maliban Chocolate Puff 200g', sku: 'SNK-MB-200', barcode: '4792063118217',
    category: catSummary('Snacks'), unitPrice: 310, costPrice: 238, taxRate: 10,
    reorderThreshold: 12, unitOfMeasure: 'PACK', unitLabel: 'Pack', imageUrl: null,
    preferredSupplier: suppSummary('s-4', 'Local Bakers Collective'),
    stock: stock(4, 18, 4, 12, 6), active: true,
    createdAt: '2025-01-10T09:00:00Z', updatedAt: minutesAgo(140)
  },
  {
    id: 'p-007', name: "Lay's Classic Salted 90g", sku: 'SNK-LC-090', barcode: '4897029301188',
    category: catSummary('Snacks'), unitPrice: 420, costPrice: 330, taxRate: 10,
    reorderThreshold: 10, unitOfMeasure: 'PACK', unitLabel: 'Pack', imageUrl: null,
    preferredSupplier: suppSummary('s-3', 'Unilever Consumer Distribution'),
    stock: stock(31, 16, 11, 24, 9), active: true,
    createdAt: '2025-01-10T09:00:00Z', updatedAt: minutesAgo(400)
  },
  {
    id: 'p-019', name: 'Tiara Marie Biscuits 200g', sku: 'SNK-TM-200', barcode: '4792063220118',
    category: catSummary('Snacks'), unitPrice: 185, costPrice: 134, taxRate: 10,
    reorderThreshold: 15, unitOfMeasure: 'PACK', unitLabel: 'Pack', imageUrl: null,
    preferredSupplier: suppSummary('s-4', 'Local Bakers Collective'),
    stock: stock(46, 30, 21, 38, 18), active: true,
    createdAt: '2025-01-10T09:00:00Z', updatedAt: minutesAgo(610)
  },
  {
    id: 'p-039', name: 'Munchee Super Cream Cracker 190g', sku: 'SNK-MU-190', barcode: '4792063005036',
    category: catSummary('Snacks'), unitPrice: 260, costPrice: 192, taxRate: 10,
    reorderThreshold: 15, unitOfMeasure: 'PACK', unitLabel: 'Pack', imageUrl: null,
    preferredSupplier: suppSummary('s-4', 'Local Bakers Collective'),
    stock: stock(48, 34, 19, 40, 16), active: true,
    createdAt: '2025-02-01T09:00:00Z', updatedAt: minutesAgo(660)
  },
  {
    id: 'p-040', name: 'Pringles Original 110g', sku: 'SNK-PR-110', barcode: '5053990104963',
    category: catSummary('Snacks'), unitPrice: 980, costPrice: 750, taxRate: 10,
    reorderThreshold: 6, unitOfMeasure: 'PACK', unitLabel: 'Pack', imageUrl: null,
    preferredSupplier: suppSummary('s-8', 'Metro Imports (Pvt) Ltd'),
    stock: stock(22, 12, 7, 18, 5), active: true,
    createdAt: '2025-02-10T09:00:00Z', updatedAt: minutesAgo(720)
  },
  {
    id: 'p-041', name: 'Kandos Milk Chocolate Bar 50g', sku: 'SNK-KB-050', barcode: '4791234500069',
    category: catSummary('Snacks'), unitPrice: 220, costPrice: 162, taxRate: 10,
    reorderThreshold: 20, unitOfMeasure: 'EACH', unitLabel: 'Each', imageUrl: null,
    preferredSupplier: suppSummary('s-7', 'Cargills Food City Distributors'),
    stock: stock(60, 42, 25, 50, 20), active: true,
    createdAt: '2025-02-15T09:00:00Z', updatedAt: minutesAgo(780)
  },
  {
    id: 'p-042', name: 'Maliban Milk Puff 200g', sku: 'SNK-MP-200', barcode: '4792063118224',
    category: catSummary('Snacks'), unitPrice: 290, costPrice: 218, taxRate: 10,
    reorderThreshold: 12, unitOfMeasure: 'PACK', unitLabel: 'Pack', imageUrl: null,
    preferredSupplier: suppSummary('s-4', 'Local Bakers Collective'),
    stock: stock(35, 22, 14, 28, 11), active: true,
    createdAt: '2025-03-01T09:00:00Z', updatedAt: minutesAgo(840)
  },
  {
    id: 'p-043', name: 'Ritz Crackers 135g', sku: 'SNK-RT-135', barcode: '7622210949684',
    category: catSummary('Snacks'), unitPrice: 620, costPrice: 475, taxRate: 10,
    reorderThreshold: 8, unitOfMeasure: 'PACK', unitLabel: 'Pack', imageUrl: null,
    preferredSupplier: suppSummary('s-8', 'Metro Imports (Pvt) Ltd'),
    stock: stock(18, 11, 6, 14, 5), active: true,
    createdAt: '2025-03-10T09:00:00Z', updatedAt: minutesAgo(900)
  },
  {
    id: 'p-044', name: 'Roasted Peanuts 150g', sku: 'SNK-RP-150', barcode: '4791555011213',
    category: catSummary('Snacks'), unitPrice: 280, costPrice: 205, taxRate: 10,
    reorderThreshold: 10, unitOfMeasure: 'PACK', unitLabel: 'Pack', imageUrl: null,
    preferredSupplier: suppSummary('s-9', 'Kelani Valley Agro Products'),
    stock: stock(42, 28, 16, 35, 13), active: true,
    createdAt: '2025-03-15T09:00:00Z', updatedAt: minutesAgo(960)
  },
  {
    id: 'p-045', name: 'Oreo Original 119g', sku: 'SNK-OR-119', barcode: '7622210449481',
    category: catSummary('Snacks'), unitPrice: 550, costPrice: 420, taxRate: 10,
    reorderThreshold: 8, unitOfMeasure: 'PACK', unitLabel: 'Pack', imageUrl: null,
    preferredSupplier: suppSummary('s-8', 'Metro Imports (Pvt) Ltd'),
    stock: stock(24, 15, 8, 19, 7), active: true,
    createdAt: '2025-04-01T09:00:00Z', updatedAt: minutesAgo(1020)
  },
  {
    id: 'p-046', name: 'Sliced Bread Toast 400g', sku: 'SNK-SB-400', barcode: '4791020009920',
    category: catSummary('Snacks'), unitPrice: 210, costPrice: 155, taxRate: 10,
    reorderThreshold: 12, unitOfMeasure: 'PACK', unitLabel: 'Pack', imageUrl: null,
    preferredSupplier: suppSummary('s-4', 'Local Bakers Collective'),
    stock: stock(30, 18, 10, 24, 9), active: true,
    createdAt: '2025-04-05T09:00:00Z', updatedAt: minutesAgo(1080)
  },
  {
    id: 'p-047', name: 'Ceylon Cashews 100g', sku: 'SNK-CW-100', barcode: '4791555022320',
    category: catSummary('Snacks'), unitPrice: 1250, costPrice: 960, taxRate: 10,
    reorderThreshold: 6, unitOfMeasure: 'PACK', unitLabel: 'Pack', imageUrl: null,
    preferredSupplier: suppSummary('s-9', 'Kelani Valley Agro Products'),
    stock: stock(15, 9, 4, 12, 4), active: true,
    createdAt: '2025-04-10T09:00:00Z', updatedAt: minutesAgo(1140)
  },
  {
    id: 'p-048', name: 'Digestive Biscuits 400g', sku: 'SNK-DB-400', barcode: '4792063330107',
    category: catSummary('Snacks'), unitPrice: 590, costPrice: 450, taxRate: 10,
    reorderThreshold: 8, unitOfMeasure: 'PACK', unitLabel: 'Pack', imageUrl: null,
    preferredSupplier: suppSummary('s-4', 'Local Bakers Collective'),
    stock: stock(20, 13, 7, 16, 6), active: true,
    createdAt: '2025-04-15T09:00:00Z', updatedAt: minutesAgo(1200)
  },
  {
    id: 'p-049', name: 'Tortilla Chips 90g', sku: 'SNK-TC-090', barcode: '4897029302185',
    category: catSummary('Snacks'), unitPrice: 380, costPrice: 290, taxRate: 10,
    reorderThreshold: 8, unitOfMeasure: 'PACK', unitLabel: 'Pack', imageUrl: null,
    preferredSupplier: suppSummary('s-8', 'Metro Imports (Pvt) Ltd'),
    stock: stock(18, 10, 6, 14, 5), active: true,
    createdAt: '2025-04-20T09:00:00Z', updatedAt: minutesAgo(1260)
  },

  // ─────────────────────────── DAIRY (10 products) ───────────────────────────
  {
    id: 'p-008', name: 'Anchor Full Cream Milk 1L', sku: 'DRY-AN-1000', barcode: '9415007023456',
    category: catSummary('Dairy'), unitPrice: 690, costPrice: 552, taxRate: 10,
    reorderThreshold: 12, unitOfMeasure: 'BOX', unitLabel: 'Carton', imageUrl: null,
    preferredSupplier: suppSummary('s-2', 'Fonterra Sri Lanka'),
    stock: stock(4, 26, 18, 8, 12), active: true,
    createdAt: '2025-01-10T09:00:00Z', updatedAt: minutesAgo(8)
  },
  {
    id: 'p-009', name: 'Highland Set Yoghurt 80g', sku: 'DRY-HL-080', barcode: '4791111027744',
    category: catSummary('Dairy'), unitPrice: 95, costPrice: 68, taxRate: 10,
    reorderThreshold: 24, unitOfMeasure: 'PCS', unitLabel: 'Cup', imageUrl: null,
    preferredSupplier: suppSummary('s-2', 'Fonterra Sri Lanka'),
    stock: stock(88, 54, 37, 70, 30), active: true,
    createdAt: '2025-01-10T09:00:00Z', updatedAt: minutesAgo(65)
  },
  {
    id: 'p-010', name: 'Kotmale Cheddar Cheese 200g', sku: 'DRY-KC-200', barcode: '4791111083122',
    category: catSummary('Dairy'), unitPrice: 1180, costPrice: 940, taxRate: 10,
    reorderThreshold: 8, unitOfMeasure: 'PCS', unitLabel: 'Block', imageUrl: null,
    preferredSupplier: suppSummary('s-2', 'Fonterra Sri Lanka'),
    stock: stock(0, 0, 6, 4, 2), active: true,
    createdAt: '2025-01-10T09:00:00Z', updatedAt: minutesAgo(95)
  },
  {
    id: 'p-020', name: 'Anchor Butter 227g', sku: 'DRY-AB-227', barcode: '9415007044512',
    category: catSummary('Dairy'), unitPrice: 1020, costPrice: 812, taxRate: 10,
    reorderThreshold: 8, unitOfMeasure: 'PCS', unitLabel: 'Block', imageUrl: null,
    preferredSupplier: suppSummary('s-2', 'Fonterra Sri Lanka'),
    stock: stock(13, 10, 7, 11, 5), active: true,
    createdAt: '2025-01-10T09:00:00Z', updatedAt: minutesAgo(700)
  },
  {
    id: 'p-050', name: 'Kotmale Full Cream Milk Powder 400g', sku: 'DRY-KM-400', barcode: '4791111100125',
    category: catSummary('Dairy'), unitPrice: 1480, costPrice: 1150, taxRate: 10,
    reorderThreshold: 8, unitOfMeasure: 'PACK', unitLabel: 'Pack', imageUrl: null,
    preferredSupplier: suppSummary('s-2', 'Fonterra Sri Lanka'),
    stock: stock(18, 12, 7, 14, 6), active: true,
    createdAt: '2025-02-01T09:00:00Z', updatedAt: minutesAgo(1320)
  },
  {
    id: 'p-051', name: 'Highlands Drinking Yoghurt 150ml', sku: 'DRY-HD-150', barcode: '4791111038741',
    category: catSummary('Dairy'), unitPrice: 140, costPrice: 100, taxRate: 10,
    reorderThreshold: 20, unitOfMeasure: 'BOTTLE', unitLabel: 'Bottle', imageUrl: null,
    preferredSupplier: suppSummary('s-2', 'Fonterra Sri Lanka'),
    stock: stock(60, 40, 25, 48, 20), active: true,
    createdAt: '2025-02-10T09:00:00Z', updatedAt: minutesAgo(1380)
  },
  {
    id: 'p-052', name: 'Pelwatte Dairy Butter 227g', sku: 'DRY-PB-227', barcode: '4791234512217',
    category: catSummary('Dairy'), unitPrice: 980, costPrice: 780, taxRate: 10,
    reorderThreshold: 8, unitOfMeasure: 'PCS', unitLabel: 'Block', imageUrl: null,
    preferredSupplier: suppSummary('s-10', 'Pelwatte Agri Industries'),
    stock: stock(10, 8, 4, 9, 3), active: true,
    createdAt: '2025-02-15T09:00:00Z', updatedAt: minutesAgo(1440)
  },
  {
    id: 'p-053', name: 'Milac Sliced Cheese 200g', sku: 'DRY-MS-200', barcode: '4791234523314',
    category: catSummary('Dairy'), unitPrice: 1120, costPrice: 890, taxRate: 10,
    reorderThreshold: 6, unitOfMeasure: 'PCS', unitLabel: 'Pack', imageUrl: null,
    preferredSupplier: suppSummary('s-10', 'Pelwatte Agri Industries'),
    stock: stock(8, 5, 3, 6, 2), active: true,
    createdAt: '2025-03-01T09:00:00Z', updatedAt: minutesAgo(1500)
  },
  {
    id: 'p-054', name: 'Anchor UHT Full Cream 200ml', sku: 'DRY-AU-200', barcode: '9415007034513',
    category: catSummary('Dairy'), unitPrice: 280, costPrice: 210, taxRate: 10,
    reorderThreshold: 15, unitOfMeasure: 'BOX', unitLabel: 'Carton', imageUrl: null,
    preferredSupplier: suppSummary('s-2', 'Fonterra Sri Lanka'),
    stock: stock(45, 30, 18, 38, 15), active: true,
    createdAt: '2025-03-10T09:00:00Z', updatedAt: minutesAgo(1560)
  },
  {
    id: 'p-055', name: 'Creamline Fresh Milk 500ml', sku: 'DRY-CF-500', barcode: '4791555030225',
    category: catSummary('Dairy'), unitPrice: 320, costPrice: 238, taxRate: 10,
    reorderThreshold: 12, unitOfMeasure: 'BOTTLE', unitLabel: 'Bottle', imageUrl: null,
    preferredSupplier: suppSummary('s-10', 'Pelwatte Agri Industries'),
    stock: stock(25, 15, 9, 20, 8), active: true,
    createdAt: '2025-03-15T09:00:00Z', updatedAt: minutesAgo(1620)
  },

  // ─────────────────────────── HOUSEHOLD (12 products) ───────────────────────────
  {
    id: 'p-011', name: 'Signal Toothpaste 120g', sku: 'HHD-SG-120', barcode: '8710908662249',
    category: catSummary('Household'), unitPrice: 460, costPrice: 351, taxRate: 10,
    reorderThreshold: 15, unitOfMeasure: 'PCS', unitLabel: 'Tube', imageUrl: null,
    preferredSupplier: suppSummary('s-3', 'Unilever Consumer Distribution'),
    stock: stock(54, 33, 25, 44, 20), active: true,
    createdAt: '2025-01-10T09:00:00Z', updatedAt: minutesAgo(150)
  },
  {
    id: 'p-012', name: 'Sunlight Detergent Powder 1kg', sku: 'HHD-SL-1000', barcode: '8710908114458',
    category: catSummary('Household'), unitPrice: 720, costPrice: 566, taxRate: 10,
    reorderThreshold: 10, unitOfMeasure: 'PACK', unitLabel: 'Pack', imageUrl: null,
    preferredSupplier: suppSummary('s-6', 'Lanka Household Supplies'),
    stock: stock(22, 19, 14, 18, 10), active: true,
    createdAt: '2025-01-10T09:00:00Z', updatedAt: minutesAgo(240)
  },
  {
    id: 'p-013', name: 'Keells Basmati Rice 5kg', sku: 'HHD-KB-5000', barcode: '4791234500052',
    category: catSummary('Household'), unitPrice: 3250, costPrice: 2780, taxRate: 10,
    reorderThreshold: 6, unitOfMeasure: 'KG', unitLabel: 'Bag', imageUrl: null,
    preferredSupplier: suppSummary('s-5', 'Kandy Fresh Produce Co.'),
    stock: stock(15, 11, 8, 12, 6), active: true,
    createdAt: '2025-01-10T09:00:00Z', updatedAt: minutesAgo(300)
  },
  {
    id: 'p-021', name: 'Harpic Toilet Cleaner 500ml', sku: 'HHD-HP-500', barcode: '8901396115519',
    category: catSummary('Household'), unitPrice: 640, costPrice: 498, taxRate: 10,
    reorderThreshold: 10, unitOfMeasure: 'BOTTLE', unitLabel: 'Bottle', imageUrl: null,
    preferredSupplier: suppSummary('s-6', 'Lanka Household Supplies'),
    stock: stock(29, 17, 12, 22, 9), active: true,
    createdAt: '2025-01-10T09:00:00Z', updatedAt: minutesAgo(760)
  },
  {
    id: 'p-056', name: 'Dettol Antiseptic Liquid 500ml', sku: 'HHD-DT-500', barcode: '6001108006117',
    category: catSummary('Household'), unitPrice: 1490, costPrice: 1145, taxRate: 10,
    reorderThreshold: 8, unitOfMeasure: 'BOTTLE', unitLabel: 'Bottle', imageUrl: null,
    preferredSupplier: suppSummary('s-6', 'Lanka Household Supplies'),
    stock: stock(24, 15, 9, 20, 7), active: true,
    createdAt: '2025-02-01T09:00:00Z', updatedAt: minutesAgo(1680)
  },
  {
    id: 'p-057', name: 'Surf Excel Washing Powder 1kg', sku: 'HHD-SF-1000', barcode: '8901030731846',
    category: catSummary('Household'), unitPrice: 890, costPrice: 685, taxRate: 10,
    reorderThreshold: 8, unitOfMeasure: 'PACK', unitLabel: 'Pack', imageUrl: null,
    preferredSupplier: suppSummary('s-3', 'Unilever Consumer Distribution'),
    stock: stock(20, 14, 8, 16, 6), active: true,
    createdAt: '2025-02-10T09:00:00Z', updatedAt: minutesAgo(1740)
  },
  {
    id: 'p-058', name: 'Mr. Muscle Kitchen Spray 500ml', sku: 'HHD-MM-500', barcode: '5000204660210',
    category: catSummary('Household'), unitPrice: 1280, costPrice: 980, taxRate: 10,
    reorderThreshold: 6, unitOfMeasure: 'BOTTLE', unitLabel: 'Bottle', imageUrl: null,
    preferredSupplier: suppSummary('s-6', 'Lanka Household Supplies'),
    stock: stock(14, 9, 5, 11, 4), active: true,
    createdAt: '2025-02-15T09:00:00Z', updatedAt: minutesAgo(1800)
  },
  {
    id: 'p-059', name: 'Vim Dishwash Bar 400g', sku: 'HHD-VM-400', barcode: '8901030800665',
    category: catSummary('Household'), unitPrice: 360, costPrice: 272, taxRate: 10,
    reorderThreshold: 12, unitOfMeasure: 'PCS', unitLabel: 'Bar', imageUrl: null,
    preferredSupplier: suppSummary('s-3', 'Unilever Consumer Distribution'),
    stock: stock(35, 24, 14, 28, 11), active: true,
    createdAt: '2025-03-01T09:00:00Z', updatedAt: minutesAgo(1860)
  },
  {
    id: 'p-060', name: 'Lanka Tissue Box 200 Sheets', sku: 'HHD-LT-200', barcode: '4791555040325',
    category: catSummary('Household'), unitPrice: 480, costPrice: 360, taxRate: 10,
    reorderThreshold: 10, unitOfMeasure: 'BOX', unitLabel: 'Box', imageUrl: null,
    preferredSupplier: suppSummary('s-6', 'Lanka Household Supplies'),
    stock: stock(28, 18, 10, 22, 8), active: true,
    createdAt: '2025-03-10T09:00:00Z', updatedAt: minutesAgo(1920)
  },
  {
    id: 'p-061', name: 'Comfort Blue Fabric Softener 1L', sku: 'HHD-CB-1000', barcode: '8901030920649',
    category: catSummary('Household'), unitPrice: 980, costPrice: 752, taxRate: 10,
    reorderThreshold: 6, unitOfMeasure: 'BOTTLE', unitLabel: 'Bottle', imageUrl: null,
    preferredSupplier: suppSummary('s-3', 'Unilever Consumer Distribution'),
    stock: stock(16, 10, 6, 13, 5), active: true,
    createdAt: '2025-03-15T09:00:00Z', updatedAt: minutesAgo(1980)
  },
  {
    id: 'p-062', name: 'Pettit White Washing Powder 2kg', sku: 'HHD-PW-2000', barcode: '4791555050424',
    category: catSummary('Household'), unitPrice: 1450, costPrice: 1110, taxRate: 10,
    reorderThreshold: 5, unitOfMeasure: 'PACK', unitLabel: 'Pack', imageUrl: null,
    preferredSupplier: suppSummary('s-6', 'Lanka Household Supplies'),
    stock: stock(12, 8, 4, 10, 4), active: true,
    createdAt: '2025-04-01T09:00:00Z', updatedAt: minutesAgo(2040)
  },
  {
    id: 'p-063', name: 'Clorox Bleach 500ml', sku: 'HHD-CL-500', barcode: '4800888004119',
    category: catSummary('Household'), unitPrice: 560, costPrice: 425, taxRate: 10,
    reorderThreshold: 8, unitOfMeasure: 'BOTTLE', unitLabel: 'Bottle', imageUrl: null,
    preferredSupplier: suppSummary('s-6', 'Lanka Household Supplies'),
    stock: stock(20, 13, 7, 16, 6), active: true,
    createdAt: '2025-04-10T09:00:00Z', updatedAt: minutesAgo(2100)
  },

  // ─────────────────────────── BAKERY (8 products) ───────────────────────────
  {
    id: 'p-014', name: 'Sandwich Bread Loaf 450g', sku: 'BAK-SB-450', barcode: '4791020009913',
    category: catSummary('Bakery'), unitPrice: 210, costPrice: 148, taxRate: 10,
    reorderThreshold: 20, unitOfMeasure: 'PCS', unitLabel: 'Loaf', imageUrl: null,
    preferredSupplier: suppSummary('s-4', 'Local Bakers Collective'),
    stock: stock(9, 9, 16, 12, 8), active: true,
    createdAt: '2025-01-10T09:00:00Z', updatedAt: minutesAgo(35)
  },
  {
    id: 'p-015', name: 'Butter Croissant (4 pack)', sku: 'BAK-BC-004', barcode: '4791020044716',
    category: catSummary('Bakery'), unitPrice: 640, costPrice: 470, taxRate: 10,
    reorderThreshold: 6, unitOfMeasure: 'PACK', unitLabel: 'Pack', imageUrl: null,
    preferredSupplier: suppSummary('s-4', 'Local Bakers Collective'),
    stock: stock(12, 7, 5, 10, 4), active: true,
    createdAt: '2025-01-10T09:00:00Z', updatedAt: minutesAgo(110)
  },
  {
    id: 'p-022', name: 'Seeduwa Coconut Roti (6 pack)', sku: 'BAK-CR-006', barcode: '4791020077417',
    category: catSummary('Bakery'), unitPrice: 380, costPrice: 268, taxRate: 10,
    reorderThreshold: 10, unitOfMeasure: 'PACK', unitLabel: 'Pack', imageUrl: null,
    preferredSupplier: suppSummary('s-4', 'Local Bakers Collective'),
    stock: stock(5, 4, 0, 8, 3), active: true,
    createdAt: '2025-01-10T09:00:00Z', updatedAt: minutesAgo(90)
  },
  {
    id: 'p-064', name: 'Chicken Bun', sku: 'BAK-CB-001', barcode: '4791020088514',
    category: catSummary('Bakery'), unitPrice: 120, costPrice: 82, taxRate: 10,
    reorderThreshold: 24, unitOfMeasure: 'EACH', unitLabel: 'Each', imageUrl: null,
    preferredSupplier: suppSummary('s-4', 'Local Bakers Collective'),
    stock: stock(30, 24, 18, 28, 15), active: true,
    createdAt: '2025-02-01T09:00:00Z', updatedAt: minutesAgo(2160)
  },
  {
    id: 'p-065', name: 'Cinnamon Roll (4 pack)', sku: 'BAK-CI-004', barcode: '4791020099611',
    category: catSummary('Bakery'), unitPrice: 560, costPrice: 398, taxRate: 10,
    reorderThreshold: 6, unitOfMeasure: 'PACK', unitLabel: 'Pack', imageUrl: null,
    preferredSupplier: suppSummary('s-4', 'Local Bakers Collective'),
    stock: stock(10, 6, 4, 8, 3), active: true,
    createdAt: '2025-02-10T09:00:00Z', updatedAt: minutesAgo(2220)
  },
  {
    id: 'p-066', name: 'Whole Wheat Bread 400g', sku: 'BAK-WW-400', barcode: '4791020110617',
    category: catSummary('Bakery'), unitPrice: 250, costPrice: 178, taxRate: 10,
    reorderThreshold: 15, unitOfMeasure: 'PCS', unitLabel: 'Loaf', imageUrl: null,
    preferredSupplier: suppSummary('s-4', 'Local Bakers Collective'),
    stock: stock(8, 5, 3, 7, 3), active: true,
    createdAt: '2025-02-15T09:00:00Z', updatedAt: minutesAgo(2280)
  },
  {
    id: 'p-067', name: 'Seeni Sambol Roll', sku: 'BAK-SS-001', barcode: '4791020121714',
    category: catSummary('Bakery'), unitPrice: 90, costPrice: 62, taxRate: 10,
    reorderThreshold: 20, unitOfMeasure: 'EACH', unitLabel: 'Each', imageUrl: null,
    preferredSupplier: suppSummary('s-4', 'Local Bakers Collective'),
    stock: stock(25, 18, 12, 20, 10), active: true,
    createdAt: '2025-03-01T09:00:00Z', updatedAt: minutesAgo(2340)
  },
  {
    id: 'p-068', name: 'Chocolate Muffin (2 pack)', sku: 'BAK-CM-002', barcode: '4791020132811',
    category: catSummary('Bakery'), unitPrice: 390, costPrice: 278, taxRate: 10,
    reorderThreshold: 6, unitOfMeasure: 'PACK', unitLabel: 'Pack', imageUrl: null,
    preferredSupplier: suppSummary('s-4', 'Local Bakers Collective'),
    stock: stock(12, 8, 4, 10, 4), active: true,
    createdAt: '2025-03-10T09:00:00Z', updatedAt: minutesAgo(2400)
  },

  // ─────────────────────────── FROZEN (6 products) ───────────────────────────
  {
    id: 'p-016', name: 'Elephant House Vanilla Ice Cream 1L', sku: 'FRZ-EH-1000', barcode: '4792024088776',
    category: catSummary('Frozen'), unitPrice: 1150, costPrice: 890, taxRate: 10,
    reorderThreshold: 8, unitOfMeasure: 'L', unitLabel: 'Tub', imageUrl: null,
    preferredSupplier: suppSummary('s-1', 'Ceylon Beverages Distributors'),
    stock: stock(20, 12, 9, 16, 7), active: true,
    createdAt: '2025-01-10T09:00:00Z', updatedAt: minutesAgo(420)
  },
  {
    id: 'p-023', name: 'Crescent Frozen Prawns 500g', sku: 'FRZ-CP-500', barcode: '4791550120043',
    category: catSummary('Frozen'), unitPrice: 2680, costPrice: 2190, taxRate: 10,
    reorderThreshold: 5, unitOfMeasure: 'PACK', unitLabel: 'Pack', imageUrl: null,
    preferredSupplier: suppSummary('s-5', 'Kandy Fresh Produce Co.'),
    stock: stock(11, 6, 4, 9, 3), active: true,
    createdAt: '2025-01-10T09:00:00Z', updatedAt: minutesAgo(820)
  },
  {
    id: 'p-024', name: 'Elephant House Chocolate Cone', sku: 'FRZ-EC-120', barcode: '4792024099117',
    category: catSummary('Frozen'), unitPrice: 260, costPrice: 194, taxRate: 10,
    reorderThreshold: 12, unitOfMeasure: 'EACH', unitLabel: 'Each', imageUrl: null,
    preferredSupplier: suppSummary('s-1', 'Ceylon Beverages Distributors'),
    stock: stock(0, 22, 15, 5, 8), active: false,
    createdAt: '2025-01-10T09:00:00Z', updatedAt: minutesAgo(1500)
  },
  {
    id: 'p-069', name: 'EH Strawberry Ice Cream 500ml', sku: 'FRZ-ES-500', barcode: '4792024110023',
    category: catSummary('Frozen'), unitPrice: 680, costPrice: 520, taxRate: 10,
    reorderThreshold: 8, unitOfMeasure: 'L', unitLabel: 'Tub', imageUrl: null,
    preferredSupplier: suppSummary('s-1', 'Ceylon Beverages Distributors'),
    stock: stock(14, 9, 6, 11, 5), active: true,
    createdAt: '2025-02-01T09:00:00Z', updatedAt: minutesAgo(2460)
  },
  {
    id: 'p-070', name: 'Serunuwara Frozen Chicken 1kg', sku: 'FRZ-FC-1000', barcode: '4791555061231',
    category: catSummary('Frozen'), unitPrice: 1890, costPrice: 1480, taxRate: 10,
    reorderThreshold: 6, unitOfMeasure: 'KG', unitLabel: 'Pack', imageUrl: null,
    preferredSupplier: suppSummary('s-11', 'Bairaha Farms Ltd'),
    stock: stock(18, 11, 7, 14, 6), active: true,
    createdAt: '2025-02-10T09:00:00Z', updatedAt: minutesAgo(2520)
  },
  {
    id: 'p-071', name: 'Frozen Vegetable Mix 500g', sku: 'FRZ-VM-500', barcode: '4791555072338',
    category: catSummary('Frozen'), unitPrice: 760, costPrice: 580, taxRate: 10,
    reorderThreshold: 6, unitOfMeasure: 'PACK', unitLabel: 'Pack', imageUrl: null,
    preferredSupplier: suppSummary('s-5', 'Kandy Fresh Produce Co.'),
    stock: stock(12, 8, 4, 10, 4), active: true,
    createdAt: '2025-02-15T09:00:00Z', updatedAt: minutesAgo(2580)
  },

  // ─────────────────────────── PERSONAL CARE (10 products) ───────────────────────────
  {
    id: 'p-072', name: 'Sunsilk Shampoo 200ml', sku: 'PRC-SH-200', barcode: '8901030771064',
    category: catSummary('Personal Care'), unitPrice: 590, costPrice: 452, taxRate: 10,
    reorderThreshold: 10, unitOfMeasure: 'BOTTLE', unitLabel: 'Bottle', imageUrl: null,
    preferredSupplier: suppSummary('s-3', 'Unilever Consumer Distribution'),
    stock: stock(28, 18, 10, 22, 8), active: true,
    createdAt: '2025-02-01T09:00:00Z', updatedAt: minutesAgo(2640)
  },
  {
    id: 'p-073', name: 'Dove Soap Bar 100g', sku: 'PRC-DV-100', barcode: '8901030700322',
    category: catSummary('Personal Care'), unitPrice: 340, costPrice: 258, taxRate: 10,
    reorderThreshold: 15, unitOfMeasure: 'PCS', unitLabel: 'Bar', imageUrl: null,
    preferredSupplier: suppSummary('s-3', 'Unilever Consumer Distribution'),
    stock: stock(50, 34, 20, 42, 16), active: true,
    createdAt: '2025-02-05T09:00:00Z', updatedAt: minutesAgo(2700)
  },
  {
    id: 'p-074', name: 'Ponds Cream 150ml', sku: 'PRC-PD-150', barcode: '8901030690920',
    category: catSummary('Personal Care'), unitPrice: 780, costPrice: 598, taxRate: 10,
    reorderThreshold: 8, unitOfMeasure: 'PCS', unitLabel: 'Jar', imageUrl: null,
    preferredSupplier: suppSummary('s-3', 'Unilever Consumer Distribution'),
    stock: stock(22, 14, 8, 18, 6), active: true,
    createdAt: '2025-02-10T09:00:00Z', updatedAt: minutesAgo(2760)
  },
  {
    id: 'p-075', name: 'Lux Beauty Soap 90g', sku: 'PRC-LX-090', barcode: '8901030610133',
    category: catSummary('Personal Care'), unitPrice: 220, costPrice: 162, taxRate: 10,
    reorderThreshold: 20, unitOfMeasure: 'PCS', unitLabel: 'Bar', imageUrl: null,
    preferredSupplier: suppSummary('s-3', 'Unilever Consumer Distribution'),
    stock: stock(65, 44, 25, 52, 20), active: true,
    createdAt: '2025-02-15T09:00:00Z', updatedAt: minutesAgo(2820)
  },
  {
    id: 'p-076', name: 'Colgate Toothpaste 150g', sku: 'PRC-CG-150', barcode: '8901314006840',
    category: catSummary('Personal Care'), unitPrice: 520, costPrice: 398, taxRate: 10,
    reorderThreshold: 12, unitOfMeasure: 'PCS', unitLabel: 'Tube', imageUrl: null,
    preferredSupplier: suppSummary('s-12', 'Procter & Gamble Lanka'),
    stock: stock(40, 26, 15, 32, 12), active: true,
    createdAt: '2025-03-01T09:00:00Z', updatedAt: minutesAgo(2880)
  },
  {
    id: 'p-077', name: 'Pantene Shampoo 170ml', sku: 'PRC-PT-170', barcode: '8006540204542',
    category: catSummary('Personal Care'), unitPrice: 640, costPrice: 490, taxRate: 10,
    reorderThreshold: 8, unitOfMeasure: 'BOTTLE', unitLabel: 'Bottle', imageUrl: null,
    preferredSupplier: suppSummary('s-12', 'Procter & Gamble Lanka'),
    stock: stock(20, 13, 7, 16, 6), active: true,
    createdAt: '2025-03-10T09:00:00Z', updatedAt: minutesAgo(2940)
  },
  {
    id: 'p-078', name: 'Vaseline Petroleum Jelly 100g', sku: 'PRC-VS-100', barcode: '8901030704849',
    category: catSummary('Personal Care'), unitPrice: 480, costPrice: 366, taxRate: 10,
    reorderThreshold: 8, unitOfMeasure: 'PCS', unitLabel: 'Jar', imageUrl: null,
    preferredSupplier: suppSummary('s-3', 'Unilever Consumer Distribution'),
    stock: stock(24, 15, 8, 19, 7), active: true,
    createdAt: '2025-03-15T09:00:00Z', updatedAt: minutesAgo(3000)
  },
  {
    id: 'p-079', name: 'Old Spice Deodorant 150ml', sku: 'PRC-OS-150', barcode: '8001841459974',
    category: catSummary('Personal Care'), unitPrice: 980, costPrice: 750, taxRate: 10,
    reorderThreshold: 6, unitOfMeasure: 'BOTTLE', unitLabel: 'Can', imageUrl: null,
    preferredSupplier: suppSummary('s-12', 'Procter & Gamble Lanka'),
    stock: stock(15, 9, 5, 12, 4), active: true,
    createdAt: '2025-04-01T09:00:00Z', updatedAt: minutesAgo(3060)
  },
  {
    id: 'p-080', name: 'Savlon Hand Wash 200ml', sku: 'PRC-SV-200', barcode: '6001108021011',
    category: catSummary('Personal Care'), unitPrice: 580, costPrice: 442, taxRate: 10,
    reorderThreshold: 8, unitOfMeasure: 'BOTTLE', unitLabel: 'Bottle', imageUrl: null,
    preferredSupplier: suppSummary('s-6', 'Lanka Household Supplies'),
    stock: stock(18, 12, 6, 14, 5), active: true,
    createdAt: '2025-04-05T09:00:00Z', updatedAt: minutesAgo(3120)
  },
  {
    id: 'p-081', name: 'Nivea Body Lotion 200ml', sku: 'PRC-NV-200', barcode: '4005808837007',
    category: catSummary('Personal Care'), unitPrice: 1380, costPrice: 1058, taxRate: 10,
    reorderThreshold: 6, unitOfMeasure: 'BOTTLE', unitLabel: 'Bottle', imageUrl: null,
    preferredSupplier: suppSummary('s-8', 'Metro Imports (Pvt) Ltd'),
    stock: stock(12, 8, 4, 10, 3), active: true,
    createdAt: '2025-04-10T09:00:00Z', updatedAt: minutesAgo(3180)
  },

  // ─────────────────────────── STATIONERY (9 products) ───────────────────────────
  {
    id: 'p-082', name: 'Bic Ballpoint Pen (12 pack)', sku: 'STN-BP-012', barcode: '0070330140124',
    category: catSummary('Stationery'), unitPrice: 580, costPrice: 440, taxRate: 10,
    reorderThreshold: 10, unitOfMeasure: 'PACK', unitLabel: 'Pack', imageUrl: null,
    preferredSupplier: suppSummary('s-13', 'Office Needs Lanka'),
    stock: stock(30, 20, 12, 24, 10), active: true,
    createdAt: '2025-03-01T09:00:00Z', updatedAt: minutesAgo(3240)
  },
  {
    id: 'p-083', name: 'Mead Composition Book A4', sku: 'STN-CB-A4', barcode: '0043100060240',
    category: catSummary('Stationery'), unitPrice: 290, costPrice: 215, taxRate: 10,
    reorderThreshold: 15, unitOfMeasure: 'EACH', unitLabel: 'Each', imageUrl: null,
    preferredSupplier: suppSummary('s-13', 'Office Needs Lanka'),
    stock: stock(45, 30, 18, 36, 14), active: true,
    createdAt: '2025-03-05T09:00:00Z', updatedAt: minutesAgo(3300)
  },
  {
    id: 'p-084', name: 'Stapler with 1000 Staples', sku: 'STN-SL-001', barcode: '4891003160418',
    category: catSummary('Stationery'), unitPrice: 980, costPrice: 748, taxRate: 10,
    reorderThreshold: 5, unitOfMeasure: 'EACH', unitLabel: 'Each', imageUrl: null,
    preferredSupplier: suppSummary('s-13', 'Office Needs Lanka'),
    stock: stock(12, 8, 4, 10, 3), active: true,
    createdAt: '2025-03-10T09:00:00Z', updatedAt: minutesAgo(3360)
  },
  {
    id: 'p-085', name: 'A4 Photocopy Paper 500 Sheets', sku: 'STN-AP-500', barcode: '4901480102916',
    category: catSummary('Stationery'), unitPrice: 2650, costPrice: 2020, taxRate: 10,
    reorderThreshold: 5, unitOfMeasure: 'PACK', unitLabel: 'Ream', imageUrl: null,
    preferredSupplier: suppSummary('s-13', 'Office Needs Lanka'),
    stock: stock(18, 12, 6, 14, 5), active: true,
    createdAt: '2025-03-15T09:00:00Z', updatedAt: minutesAgo(3420)
  },
  {
    id: 'p-086', name: 'Highlighter Pens (5 pack)', sku: 'STN-HP-005', barcode: '4007110086404',
    category: catSummary('Stationery'), unitPrice: 490, costPrice: 372, taxRate: 10,
    reorderThreshold: 8, unitOfMeasure: 'PACK', unitLabel: 'Pack', imageUrl: null,
    preferredSupplier: suppSummary('s-13', 'Office Needs Lanka'),
    stock: stock(20, 14, 8, 16, 6), active: true,
    createdAt: '2025-04-01T09:00:00Z', updatedAt: minutesAgo(3480)
  },
  {
    id: 'p-087', name: 'Scissors 21cm', sku: 'STN-SC-210', barcode: '4007110087005',
    category: catSummary('Stationery'), unitPrice: 350, costPrice: 262, taxRate: 10,
    reorderThreshold: 6, unitOfMeasure: 'EACH', unitLabel: 'Each', imageUrl: null,
    preferredSupplier: suppSummary('s-13', 'Office Needs Lanka'),
    stock: stock(14, 9, 5, 11, 4), active: true,
    createdAt: '2025-04-05T09:00:00Z', updatedAt: minutesAgo(3540)
  },
  {
    id: 'p-088', name: 'Glue Stick 40g', sku: 'STN-GS-040', barcode: '4007110110221',
    category: catSummary('Stationery'), unitPrice: 180, costPrice: 132, taxRate: 10,
    reorderThreshold: 10, unitOfMeasure: 'EACH', unitLabel: 'Each', imageUrl: null,
    preferredSupplier: suppSummary('s-13', 'Office Needs Lanka'),
    stock: stock(25, 16, 9, 20, 7), active: true,
    createdAt: '2025-04-10T09:00:00Z', updatedAt: minutesAgo(3600)
  },
  {
    id: 'p-089', name: 'Correction Fluid 20ml', sku: 'STN-CF-020', barcode: '0021200010223',
    category: catSummary('Stationery'), unitPrice: 220, costPrice: 162, taxRate: 10,
    reorderThreshold: 8, unitOfMeasure: 'EACH', unitLabel: 'Each', imageUrl: null,
    preferredSupplier: suppSummary('s-13', 'Office Needs Lanka'),
    stock: stock(18, 12, 6, 14, 5), active: true,
    createdAt: '2025-04-15T09:00:00Z', updatedAt: minutesAgo(3660)
  },
  {
    id: 'p-090', name: 'Ruler 30cm Plastic', sku: 'STN-RL-300', barcode: '4007110200022',
    category: catSummary('Stationery'), unitPrice: 120, costPrice: 85, taxRate: 10,
    reorderThreshold: 10, unitOfMeasure: 'EACH', unitLabel: 'Each', imageUrl: null,
    preferredSupplier: suppSummary('s-13', 'Office Needs Lanka'),
    stock: stock(30, 20, 12, 24, 9), active: true,
    createdAt: '2025-04-20T09:00:00Z', updatedAt: minutesAgo(3720)
  },

  // ─────────────────────────── ELECTRONICS (10 products) ───────────────────────────
  {
    id: 'p-091', name: 'Duracell AA Batteries (4 pack)', sku: 'ELC-DA-004', barcode: '5000394107519',
    category: catSummary('Electronics'), unitPrice: 680, costPrice: 520, taxRate: 10,
    reorderThreshold: 10, unitOfMeasure: 'PACK', unitLabel: 'Pack', imageUrl: null,
    preferredSupplier: suppSummary('s-8', 'Metro Imports (Pvt) Ltd'),
    stock: stock(35, 22, 13, 28, 10), active: true,
    createdAt: '2025-03-01T09:00:00Z', updatedAt: minutesAgo(3780)
  },
  {
    id: 'p-092', name: 'Panasonic AA Batteries (4 pack)', sku: 'ELC-PA-004', barcode: '5410853038979',
    category: catSummary('Electronics'), unitPrice: 580, costPrice: 440, taxRate: 10,
    reorderThreshold: 10, unitOfMeasure: 'PACK', unitLabel: 'Pack', imageUrl: null,
    preferredSupplier: suppSummary('s-8', 'Metro Imports (Pvt) Ltd'),
    stock: stock(28, 18, 10, 22, 8), active: true,
    createdAt: '2025-03-05T09:00:00Z', updatedAt: minutesAgo(3840)
  },
  {
    id: 'p-093', name: 'USB Type-C Charging Cable 1m', sku: 'ELC-UC-100', barcode: '6970185210812',
    category: catSummary('Electronics'), unitPrice: 990, costPrice: 755, taxRate: 10,
    reorderThreshold: 6, unitOfMeasure: 'EACH', unitLabel: 'Each', imageUrl: null,
    preferredSupplier: suppSummary('s-8', 'Metro Imports (Pvt) Ltd'),
    stock: stock(20, 14, 8, 16, 6), active: true,
    createdAt: '2025-03-10T09:00:00Z', updatedAt: minutesAgo(3900)
  },
  {
    id: 'p-094', name: 'Phone Screen Protector Universal', sku: 'ELC-SP-001', barcode: '6970185220811',
    category: catSummary('Electronics'), unitPrice: 650, costPrice: 495, taxRate: 10,
    reorderThreshold: 8, unitOfMeasure: 'EACH', unitLabel: 'Each', imageUrl: null,
    preferredSupplier: suppSummary('s-8', 'Metro Imports (Pvt) Ltd'),
    stock: stock(15, 10, 5, 12, 4), active: true,
    createdAt: '2025-03-15T09:00:00Z', updatedAt: minutesAgo(3960)
  },
  {
    id: 'p-095', name: 'Earphones with Mic 3.5mm', sku: 'ELC-EP-001', barcode: '6970185230819',
    category: catSummary('Electronics'), unitPrice: 1490, costPrice: 1140, taxRate: 10,
    reorderThreshold: 5, unitOfMeasure: 'EACH', unitLabel: 'Each', imageUrl: null,
    preferredSupplier: suppSummary('s-8', 'Metro Imports (Pvt) Ltd'),
    stock: stock(12, 8, 4, 10, 3), active: true,
    createdAt: '2025-04-01T09:00:00Z', updatedAt: minutesAgo(4020)
  },
  {
    id: 'p-096', name: 'Philips LED Bulb 9W', sku: 'ELC-PL-009', barcode: '8718696700662',
    category: catSummary('Electronics'), unitPrice: 880, costPrice: 670, taxRate: 10,
    reorderThreshold: 8, unitOfMeasure: 'EACH', unitLabel: 'Each', imageUrl: null,
    preferredSupplier: suppSummary('s-14', 'Electro Lanka Distributors'),
    stock: stock(24, 16, 9, 20, 7), active: true,
    createdAt: '2025-04-05T09:00:00Z', updatedAt: minutesAgo(4080)
  },
  {
    id: 'p-097', name: 'Extension Cord 3-Socket 3m', sku: 'ELC-EC-003', barcode: '4891003880415',
    category: catSummary('Electronics'), unitPrice: 1850, costPrice: 1415, taxRate: 10,
    reorderThreshold: 4, unitOfMeasure: 'EACH', unitLabel: 'Each', imageUrl: null,
    preferredSupplier: suppSummary('s-14', 'Electro Lanka Distributors'),
    stock: stock(10, 7, 3, 8, 3), active: true,
    createdAt: '2025-04-10T09:00:00Z', updatedAt: minutesAgo(4140)
  },
  {
    id: 'p-098', name: 'Calculator Casio FX-82', sku: 'ELC-CS-082', barcode: '4971850167990',
    category: catSummary('Electronics'), unitPrice: 4200, costPrice: 3210, taxRate: 10,
    reorderThreshold: 3, unitOfMeasure: 'EACH', unitLabel: 'Each', imageUrl: null,
    preferredSupplier: suppSummary('s-14', 'Electro Lanka Distributors'),
    stock: stock(6, 4, 2, 5, 2), active: true,
    createdAt: '2025-04-15T09:00:00Z', updatedAt: minutesAgo(4200)
  },
  {
    id: 'p-099', name: 'Wireless Mouse Basic', sku: 'ELC-WM-001', barcode: '5099206066113',
    category: catSummary('Electronics'), unitPrice: 2890, costPrice: 2210, taxRate: 10,
    reorderThreshold: 3, unitOfMeasure: 'EACH', unitLabel: 'Each', imageUrl: null,
    preferredSupplier: suppSummary('s-14', 'Electro Lanka Distributors'),
    stock: stock(5, 3, 2, 4, 2), active: true,
    createdAt: '2025-04-20T09:00:00Z', updatedAt: minutesAgo(4260)
  },
  {
    id: 'p-100', name: 'Power Bank 10000mAh', sku: 'ELC-PB-10K', barcode: '6970185240818',
    category: catSummary('Electronics'), unitPrice: 5990, costPrice: 4580, taxRate: 10,
    reorderThreshold: 3, unitOfMeasure: 'EACH', unitLabel: 'Each', imageUrl: null,
    preferredSupplier: suppSummary('s-8', 'Metro Imports (Pvt) Ltd'),
    stock: stock(8, 5, 3, 6, 2), active: true,
    createdAt: '2025-04-25T09:00:00Z', updatedAt: minutesAgo(4320)
  }
];

export const categoryTree = [
  {
    name: 'Beverages',
    children: [
      { name: 'Soft Drinks', count: 6 },
      { name: 'Juices & Nectar', count: 3 },
      { name: 'Tea & Coffee', count: 5 },
      { name: 'Energy Drinks', count: 2 },
      { name: 'Malt Drinks', count: 2 }
    ]
  },
  {
    name: 'Snacks',
    children: [
      { name: 'Biscuits', count: 6 },
      { name: 'Chips & Crisps', count: 3 },
      { name: 'Chocolates', count: 2 },
      { name: 'Nuts', count: 2 },
      { name: 'Bread', count: 2 }
    ]
  },
  {
    name: 'Dairy',
    children: [
      { name: 'Milk', count: 3 },
      { name: 'Yoghurt', count: 2 },
      { name: 'Cheese & Butter', count: 3 },
      { name: 'Milk Powder', count: 2 }
    ]
  },
  {
    name: 'Household',
    children: [
      { name: 'Cleaning', count: 5 },
      { name: 'Laundry', count: 3 },
      { name: 'Tissue & Paper', count: 2 },
      { name: 'Staples (Rice)', count: 2 }
    ]
  },
  {
    name: 'Bakery',
    children: [
      { name: 'Bread & Loaves', count: 3 },
      { name: 'Pastries & Buns', count: 3 },
      { name: 'Rolls', count: 2 }
    ]
  },
  {
    name: 'Frozen',
    children: [
      { name: 'Ice Cream', count: 3 },
      { name: 'Meat & Seafood', count: 2 },
      { name: 'Vegetables', count: 1 }
    ]
  },
  {
    name: 'Personal Care',
    children: [
      { name: 'Shampoo & Hair', count: 2 },
      { name: 'Soap & Body', count: 3 },
      { name: 'Oral Care', count: 2 },
      { name: 'Skincare', count: 2 },
      { name: 'Deodorant', count: 1 }
    ]
  },
  {
    name: 'Stationery',
    children: [
      { name: 'Pens & Pencils', count: 2 },
      { name: 'Paper & Books', count: 2 },
      { name: 'Office Tools', count: 5 }
    ]
  },
  {
    name: 'Electronics',
    children: [
      { name: 'Batteries', count: 2 },
      { name: 'Accessories', count: 4 },
      { name: 'Lighting', count: 1 },
      { name: 'Gadgets', count: 3 }
    ]
  }
];