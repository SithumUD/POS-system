import { Supplier, PoLine, PoStatus, PurchaseOrder } from '../types';
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
    id: 's-1', name: 'Ceylon Beverages Distributors',
    contactPerson: 'Chaminda Rajapaksa', contact: 'Chaminda Rajapaksa',
    phone: '+94 11 234 5567', contactEmail: 'orders@ceylonbev.lk', email: 'orders@ceylonbev.lk',
    address: '312 Negombo Road, Wattala, Gampaha', paymentTerms: 'NET_30',
    leadTimeDays: 4, suppliedCategories: ['beverages', 'frozen'], categories: ['Beverages', 'Frozen'],
    status: 'ACTIVE', notes: 'Delivers Mon/Wed/Fri before 10 AM. Pallet returns required.',
    createdAt: daysAgo(420, 9, 0), updatedAt: daysAgo(10, 9, 0)
  },
  {
    id: 's-2', name: 'Fonterra Sri Lanka (Pvt) Ltd',
    contactPerson: 'Priyanka de Silva', contact: 'Priyanka de Silva',
    phone: '+94 11 478 9021', contactEmail: 'trade.lk@fonterra.com', email: 'trade.lk@fonterra.com',
    address: 'Level 8, Access Tower, Union Place, Colombo 02', paymentTerms: 'NET_15',
    leadTimeDays: 6, suppliedCategories: ['dairy', 'frozen'], categories: ['Dairy', 'Frozen'],
    status: 'ACTIVE', notes: 'Cold-chain deliveries. Reject any load above 6 °C.',
    createdAt: daysAgo(510, 9, 0), updatedAt: daysAgo(12, 9, 0)
  },
  {
    id: 's-3', name: 'Unilever Consumer Distribution Lanka',
    contactPerson: 'Nuwan Bandara', contact: 'Nuwan Bandara',
    phone: '+94 11 556 3344', contactEmail: 'distribution@unilever.lk', email: 'distribution@unilever.lk',
    address: '258 Grandpass Road, Colombo 14', paymentTerms: 'NET_45',
    leadTimeDays: 7, suppliedCategories: ['household', 'snacks', 'personal-care', 'beverages'],
    categories: ['Household', 'Snacks', 'Personal Care', 'Beverages'],
    status: 'ACTIVE', notes: 'Quarterly rebate applies above Rs. 2,000,000 in purchases.',
    createdAt: daysAgo(680, 9, 0), updatedAt: daysAgo(15, 9, 0)
  },
  {
    id: 's-4', name: 'Local Bakers Collective',
    contactPerson: 'Sunil Gunaratne', contact: 'Sunil Gunaratne',
    phone: '+94 77 812 4460', contactEmail: 'sunil@bakerscollective.lk', email: 'sunil@bakerscollective.lk',
    address: '14 Temple Lane, Dehiwala, Colombo', paymentTerms: 'CASH_ON_DELIVERY',
    leadTimeDays: 1, suppliedCategories: ['bakery', 'snacks'], categories: ['Bakery', 'Snacks'],
    status: 'ACTIVE', notes: 'Daily 5 AM drop. Same-day credit for unsold returns.',
    createdAt: daysAgo(240, 9, 0), updatedAt: daysAgo(2, 9, 0)
  },
  {
    id: 's-5', name: 'Kandy Fresh Produce Co.',
    contactPerson: 'Menaka Herath', contact: 'Menaka Herath',
    phone: '+94 81 220 7715', contactEmail: 'supply@kandyfresh.lk', email: 'supply@kandyfresh.lk',
    address: '9 Katugastota Road, Kandy 20000', paymentTerms: 'NET_7',
    leadTimeDays: 2, suppliedCategories: ['dairy', 'bakery', 'frozen'], categories: ['Dairy', 'Bakery', 'Frozen'],
    status: 'ON_HOLD', notes: 'On hold pending resolution of three short-shipped orders.',
    createdAt: daysAgo(160, 9, 0), updatedAt: daysAgo(5, 9, 0)
  },
  {
    id: 's-6', name: 'Lanka Household Supplies',
    contactPerson: 'Farhan Nazeer', contact: 'Farhan Nazeer',
    phone: '+94 11 903 2288', contactEmail: 'sales@lankahousehold.lk', email: 'sales@lankahousehold.lk',
    address: '77 Sea Street, Colombo 11', paymentTerms: 'NET_30',
    leadTimeDays: 5, suppliedCategories: ['household', 'personal-care'], categories: ['Household', 'Personal Care'],
    status: 'ACTIVE', notes: 'Bulk pricing unlocks at 20 cases per SKU.',
    createdAt: daysAgo(300, 9, 0), updatedAt: daysAgo(8, 9, 0)
  },
  {
    id: 's-7', name: 'Cargills Food City Distributors',
    contactPerson: 'Ruchika Perera', contact: 'Ruchika Perera',
    phone: '+94 11 249 0000', contactEmail: 'trade@cargillsfoods.lk', email: 'trade@cargillsfoods.lk',
    address: '40 York Street, Colombo 01', paymentTerms: 'NET_30',
    leadTimeDays: 3, suppliedCategories: ['beverages', 'snacks', 'dairy'], categories: ['Beverages', 'Snacks', 'Dairy'],
    status: 'ACTIVE', notes: 'Minimum order Rs. 50,000. Fixed delivery windows Tuesday & Friday.',
    createdAt: daysAgo(380, 9, 0), updatedAt: daysAgo(7, 9, 0)
  },
  {
    id: 's-8', name: 'Metro Imports (Pvt) Ltd',
    contactPerson: 'Ashraf Marikar', contact: 'Ashraf Marikar',
    phone: '+94 11 242 6600', contactEmail: 'imports@metrolk.com', email: 'imports@metrolk.com',
    address: '55 Main Street, Pettah, Colombo 11', paymentTerms: 'NET_15',
    leadTimeDays: 10, suppliedCategories: ['beverages', 'electronics', 'snacks'], categories: ['Beverages', 'Electronics', 'Snacks'],
    status: 'ACTIVE', notes: 'Handles all imported products. Lead time varies by country of origin.',
    createdAt: daysAgo(450, 9, 0), updatedAt: daysAgo(20, 9, 0)
  },
  {
    id: 's-9', name: 'Kelani Valley Agro Products',
    contactPerson: 'Buddhika Siriwardena', contact: 'Buddhika Siriwardena',
    phone: '+94 11 293 4400', contactEmail: 'bud@kelaniagro.lk', email: 'bud@kelaniagro.lk',
    address: '7 Malwatta Road, Avissawella 10700', paymentTerms: 'CASH_ON_DELIVERY',
    leadTimeDays: 2, suppliedCategories: ['snacks'], categories: ['Snacks'],
    status: 'ACTIVE', notes: 'Premium local cashews and nuts. Seasonal stock may vary.',
    createdAt: daysAgo(200, 9, 0), updatedAt: daysAgo(6, 9, 0)
  },
  {
    id: 's-10', name: 'Pelwatte Agri Industries Ltd',
    contactPerson: 'Dulani Rathnayake', contact: 'Dulani Rathnayake',
    phone: '+94 55 222 8800', contactEmail: 'sales@pelwatte.lk', email: 'sales@pelwatte.lk',
    address: 'Pelwatte, Buttala, Moneragala', paymentTerms: 'NET_15',
    leadTimeDays: 4, suppliedCategories: ['dairy'], categories: ['Dairy'],
    status: 'ACTIVE', notes: 'Highland butter and Pelwatte dairy products. Cold chain mandatory.',
    createdAt: daysAgo(320, 9, 0), updatedAt: daysAgo(9, 9, 0)
  },
  {
    id: 's-11', name: 'Bairaha Farms Ltd',
    contactPerson: 'Rohan Jayasuriya', contact: 'Rohan Jayasuriya',
    phone: '+94 37 492 1000', contactEmail: 'orders@bairaha.lk', email: 'orders@bairaha.lk',
    address: 'Chilaw Road, Kurunegala 60000', paymentTerms: 'NET_7',
    leadTimeDays: 3, suppliedCategories: ['frozen'], categories: ['Frozen'],
    status: 'ACTIVE', notes: 'Frozen poultry. Temperature logs required with each delivery.',
    createdAt: daysAgo(270, 9, 0), updatedAt: daysAgo(11, 9, 0)
  },
  {
    id: 's-12', name: 'Procter & Gamble Lanka (Pvt) Ltd',
    contactPerson: 'Sachini Fernando', contact: 'Sachini Fernando',
    phone: '+94 11 268 9000', contactEmail: 'trade.lk@pg.com', email: 'trade.lk@pg.com',
    address: '4 Upper Chatham Street, Colombo 01', paymentTerms: 'NET_45',
    leadTimeDays: 8, suppliedCategories: ['personal-care', 'household'], categories: ['Personal Care', 'Household'],
    status: 'ACTIVE', notes: 'Global brand. Quarterly promotions & trade incentives available.',
    createdAt: daysAgo(500, 9, 0), updatedAt: daysAgo(14, 9, 0)
  },
  {
    id: 's-13', name: 'Office Needs Lanka',
    contactPerson: 'Tharaka Wijesinghe', contact: 'Tharaka Wijesinghe',
    phone: '+94 11 566 7788', contactEmail: 'orders@officeneeds.lk', email: 'orders@officeneeds.lk',
    address: '22 Maradana Road, Colombo 10', paymentTerms: 'NET_30',
    leadTimeDays: 5, suppliedCategories: ['stationery'], categories: ['Stationery'],
    status: 'ACTIVE', notes: 'Offers loyalty discounts for orders above Rs. 100,000 per quarter.',
    createdAt: daysAgo(180, 9, 0), updatedAt: daysAgo(18, 9, 0)
  },
  {
    id: 's-14', name: 'Electro Lanka Distributors',
    contactPerson: 'Kasun Liyanage', contact: 'Kasun Liyanage',
    phone: '+94 11 488 2200', contactEmail: 'sales@electrolanka.lk', email: 'sales@electrolanka.lk',
    address: '85 Baseline Road, Borella, Colombo 08', paymentTerms: 'NET_15',
    leadTimeDays: 6, suppliedCategories: ['electronics'], categories: ['Electronics'],
    status: 'ACTIVE', notes: 'Handles Philips and local electronics. Warranty support included.',
    createdAt: daysAgo(210, 9, 0), updatedAt: daysAgo(16, 9, 0)
  },
  {
    id: 's-15', name: 'Nestlé Lanka (Pvt) Ltd',
    contactPerson: 'Pradeep Kumara', contact: 'Pradeep Kumara',
    phone: '+94 11 244 9000', contactEmail: 'trade@nestle.lk', email: 'trade@nestle.lk',
    address: '209 Duplication Road, Colombo 03', paymentTerms: 'NET_45',
    leadTimeDays: 7, suppliedCategories: ['beverages', 'dairy', 'snacks'], categories: ['Beverages', 'Dairy', 'Snacks'],
    status: 'INACTIVE', notes: 'Currently transitioning distribution arrangements. Suspended orders until confirmation.',
    createdAt: daysAgo(600, 9, 0), updatedAt: daysAgo(25, 9, 0)
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
    id, description, text: description, occurredAt, at: occurredAt,
    actor: { id: 'u-1', name: actorName, email: 'ruwan.silva@nexpos.lk', role: 'ADMIN' },
    createdAt: occurredAt, updatedAt: occurredAt
  };
}

export const purchaseOrders: PurchaseOrder[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655442043', poNumber: 'PO-2043',
    supplierId: 's-2', supplier: { id: 's-2', name: 'Fonterra Sri Lanka (Pvt) Ltd' },
    branch: { id: '550e8400-e29b-41d4-a716-446655440001', slug: 'colombo', name: 'Colombo – Main Branch' },
    items: lines([line('DRY-AN-1000', 50, 30), line('DRY-HL-080', 240, 240), line('DRY-KC-200', 40, 0), line('DRY-AB-227', 60, 60), line('BEV-NM-400', 80, 20)]),
    lines: lines([line('DRY-AN-1000', 50, 30), line('DRY-HL-080', 240, 240), line('DRY-KC-200', 40, 0), line('DRY-AB-227', 60, 60), line('BEV-NM-400', 80, 20)]),
    status: 'PARTIALLY_RECEIVED', createdAt: daysAgo(19, 10, 15), updatedAt: daysAgo(12, 9, 20),
    expectedAt: daysAgo(-3, 9, 0), notes: 'Split delivery agreed — balance to follow this week.',
    events: [event('e-1', 'Purchase order created', daysAgo(19, 10, 15)), event('e-2', 'Sent to Fonterra Sri Lanka', daysAgo(19, 11, 2)), event('e-3', 'Partial delivery received — 350 of 470 units', daysAgo(12, 9, 20), 'Anushka Weerasinghe')],
    activity: [event('e-1', 'Purchase order created', daysAgo(19, 10, 15)), event('e-2', 'Sent to Fonterra Sri Lanka', daysAgo(19, 11, 2)), event('e-3', 'Partial delivery received — 350 of 470 units', daysAgo(12, 9, 20), 'Anushka Weerasinghe')]
  },
  {
    id: '550e8400-e29b-41d4-a716-446655442042', poNumber: 'PO-2042',
    supplierId: 's-1', supplier: { id: 's-1', name: 'Ceylon Beverages Distributors' },
    branch: { id: '550e8400-e29b-41d4-a716-446655440001', slug: 'colombo', name: 'Colombo – Main Branch' },
    items: lines([line('BEV-CC-400', 240, 240), line('BEV-EH-1000', 96, 96), line('BEV-NM-400', 60, 60), line('BEV-LT-100', 120, 120)]),
    lines: lines([line('BEV-CC-400', 240, 240), line('BEV-EH-1000', 96, 96), line('BEV-NM-400', 60, 60), line('BEV-LT-100', 120, 120)]),
    status: 'RECEIVED', createdAt: daysAgo(21, 8, 45), updatedAt: daysAgo(15, 8, 30),
    expectedAt: daysAgo(15, 9, 0), notes: '',
    events: [event('e-1', 'Purchase order created', daysAgo(21, 8, 45)), event('e-2', 'Sent to Ceylon Beverages Distributors', daysAgo(21, 9, 5)), event('e-3', 'Delivery received in full', daysAgo(15, 8, 30), 'Nadeesha Perera')],
    activity: [event('e-1', 'Purchase order created', daysAgo(21, 8, 45)), event('e-2', 'Sent to Ceylon Beverages Distributors', daysAgo(21, 9, 5)), event('e-3', 'Delivery received in full', daysAgo(15, 8, 30), 'Nadeesha Perera')]
  },
  {
    id: '550e8400-e29b-41d4-a716-446655442041', poNumber: 'PO-2041',
    supplierId: 's-4', supplier: { id: 's-4', name: 'Local Bakers Collective' },
    branch: { id: '550e8400-e29b-41d4-a716-446655440002', slug: 'kandy', name: 'Kandy Branch' },
    items: lines([line('BAK-SB-450', 120, 0), line('BAK-BC-004', 200, 0), line('BAK-CB-001', 300, 0)]),
    lines: lines([line('BAK-SB-450', 120, 0), line('BAK-BC-004', 200, 0), line('BAK-CB-001', 300, 0)]),
    status: 'SENT', createdAt: daysAgo(4, 16, 30), updatedAt: daysAgo(4, 16, 41),
    expectedAt: daysAgo(-2, 5, 0), notes: 'Standing weekly order.',
    events: [event('e-1', 'Purchase order created', daysAgo(4, 16, 30), 'Ishara Jayasuriya'), event('e-2', 'Sent to Local Bakers Collective', daysAgo(4, 16, 41), 'Ishara Jayasuriya')],
    activity: [event('e-1', 'Purchase order created', daysAgo(4, 16, 30), 'Ishara Jayasuriya'), event('e-2', 'Sent to Local Bakers Collective', daysAgo(4, 16, 41), 'Ishara Jayasuriya')]
  },
  {
    id: '550e8400-e29b-41d4-a716-446655442040', poNumber: 'PO-2040',
    supplierId: 's-3', supplier: { id: 's-3', name: 'Unilever Consumer Distribution Lanka' },
    branch: { id: '550e8400-e29b-41d4-a716-446655440003', slug: 'galle', name: 'Galle Branch' },
    items: lines([line('HHD-SG-120', 90, 90), line('HHD-SL-1000', 60, 60), line('HHD-KB-5000', 40, 40)]),
    lines: lines([line('HHD-SG-120', 90, 90), line('HHD-SL-1000', 60, 60), line('HHD-KB-5000', 40, 40)]),
    status: 'RECEIVED', createdAt: daysAgo(24, 11, 0), updatedAt: daysAgo(17, 10, 5),
    expectedAt: daysAgo(17, 9, 0), notes: '',
    events: [event('e-1', 'Purchase order created', daysAgo(24, 11, 0)), event('e-2', 'Sent to Unilever Consumer Distribution', daysAgo(24, 11, 20)), event('e-3', 'Delivery received in full', daysAgo(17, 10, 5), 'Dilhani Wickrama')],
    activity: [event('e-1', 'Purchase order created', daysAgo(24, 11, 0)), event('e-2', 'Sent to Unilever Consumer Distribution', daysAgo(24, 11, 20)), event('e-3', 'Delivery received in full', daysAgo(17, 10, 5), 'Dilhani Wickrama')]
  },
  {
    id: '550e8400-e29b-41d4-a716-446655442039', poNumber: 'PO-2039',
    supplierId: 's-4', supplier: { id: 's-4', name: 'Local Bakers Collective' },
    branch: { id: '550e8400-e29b-41d4-a716-446655440001', slug: 'colombo', name: 'Colombo – Main Branch' },
    items: lines([line('BAK-SB-450', 80, 0), line('BAK-BC-004', 150, 0), line('BAK-WW-400', 60, 0)]),
    lines: lines([line('BAK-SB-450', 80, 0), line('BAK-BC-004', 150, 0), line('BAK-WW-400', 60, 0)]),
    status: 'DRAFT', createdAt: daysAgo(1, 17, 12), updatedAt: daysAgo(1, 17, 12),
    expectedAt: daysAgo(-4, 5, 0), notes: 'Awaiting confirmation of the festive-week uplift.',
    events: [event('e-1', 'Purchase order created', daysAgo(1, 17, 12))],
    activity: [event('e-1', 'Purchase order created', daysAgo(1, 17, 12))]
  },
  {
    id: '550e8400-e29b-41d4-a716-446655442038', poNumber: 'PO-2038',
    supplierId: 's-1', supplier: { id: 's-1', name: 'Ceylon Beverages Distributors' },
    branch: { id: '550e8400-e29b-41d4-a716-446655440002', slug: 'kandy', name: 'Kandy Branch' },
    items: lines([line('BEV-CC-400', 180, 120), line('BEV-NG-200', 36, 12), line('BEV-GB-400', 96, 48)]),
    lines: lines([line('BEV-CC-400', 180, 120), line('BEV-NG-200', 36, 12), line('BEV-GB-400', 96, 48)]),
    status: 'PARTIALLY_RECEIVED', createdAt: daysAgo(9, 9, 30), updatedAt: daysAgo(3, 8, 55),
    expectedAt: daysAgo(-1, 9, 0), notes: '',
    events: [event('e-1', 'Purchase order created', daysAgo(9, 9, 30), 'Ishara Jayasuriya'), event('e-2', 'Sent to Ceylon Beverages Distributors', daysAgo(9, 9, 44), 'Ishara Jayasuriya'), event('e-3', 'Partial delivery received — 180 of 312 units', daysAgo(3, 8, 55), 'Ishara Jayasuriya')],
    activity: [event('e-1', 'Purchase order created', daysAgo(9, 9, 30), 'Ishara Jayasuriya'), event('e-2', 'Sent to Ceylon Beverages Distributors', daysAgo(9, 9, 44), 'Ishara Jayasuriya'), event('e-3', 'Partial delivery received — 180 of 312 units', daysAgo(3, 8, 55), 'Ishara Jayasuriya')]
  },
  {
    id: '550e8400-e29b-41d4-a716-446655442037', poNumber: 'PO-2037',
    supplierId: 's-2', supplier: { id: 's-2', name: 'Fonterra Sri Lanka (Pvt) Ltd' },
    branch: { id: '550e8400-e29b-41d4-a716-446655440003', slug: 'galle', name: 'Galle Branch' },
    items: lines([line('DRY-AN-1000', 40, 40), line('FRZ-CP-500', 30, 30), line('DRY-KM-400', 50, 50)]),
    lines: lines([line('DRY-AN-1000', 40, 40), line('FRZ-CP-500', 30, 30), line('DRY-KM-400', 50, 50)]),
    status: 'CLOSED', createdAt: daysAgo(30, 14, 0), updatedAt: daysAgo(22, 16, 0),
    expectedAt: daysAgo(23, 9, 0), notes: 'Closed after credit note issued for 2 damaged cases.',
    events: [event('e-1', 'Purchase order created', daysAgo(30, 14, 0)), event('e-2', 'Delivery received in full', daysAgo(23, 9, 10), 'Dilhani Wickrama'), event('e-3', 'Order closed', daysAgo(22, 16, 0))],
    activity: [event('e-1', 'Purchase order created', daysAgo(30, 14, 0)), event('e-2', 'Delivery received in full', daysAgo(23, 9, 10), 'Dilhani Wickrama'), event('e-3', 'Order closed', daysAgo(22, 16, 0))]
  },
  {
    id: '550e8400-e29b-41d4-a716-446655442036', poNumber: 'PO-2036',
    supplierId: 's-6', supplier: { id: 's-6', name: 'Lanka Household Supplies' },
    branch: { id: '550e8400-e29b-41d4-a716-446655440001', slug: 'colombo', name: 'Colombo – Main Branch' },
    items: lines([line('HHD-KB-5000', 60, 0), line('HHD-SL-1000', 48, 0), line('HHD-SG-120', 72, 0), line('HHD-DT-500', 36, 0)]),
    lines: lines([line('HHD-KB-5000', 60, 0), line('HHD-SL-1000', 48, 0), line('HHD-SG-120', 72, 0), line('HHD-DT-500', 36, 0)]),
    status: 'SENT', createdAt: daysAgo(2, 12, 5), updatedAt: daysAgo(2, 12, 30),
    expectedAt: daysAgo(-5, 9, 0), notes: '',
    events: [event('e-1', 'Purchase order created', daysAgo(2, 12, 5)), event('e-2', 'Sent to Lanka Household Supplies', daysAgo(2, 12, 30))],
    activity: [event('e-1', 'Purchase order created', daysAgo(2, 12, 5)), event('e-2', 'Sent to Lanka Household Supplies', daysAgo(2, 12, 30))]
  },
  {
    id: '550e8400-e29b-41d4-a716-446655442035', poNumber: 'PO-2035',
    supplierId: 's-8', supplier: { id: 's-8', name: 'Metro Imports (Pvt) Ltd' },
    branch: { id: '550e8400-e29b-41d4-a716-446655440001', slug: 'colombo', name: 'Colombo – Main Branch' },
    items: lines([line('ELC-DA-004', 100, 60), line('ELC-PA-004', 80, 40), line('ELC-UC-100', 40, 20), line('SNK-PR-110', 60, 60)]),
    lines: lines([line('ELC-DA-004', 100, 60), line('ELC-PA-004', 80, 40), line('ELC-UC-100', 40, 20), line('SNK-PR-110', 60, 60)]),
    status: 'PARTIALLY_RECEIVED', createdAt: daysAgo(14, 10, 30), updatedAt: daysAgo(7, 11, 15),
    expectedAt: daysAgo(-1, 12, 0), notes: 'Awaiting second container from Singapore.',
    events: [event('e-1', 'Purchase order created', daysAgo(14, 10, 30)), event('e-2', 'Sent to Metro Imports', daysAgo(14, 11, 5)), event('e-3', 'Partial delivery received — 180 of 280 units', daysAgo(7, 11, 15), 'Nadeesha Perera')],
    activity: [event('e-1', 'Purchase order created', daysAgo(14, 10, 30)), event('e-2', 'Sent to Metro Imports', daysAgo(14, 11, 5)), event('e-3', 'Partial delivery received — 180 of 280 units', daysAgo(7, 11, 15), 'Nadeesha Perera')]
  },
  {
    id: '550e8400-e29b-41d4-a716-446655442034', poNumber: 'PO-2034',
    supplierId: 's-3', supplier: { id: 's-3', name: 'Unilever Consumer Distribution Lanka' },
    branch: { id: '550e8400-e29b-41d4-a716-446655440004', slug: 'negombo', name: 'Negombo Branch' },
    items: lines([line('PRC-SH-200', 120, 120), line('PRC-DV-100', 180, 180), line('PRC-LX-090', 200, 200), line('PRC-VS-100', 80, 80)]),
    lines: lines([line('PRC-SH-200', 120, 120), line('PRC-DV-100', 180, 180), line('PRC-LX-090', 200, 200), line('PRC-VS-100', 80, 80)]),
    status: 'RECEIVED', createdAt: daysAgo(28, 9, 15), updatedAt: daysAgo(20, 10, 30),
    expectedAt: daysAgo(20, 9, 0), notes: 'New branch opening stock.',
    events: [event('e-1', 'Purchase order created', daysAgo(28, 9, 15), 'Chamara Bandara'), event('e-2', 'Sent to Unilever Consumer Distribution', daysAgo(28, 9, 40), 'Chamara Bandara'), event('e-3', 'Full delivery received — 580 units', daysAgo(20, 10, 30), 'Chamara Bandara')],
    activity: [event('e-1', 'Purchase order created', daysAgo(28, 9, 15), 'Chamara Bandara'), event('e-2', 'Sent to Unilever Consumer Distribution', daysAgo(28, 9, 40), 'Chamara Bandara'), event('e-3', 'Full delivery received — 580 units', daysAgo(20, 10, 30), 'Chamara Bandara')]
  },
  {
    id: '550e8400-e29b-41d4-a716-446655442033', poNumber: 'PO-2033',
    supplierId: 's-7', supplier: { id: 's-7', name: 'Cargills Food City Distributors' },
    branch: { id: '550e8400-e29b-41d4-a716-446655440002', slug: 'kandy', name: 'Kandy Branch' },
    items: lines([line('BEV-KM-1000', 60, 60), line('SNK-KB-050', 200, 200), line('BEV-BM-330', 120, 120)]),
    lines: lines([line('BEV-KM-1000', 60, 60), line('SNK-KB-050', 200, 200), line('BEV-BM-330', 120, 120)]),
    status: 'RECEIVED', createdAt: daysAgo(35, 14, 0), updatedAt: daysAgo(27, 9, 0),
    expectedAt: daysAgo(27, 9, 0), notes: '',
    events: [event('e-1', 'Purchase order created', daysAgo(35, 14, 0), 'Ishara Jayasuriya'), event('e-2', 'Sent to Cargills Food City Distributors', daysAgo(35, 14, 30), 'Ishara Jayasuriya'), event('e-3', 'Delivery received in full — 380 units', daysAgo(27, 9, 0), 'Ishara Jayasuriya')],
    activity: [event('e-1', 'Purchase order created', daysAgo(35, 14, 0), 'Ishara Jayasuriya'), event('e-2', 'Sent to Cargills Food City Distributors', daysAgo(35, 14, 30), 'Ishara Jayasuriya'), event('e-3', 'Delivery received in full — 380 units', daysAgo(27, 9, 0), 'Ishara Jayasuriya')]
  },
  {
    id: '550e8400-e29b-41d4-a716-446655442032', poNumber: 'PO-2032',
    supplierId: 's-12', supplier: { id: 's-12', name: 'Procter & Gamble Lanka (Pvt) Ltd' },
    branch: { id: '550e8400-e29b-41d4-a716-446655440001', slug: 'colombo', name: 'Colombo – Main Branch' },
    items: lines([line('PRC-CG-150', 100, 100), line('PRC-PT-170', 80, 80), line('PRC-OS-150', 50, 0)]),
    lines: lines([line('PRC-CG-150', 100, 100), line('PRC-PT-170', 80, 80), line('PRC-OS-150', 50, 0)]),
    status: 'PARTIALLY_RECEIVED', createdAt: daysAgo(18, 11, 0), updatedAt: daysAgo(10, 9, 30),
    expectedAt: daysAgo(-2, 9, 0), notes: 'Deodorant stock delayed — customs clearance issue.',
    events: [event('e-1', 'Purchase order created', daysAgo(18, 11, 0)), event('e-2', 'Sent to P&G Lanka', daysAgo(18, 11, 25)), event('e-3', 'Partial delivery received — 180 of 230 units', daysAgo(10, 9, 30), 'Anushka Weerasinghe')],
    activity: [event('e-1', 'Purchase order created', daysAgo(18, 11, 0)), event('e-2', 'Sent to P&G Lanka', daysAgo(18, 11, 25)), event('e-3', 'Partial delivery received — 180 of 230 units', daysAgo(10, 9, 30), 'Anushka Weerasinghe')]
  },
  {
    id: '550e8400-e29b-41d4-a716-446655442031', poNumber: 'PO-2031',
    supplierId: 's-9', supplier: { id: 's-9', name: 'Kelani Valley Agro Products' },
    branch: { id: '550e8400-e29b-41d4-a716-446655440001', slug: 'colombo', name: 'Colombo – Main Branch' },
    items: lines([line('SNK-RP-150', 200, 200), line('SNK-CW-100', 80, 80)]),
    lines: lines([line('SNK-RP-150', 200, 200), line('SNK-CW-100', 80, 80)]),
    status: 'CLOSED', createdAt: daysAgo(40, 9, 0), updatedAt: daysAgo(32, 10, 0),
    expectedAt: daysAgo(33, 9, 0), notes: 'Seasonal harvest batch. Cashew quality excellent.',
    events: [event('e-1', 'Purchase order created', daysAgo(40, 9, 0)), event('e-2', 'Sent to Kelani Valley Agro', daysAgo(40, 9, 20)), event('e-3', 'Delivery received in full', daysAgo(33, 9, 10), 'Nadeesha Perera'), event('e-4', 'Order closed', daysAgo(32, 10, 0))],
    activity: [event('e-1', 'Purchase order created', daysAgo(40, 9, 0)), event('e-2', 'Sent to Kelani Valley Agro', daysAgo(40, 9, 20)), event('e-3', 'Delivery received in full', daysAgo(33, 9, 10), 'Nadeesha Perera'), event('e-4', 'Order closed', daysAgo(32, 10, 0))]
  },
  {
    id: '550e8400-e29b-41d4-a716-446655442030', poNumber: 'PO-2030',
    supplierId: 's-11', supplier: { id: 's-11', name: 'Bairaha Farms Ltd' },
    branch: { id: '550e8400-e29b-41d4-a716-446655440003', slug: 'galle', name: 'Galle Branch' },
    items: lines([line('FRZ-FC-1000', 40, 40)]),
    lines: lines([line('FRZ-FC-1000', 40, 40)]),
    status: 'RECEIVED', createdAt: daysAgo(10, 8, 0), updatedAt: daysAgo(7, 9, 20),
    expectedAt: daysAgo(7, 8, 0), notes: 'Temperature log verified on receipt.',
    events: [event('e-1', 'Purchase order created', daysAgo(10, 8, 0), 'Dilhani Wickrama'), event('e-2', 'Sent to Bairaha Farms', daysAgo(10, 8, 20), 'Dilhani Wickrama'), event('e-3', 'Delivery received in full — 40 kg frozen chicken', daysAgo(7, 9, 20), 'Dilhani Wickrama')],
    activity: [event('e-1', 'Purchase order created', daysAgo(10, 8, 0), 'Dilhani Wickrama'), event('e-2', 'Sent to Bairaha Farms', daysAgo(10, 8, 20), 'Dilhani Wickrama'), event('e-3', 'Delivery received in full — 40 kg frozen chicken', daysAgo(7, 9, 20), 'Dilhani Wickrama')]
  },
  {
    id: '550e8400-e29b-41d4-a716-446655442029', poNumber: 'PO-2029',
    supplierId: 's-13', supplier: { id: 's-13', name: 'Office Needs Lanka' },
    branch: { id: '550e8400-e29b-41d4-a716-446655440001', slug: 'colombo', name: 'Colombo – Main Branch' },
    items: lines([line('STN-BP-012', 50, 0), line('STN-CB-A4', 80, 0), line('STN-AP-500', 30, 0), line('STN-HP-005', 40, 0)]),
    lines: lines([line('STN-BP-012', 50, 0), line('STN-CB-A4', 80, 0), line('STN-AP-500', 30, 0), line('STN-HP-005', 40, 0)]),
    status: 'DRAFT', createdAt: daysAgo(0, 15, 30), updatedAt: daysAgo(0, 15, 30),
    expectedAt: daysAgo(-7, 9, 0), notes: 'Seasonal back-to-school restock.',
    events: [event('e-1', 'Purchase order created', daysAgo(0, 15, 30))],
    activity: [event('e-1', 'Purchase order created', daysAgo(0, 15, 30))]
  },
  {
    id: '550e8400-e29b-41d4-a716-446655442028', poNumber: 'PO-2028',
    supplierId: 's-14', supplier: { id: 's-14', name: 'Electro Lanka Distributors' },
    branch: { id: '550e8400-e29b-41d4-a716-446655440001', slug: 'colombo', name: 'Colombo – Main Branch' },
    items: lines([line('ELC-PL-009', 80, 80), line('ELC-EC-003', 20, 20)]),
    lines: lines([line('ELC-PL-009', 80, 80), line('ELC-EC-003', 20, 20)]),
    status: 'RECEIVED', createdAt: daysAgo(45, 10, 0), updatedAt: daysAgo(38, 9, 15),
    expectedAt: daysAgo(38, 9, 0), notes: '',
    events: [event('e-1', 'Purchase order created', daysAgo(45, 10, 0)), event('e-2', 'Sent to Electro Lanka', daysAgo(45, 10, 30)), event('e-3', 'Delivery received in full — 100 units', daysAgo(38, 9, 15), 'Anushka Weerasinghe')],
    activity: [event('e-1', 'Purchase order created', daysAgo(45, 10, 0)), event('e-2', 'Sent to Electro Lanka', daysAgo(45, 10, 30)), event('e-3', 'Delivery received in full — 100 units', daysAgo(38, 9, 15), 'Anushka Weerasinghe')]
  },
  {
    id: '550e8400-e29b-41d4-a716-446655442027', poNumber: 'PO-2027',
    supplierId: 's-10', supplier: { id: 's-10', name: 'Pelwatte Agri Industries Ltd' },
    branch: { id: '550e8400-e29b-41d4-a716-446655440002', slug: 'kandy', name: 'Kandy Branch' },
    items: lines([line('DRY-PB-227', 48, 20), line('DRY-MS-200', 36, 0)]),
    lines: lines([line('DRY-PB-227', 48, 20), line('DRY-MS-200', 36, 0)]),
    status: 'PARTIALLY_RECEIVED', createdAt: daysAgo(11, 9, 0), updatedAt: daysAgo(5, 10, 45),
    expectedAt: daysAgo(-3, 9, 0), notes: 'Balance to arrive with next cold-chain run.',
    events: [event('e-1', 'Purchase order created', daysAgo(11, 9, 0), 'Ishara Jayasuriya'), event('e-2', 'Sent to Pelwatte Agri', daysAgo(11, 9, 20), 'Ishara Jayasuriya'), event('e-3', 'Partial delivery received — 20 of 84 units', daysAgo(5, 10, 45), 'Ishara Jayasuriya')],
    activity: [event('e-1', 'Purchase order created', daysAgo(11, 9, 0), 'Ishara Jayasuriya'), event('e-2', 'Sent to Pelwatte Agri', daysAgo(11, 9, 20), 'Ishara Jayasuriya'), event('e-3', 'Partial delivery received — 20 of 84 units', daysAgo(5, 10, 45), 'Ishara Jayasuriya')]
  },
  {
    id: '550e8400-e29b-41d4-a716-446655442026', poNumber: 'PO-2026',
    supplierId: 's-1', supplier: { id: 's-1', name: 'Ceylon Beverages Distributors' },
    branch: { id: '550e8400-e29b-41d4-a716-446655440005', slug: 'matara', name: 'Matara Branch' },
    items: lines([line('BEV-CC-400', 120, 120), line('BEV-SP-400', 96, 96), line('BEV-FA-400', 96, 96), line('BEV-EH-1000', 48, 48)]),
    lines: lines([line('BEV-CC-400', 120, 120), line('BEV-SP-400', 96, 96), line('BEV-FA-400', 96, 96), line('BEV-EH-1000', 48, 48)]),
    status: 'RECEIVED', createdAt: daysAgo(25, 11, 0), updatedAt: daysAgo(18, 10, 30),
    expectedAt: daysAgo(18, 9, 0), notes: 'Matara branch opening stock.',
    events: [event('e-1', 'Purchase order created', daysAgo(25, 11, 0), 'Prabha Seneviratne'), event('e-2', 'Sent to Ceylon Beverages', daysAgo(25, 11, 25), 'Prabha Seneviratne'), event('e-3', 'Delivery received in full — 360 units', daysAgo(18, 10, 30), 'Prabha Seneviratne')],
    activity: [event('e-1', 'Purchase order created', daysAgo(25, 11, 0), 'Prabha Seneviratne'), event('e-2', 'Sent to Ceylon Beverages', daysAgo(25, 11, 25), 'Prabha Seneviratne'), event('e-3', 'Delivery received in full — 360 units', daysAgo(18, 10, 30), 'Prabha Seneviratne')]
  },
  {
    id: '550e8400-e29b-41d4-a716-446655442025', poNumber: 'PO-2025',
    supplierId: 's-6', supplier: { id: 's-6', name: 'Lanka Household Supplies' },
    branch: { id: '550e8400-e29b-41d4-a716-446655440004', slug: 'negombo', name: 'Negombo Branch' },
    items: lines([line('HHD-DT-500', 40, 0), line('HHD-SF-1000', 60, 0), line('HHD-MM-500', 24, 0)]),
    lines: lines([line('HHD-DT-500', 40, 0), line('HHD-SF-1000', 60, 0), line('HHD-MM-500', 24, 0)]),
    status: 'SENT', createdAt: daysAgo(3, 14, 0), updatedAt: daysAgo(3, 14, 20),
    expectedAt: daysAgo(-4, 9, 0), notes: '',
    events: [event('e-1', 'Purchase order created', daysAgo(3, 14, 0), 'Chamara Bandara'), event('e-2', 'Sent to Lanka Household Supplies', daysAgo(3, 14, 20), 'Chamara Bandara')],
    activity: [event('e-1', 'Purchase order created', daysAgo(3, 14, 0), 'Chamara Bandara'), event('e-2', 'Sent to Lanka Household Supplies', daysAgo(3, 14, 20), 'Chamara Bandara')]
  },
  {
    id: '550e8400-e29b-41d4-a716-446655442024', poNumber: 'PO-2024',
    supplierId: 's-4', supplier: { id: 's-4', name: 'Local Bakers Collective' },
    branch: { id: '550e8400-e29b-41d4-a716-446655440003', slug: 'galle', name: 'Galle Branch' },
    items: lines([line('BAK-SB-450', 60, 60), line('BAK-CB-001', 200, 200), line('BAK-CI-004', 40, 40)]),
    lines: lines([line('BAK-SB-450', 60, 60), line('BAK-CB-001', 200, 200), line('BAK-CI-004', 40, 40)]),
    status: 'RECEIVED', createdAt: daysAgo(7, 16, 30), updatedAt: daysAgo(6, 6, 0),
    expectedAt: daysAgo(6, 5, 0), notes: 'Daily bread standing order.',
    events: [event('e-1', 'Purchase order created', daysAgo(7, 16, 30), 'Dilhani Wickrama'), event('e-2', 'Sent to Local Bakers Collective', daysAgo(7, 16, 45), 'Dilhani Wickrama'), event('e-3', 'Delivery received — 300 units', daysAgo(6, 6, 0), 'Dilhani Wickrama')],
    activity: [event('e-1', 'Purchase order created', daysAgo(7, 16, 30), 'Dilhani Wickrama'), event('e-2', 'Sent to Local Bakers Collective', daysAgo(7, 16, 45), 'Dilhani Wickrama'), event('e-3', 'Delivery received — 300 units', daysAgo(6, 6, 0), 'Dilhani Wickrama')]
  },
  {
    id: '550e8400-e29b-41d4-a716-446655442023', poNumber: 'PO-2023',
    supplierId: 's-8', supplier: { id: 's-8', name: 'Metro Imports (Pvt) Ltd' },
    branch: { id: '550e8400-e29b-41d4-a716-446655440002', slug: 'kandy', name: 'Kandy Branch' },
    items: lines([line('SNK-OR-119', 60, 60), line('SNK-RT-135', 40, 40), line('BEV-RB-250', 48, 48)]),
    lines: lines([line('SNK-OR-119', 60, 60), line('SNK-RT-135', 40, 40), line('BEV-RB-250', 48, 48)]),
    status: 'CANCELLED', createdAt: daysAgo(22, 11, 0), updatedAt: daysAgo(20, 15, 30),
    expectedAt: daysAgo(15, 9, 0), notes: 'Cancelled due to supplier stock issues. Will re-raise next cycle.',
    events: [event('e-1', 'Purchase order created', daysAgo(22, 11, 0), 'Ishara Jayasuriya'), event('e-2', 'Sent to Metro Imports', daysAgo(22, 11, 20), 'Ishara Jayasuriya'), event('e-3', 'Order cancelled — supplier unable to fulfil', daysAgo(20, 15, 30))],
    activity: [event('e-1', 'Purchase order created', daysAgo(22, 11, 0), 'Ishara Jayasuriya'), event('e-2', 'Sent to Metro Imports', daysAgo(22, 11, 20), 'Ishara Jayasuriya'), event('e-3', 'Order cancelled — supplier unable to fulfil', daysAgo(20, 15, 30))]
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
