import {
  AnomalyAlert,
  RolePermissions,
  StockMovement,
  StoreSettings,
  Transfer,
  User
} from '../types';
import { daysAgo, minutesAgo } from '../utils/time';

export const seedMovements: StockMovement[] = [
  {
    id: 'mv-001',
    product: { id: 'p-008', sku: 'DRY-AN-1000', name: 'Anchor Full Cream Milk 1L' },
    productId: 'p-008',
    branch: { id: 'colombo-id', slug: 'colombo', name: 'Colombo – Main Branch' },
    type: 'SALE',
    quantity: -2,
    qty: -2,
    referenceId: 'SALE-10493',
    reference: 'SALE-10493',
    note: 'Card payment · Terminal 1',
    createdAt: minutesAgo(38),
    updatedAt: minutesAgo(38)
  },
  {
    id: 'mv-002',
    product: { id: 'p-008', sku: 'DRY-AN-1000', name: 'Anchor Full Cream Milk 1L' },
    productId: 'p-008',
    branch: { id: 'colombo-id', slug: 'colombo', name: 'Colombo – Main Branch' },
    type: 'SALE',
    quantity: -6,
    qty: -6,
    referenceId: 'SALE-10471',
    reference: 'SALE-10471',
    note: 'Bulk purchase',
    createdAt: minutesAgo(210),
    updatedAt: minutesAgo(210)
  },
  {
    id: 'mv-003',
    product: { id: 'p-008', sku: 'DRY-AN-1000', name: 'Anchor Full Cream Milk 1L' },
    productId: 'p-008',
    branch: { id: 'colombo-id', slug: 'colombo', name: 'Colombo – Main Branch' },
    type: 'PURCHASE',
    quantity: 50,
    qty: 50,
    referenceId: 'PO-2043',
    reference: 'PO-2043',
    note: 'PO-2043 received',
    createdAt: daysAgo(2, 9, 5),
    updatedAt: daysAgo(2, 9, 5)
  },
  {
    id: 'mv-004',
    product: { id: 'p-008', sku: 'DRY-AN-1000', name: 'Anchor Full Cream Milk 1L' },
    productId: 'p-008',
    branch: { id: 'colombo-id', slug: 'colombo', name: 'Colombo – Main Branch' },
    type: 'ADJUSTMENT',
    quantity: -1,
    qty: -1,
    referenceId: 'ADJ-0912',
    reference: 'ADJ-0912',
    note: 'Damaged in storage',
    createdAt: daysAgo(3, 18, 30),
    updatedAt: daysAgo(3, 18, 30)
  },
  {
    id: 'mv-005',
    product: { id: 'p-008', sku: 'DRY-AN-1000', name: 'Anchor Full Cream Milk 1L' },
    productId: 'p-008',
    branch: { id: 'colombo-id', slug: 'colombo', name: 'Colombo – Main Branch' },
    type: 'TRANSFER_OUT',
    quantity: -12,
    qty: -12,
    referenceId: 'TRF-0338',
    reference: 'TRF-0338',
    note: 'Transferred to Kandy Branch',
    createdAt: daysAgo(4, 11, 40),
    updatedAt: daysAgo(4, 11, 40)
  },
  {
    id: 'mv-006',
    product: { id: 'p-008', sku: 'DRY-AN-1000', name: 'Anchor Full Cream Milk 1L' },
    productId: 'p-008',
    branch: { id: 'colombo-id', slug: 'colombo', name: 'Colombo – Main Branch' },
    type: 'ADJUSTMENT',
    quantity: 3,
    qty: 3,
    referenceId: 'ADJ-0908',
    reference: 'ADJ-0908',
    note: 'Recount correction',
    createdAt: daysAgo(5, 8, 15),
    updatedAt: daysAgo(5, 8, 15)
  },
  {
    id: 'mv-007',
    product: { id: 'p-010', sku: 'DRY-KC-200', name: 'Kotmale Cheddar Cheese 200g' },
    productId: 'p-010',
    branch: { id: 'colombo-id', slug: 'colombo', name: 'Colombo – Main Branch' },
    type: 'SALE',
    quantity: -4,
    qty: -4,
    referenceId: 'SALE-10462',
    reference: 'SALE-10462',
    note: 'Last units on hand',
    createdAt: daysAgo(1, 16, 20),
    updatedAt: daysAgo(1, 16, 20)
  },
  {
    id: 'mv-008',
    product: { id: 'p-001', sku: 'BEV-CC-400', name: 'Coca-Cola 400ml' },
    productId: 'p-001',
    branch: { id: 'colombo-id', slug: 'colombo', name: 'Colombo – Main Branch' },
    type: 'PURCHASE',
    quantity: 48,
    qty: 48,
    referenceId: 'PO-2042',
    reference: 'PO-2042',
    note: 'PO-2042 received',
    createdAt: daysAgo(6, 10, 0),
    updatedAt: daysAgo(6, 10, 0)
  }
];

export const anomalyAlerts: AnomalyAlert[] = [
  {
    id: 'a-1',
    title: 'Unusually high void rate — Kasun Fernando',
    explanation: '6 voided sales in a 2-hour shift — 4× above average.',
    severity: 'HIGH',
    status: 'NEW',
    branch: { id: 'colombo-id', slug: 'colombo', name: 'Colombo – Main Branch' },
    relatedUser: { id: 'u-5', name: 'Kasun Fernando', email: 'kasun.f@nexpos.app', role: 'CASHIER' },
    windowDescription: 'Today, 2:00 PM – 4:00 PM',
    relatedEntityLabel: 'Kasun Fernando',
    metricDescription: '6 voids · avg 1.5',
    window: 'Today, 2:00 PM – 4:00 PM',
    related: 'Kasun Fernando',
    metric: '6 voids · avg 1.5',
    at: minutesAgo(95),
    createdAt: minutesAgo(95),
    updatedAt: minutesAgo(95),
    notes: []
  },
  {
    id: 'a-2',
    title: 'Repeated manual stock adjustments — Nescafé Gold 200g',
    explanation: '5 negative adjustments totalling −19 units in 8 days, all logged as “Recount”.',
    severity: 'HIGH',
    status: 'NEW',
    branch: { id: 'colombo-id', slug: 'colombo', name: 'Colombo – Main Branch' },
    relatedUser: null,
    windowDescription: 'Last 8 days',
    relatedEntityLabel: 'Nescafé Gold 200g',
    metricDescription: '−19 units · 5 entries',
    window: 'Last 8 days',
    related: 'Nescafé Gold 200g',
    metric: '−19 units · 5 entries',
    at: daysAgo(1, 8, 20),
    createdAt: daysAgo(1, 8, 20),
    updatedAt: daysAgo(1, 8, 20),
    notes: []
  },
  {
    id: 'a-3',
    title: 'Discount pattern near approval threshold — Terminal 3',
    explanation: '14 discounts applied at 9.5%, just under the 10% manager-approval limit.',
    severity: 'MEDIUM',
    status: 'NEW',
    branch: { id: 'kandy-id', slug: 'kandy', name: 'Kandy Branch' },
    relatedUser: null,
    windowDescription: 'Last 5 days',
    relatedEntityLabel: 'Terminal 3',
    metricDescription: '14 discounts @ 9.5%',
    window: 'Last 5 days',
    related: 'Terminal 3',
    metric: '14 discounts @ 9.5%',
    at: daysAgo(2, 17, 45),
    createdAt: daysAgo(2, 17, 45),
    updatedAt: daysAgo(2, 17, 45),
    notes: []
  },
  {
    id: 'a-4',
    title: 'Cash drawer variance trending up — Galle Branch',
    explanation: 'Average end-of-day shortfall of Rs. 840.00 across 4 consecutive closings.',
    severity: 'MEDIUM',
    status: 'INVESTIGATING',
    branch: { id: 'galle-id', slug: 'galle', name: 'Galle Branch' },
    relatedUser: null,
    windowDescription: 'Last 4 days',
    relatedEntityLabel: 'Galle Branch',
    metricDescription: 'Rs. 840 avg shortfall',
    window: 'Last 4 days',
    related: 'Galle Branch',
    metric: 'Rs. 840 avg shortfall',
    at: daysAgo(3, 21, 10),
    createdAt: daysAgo(3, 21, 10),
    updatedAt: daysAgo(3, 21, 10),
    notes: [
      {
        id: 'n-1',
        text: 'Asked Dilhani to recount the float at open and close for the rest of the week.',
        author: { id: 'u-1', name: 'Ruwan Silva', email: 'ruwan.silva@nexpos.app', role: 'ADMIN' },
        createdAt: daysAgo(2, 9, 30),
        updatedAt: daysAgo(2, 9, 30)
      }
    ]
  },
  {
    id: 'a-5',
    title: 'After-hours refund activity — Ishara Jayasuriya',
    explanation: '2 refunds processed 26 minutes after shift close last night.',
    severity: 'LOW',
    status: 'REVIEWED',
    branch: { id: 'kandy-id', slug: 'kandy', name: 'Kandy Branch' },
    relatedUser: { id: 'u-3', name: 'Ishara Jayasuriya', email: 'ishara.j@nexpos.app', role: 'MANAGER' },
    windowDescription: 'Yesterday, 8:41 PM – 9:07 PM',
    relatedEntityLabel: 'Ishara Jayasuriya',
    metricDescription: '2 refunds · Rs. 4,180',
    window: 'Yesterday, 8:41 PM – 9:07 PM',
    related: 'Ishara Jayasuriya',
    metric: '2 refunds · Rs. 4,180',
    at: daysAgo(1, 21, 7),
    createdAt: daysAgo(1, 21, 7),
    updatedAt: daysAgo(1, 21, 7),
    notes: [
      {
        id: 'n-1',
        text: 'Confirmed with Ishara — customer returned after closing with a receipt. No action needed.',
        author: { id: 'u-2', name: 'Anushka Weerasinghe', email: 'anushka.w@nexpos.app', role: 'MANAGER' },
        createdAt: daysAgo(1, 10, 5),
        updatedAt: daysAgo(1, 10, 5)
      }
    ]
  }
];

export const users: User[] = [
  {
    id: 'u-1',
    name: 'Ruwan Silva',
    email: 'ruwan.silva@nexpos.app',
    role: 'ADMIN',
    branch: null,
    status: 'ACTIVE',
    lastActiveAt: minutesAgo(3),
    lastActive: minutesAgo(3),
    createdAt: daysAgo(720, 9, 0),
    updatedAt: daysAgo(720, 9, 0)
  },
  {
    id: 'u-2',
    name: 'Anushka Weerasinghe',
    email: 'anushka.w@nexpos.app',
    role: 'MANAGER',
    branch: { id: 'colombo-id', slug: 'colombo', name: 'Colombo – Main Branch' },
    status: 'ACTIVE',
    lastActiveAt: minutesAgo(62),
    lastActive: minutesAgo(62),
    createdAt: daysAgo(540, 9, 0),
    updatedAt: daysAgo(540, 9, 0)
  },
  {
    id: 'u-3',
    name: 'Ishara Jayasuriya',
    email: 'ishara.j@nexpos.app',
    role: 'MANAGER',
    branch: { id: 'kandy-id', slug: 'kandy', name: 'Kandy Branch' },
    status: 'ACTIVE',
    lastActiveAt: daysAgo(1, 19, 40),
    lastActive: daysAgo(1, 19, 40),
    createdAt: daysAgo(430, 9, 0),
    updatedAt: daysAgo(430, 9, 0)
  },
  {
    id: 'u-4',
    name: 'Nadeesha Perera',
    email: 'nadeesha.p@nexpos.app',
    role: 'CASHIER',
    branch: { id: 'colombo-id', slug: 'colombo', name: 'Colombo – Main Branch' },
    status: 'ACTIVE',
    lastActiveAt: minutesAgo(12),
    lastActive: minutesAgo(12),
    createdAt: daysAgo(260, 9, 0),
    updatedAt: daysAgo(260, 9, 0)
  },
  {
    id: 'u-5',
    name: 'Kasun Fernando',
    email: 'kasun.f@nexpos.app',
    role: 'CASHIER',
    branch: { id: 'colombo-id', slug: 'colombo', name: 'Colombo – Main Branch' },
    status: 'SUSPENDED',
    lastActiveAt: daysAgo(1, 16, 5),
    lastActive: daysAgo(1, 16, 5),
    createdAt: daysAgo(180, 9, 0),
    updatedAt: daysAgo(180, 9, 0)
  },
  {
    id: 'u-6',
    name: 'Dilhani Wickrama',
    email: 'dilhani.w@nexpos.app',
    role: 'CASHIER',
    branch: { id: 'galle-id', slug: 'galle', name: 'Galle Branch' },
    status: 'INVITED',
    lastActiveAt: null,
    lastActive: '',
    createdAt: daysAgo(4, 9, 0),
    updatedAt: daysAgo(4, 9, 0)
  }
];

export const permissionLabels: { key: keyof RolePermissions['ADMIN']; label: string; hint: string }[] = [
  { key: 'pos', label: 'Operate POS', hint: 'Ring up sales, hold and resume carts' },
  { key: 'refunds', label: 'Refunds & voids', hint: 'Reverse completed transactions' },
  { key: 'products', label: 'Manage products', hint: 'Create, edit and archive catalogue items' },
  { key: 'purchasing', label: 'Purchasing', hint: 'Raise POs and receive stock' },
  { key: 'reports', label: 'View reports', hint: 'Access analytics and exports' },
  { key: 'settings', label: 'Manage settings', hint: 'Change store, tax and user configuration' }
];

export const rolePermissions: RolePermissions = {
  ADMIN: {
    pos: true,
    refunds: true,
    products: true,
    purchasing: true,
    reports: true,
    settings: true
  },
  MANAGER: {
    pos: true,
    refunds: true,
    products: true,
    purchasing: true,
    reports: true,
    settings: false
  },
  CASHIER: {
    pos: true,
    refunds: false,
    products: false,
    purchasing: false,
    reports: false,
    settings: false
  },
  VIEWER: {
    pos: false,
    refunds: false,
    products: true,
    purchasing: true,
    reports: true,
    settings: false
  }
};

export const storeSettings: StoreSettings = {
  storeName: 'NexPOS',
  legalName: 'Sathosa Group (Pvt) Ltd',
  currency: 'LKR',
  taxRate: 10,
  taxLabel: 'VAT',
  receiptFooter: 'Thank you for shopping with us. Exchanges within 7 days with receipt.',
  timezone: 'Asia/Colombo',
  lowStockThreshold: 12,
  maxDiscountPercent: 10,
  requireManagerApproval: true,
  allowNegativeStock: false,
  autoPrintReceipt: true,
  roundCashTo: 1,
  emailAlerts: true,
  alertSensitivity: 'BALANCED',
  sessionTimeoutMinutes: 30,
  twoFactorEnabled: false,
  twoFactor: false
};

export const seedTransfers: Transfer[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440338',
    transferNumber: 'TRF-0338',
    fromBranch: { id: 'colombo-id', slug: 'colombo', name: 'Colombo – Main Branch' },
    toBranch: { id: 'kandy-id', slug: 'kandy', name: 'Kandy Branch' },
    from: 'colombo',
    to: 'kandy',
    items: [
      {
        id: 'ti-1',
        product: { id: 'p-008', sku: 'DRY-AN-1000', name: 'Anchor Full Cream Milk 1L' },
        productNameSnapshot: 'Anchor Full Cream Milk 1L',
        productSkuSnapshot: 'DRY-AN-1000',
        quantity: 12,
        productId: 'p-008',
        name: 'Anchor Full Cream Milk 1L',
        sku: 'DRY-AN-1000',
        qty: 12,
        createdAt: daysAgo(4, 11, 40),
        updatedAt: daysAgo(4, 11, 40)
      }
    ],
    lines: [
      {
        id: 'ti-1',
        product: { id: 'p-008', sku: 'DRY-AN-1000', name: 'Anchor Full Cream Milk 1L' },
        productNameSnapshot: 'Anchor Full Cream Milk 1L',
        productSkuSnapshot: 'DRY-AN-1000',
        quantity: 12,
        productId: 'p-008',
        name: 'Anchor Full Cream Milk 1L',
        sku: 'DRY-AN-1000',
        qty: 12,
        createdAt: daysAgo(4, 11, 40),
        updatedAt: daysAgo(4, 11, 40)
      }
    ],
    status: 'COMPLETED',
    note: 'Cover weekend shortfall',
    createdAt: daysAgo(4, 11, 40),
    completedAt: daysAgo(3, 15, 10),
    updatedAt: daysAgo(3, 15, 10)
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440339',
    transferNumber: 'TRF-0339',
    fromBranch: { id: 'colombo-id', slug: 'colombo', name: 'Colombo – Main Branch' },
    toBranch: { id: 'galle-id', slug: 'galle', name: 'Galle Branch' },
    from: 'colombo',
    to: 'galle',
    items: [
      {
        id: 'ti-2',
        product: { id: 'p-001', sku: 'BEV-CC-400', name: 'Coca-Cola 400ml' },
        productNameSnapshot: 'Coca-Cola 400ml',
        productSkuSnapshot: 'BEV-CC-400',
        quantity: 48,
        productId: 'p-001',
        name: 'Coca-Cola 400ml',
        sku: 'BEV-CC-400',
        qty: 48,
        createdAt: daysAgo(0, 8, 15),
        updatedAt: daysAgo(0, 8, 15)
      },
      {
        id: 'ti-3',
        product: { id: 'p-005', sku: 'SNK-MC-190', name: 'Munchee Cream Crackers 190g' },
        productNameSnapshot: 'Munchee Cream Crackers 190g',
        productSkuSnapshot: 'SNK-MC-190',
        quantity: 24,
        productId: 'p-005',
        name: 'Munchee Cream Crackers 190g',
        sku: 'SNK-MC-190',
        qty: 24,
        createdAt: daysAgo(0, 8, 15),
        updatedAt: daysAgo(0, 8, 15)
      }
    ],
    lines: [
      {
        id: 'ti-2',
        product: { id: 'p-001', sku: 'BEV-CC-400', name: 'Coca-Cola 400ml' },
        productNameSnapshot: 'Coca-Cola 400ml',
        productSkuSnapshot: 'BEV-CC-400',
        quantity: 48,
        productId: 'p-001',
        name: 'Coca-Cola 400ml',
        sku: 'BEV-CC-400',
        qty: 48,
        createdAt: daysAgo(0, 8, 15),
        updatedAt: daysAgo(0, 8, 15)
      },
      {
        id: 'ti-3',
        product: { id: 'p-005', sku: 'SNK-MC-190', name: 'Munchee Cream Crackers 190g' },
        productNameSnapshot: 'Munchee Cream Crackers 190g',
        productSkuSnapshot: 'SNK-MC-190',
        quantity: 24,
        productId: 'p-005',
        name: 'Munchee Cream Crackers 190g',
        sku: 'SNK-MC-190',
        qty: 24,
        createdAt: daysAgo(0, 8, 15),
        updatedAt: daysAgo(0, 8, 15)
      }
    ],
    status: 'IN_TRANSIT',
    note: 'Van dispatched 8:15 AM',
    createdAt: daysAgo(0, 8, 15),
    updatedAt: daysAgo(0, 8, 15)
  }
];
