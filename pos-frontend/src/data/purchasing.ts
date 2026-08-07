import { PoLine, PoStatus, PurchaseOrder, Supplier } from '../types';
import { seedProducts } from './products';
import { daysAgo } from '../utils/time';

export const paymentTermOptions = ['NET_7', 'NET_15', 'NET_30', 'NET_45', 'CASH_ON_DELIVERY'];

export const poStatusTones: Record<
  PoStatus,
  'gray' | 'blue' | 'amber' | 'green' | 'slate' | 'red'
> = {
  DRAFT: 'gray',
  SENT: 'blue',
  PARTIALLY_RECEIVED: 'amber',
  RECEIVED: 'green',
  CLOSED: 'slate',
  CANCELLED: 'red'
};

export const poStatuses: PoStatus[] = [
  'DRAFT',
  'SENT',
  'PARTIALLY_RECEIVED',
  'RECEIVED',
  'CLOSED',
  'CANCELLED'
];

export const suppliers: Supplier[] = [
  {
    id: 's-1',
    name: 'Ceylon Beverages Distributors',
    contactPerson: 'Chaminda Rajapaksa',
    contact: 'Chaminda Rajapaksa',
    phone: '+94 11 234 5567',
    contactEmail: 'orders@ceylonbev.lk',
    email: 'orders@ceylonbev.lk',
    address: '312 Negombo Road, Wattala',
    paymentTerms: 'NET_30',
    leadTimeDays: 4,
    suppliedCategories: ['beverages'],
    categories: ['Beverages'],
    status: 'ACTIVE',
    notes: 'Delivers Mon/Wed/Fri before 10 AM. Pallet returns required.',
    createdAt: daysAgo(420, 9, 0),
    updatedAt: daysAgo(10, 9, 0)
  },
  {
    id: 's-2',
    name: 'Fonterra Sri Lanka',
    contactPerson: 'Priyanka de Silva',
    contact: 'Priyanka de Silva',
    phone: '+94 11 478 9021',
    contactEmail: 'trade.lk@fonterra.com',
    email: 'trade.lk@fonterra.com',
    address: 'Level 8, Access Tower, Union Place, Colombo 02',
    paymentTerms: 'NET_15',
    leadTimeDays: 6,
    suppliedCategories: ['dairy', 'frozen'],
    categories: ['Dairy', 'Frozen'],
    status: 'ACTIVE',
    notes: 'Cold-chain deliveries. Reject any load above 6 °C.',
    createdAt: daysAgo(510, 9, 0),
    updatedAt: daysAgo(12, 9, 0)
  },
  {
    id: 's-3',
    name: 'Unilever Consumer Distribution',
    contactPerson: 'Nuwan Bandara',
    contact: 'Nuwan Bandara',
    phone: '+94 11 556 3344',
    contactEmail: 'distribution@unilever.lk',
    email: 'distribution@unilever.lk',
    address: '258 Grandpass Road, Colombo 14',
    paymentTerms: 'NET_45',
    leadTimeDays: 7,
    suppliedCategories: ['household', 'snacks'],
    categories: ['Household', 'Snacks'],
    status: 'ACTIVE',
    notes: 'Quarterly rebate applies above Rs. 2,000,000 in purchases.',
    createdAt: daysAgo(680, 9, 0),
    updatedAt: daysAgo(15, 9, 0)
  },
  {
    id: 's-4',
    name: 'Local Bakers Collective',
    contactPerson: 'Sunil Gunaratne',
    contact: 'Sunil Gunaratne',
    phone: '+94 77 812 4460',
    contactEmail: 'sunil@bakerscollective.lk',
    email: 'sunil@bakerscollective.lk',
    address: '14 Temple Lane, Dehiwala',
    paymentTerms: 'CASH_ON_DELIVERY',
    leadTimeDays: 1,
    suppliedCategories: ['bakery'],
    categories: ['Bakery'],
    status: 'ACTIVE',
    notes: 'Daily 5 AM drop. Same-day credit for unsold returns.',
    createdAt: daysAgo(240, 9, 0),
    updatedAt: daysAgo(2, 9, 0)
  },
  {
    id: 's-5',
    name: 'Kandy Fresh Produce Co.',
    contactPerson: 'Menaka Herath',
    contact: 'Menaka Herath',
    phone: '+94 81 220 7715',
    contactEmail: 'supply@kandyfresh.lk',
    email: 'supply@kandyfresh.lk',
    address: '9 Katugastota Road, Kandy',
    paymentTerms: 'NET_7',
    leadTimeDays: 2,
    suppliedCategories: ['dairy', 'bakery'],
    categories: ['Dairy', 'Bakery'],
    status: 'ON_HOLD',
    notes: 'On hold pending resolution of three short-shipped orders.',
    createdAt: daysAgo(160, 9, 0),
    updatedAt: daysAgo(5, 9, 0)
  },
  {
    id: 's-6',
    name: 'Lanka Household Supplies',
    contactPerson: 'Farhan Nazeer',
    contact: 'Farhan Nazeer',
    phone: '+94 11 903 2288',
    contactEmail: 'sales@lankahousehold.lk',
    email: 'sales@lankahousehold.lk',
    address: '77 Sea Street, Colombo 11',
    paymentTerms: 'NET_30',
    leadTimeDays: 5,
    suppliedCategories: ['household'],
    categories: ['Household'],
    status: 'ACTIVE',
    notes: 'Bulk pricing unlocks at 20 cases per SKU.',
    createdAt: daysAgo(300, 9, 0),
    updatedAt: daysAgo(8, 9, 0)
  }
];

function line(sku: string, ordered: number, received: number, markup = 1): PoLine | null {
  const product = seedProducts.find((p) => p.sku === sku);
  if (!product) return null;
  const unitCost = Math.round(product.costPrice * markup);
  return {
    id: `poi-${product.id}`,
    product: { id: product.id, sku: product.sku, name: product.name },
    productId: product.id,
    name: product.name,
    sku: product.sku,
    quantityOrdered: ordered,
    ordered,
    quantityReceived: received,
    received,
    unitCost,
    createdAt: daysAgo(20, 10, 0),
    updatedAt: daysAgo(5, 10, 0)
  };
}

function lines(entries: (PoLine | null)[]): PoLine[] {
  return entries.filter((entry): entry is PoLine => entry !== null);
}

function event(id: string, description: string, occurredAt: string, actorName = 'Ruwan Silva') {
  return {
    id,
    description,
    text: description,
    occurredAt,
    at: occurredAt,
    actor: { id: 'u-1', name: actorName, email: 'ruwan.silva@nexpos.app', role: 'ADMIN' },
    createdAt: occurredAt,
    updatedAt: occurredAt
  };
}

export const purchaseOrders: PurchaseOrder[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655442043',
    poNumber: 'PO-2043',
    supplierId: 's-2',
    supplier: { id: 's-2', name: 'Fonterra Sri Lanka' },
    branch: { id: '550e8400-e29b-41d4-a716-446655440001', slug: 'colombo', name: 'Colombo – Main Branch' },
    items: lines([
      line('DRY-AN-1000', 50, 30),
      line('DRY-HL-080', 240, 240),
      line('DRY-KC-200', 40, 0),
      line('DRY-AB-227', 60, 60),
      line('BEV-NM-400', 80, 20)
    ]),
    lines: lines([
      line('DRY-AN-1000', 50, 30),
      line('DRY-HL-080', 240, 240),
      line('DRY-KC-200', 40, 0),
      line('DRY-AB-227', 60, 60),
      line('BEV-NM-400', 80, 20)
    ]),
    status: 'PARTIALLY_RECEIVED',
    createdAt: daysAgo(19, 10, 15),
    updatedAt: daysAgo(12, 9, 20),
    expectedAt: daysAgo(-3, 9, 0),
    notes: 'Split delivery agreed with supplier — balance to follow this week.',
    events: [
      event('e-1', 'Purchase order created', daysAgo(19, 10, 15)),
      event('e-2', 'Sent to Fonterra Sri Lanka', daysAgo(19, 11, 2)),
      event('e-3', 'Partial delivery received — 350 of 470 units', daysAgo(12, 9, 20), 'Anushka Weerasinghe')
    ],
    activity: [
      event('e-1', 'Purchase order created', daysAgo(19, 10, 15)),
      event('e-2', 'Sent to Fonterra Sri Lanka', daysAgo(19, 11, 2)),
      event('e-3', 'Partial delivery received — 350 of 470 units', daysAgo(12, 9, 20), 'Anushka Weerasinghe')
    ]
  },
  {
    id: '550e8400-e29b-41d4-a716-446655442042',
    poNumber: 'PO-2042',
    supplierId: 's-1',
    supplier: { id: 's-1', name: 'Ceylon Beverages Distributors' },
    branch: { id: '550e8400-e29b-41d4-a716-446655440001', slug: 'colombo', name: 'Colombo – Main Branch' },
    items: lines([
      line('BEV-CC-400', 240, 240),
      line('BEV-EH-1000', 96, 96),
      line('BEV-NM-400', 60, 60),
      line('BEV-LT-100', 120, 120)
    ]),
    lines: lines([
      line('BEV-CC-400', 240, 240),
      line('BEV-EH-1000', 96, 96),
      line('BEV-NM-400', 60, 60),
      line('BEV-LT-100', 120, 120)
    ]),
    status: 'RECEIVED',
    createdAt: daysAgo(21, 8, 45),
    updatedAt: daysAgo(15, 8, 30),
    expectedAt: daysAgo(15, 9, 0),
    notes: '',
    events: [
      event('e-1', 'Purchase order created', daysAgo(21, 8, 45)),
      event('e-2', 'Sent to Ceylon Beverages Distributors', daysAgo(21, 9, 5)),
      event('e-3', 'Delivery received in full', daysAgo(15, 8, 30), 'Nadeesha Perera')
    ],
    activity: [
      event('e-1', 'Purchase order created', daysAgo(21, 8, 45)),
      event('e-2', 'Sent to Ceylon Beverages Distributors', daysAgo(21, 9, 5)),
      event('e-3', 'Delivery received in full', daysAgo(15, 8, 30), 'Nadeesha Perera')
    ]
  },
  {
    id: '550e8400-e29b-41d4-a716-446655442041',
    poNumber: 'PO-2041',
    supplierId: 's-4',
    supplier: { id: 's-4', name: 'Local Bakers Collective' },
    branch: { id: '550e8400-e29b-41d4-a716-446655440002', slug: 'kandy', name: 'Kandy Branch' },
    items: lines([line('BAK-SB-450', 120, 0), line('BAK-BC-004', 200, 0)]),
    lines: lines([line('BAK-SB-450', 120, 0), line('BAK-BC-004', 200, 0)]),
    status: 'SENT',
    createdAt: daysAgo(4, 16, 30),
    updatedAt: daysAgo(4, 16, 41),
    expectedAt: daysAgo(-2, 5, 0),
    notes: 'Standing weekly order.',
    events: [
      event('e-1', 'Purchase order created', daysAgo(4, 16, 30), 'Ishara Jayasuriya'),
      event('e-2', 'Sent to Local Bakers Collective', daysAgo(4, 16, 41), 'Ishara Jayasuriya')
    ],
    activity: [
      event('e-1', 'Purchase order created', daysAgo(4, 16, 30), 'Ishara Jayasuriya'),
      event('e-2', 'Sent to Local Bakers Collective', daysAgo(4, 16, 41), 'Ishara Jayasuriya')
    ]
  },
  {
    id: '550e8400-e29b-41d4-a716-446655442040',
    poNumber: 'PO-2040',
    supplierId: 's-3',
    supplier: { id: 's-3', name: 'Unilever Consumer Distribution' },
    branch: { id: '550e8400-e29b-41d4-a716-446655440003', slug: 'galle', name: 'Galle Branch' },
    items: lines([
      line('HHD-SG-120', 90, 90),
      line('HHD-SL-1000', 60, 60),
      line('HHD-KB-5000', 40, 40)
    ]),
    lines: lines([
      line('HHD-SG-120', 90, 90),
      line('HHD-SL-1000', 60, 60),
      line('HHD-KB-5000', 40, 40)
    ]),
    status: 'RECEIVED',
    createdAt: daysAgo(24, 11, 0),
    updatedAt: daysAgo(17, 10, 5),
    expectedAt: daysAgo(17, 9, 0),
    notes: '',
    events: [
      event('e-1', 'Purchase order created', daysAgo(24, 11, 0)),
      event('e-2', 'Sent to Unilever Consumer Distribution', daysAgo(24, 11, 20)),
      event('e-3', 'Delivery received in full', daysAgo(17, 10, 5), 'Dilhani Wickrama')
    ],
    activity: [
      event('e-1', 'Purchase order created', daysAgo(24, 11, 0)),
      event('e-2', 'Sent to Unilever Consumer Distribution', daysAgo(24, 11, 20)),
      event('e-3', 'Delivery received in full', daysAgo(17, 10, 5), 'Dilhani Wickrama')
    ]
  },
  {
    id: '550e8400-e29b-41d4-a716-446655442039',
    poNumber: 'PO-2039',
    supplierId: 's-4',
    supplier: { id: 's-4', name: 'Local Bakers Collective' },
    branch: { id: '550e8400-e29b-41d4-a716-446655440001', slug: 'colombo', name: 'Colombo – Main Branch' },
    items: lines([line('BAK-SB-450', 80, 0), line('BAK-BC-004', 150, 0)]),
    lines: lines([line('BAK-SB-450', 80, 0), line('BAK-BC-004', 150, 0)]),
    status: 'DRAFT',
    createdAt: daysAgo(1, 17, 12),
    updatedAt: daysAgo(1, 17, 12),
    expectedAt: daysAgo(-4, 5, 0),
    notes: 'Awaiting confirmation of the festive-week uplift.',
    events: [event('e-1', 'Purchase order created', daysAgo(1, 17, 12))],
    activity: [event('e-1', 'Purchase order created', daysAgo(1, 17, 12))]
  },
  {
    id: '550e8400-e29b-41d4-a716-446655442038',
    poNumber: 'PO-2038',
    supplierId: 's-1',
    supplier: { id: 's-1', name: 'Ceylon Beverages Distributors' },
    branch: { id: '550e8400-e29b-41d4-a716-446655440002', slug: 'kandy', name: 'Kandy Branch' },
    items: lines([line('BEV-CC-400', 180, 120), line('BEV-NG-200', 36, 12)]),
    lines: lines([line('BEV-CC-400', 180, 120), line('BEV-NG-200', 36, 12)]),
    status: 'PARTIALLY_RECEIVED',
    createdAt: daysAgo(9, 9, 30),
    updatedAt: daysAgo(3, 8, 55),
    expectedAt: daysAgo(-1, 9, 0),
    notes: '',
    events: [
      event('e-1', 'Purchase order created', daysAgo(9, 9, 30), 'Ishara Jayasuriya'),
      event('e-2', 'Sent to Ceylon Beverages Distributors', daysAgo(9, 9, 44), 'Ishara Jayasuriya'),
      event('e-3', 'Partial delivery received — 132 of 216 units', daysAgo(3, 8, 55), 'Ishara Jayasuriya')
    ],
    activity: [
      event('e-1', 'Purchase order created', daysAgo(9, 9, 30), 'Ishara Jayasuriya'),
      event('e-2', 'Sent to Ceylon Beverages Distributors', daysAgo(9, 9, 44), 'Ishara Jayasuriya'),
      event('e-3', 'Partial delivery received — 132 of 216 units', daysAgo(3, 8, 55), 'Ishara Jayasuriya')
    ]
  },
  {
    id: '550e8400-e29b-41d4-a716-446655442037',
    poNumber: 'PO-2037',
    supplierId: 's-2',
    supplier: { id: 's-2', name: 'Fonterra Sri Lanka' },
    branch: { id: '550e8400-e29b-41d4-a716-446655440003', slug: 'galle', name: 'Galle Branch' },
    items: lines([line('DRY-AN-1000', 40, 40), line('FRZ-CP-500', 30, 30)]),
    lines: lines([line('DRY-AN-1000', 40, 40), line('FRZ-CP-500', 30, 30)]),
    status: 'CLOSED',
    createdAt: daysAgo(30, 14, 0),
    updatedAt: daysAgo(22, 16, 0),
    expectedAt: daysAgo(23, 9, 0),
    notes: 'Closed after credit note issued for 2 damaged cases.',
    events: [
      event('e-1', 'Purchase order created', daysAgo(30, 14, 0)),
      event('e-2', 'Delivery received in full', daysAgo(23, 9, 10), 'Dilhani Wickrama'),
      event('e-3', 'Order closed', daysAgo(22, 16, 0))
    ],
    activity: [
      event('e-1', 'Purchase order created', daysAgo(30, 14, 0)),
      event('e-2', 'Delivery received in full', daysAgo(23, 9, 10), 'Dilhani Wickrama'),
      event('e-3', 'Order closed', daysAgo(22, 16, 0))
    ]
  },
  {
    id: '550e8400-e29b-41d4-a716-446655442036',
    poNumber: 'PO-2036',
    supplierId: 's-6',
    supplier: { id: 's-6', name: 'Lanka Household Supplies' },
    branch: { id: '550e8400-e29b-41d4-a716-446655440001', slug: 'colombo', name: 'Colombo – Main Branch' },
    items: lines([line('HHD-KB-5000', 60, 0), line('HHD-SL-1000', 48, 0), line('HHD-SG-120', 72, 0)]),
    lines: lines([line('HHD-KB-5000', 60, 0), line('HHD-SL-1000', 48, 0), line('HHD-SG-120', 72, 0)]),
    status: 'SENT',
    createdAt: daysAgo(2, 12, 5),
    updatedAt: daysAgo(2, 12, 30),
    expectedAt: daysAgo(-5, 9, 0),
    notes: '',
    events: [
      event('e-1', 'Purchase order created', daysAgo(2, 12, 5)),
      event('e-2', 'Sent to Lanka Household Supplies', daysAgo(2, 12, 30))
    ],
    activity: [
      event('e-1', 'Purchase order created', daysAgo(2, 12, 5)),
      event('e-2', 'Sent to Lanka Household Supplies', daysAgo(2, 12, 30))
    ]
  }
];

export function poItemCount(po: PurchaseOrder): number {
  return (po.items || po.lines).length;
}

export function poUnits(po: PurchaseOrder): number {
  return (po.items || po.lines).reduce((sum, l) => sum + (l.quantityOrdered ?? l.ordered ?? 0), 0);
}

export function poReceivedUnits(po: PurchaseOrder): number {
  return (po.items || po.lines).reduce((sum, l) => sum + (l.quantityReceived ?? l.received ?? 0), 0);
}

export function poTotal(po: PurchaseOrder): number {
  return (po.items || po.lines).reduce((sum, l) => sum + (l.quantityOrdered ?? l.ordered ?? 0) * l.unitCost, 0);
}

export function poProgress(po: PurchaseOrder): number {
  const units = poUnits(po);
  return units === 0 ? 0 : Math.round((poReceivedUnits(po) / units) * 100);
}
