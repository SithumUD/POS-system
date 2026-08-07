import { Product, CategoryName, StockState, BranchId, UnitOfMeasure } from '../types';
import { minutesAgo } from '../utils/time';

export const TAX_RATE = 0.1;

export const categories: CategoryName[] = [
  'Beverages',
  'Snacks',
  'Dairy',
  'Household',
  'Bakery',
  'Frozen'
];

export const units = ['Bottle', 'Can', 'Pack', 'Carton', 'Cup', 'Jar', 'Loaf', 'Bag', 'Block', 'Tube', 'Tub', 'Each'];

export const categoryColors: Record<CategoryName, { bg: string; text: string; block: string }> = {
  Beverages: { bg: 'bg-sky-50', text: 'text-sky-700', block: 'bg-sky-100 text-sky-600' },
  Snacks: { bg: 'bg-amber-50', text: 'text-amber-700', block: 'bg-amber-100 text-amber-600' },
  Dairy: { bg: 'bg-indigo-50', text: 'text-indigo-700', block: 'bg-indigo-100 text-indigo-600' },
  Household: { bg: 'bg-teal-50', text: 'text-teal-700', block: 'bg-teal-100 text-teal-600' },
  Bakery: { bg: 'bg-orange-50', text: 'text-orange-700', block: 'bg-orange-100 text-orange-600' },
  Frozen: { bg: 'bg-cyan-50', text: 'text-cyan-700', block: 'bg-cyan-100 text-cyan-600' }
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

function stock(colombo: number, kandy: number, galle: number): Record<BranchId, number> {
  return { colombo, kandy, galle };
}

function catSummary(name: CategoryName) {
  return { id: `cat-${name.toLowerCase()}`, name, slug: name.toLowerCase() };
}

function suppSummary(id: string, name: string) {
  return { id, name };
}

export const seedProducts: Product[] = [
  {
    id: 'p-001',
    name: 'Coca-Cola 400ml',
    sku: 'BEV-CC-400',
    barcode: '4792024011234',
    category: catSummary('Beverages'),
    unitPrice: 180,
    costPrice: 132,
    taxRate: 10,
    reorderThreshold: 12,
    unitOfMeasure: 'BOTTLE',
    unitLabel: 'Bottle',
    imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=300&q=80',
    preferredSupplier: suppSummary('s-1', 'Ceylon Beverages Distributors'),
    stock: stock(42, 28, 19),
    active: true,
    createdAt: '2025-01-10T09:00:00Z',
    updatedAt: minutesAgo(4)
  },
  {
    id: 'p-002',
    name: 'Elephant House Cream Soda 1L',
    sku: 'BEV-EH-1000',
    barcode: '4792024015571',
    category: catSummary('Beverages'),
    unitPrice: 320,
    costPrice: 244,
    taxRate: 10,
    reorderThreshold: 10,
    unitOfMeasure: 'BOTTLE',
    unitLabel: 'Bottle',
    imageUrl: null,
    preferredSupplier: suppSummary('s-1', 'Ceylon Beverages Distributors'),
    stock: stock(6, 14, 6),
    active: true,
    createdAt: '2025-01-10T09:00:00Z',
    updatedAt: minutesAgo(52)
  },
  {
    id: 'p-003',
    name: 'Nescafé Gold 200g',
    sku: 'BEV-NG-200',
    barcode: '7613036712095',
    category: catSummary('Beverages'),
    unitPrice: 2450,
    costPrice: 1980,
    taxRate: 10,
    reorderThreshold: 8,
    unitOfMeasure: 'PCS',
    unitLabel: 'Jar',
    imageUrl: null,
    preferredSupplier: suppSummary('s-3', 'Unilever Consumer Distribution'),
    stock: stock(18, 9, 4),
    active: true,
    createdAt: '2025-01-10T09:00:00Z',
    updatedAt: minutesAgo(180)
  },
  {
    id: 'p-004',
    name: 'Lipton Ceylon Tea 100 Bags',
    sku: 'BEV-LT-100',
    barcode: '4792085006618',
    category: catSummary('Beverages'),
    unitPrice: 890,
    costPrice: 705,
    taxRate: 10,
    reorderThreshold: 10,
    unitOfMeasure: 'PACK',
    unitLabel: 'Pack',
    imageUrl: null,
    preferredSupplier: suppSummary('s-3', 'Unilever Consumer Distribution'),
    stock: stock(27, 21, 12),
    active: true,
    createdAt: '2025-01-10T09:00:00Z',
    updatedAt: minutesAgo(320)
  },
  {
    id: 'p-005',
    name: 'Munchee Cream Crackers 190g',
    sku: 'SNK-MC-190',
    barcode: '4792063005029',
    category: catSummary('Snacks'),
    unitPrice: 240,
    costPrice: 178,
    taxRate: 10,
    reorderThreshold: 15,
    unitOfMeasure: 'PACK',
    unitLabel: 'Pack',
    imageUrl: null,
    preferredSupplier: suppSummary('s-4', 'Local Bakers Collective'),
    stock: stock(63, 40, 22),
    active: true,
    createdAt: '2025-01-10T09:00:00Z',
    updatedAt: minutesAgo(21)
  },
  {
    id: 'p-006',
    name: 'Maliban Chocolate Puff 200g',
    sku: 'SNK-MB-200',
    barcode: '4792063118217',
    category: catSummary('Snacks'),
    unitPrice: 310,
    costPrice: 238,
    taxRate: 10,
    reorderThreshold: 12,
    unitOfMeasure: 'PACK',
    unitLabel: 'Pack',
    imageUrl: null,
    preferredSupplier: suppSummary('s-4', 'Local Bakers Collective'),
    stock: stock(4, 18, 4),
    active: true,
    createdAt: '2025-01-10T09:00:00Z',
    updatedAt: minutesAgo(140)
  },
  {
    id: 'p-007',
    name: "Lay's Classic Salted 90g",
    sku: 'SNK-LC-090',
    barcode: '4897029301188',
    category: catSummary('Snacks'),
    unitPrice: 420,
    costPrice: 330,
    taxRate: 10,
    reorderThreshold: 10,
    unitOfMeasure: 'PACK',
    unitLabel: 'Pack',
    imageUrl: null,
    preferredSupplier: suppSummary('s-3', 'Unilever Consumer Distribution'),
    stock: stock(31, 16, 11),
    active: true,
    createdAt: '2025-01-10T09:00:00Z',
    updatedAt: minutesAgo(400)
  },
  {
    id: 'p-008',
    name: 'Anchor Full Cream Milk 1L',
    sku: 'DRY-AN-1000',
    barcode: '9415007023456',
    category: catSummary('Dairy'),
    unitPrice: 690,
    costPrice: 552,
    taxRate: 10,
    reorderThreshold: 12,
    unitOfMeasure: 'BOX',
    unitLabel: 'Carton',
    imageUrl: null,
    preferredSupplier: suppSummary('s-2', 'Fonterra Sri Lanka'),
    stock: stock(4, 26, 18),
    active: true,
    createdAt: '2025-01-10T09:00:00Z',
    updatedAt: minutesAgo(8)
  },
  {
    id: 'p-009',
    name: 'Highland Set Yoghurt 80g',
    sku: 'DRY-HL-080',
    barcode: '4791111027744',
    category: catSummary('Dairy'),
    unitPrice: 95,
    costPrice: 68,
    taxRate: 10,
    reorderThreshold: 24,
    unitOfMeasure: 'PCS',
    unitLabel: 'Cup',
    imageUrl: null,
    preferredSupplier: suppSummary('s-2', 'Fonterra Sri Lanka'),
    stock: stock(88, 54, 37),
    active: true,
    createdAt: '2025-01-10T09:00:00Z',
    updatedAt: minutesAgo(65)
  },
  {
    id: 'p-010',
    name: 'Kotmale Cheddar Cheese 200g',
    sku: 'DRY-KC-200',
    barcode: '4791111083122',
    category: catSummary('Dairy'),
    unitPrice: 1180,
    costPrice: 940,
    taxRate: 10,
    reorderThreshold: 8,
    unitOfMeasure: 'PCS',
    unitLabel: 'Block',
    imageUrl: null,
    preferredSupplier: suppSummary('s-2', 'Fonterra Sri Lanka'),
    stock: stock(0, 0, 6),
    active: true,
    createdAt: '2025-01-10T09:00:00Z',
    updatedAt: minutesAgo(95)
  },
  {
    id: 'p-011',
    name: 'Signal Toothpaste 120g',
    sku: 'HHD-SG-120',
    barcode: '8710908662249',
    category: catSummary('Household'),
    unitPrice: 460,
    costPrice: 351,
    taxRate: 10,
    reorderThreshold: 15,
    unitOfMeasure: 'PCS',
    unitLabel: 'Tube',
    imageUrl: null,
    preferredSupplier: suppSummary('s-3', 'Unilever Consumer Distribution'),
    stock: stock(54, 33, 25),
    active: true,
    createdAt: '2025-01-10T09:00:00Z',
    updatedAt: minutesAgo(150)
  },
  {
    id: 'p-012',
    name: 'Sunlight Detergent Powder 1kg',
    sku: 'HHD-SL-1000',
    barcode: '8710908114458',
    category: catSummary('Household'),
    unitPrice: 720,
    costPrice: 566,
    taxRate: 10,
    reorderThreshold: 10,
    unitOfMeasure: 'PACK',
    unitLabel: 'Pack',
    imageUrl: null,
    preferredSupplier: suppSummary('s-6', 'Lanka Household Supplies'),
    stock: stock(22, 19, 14),
    active: true,
    createdAt: '2025-01-10T09:00:00Z',
    updatedAt: minutesAgo(240)
  },
  {
    id: 'p-013',
    name: 'Keells Basmati Rice 5kg',
    sku: 'HHD-KB-5000',
    barcode: '4791234500052',
    category: catSummary('Household'),
    unitPrice: 3250,
    costPrice: 2780,
    taxRate: 10,
    reorderThreshold: 6,
    unitOfMeasure: 'KG',
    unitLabel: 'Bag',
    imageUrl: null,
    preferredSupplier: suppSummary('s-5', 'Kandy Fresh Produce Co.'),
    stock: stock(15, 11, 8),
    active: true,
    createdAt: '2025-01-10T09:00:00Z',
    updatedAt: minutesAgo(300)
  },
  {
    id: 'p-014',
    name: 'Sandwich Bread Loaf 450g',
    sku: 'BAK-SB-450',
    barcode: '4791020009913',
    category: catSummary('Bakery'),
    unitPrice: 210,
    costPrice: 148,
    taxRate: 10,
    reorderThreshold: 20,
    unitOfMeasure: 'PCS',
    unitLabel: 'Loaf',
    imageUrl: null,
    preferredSupplier: suppSummary('s-4', 'Local Bakers Collective'),
    stock: stock(9, 9, 16),
    active: true,
    createdAt: '2025-01-10T09:00:00Z',
    updatedAt: minutesAgo(35)
  },
  {
    id: 'p-015',
    name: 'Butter Croissant (4 pack)',
    sku: 'BAK-BC-004',
    barcode: '4791020044716',
    category: catSummary('Bakery'),
    unitPrice: 640,
    costPrice: 470,
    taxRate: 10,
    reorderThreshold: 6,
    unitOfMeasure: 'PACK',
    unitLabel: 'Pack',
    imageUrl: null,
    preferredSupplier: suppSummary('s-4', 'Local Bakers Collective'),
    stock: stock(12, 7, 5),
    active: true,
    createdAt: '2025-01-10T09:00:00Z',
    updatedAt: minutesAgo(110)
  },
  {
    id: 'p-016',
    name: 'Elephant House Vanilla Ice Cream 1L',
    sku: 'FRZ-EH-1000',
    barcode: '4792024088776',
    category: catSummary('Frozen'),
    unitPrice: 1150,
    costPrice: 890,
    taxRate: 10,
    reorderThreshold: 8,
    unitOfMeasure: 'L',
    unitLabel: 'Tub',
    imageUrl: null,
    preferredSupplier: suppSummary('s-1', 'Ceylon Beverages Distributors'),
    stock: stock(20, 12, 9),
    active: true,
    createdAt: '2025-01-10T09:00:00Z',
    updatedAt: minutesAgo(420)
  },
  {
    id: 'p-017',
    name: 'Nestlé Milo 400g',
    sku: 'BEV-NM-400',
    barcode: '7613036519847',
    category: catSummary('Beverages'),
    unitPrice: 1290,
    costPrice: 1010,
    taxRate: 10,
    reorderThreshold: 10,
    unitOfMeasure: 'PACK',
    unitLabel: 'Pack',
    imageUrl: null,
    preferredSupplier: suppSummary('s-3', 'Unilever Consumer Distribution'),
    stock: stock(24, 15, 10),
    active: true,
    createdAt: '2025-01-10T09:00:00Z',
    updatedAt: minutesAgo(500)
  },
  {
    id: 'p-018',
    name: 'Smak Mixed Fruit Juice 1L',
    sku: 'BEV-SM-1000',
    barcode: '4791105002289',
    category: catSummary('Beverages'),
    unitPrice: 480,
    costPrice: 372,
    taxRate: 10,
    reorderThreshold: 10,
    unitOfMeasure: 'BOX',
    unitLabel: 'Carton',
    imageUrl: null,
    preferredSupplier: suppSummary('s-1', 'Ceylon Beverages Distributors'),
    stock: stock(17, 8, 3),
    active: true,
    createdAt: '2025-01-10T09:00:00Z',
    updatedAt: minutesAgo(560)
  },
  {
    id: 'p-019',
    name: 'Tiara Marie Biscuits 200g',
    sku: 'SNK-TM-200',
    barcode: '4792063220118',
    category: catSummary('Snacks'),
    unitPrice: 185,
    costPrice: 134,
    taxRate: 10,
    reorderThreshold: 15,
    unitOfMeasure: 'PACK',
    unitLabel: 'Pack',
    imageUrl: null,
    preferredSupplier: suppSummary('s-4', 'Local Bakers Collective'),
    stock: stock(46, 30, 21),
    active: true,
    createdAt: '2025-01-10T09:00:00Z',
    updatedAt: minutesAgo(610)
  },
  {
    id: 'p-020',
    name: 'Anchor Butter 227g',
    sku: 'DRY-AB-227',
    barcode: '9415007044512',
    category: catSummary('Dairy'),
    unitPrice: 1020,
    costPrice: 812,
    taxRate: 10,
    reorderThreshold: 8,
    unitOfMeasure: 'PCS',
    unitLabel: 'Block',
    imageUrl: null,
    preferredSupplier: suppSummary('s-2', 'Fonterra Sri Lanka'),
    stock: stock(13, 10, 7),
    active: true,
    createdAt: '2025-01-10T09:00:00Z',
    updatedAt: minutesAgo(700)
  },
  {
    id: 'p-021',
    name: 'Harpic Toilet Cleaner 500ml',
    sku: 'HHD-HP-500',
    barcode: '8901396115519',
    category: catSummary('Household'),
    unitPrice: 640,
    costPrice: 498,
    taxRate: 10,
    reorderThreshold: 10,
    unitOfMeasure: 'BOTTLE',
    unitLabel: 'Bottle',
    imageUrl: null,
    preferredSupplier: suppSummary('s-6', 'Lanka Household Supplies'),
    stock: stock(29, 17, 12),
    active: true,
    createdAt: '2025-01-10T09:00:00Z',
    updatedAt: minutesAgo(760)
  },
  {
    id: 'p-022',
    name: 'Seeduwa Coconut Roti (6 pack)',
    sku: 'BAK-CR-006',
    barcode: '4791020077417',
    category: catSummary('Bakery'),
    unitPrice: 380,
    costPrice: 268,
    taxRate: 10,
    reorderThreshold: 10,
    unitOfMeasure: 'PACK',
    unitLabel: 'Pack',
    imageUrl: null,
    preferredSupplier: suppSummary('s-4', 'Local Bakers Collective'),
    stock: stock(5, 4, 0),
    active: true,
    createdAt: '2025-01-10T09:00:00Z',
    updatedAt: minutesAgo(90)
  },
  {
    id: 'p-023',
    name: 'Crescent Frozen Prawns 500g',
    sku: 'FRZ-CP-500',
    barcode: '4791550120043',
    category: catSummary('Frozen'),
    unitPrice: 2680,
    costPrice: 2190,
    taxRate: 10,
    reorderThreshold: 5,
    unitOfMeasure: 'PACK',
    unitLabel: 'Pack',
    imageUrl: null,
    preferredSupplier: suppSummary('s-5', 'Kandy Fresh Produce Co.'),
    stock: stock(11, 6, 4),
    active: true,
    createdAt: '2025-01-10T09:00:00Z',
    updatedAt: minutesAgo(820)
  },
  {
    id: 'p-024',
    name: 'Elephant House Chocolate Cone',
    sku: 'FRZ-EC-120',
    barcode: '4792024099117',
    category: catSummary('Frozen'),
    unitPrice: 260,
    costPrice: 194,
    taxRate: 10,
    reorderThreshold: 12,
    unitOfMeasure: 'EACH',
    unitLabel: 'Each',
    imageUrl: null,
    preferredSupplier: suppSummary('s-1', 'Ceylon Beverages Distributors'),
    stock: stock(0, 22, 15),
    active: false,
    createdAt: '2025-01-10T09:00:00Z',
    updatedAt: minutesAgo(1500)
  }
];

export const categoryTree = [
  {
    name: 'Beverages',
    children: [
      { name: 'Soft Drinks', count: 3 },
      { name: 'Juices', count: 1 },
      { name: 'Tea & Coffee', count: 3 }
    ]
  },
  {
    name: 'Snacks',
    children: [
      { name: 'Biscuits', count: 3 },
      { name: 'Chips', count: 1 }
    ]
  },
  {
    name: 'Dairy',
    children: [
      { name: 'Milk', count: 1 },
      { name: 'Yoghurt', count: 1 },
      { name: 'Cheese & Butter', count: 2 }
    ]
  },
  {
    name: 'Household',
    children: [
      { name: 'Cleaning', count: 2 },
      { name: 'Personal Care', count: 1 },
      { name: 'Staples', count: 1 }
    ]
  },
  {
    name: 'Bakery',
    children: [
      { name: 'Bread', count: 1 },
      { name: 'Pastries', count: 2 }
    ]
  },
  {
    name: 'Frozen',
    children: [
      { name: 'Ice Cream', count: 2 },
      { name: 'Ready Meals', count: 1 }
    ]
  }
];