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
  // ─── Colombo Branch Movements ───
  { id: 'mv-001', product: { id: 'p-008', sku: 'DRY-AN-1000', name: 'Anchor Full Cream Milk 1L' }, productId: 'p-008', branch: { id: 'colombo-id', slug: 'colombo', name: 'Colombo – Main Branch' }, type: 'SALE', quantity: -2, qty: -2, referenceId: 'SALE-10493', reference: 'SALE-10493', note: 'Card payment · Terminal 1', createdAt: minutesAgo(38), updatedAt: minutesAgo(38) },
  { id: 'mv-002', product: { id: 'p-008', sku: 'DRY-AN-1000', name: 'Anchor Full Cream Milk 1L' }, productId: 'p-008', branch: { id: 'colombo-id', slug: 'colombo', name: 'Colombo – Main Branch' }, type: 'SALE', quantity: -6, qty: -6, referenceId: 'SALE-10471', reference: 'SALE-10471', note: 'Bulk purchase', createdAt: minutesAgo(210), updatedAt: minutesAgo(210) },
  { id: 'mv-003', product: { id: 'p-008', sku: 'DRY-AN-1000', name: 'Anchor Full Cream Milk 1L' }, productId: 'p-008', branch: { id: 'colombo-id', slug: 'colombo', name: 'Colombo – Main Branch' }, type: 'PURCHASE', quantity: 50, qty: 50, referenceId: 'PO-2043', reference: 'PO-2043', note: 'PO-2043 partial receipt', createdAt: daysAgo(2, 9, 5), updatedAt: daysAgo(2, 9, 5) },
  { id: 'mv-004', product: { id: 'p-008', sku: 'DRY-AN-1000', name: 'Anchor Full Cream Milk 1L' }, productId: 'p-008', branch: { id: 'colombo-id', slug: 'colombo', name: 'Colombo – Main Branch' }, type: 'ADJUSTMENT', quantity: -1, qty: -1, referenceId: 'ADJ-0912', reference: 'ADJ-0912', note: 'Damaged in storage', createdAt: daysAgo(3, 18, 30), updatedAt: daysAgo(3, 18, 30) },
  { id: 'mv-005', product: { id: 'p-008', sku: 'DRY-AN-1000', name: 'Anchor Full Cream Milk 1L' }, productId: 'p-008', branch: { id: 'colombo-id', slug: 'colombo', name: 'Colombo – Main Branch' }, type: 'TRANSFER_OUT', quantity: -12, qty: -12, referenceId: 'TRF-0338', reference: 'TRF-0338', note: 'Transferred to Kandy Branch', createdAt: daysAgo(4, 11, 40), updatedAt: daysAgo(4, 11, 40) },
  { id: 'mv-006', product: { id: 'p-008', sku: 'DRY-AN-1000', name: 'Anchor Full Cream Milk 1L' }, productId: 'p-008', branch: { id: 'colombo-id', slug: 'colombo', name: 'Colombo – Main Branch' }, type: 'ADJUSTMENT', quantity: 3, qty: 3, referenceId: 'ADJ-0908', reference: 'ADJ-0908', note: 'Recount correction', createdAt: daysAgo(5, 8, 15), updatedAt: daysAgo(5, 8, 15) },
  { id: 'mv-007', product: { id: 'p-010', sku: 'DRY-KC-200', name: 'Kotmale Cheddar Cheese 200g' }, productId: 'p-010', branch: { id: 'colombo-id', slug: 'colombo', name: 'Colombo – Main Branch' }, type: 'SALE', quantity: -4, qty: -4, referenceId: 'SALE-10462', reference: 'SALE-10462', note: 'Last units on hand', createdAt: daysAgo(1, 16, 20), updatedAt: daysAgo(1, 16, 20) },
  { id: 'mv-008', product: { id: 'p-001', sku: 'BEV-CC-400', name: 'Coca-Cola 400ml' }, productId: 'p-001', branch: { id: 'colombo-id', slug: 'colombo', name: 'Colombo – Main Branch' }, type: 'PURCHASE', quantity: 240, qty: 240, referenceId: 'PO-2042', reference: 'PO-2042', note: 'PO-2042 received in full', createdAt: daysAgo(6, 10, 0), updatedAt: daysAgo(6, 10, 0) },
  { id: 'mv-009', product: { id: 'p-001', sku: 'BEV-CC-400', name: 'Coca-Cola 400ml' }, productId: 'p-001', branch: { id: 'colombo-id', slug: 'colombo', name: 'Colombo – Main Branch' }, type: 'SALE', quantity: -8, qty: -8, referenceId: 'SALE-10488', reference: 'SALE-10488', note: 'Party purchase · Card', createdAt: minutesAgo(95), updatedAt: minutesAgo(95) },
  { id: 'mv-010', product: { id: 'p-005', sku: 'SNK-MC-190', name: 'Munchee Cream Crackers 190g' }, productId: 'p-005', branch: { id: 'colombo-id', slug: 'colombo', name: 'Colombo – Main Branch' }, type: 'SALE', quantity: -5, qty: -5, referenceId: 'SALE-10475', reference: 'SALE-10475', note: '', createdAt: minutesAgo(170), updatedAt: minutesAgo(170) },
  { id: 'mv-011', product: { id: 'p-011', sku: 'HHD-SG-120', name: 'Signal Toothpaste 120g' }, productId: 'p-011', branch: { id: 'colombo-id', slug: 'colombo', name: 'Colombo – Main Branch' }, type: 'PURCHASE', quantity: 90, qty: 90, referenceId: 'PO-2040', reference: 'PO-2040', note: 'Unilever PO-2040 received', createdAt: daysAgo(17, 10, 5), updatedAt: daysAgo(17, 10, 5) },
  { id: 'mv-012', product: { id: 'p-003', sku: 'BEV-NG-200', name: 'Nescafé Gold 200g' }, productId: 'p-003', branch: { id: 'colombo-id', slug: 'colombo', name: 'Colombo – Main Branch' }, type: 'ADJUSTMENT', quantity: -3, qty: -3, referenceId: 'ADJ-0915', reference: 'ADJ-0915', note: 'Recount — packaging damaged', createdAt: daysAgo(2, 14, 20), updatedAt: daysAgo(2, 14, 20) },
  { id: 'mv-013', product: { id: 'p-003', sku: 'BEV-NG-200', name: 'Nescafé Gold 200g' }, productId: 'p-003', branch: { id: 'colombo-id', slug: 'colombo', name: 'Colombo – Main Branch' }, type: 'ADJUSTMENT', quantity: -4, qty: -4, referenceId: 'ADJ-0910', reference: 'ADJ-0910', note: 'Recount — shelf variance', createdAt: daysAgo(4, 11, 0), updatedAt: daysAgo(4, 11, 0) },
  { id: 'mv-014', product: { id: 'p-003', sku: 'BEV-NG-200', name: 'Nescafé Gold 200g' }, productId: 'p-003', branch: { id: 'colombo-id', slug: 'colombo', name: 'Colombo – Main Branch' }, type: 'ADJUSTMENT', quantity: -4, qty: -4, referenceId: 'ADJ-0905', reference: 'ADJ-0905', note: 'Recount — discrepancy found', createdAt: daysAgo(6, 9, 30), updatedAt: daysAgo(6, 9, 30) },
  { id: 'mv-015', product: { id: 'p-003', sku: 'BEV-NG-200', name: 'Nescafé Gold 200g' }, productId: 'p-003', branch: { id: 'colombo-id', slug: 'colombo', name: 'Colombo – Main Branch' }, type: 'ADJUSTMENT', quantity: -5, qty: -5, referenceId: 'ADJ-0901', reference: 'ADJ-0901', note: 'Recount', createdAt: daysAgo(8, 10, 15), updatedAt: daysAgo(8, 10, 15) },
  { id: 'mv-016', product: { id: 'p-009', sku: 'DRY-HL-080', name: 'Highland Set Yoghurt 80g' }, productId: 'p-009', branch: { id: 'colombo-id', slug: 'colombo', name: 'Colombo – Main Branch' }, type: 'SALE', quantity: -12, qty: -12, referenceId: 'SALE-10480', reference: 'SALE-10480', note: '', createdAt: minutesAgo(145), updatedAt: minutesAgo(145) },
  { id: 'mv-017', product: { id: 'p-041', sku: 'SNK-KB-050', name: 'Kandos Milk Chocolate Bar 50g' }, productId: 'p-041', branch: { id: 'colombo-id', slug: 'colombo', name: 'Colombo – Main Branch' }, type: 'SALE', quantity: -10, qty: -10, referenceId: 'SALE-10485', reference: 'SALE-10485', note: 'School group purchase', createdAt: minutesAgo(80), updatedAt: minutesAgo(80) },
  { id: 'mv-018', product: { id: 'p-072', sku: 'PRC-SH-200', name: 'Sunsilk Shampoo 200ml' }, productId: 'p-072', branch: { id: 'colombo-id', slug: 'colombo', name: 'Colombo – Main Branch' }, type: 'PURCHASE', quantity: 120, qty: 120, referenceId: 'PO-2034', reference: 'PO-2034', note: 'Unilever personal care PO-2034', createdAt: daysAgo(20, 10, 30), updatedAt: daysAgo(20, 10, 30) },
  { id: 'mv-019', product: { id: 'p-014', sku: 'BAK-SB-450', name: 'Sandwich Bread Loaf 450g' }, productId: 'p-014', branch: { id: 'colombo-id', slug: 'colombo', name: 'Colombo – Main Branch' }, type: 'SALE', quantity: -6, qty: -6, referenceId: 'SALE-10490', reference: 'SALE-10490', note: '', createdAt: minutesAgo(55), updatedAt: minutesAgo(55) },
  { id: 'mv-020', product: { id: 'p-091', sku: 'ELC-DA-004', name: 'Duracell AA Batteries (4 pack)' }, productId: 'p-091', branch: { id: 'colombo-id', slug: 'colombo', name: 'Colombo – Main Branch' }, type: 'PURCHASE', quantity: 60, qty: 60, referenceId: 'PO-2035', reference: 'PO-2035', note: 'Metro Imports partial PO-2035', createdAt: daysAgo(7, 11, 15), updatedAt: daysAgo(7, 11, 15) },
  // ─── Kandy Branch Movements ───
  { id: 'mv-021', product: { id: 'p-001', sku: 'BEV-CC-400', name: 'Coca-Cola 400ml' }, productId: 'p-001', branch: { id: 'kandy-id', slug: 'kandy', name: 'Kandy Branch' }, type: 'SALE', quantity: -5, qty: -5, referenceId: 'SALE-10445', reference: 'SALE-10445', note: '', createdAt: minutesAgo(240), updatedAt: minutesAgo(240) },
  { id: 'mv-022', product: { id: 'p-004', sku: 'BEV-LT-100', name: 'Lipton Ceylon Tea 100 Bags' }, productId: 'p-004', branch: { id: 'kandy-id', slug: 'kandy', name: 'Kandy Branch' }, type: 'SALE', quantity: -3, qty: -3, referenceId: 'SALE-10432', reference: 'SALE-10432', note: '', createdAt: minutesAgo(380), updatedAt: minutesAgo(380) },
  { id: 'mv-023', product: { id: 'p-017', sku: 'BEV-NM-400', name: 'Nestlé Milo 400g' }, productId: 'p-017', branch: { id: 'kandy-id', slug: 'kandy', name: 'Kandy Branch' }, type: 'PURCHASE', quantity: 80, qty: 80, referenceId: 'PO-2043', reference: 'PO-2043', note: 'PO-2043 partial — Milo allocation', createdAt: daysAgo(12, 9, 20), updatedAt: daysAgo(12, 9, 20) },
  { id: 'mv-024', product: { id: 'p-007', sku: 'SNK-LC-090', name: "Lay's Classic Salted 90g" }, productId: 'p-007', branch: { id: 'kandy-id', slug: 'kandy', name: 'Kandy Branch' }, type: 'SALE', quantity: -4, qty: -4, referenceId: 'SALE-10420', reference: 'SALE-10420', note: '', createdAt: daysAgo(1, 14, 30), updatedAt: daysAgo(1, 14, 30) },
  { id: 'mv-025', product: { id: 'p-023', sku: 'FRZ-CP-500', name: 'Crescent Frozen Prawns 500g' }, productId: 'p-023', branch: { id: 'kandy-id', slug: 'kandy', name: 'Kandy Branch' }, type: 'ADJUSTMENT', quantity: -2, qty: -2, referenceId: 'ADJ-0920', reference: 'ADJ-0920', note: 'Freezer burn — disposal', createdAt: daysAgo(2, 9, 45), updatedAt: daysAgo(2, 9, 45) },
  { id: 'mv-026', product: { id: 'p-013', sku: 'HHD-KB-5000', name: 'Keells Basmati Rice 5kg' }, productId: 'p-013', branch: { id: 'kandy-id', slug: 'kandy', name: 'Kandy Branch' }, type: 'SALE', quantity: -2, qty: -2, referenceId: 'SALE-10418', reference: 'SALE-10418', note: 'Cash payment', createdAt: daysAgo(1, 11, 0), updatedAt: daysAgo(1, 11, 0) },
  { id: 'mv-027', product: { id: 'p-052', sku: 'DRY-PB-227', name: 'Pelwatte Dairy Butter 227g' }, productId: 'p-052', branch: { id: 'kandy-id', slug: 'kandy', name: 'Kandy Branch' }, type: 'PURCHASE', quantity: 20, qty: 20, referenceId: 'PO-2027', reference: 'PO-2027', note: 'Pelwatte partial PO-2027', createdAt: daysAgo(5, 10, 45), updatedAt: daysAgo(5, 10, 45) },
  { id: 'mv-028', product: { id: 'p-016', sku: 'FRZ-EH-1000', name: 'Elephant House Vanilla Ice Cream 1L' }, productId: 'p-016', branch: { id: 'kandy-id', slug: 'kandy', name: 'Kandy Branch' }, type: 'SALE', quantity: -3, qty: -3, referenceId: 'SALE-10450', reference: 'SALE-10450', note: '', createdAt: minutesAgo(310), updatedAt: minutesAgo(310) },
  { id: 'mv-029', product: { id: 'p-039', sku: 'SNK-MU-190', name: 'Munchee Super Cream Cracker 190g' }, productId: 'p-039', branch: { id: 'kandy-id', slug: 'kandy', name: 'Kandy Branch' }, type: 'SALE', quantity: -6, qty: -6, referenceId: 'SALE-10440', reference: 'SALE-10440', note: '', createdAt: minutesAgo(420), updatedAt: minutesAgo(420) },
  { id: 'mv-030', product: { id: 'p-025', sku: 'BEV-GB-400', name: 'Elephant House Ginger Beer 400ml' }, productId: 'p-025', branch: { id: 'kandy-id', slug: 'kandy', name: 'Kandy Branch' }, type: 'PURCHASE', quantity: 96, qty: 96, referenceId: 'PO-2038', reference: 'PO-2038', note: 'Ceylon Beverages partial PO-2038', createdAt: daysAgo(3, 8, 55), updatedAt: daysAgo(3, 8, 55) },
  // ─── Galle Branch Movements ───
  { id: 'mv-031', product: { id: 'p-001', sku: 'BEV-CC-400', name: 'Coca-Cola 400ml' }, productId: 'p-001', branch: { id: 'galle-id', slug: 'galle', name: 'Galle Branch' }, type: 'TRANSFER_IN', quantity: 48, qty: 48, referenceId: 'TRF-0339', reference: 'TRF-0339', note: 'Transfer from Colombo – stock replenishment', createdAt: daysAgo(0, 8, 15), updatedAt: daysAgo(0, 8, 15) },
  { id: 'mv-032', product: { id: 'p-021', sku: 'HHD-HP-500', name: 'Harpic Toilet Cleaner 500ml' }, productId: 'p-021', branch: { id: 'galle-id', slug: 'galle', name: 'Galle Branch' }, type: 'SALE', quantity: -3, qty: -3, referenceId: 'SALE-10405', reference: 'SALE-10405', note: '', createdAt: minutesAgo(500), updatedAt: minutesAgo(500) },
  { id: 'mv-033', product: { id: 'p-011', sku: 'HHD-SG-120', name: 'Signal Toothpaste 120g' }, productId: 'p-011', branch: { id: 'galle-id', slug: 'galle', name: 'Galle Branch' }, type: 'PURCHASE', quantity: 90, qty: 90, referenceId: 'PO-2040', reference: 'PO-2040', note: 'Unilever PO-2040', createdAt: daysAgo(17, 10, 5), updatedAt: daysAgo(17, 10, 5) },
  { id: 'mv-034', product: { id: 'p-023', sku: 'FRZ-CP-500', name: 'Crescent Frozen Prawns 500g' }, productId: 'p-023', branch: { id: 'galle-id', slug: 'galle', name: 'Galle Branch' }, type: 'PURCHASE', quantity: 30, qty: 30, referenceId: 'PO-2037', reference: 'PO-2037', note: 'Fonterra PO-2037 received', createdAt: daysAgo(23, 9, 10), updatedAt: daysAgo(23, 9, 10) },
  { id: 'mv-035', product: { id: 'p-070', sku: 'FRZ-FC-1000', name: 'Serunuwara Frozen Chicken 1kg' }, productId: 'p-070', branch: { id: 'galle-id', slug: 'galle', name: 'Galle Branch' }, type: 'PURCHASE', quantity: 40, qty: 40, referenceId: 'PO-2030', reference: 'PO-2030', note: 'Bairaha Farms PO-2030', createdAt: daysAgo(7, 9, 20), updatedAt: daysAgo(7, 9, 20) },
  { id: 'mv-036', product: { id: 'p-064', sku: 'BAK-CB-001', name: 'Chicken Bun' }, productId: 'p-064', branch: { id: 'galle-id', slug: 'galle', name: 'Galle Branch' }, type: 'SALE', quantity: -8, qty: -8, referenceId: 'SALE-10402', reference: 'SALE-10402', note: 'Lunch rush', createdAt: daysAgo(0, 12, 15), updatedAt: daysAgo(0, 12, 15) },
  { id: 'mv-037', product: { id: 'p-002', sku: 'BEV-EH-1000', name: 'Elephant House Cream Soda 1L' }, productId: 'p-002', branch: { id: 'galle-id', slug: 'galle', name: 'Galle Branch' }, type: 'ADJUSTMENT', quantity: -1, qty: -1, referenceId: 'ADJ-0922', reference: 'ADJ-0922', note: 'Bottle broken during unloading', createdAt: daysAgo(1, 10, 30), updatedAt: daysAgo(1, 10, 30) },
  { id: 'mv-038', product: { id: 'p-076', sku: 'PRC-CG-150', name: 'Colgate Toothpaste 150g' }, productId: 'p-076', branch: { id: 'galle-id', slug: 'galle', name: 'Galle Branch' }, type: 'SALE', quantity: -4, qty: -4, referenceId: 'SALE-10398', reference: 'SALE-10398', note: '', createdAt: daysAgo(1, 16, 45), updatedAt: daysAgo(1, 16, 45) },
  // ─── Negombo Branch Movements ───
  { id: 'mv-039', product: { id: 'p-072', sku: 'PRC-SH-200', name: 'Sunsilk Shampoo 200ml' }, productId: 'p-072', branch: { id: 'negombo-id', slug: 'negombo', name: 'Negombo Branch' }, type: 'PURCHASE', quantity: 120, qty: 120, referenceId: 'PO-2034', reference: 'PO-2034', note: 'Negombo opening stock — Unilever', createdAt: daysAgo(20, 10, 30), updatedAt: daysAgo(20, 10, 30) },
  { id: 'mv-040', product: { id: 'p-072', sku: 'PRC-SH-200', name: 'Sunsilk Shampoo 200ml' }, productId: 'p-072', branch: { id: 'negombo-id', slug: 'negombo', name: 'Negombo Branch' }, type: 'SALE', quantity: -3, qty: -3, referenceId: 'SALE-10510', reference: 'SALE-10510', note: '', createdAt: minutesAgo(140), updatedAt: minutesAgo(140) },
  { id: 'mv-041', product: { id: 'p-001', sku: 'BEV-CC-400', name: 'Coca-Cola 400ml' }, productId: 'p-001', branch: { id: 'negombo-id', slug: 'negombo', name: 'Negombo Branch' }, type: 'PURCHASE', quantity: 120, qty: 120, referenceId: 'PO-2026', reference: 'PO-2026', note: 'Opening stock delivery', createdAt: daysAgo(18, 10, 30), updatedAt: daysAgo(18, 10, 30) },
  { id: 'mv-042', product: { id: 'p-001', sku: 'BEV-CC-400', name: 'Coca-Cola 400ml' }, productId: 'p-001', branch: { id: 'negombo-id', slug: 'negombo', name: 'Negombo Branch' }, type: 'SALE', quantity: -6, qty: -6, referenceId: 'SALE-10505', reference: 'SALE-10505', note: '', createdAt: minutesAgo(200), updatedAt: minutesAgo(200) },
  { id: 'mv-043', product: { id: 'p-086', sku: 'STN-HP-005', name: 'Highlighter Pens (5 pack)' }, productId: 'p-086', branch: { id: 'negombo-id', slug: 'negombo', name: 'Negombo Branch' }, type: 'ADJUSTMENT', quantity: 5, qty: 5, referenceId: 'ADJ-0925', reference: 'ADJ-0925', note: 'Inventory recount — addition', createdAt: daysAgo(1, 11, 0), updatedAt: daysAgo(1, 11, 0) },
  // ─── Matara Branch Movements ───
  { id: 'mv-044', product: { id: 'p-001', sku: 'BEV-CC-400', name: 'Coca-Cola 400ml' }, productId: 'p-001', branch: { id: 'matara-id', slug: 'matara', name: 'Matara Branch' }, type: 'PURCHASE', quantity: 120, qty: 120, referenceId: 'PO-2026', reference: 'PO-2026', note: 'Matara opening stock', createdAt: daysAgo(18, 10, 30), updatedAt: daysAgo(18, 10, 30) },
  { id: 'mv-045', product: { id: 'p-014', sku: 'BAK-SB-450', name: 'Sandwich Bread Loaf 450g' }, productId: 'p-014', branch: { id: 'matara-id', slug: 'matara', name: 'Matara Branch' }, type: 'SALE', quantity: -4, qty: -4, referenceId: 'SALE-10520', reference: 'SALE-10520', note: 'Morning rush', createdAt: daysAgo(0, 8, 30), updatedAt: daysAgo(0, 8, 30) },
  { id: 'mv-046', product: { id: 'p-004', sku: 'BEV-LT-100', name: 'Lipton Ceylon Tea 100 Bags' }, productId: 'p-004', branch: { id: 'matara-id', slug: 'matara', name: 'Matara Branch' }, type: 'SALE', quantity: -2, qty: -2, referenceId: 'SALE-10515', reference: 'SALE-10515', note: '', createdAt: minutesAgo(480), updatedAt: minutesAgo(480) },
  // ─── Returns ───
  { id: 'mv-047', product: { id: 'p-007', sku: 'SNK-LC-090', name: "Lay's Classic Salted 90g" }, productId: 'p-007', branch: { id: 'colombo-id', slug: 'colombo', name: 'Colombo – Main Branch' }, type: 'RETURN', quantity: 2, qty: 2, referenceId: 'SALE-10380', reference: 'SALE-10380', note: 'Customer return — stale product', createdAt: daysAgo(1, 10, 5), updatedAt: daysAgo(1, 10, 5) },
  { id: 'mv-048', product: { id: 'p-016', sku: 'FRZ-EH-1000', name: 'Elephant House Vanilla Ice Cream 1L' }, productId: 'p-016', branch: { id: 'kandy-id', slug: 'kandy', name: 'Kandy Branch' }, type: 'RETURN', quantity: 1, qty: 1, referenceId: 'SALE-10295', reference: 'SALE-10295', note: 'Defective product return', createdAt: daysAgo(3, 14, 40), updatedAt: daysAgo(3, 14, 40) },
  // ─── More Colombo ───
  { id: 'mv-049', product: { id: 'p-082', sku: 'STN-BP-012', name: 'Bic Ballpoint Pen (12 pack)' }, productId: 'p-082', branch: { id: 'colombo-id', slug: 'colombo', name: 'Colombo – Main Branch' }, type: 'SALE', quantity: -4, qty: -4, referenceId: 'SALE-10468', reference: 'SALE-10468', note: 'Office supply purchase', createdAt: daysAgo(0, 10, 45), updatedAt: daysAgo(0, 10, 45) },
  { id: 'mv-050', product: { id: 'p-096', sku: 'ELC-PL-009', name: 'Philips LED Bulb 9W' }, productId: 'p-096', branch: { id: 'colombo-id', slug: 'colombo', name: 'Colombo – Main Branch' }, type: 'PURCHASE', quantity: 80, qty: 80, referenceId: 'PO-2028', reference: 'PO-2028', note: 'Electro Lanka PO-2028', createdAt: daysAgo(38, 9, 15), updatedAt: daysAgo(38, 9, 15) }
];

export const anomalyAlerts: AnomalyAlert[] = [
  {
    id: 'a-1', title: 'Unusually high void rate — Kasun Fernando',
    explanation: '6 voided sales in a 2-hour shift — 4× above the branch average for this time window.',
    severity: 'HIGH', status: 'NEW',
    branch: { id: 'colombo-id', slug: 'colombo', name: 'Colombo – Main Branch' },
    relatedUser: { id: 'u-5', name: 'Kasun Fernando', email: 'kasun.f@nexpos.lk', role: 'CASHIER' },
    windowDescription: 'Today, 2:00 PM – 4:00 PM', relatedEntityLabel: 'Kasun Fernando',
    metricDescription: '6 voids · avg 1.5', window: 'Today, 2:00 PM – 4:00 PM',
    related: 'Kasun Fernando', metric: '6 voids · avg 1.5',
    at: minutesAgo(95), createdAt: minutesAgo(95), updatedAt: minutesAgo(95), notes: []
  },
  {
    id: 'a-2', title: 'Repeated manual stock adjustments — Nescafé Gold 200g',
    explanation: '5 negative adjustments totalling −19 units in 8 days, all logged as "Recount" by the same operator.',
    severity: 'HIGH', status: 'NEW',
    branch: { id: 'colombo-id', slug: 'colombo', name: 'Colombo – Main Branch' },
    relatedUser: null, windowDescription: 'Last 8 days', relatedEntityLabel: 'Nescafé Gold 200g',
    metricDescription: '−19 units · 5 entries', window: 'Last 8 days',
    related: 'Nescafé Gold 200g', metric: '−19 units · 5 entries',
    at: daysAgo(1, 8, 20), createdAt: daysAgo(1, 8, 20), updatedAt: daysAgo(1, 8, 20), notes: []
  },
  {
    id: 'a-3', title: 'Discount pattern near approval threshold — Terminal 3',
    explanation: '14 discounts applied at exactly 9.5%, just under the 10% manager-approval limit. Pattern is statistically unlikely to be random.',
    severity: 'MEDIUM', status: 'NEW',
    branch: { id: 'kandy-id', slug: 'kandy', name: 'Kandy Branch' },
    relatedUser: null, windowDescription: 'Last 5 days', relatedEntityLabel: 'Terminal 3',
    metricDescription: '14 discounts @ 9.5%', window: 'Last 5 days',
    related: 'Terminal 3', metric: '14 discounts @ 9.5%',
    at: daysAgo(2, 17, 45), createdAt: daysAgo(2, 17, 45), updatedAt: daysAgo(2, 17, 45), notes: []
  },
  {
    id: 'a-4', title: 'Cash drawer variance trending up — Galle Branch',
    explanation: 'Average end-of-day cash shortfall of Rs. 840.00 across 4 consecutive closings. Total unaccounted: Rs. 3,360.',
    severity: 'MEDIUM', status: 'INVESTIGATING',
    branch: { id: 'galle-id', slug: 'galle', name: 'Galle Branch' },
    relatedUser: null, windowDescription: 'Last 4 days', relatedEntityLabel: 'Galle Branch',
    metricDescription: 'Rs. 840 avg shortfall', window: 'Last 4 days',
    related: 'Galle Branch', metric: 'Rs. 840 avg shortfall',
    at: daysAgo(3, 21, 10), createdAt: daysAgo(3, 21, 10), updatedAt: daysAgo(3, 21, 10),
    notes: [{ id: 'n-1', text: 'Asked Dilhani to recount the float at open and close for the rest of the week. Waiting for results.', author: { id: 'u-1', name: 'Ruwan Silva', email: 'ruwan.silva@nexpos.lk', role: 'ADMIN' }, createdAt: daysAgo(2, 9, 30), updatedAt: daysAgo(2, 9, 30) }]
  },
  {
    id: 'a-5', title: 'After-hours refund activity — Ishara Jayasuriya',
    explanation: '2 refunds processed 26 minutes after shift close last night totalling Rs. 4,180.',
    severity: 'LOW', status: 'REVIEWED',
    branch: { id: 'kandy-id', slug: 'kandy', name: 'Kandy Branch' },
    relatedUser: { id: 'u-3', name: 'Ishara Jayasuriya', email: 'ishara.j@nexpos.lk', role: 'MANAGER' },
    windowDescription: 'Yesterday, 8:41 PM – 9:07 PM', relatedEntityLabel: 'Ishara Jayasuriya',
    metricDescription: '2 refunds · Rs. 4,180', window: 'Yesterday, 8:41 PM – 9:07 PM',
    related: 'Ishara Jayasuriya', metric: '2 refunds · Rs. 4,180',
    at: daysAgo(1, 21, 7), createdAt: daysAgo(1, 21, 7), updatedAt: daysAgo(1, 21, 7),
    notes: [{ id: 'n-1', text: 'Confirmed with Ishara — customer returned after closing with a receipt. No action needed.', author: { id: 'u-2', name: 'Anushka Weerasinghe', email: 'anushka.w@nexpos.lk', role: 'MANAGER' }, createdAt: daysAgo(1, 10, 5), updatedAt: daysAgo(1, 10, 5) }]
  },
  {
    id: 'a-6', title: 'Zero-stock fast mover — Kotmale Cheddar Cheese 200g',
    explanation: 'Product has been out of stock at Colombo Main Branch for 3 consecutive days. Historical sell-through rate suggests 11 missed sales.',
    severity: 'MEDIUM', status: 'NEW',
    branch: { id: 'colombo-id', slug: 'colombo', name: 'Colombo – Main Branch' },
    relatedUser: null, windowDescription: 'Last 3 days', relatedEntityLabel: 'Kotmale Cheddar Cheese 200g',
    metricDescription: '0 units · 11 missed sales', window: 'Last 3 days',
    related: 'Kotmale Cheddar Cheese 200g', metric: '0 units · 11 missed sales',
    at: daysAgo(0, 9, 0), createdAt: daysAgo(0, 9, 0), updatedAt: daysAgo(0, 9, 0), notes: []
  },
  {
    id: 'a-7', title: 'Elevated write-offs in Frozen category — Kandy Branch',
    explanation: 'Three separate write-offs totalling Rs. 14,450 in the Frozen category this week. Possible freezer malfunction.',
    severity: 'HIGH', status: 'INVESTIGATING',
    branch: { id: 'kandy-id', slug: 'kandy', name: 'Kandy Branch' },
    relatedUser: null, windowDescription: 'Last 7 days', relatedEntityLabel: 'Frozen category',
    metricDescription: 'Rs. 14,450 · 3 write-offs', window: 'Last 7 days',
    related: 'Frozen category', metric: 'Rs. 14,450 · 3 write-offs',
    at: daysAgo(1, 14, 30), createdAt: daysAgo(1, 14, 30), updatedAt: daysAgo(1, 14, 30),
    notes: [{ id: 'n-2', text: 'Sent maintenance request to check freezer unit F2. Temp log attached.', author: { id: 'u-3', name: 'Ishara Jayasuriya', email: 'ishara.j@nexpos.lk', role: 'MANAGER' }, createdAt: daysAgo(0, 9, 15), updatedAt: daysAgo(0, 9, 15) }]
  },
  {
    id: 'a-8', title: 'Single cashier processing large card transactions — Tharaka Kumara',
    explanation: '8 card transactions above Rs. 15,000 processed by a single cashier in one shift — 6× the branch average.',
    severity: 'MEDIUM', status: 'NEW',
    branch: { id: 'colombo-id', slug: 'colombo', name: 'Colombo – Main Branch' },
    relatedUser: { id: 'u-9', name: 'Tharaka Kumara', email: 'tharaka.k@nexpos.lk', role: 'CASHIER' },
    windowDescription: 'Yesterday, 9:00 AM – 5:00 PM', relatedEntityLabel: 'Tharaka Kumara',
    metricDescription: '8 large card txns', window: 'Yesterday, 9:00 AM – 5:00 PM',
    related: 'Tharaka Kumara', metric: '8 large card txns',
    at: daysAgo(1, 18, 0), createdAt: daysAgo(1, 18, 0), updatedAt: daysAgo(1, 18, 0), notes: []
  },
  {
    id: 'a-9', title: 'High refund rate — Negombo Branch',
    explanation: 'Negombo branch has processed 9 refunds this week — 3× the expected rate for a branch this size.',
    severity: 'MEDIUM', status: 'NEW',
    branch: { id: 'negombo-id', slug: 'negombo', name: 'Negombo Branch' },
    relatedUser: null, windowDescription: 'This week', relatedEntityLabel: 'Negombo Branch',
    metricDescription: '9 refunds · avg 3', window: 'This week',
    related: 'Negombo Branch', metric: '9 refunds · avg 3',
    at: daysAgo(0, 11, 30), createdAt: daysAgo(0, 11, 30), updatedAt: daysAgo(0, 11, 30), notes: []
  },
  {
    id: 'a-10', title: 'Inventory count mismatch — Keells Basmati Rice',
    explanation: 'System count shows 11 bags at Galle, physical count confirmed only 6. Variance: 5 bags (Rs. 16,250).',
    severity: 'HIGH', status: 'NEW',
    branch: { id: 'galle-id', slug: 'galle', name: 'Galle Branch' },
    relatedUser: null, windowDescription: 'Weekly count – Today', relatedEntityLabel: 'Keells Basmati Rice 5kg',
    metricDescription: '−5 units · Rs. 16,250', window: 'Weekly count',
    related: 'Keells Basmati Rice 5kg', metric: '−5 units · Rs. 16,250',
    at: daysAgo(0, 14, 0), createdAt: daysAgo(0, 14, 0), updatedAt: daysAgo(0, 14, 0), notes: []
  },
  {
    id: 'a-11', title: 'Repeated no-sale cash drawer opens — Sanduni Athukorala',
    explanation: '11 cash drawer opens with no corresponding sale recorded in last 3 days — unusually high.',
    severity: 'MEDIUM', status: 'NEW',
    branch: { id: 'negombo-id', slug: 'negombo', name: 'Negombo Branch' },
    relatedUser: { id: 'u-15', name: 'Sanduni Athukorala', email: 'sanduni.a@nexpos.lk', role: 'CASHIER' },
    windowDescription: 'Last 3 days', relatedEntityLabel: 'Sanduni Athukorala',
    metricDescription: '11 no-sale opens', window: 'Last 3 days',
    related: 'Sanduni Athukorala', metric: '11 no-sale opens',
    at: daysAgo(0, 10, 0), createdAt: daysAgo(0, 10, 0), updatedAt: daysAgo(0, 10, 0), notes: []
  },
  {
    id: 'a-12', title: 'Below reorder threshold — Anchor Full Cream Milk 1L',
    explanation: 'Stock at Colombo Main Branch (4 units) has been below reorder threshold (12) for 2 days. High daily velocity product.',
    severity: 'LOW', status: 'DISMISSED',
    branch: { id: 'colombo-id', slug: 'colombo', name: 'Colombo – Main Branch' },
    relatedUser: null, windowDescription: 'Last 2 days', relatedEntityLabel: 'Anchor Full Cream Milk 1L',
    metricDescription: '4 units · threshold 12', window: 'Last 2 days',
    related: 'Anchor Full Cream Milk 1L', metric: '4 units · threshold 12',
    at: daysAgo(2, 7, 0), createdAt: daysAgo(2, 7, 0), updatedAt: daysAgo(2, 7, 0),
    notes: [{ id: 'n-3', text: 'PO-2043 is in progress — delivery expected in 2 days. Dismissed until stock arrives.', author: { id: 'u-2', name: 'Anushka Weerasinghe', email: 'anushka.w@nexpos.lk', role: 'MANAGER' }, createdAt: daysAgo(1, 9, 0), updatedAt: daysAgo(1, 9, 0) }]
  },
  {
    id: 'a-13', title: 'Split payment manipulation suspected — Terminal 2',
    explanation: '7 split payments where the card portion is exactly Rs. 1.00 and rest is logged as cash. May be used to avoid card transaction fees.',
    severity: 'HIGH', status: 'NEW',
    branch: { id: 'colombo-id', slug: 'colombo', name: 'Colombo – Main Branch' },
    relatedUser: null, windowDescription: 'Last 5 days', relatedEntityLabel: 'Terminal 2',
    metricDescription: '7 anomalous split txns', window: 'Last 5 days',
    related: 'Terminal 2', metric: '7 anomalous split txns',
    at: daysAgo(0, 16, 0), createdAt: daysAgo(0, 16, 0), updatedAt: daysAgo(0, 16, 0), notes: []
  }
];

export const users: User[] = [
  {
    id: 'u-1', name: 'Ruwan Silva', email: 'ruwan.silva@nexpos.lk', role: 'ADMIN',
    branch: null, status: 'ACTIVE', lastActiveAt: minutesAgo(3), lastActive: minutesAgo(3),
    createdAt: daysAgo(720, 9, 0), updatedAt: daysAgo(720, 9, 0)
  },
  {
    id: 'u-2', name: 'Anushka Weerasinghe', email: 'anushka.w@nexpos.lk', role: 'MANAGER',
    branch: { id: 'colombo-id', slug: 'colombo', name: 'Colombo – Main Branch' },
    status: 'ACTIVE', lastActiveAt: minutesAgo(62), lastActive: minutesAgo(62),
    createdAt: daysAgo(540, 9, 0), updatedAt: daysAgo(540, 9, 0)
  },
  {
    id: 'u-3', name: 'Ishara Jayasuriya', email: 'ishara.j@nexpos.lk', role: 'MANAGER',
    branch: { id: 'kandy-id', slug: 'kandy', name: 'Kandy Branch' },
    status: 'ACTIVE', lastActiveAt: daysAgo(1, 19, 40), lastActive: daysAgo(1, 19, 40),
    createdAt: daysAgo(430, 9, 0), updatedAt: daysAgo(430, 9, 0)
  },
  {
    id: 'u-4', name: 'Nadeesha Perera', email: 'nadeesha.p@nexpos.lk', role: 'CASHIER',
    branch: { id: 'colombo-id', slug: 'colombo', name: 'Colombo – Main Branch' },
    status: 'ACTIVE', lastActiveAt: minutesAgo(12), lastActive: minutesAgo(12),
    createdAt: daysAgo(260, 9, 0), updatedAt: daysAgo(260, 9, 0)
  },
  {
    id: 'u-5', name: 'Kasun Fernando', email: 'kasun.f@nexpos.lk', role: 'CASHIER',
    branch: { id: 'colombo-id', slug: 'colombo', name: 'Colombo – Main Branch' },
    status: 'SUSPENDED', lastActiveAt: daysAgo(1, 16, 5), lastActive: daysAgo(1, 16, 5),
    createdAt: daysAgo(180, 9, 0), updatedAt: daysAgo(180, 9, 0)
  },
  {
    id: 'u-6', name: 'Dilhani Wickrama', email: 'dilhani.w@nexpos.lk', role: 'MANAGER',
    branch: { id: 'galle-id', slug: 'galle', name: 'Galle Branch' },
    status: 'ACTIVE', lastActiveAt: minutesAgo(30), lastActive: minutesAgo(30),
    createdAt: daysAgo(4, 9, 0), updatedAt: daysAgo(4, 9, 0)
  },
  {
    id: 'u-7', name: 'Prasad Abeysekara', email: 'prasad.a@nexpos.lk', role: 'CASHIER',
    branch: { id: 'kandy-id', slug: 'kandy', name: 'Kandy Branch' },
    status: 'ACTIVE', lastActiveAt: minutesAgo(90), lastActive: minutesAgo(90),
    createdAt: daysAgo(320, 9, 0), updatedAt: daysAgo(320, 9, 0)
  },
  {
    id: 'u-8', name: 'Kavindra Rajakaruna', email: 'kavindra.r@nexpos.lk', role: 'CASHIER',
    branch: { id: 'kandy-id', slug: 'kandy', name: 'Kandy Branch' },
    status: 'ACTIVE', lastActiveAt: daysAgo(0, 12, 30), lastActive: daysAgo(0, 12, 30),
    createdAt: daysAgo(210, 9, 0), updatedAt: daysAgo(210, 9, 0)
  },
  {
    id: 'u-9', name: 'Tharaka Kumara', email: 'tharaka.k@nexpos.lk', role: 'CASHIER',
    branch: { id: 'colombo-id', slug: 'colombo', name: 'Colombo – Main Branch' },
    status: 'ACTIVE', lastActiveAt: daysAgo(1, 17, 0), lastActive: daysAgo(1, 17, 0),
    createdAt: daysAgo(155, 9, 0), updatedAt: daysAgo(155, 9, 0)
  },
  {
    id: 'u-10', name: 'Sithara Mendis', email: 'sithara.m@nexpos.lk', role: 'CASHIER',
    branch: { id: 'colombo-id', slug: 'colombo', name: 'Colombo – Main Branch' },
    status: 'ACTIVE', lastActiveAt: minutesAgo(25), lastActive: minutesAgo(25),
    createdAt: daysAgo(130, 9, 0), updatedAt: daysAgo(130, 9, 0)
  },
  {
    id: 'u-11', name: 'Thilina Gamage', email: 'thilina.g@nexpos.lk', role: 'CASHIER',
    branch: { id: 'galle-id', slug: 'galle', name: 'Galle Branch' },
    status: 'ACTIVE', lastActiveAt: minutesAgo(110), lastActive: minutesAgo(110),
    createdAt: daysAgo(90, 9, 0), updatedAt: daysAgo(90, 9, 0)
  },
  {
    id: 'u-12', name: 'Asela Jayaratne', email: 'asela.j@nexpos.lk', role: 'CASHIER',
    branch: { id: 'negombo-id', slug: 'negombo', name: 'Negombo Branch' },
    status: 'ACTIVE', lastActiveAt: minutesAgo(75), lastActive: minutesAgo(75),
    createdAt: daysAgo(85, 9, 0), updatedAt: daysAgo(85, 9, 0)
  },
  {
    id: 'u-13', name: 'Nishantha Priyantha', email: 'nishantha.p@nexpos.lk', role: 'CASHIER',
    branch: { id: 'matara-id', slug: 'matara', name: 'Matara Branch' },
    status: 'ACTIVE', lastActiveAt: minutesAgo(195), lastActive: minutesAgo(195),
    createdAt: daysAgo(60, 9, 0), updatedAt: daysAgo(60, 9, 0)
  },
  {
    id: 'u-14', name: 'Chamara Bandara', email: 'chamara.b@nexpos.lk', role: 'MANAGER',
    branch: { id: 'negombo-id', slug: 'negombo', name: 'Negombo Branch' },
    status: 'ACTIVE', lastActiveAt: minutesAgo(40), lastActive: minutesAgo(40),
    createdAt: daysAgo(88, 9, 0), updatedAt: daysAgo(88, 9, 0)
  },
  {
    id: 'u-15', name: 'Sanduni Athukorala', email: 'sanduni.a@nexpos.lk', role: 'CASHIER',
    branch: { id: 'negombo-id', slug: 'negombo', name: 'Negombo Branch' },
    status: 'ACTIVE', lastActiveAt: minutesAgo(55), lastActive: minutesAgo(55),
    createdAt: daysAgo(78, 9, 0), updatedAt: daysAgo(78, 9, 0)
  },
  {
    id: 'u-16', name: 'Ruvini Bandara', email: 'ruvini.b@nexpos.lk', role: 'VIEWER',
    branch: null, status: 'ACTIVE', lastActiveAt: daysAgo(3, 10, 0), lastActive: daysAgo(3, 10, 0),
    createdAt: daysAgo(50, 9, 0), updatedAt: daysAgo(50, 9, 0)
  },
  {
    id: 'u-17', name: 'Malith Senanayake', email: 'malith.s@nexpos.lk', role: 'CASHIER',
    branch: { id: 'colombo-id', slug: 'colombo', name: 'Colombo – Main Branch' },
    status: 'INVITED', lastActiveAt: null, lastActive: '',
    createdAt: daysAgo(5, 9, 0), updatedAt: daysAgo(5, 9, 0)
  },
  {
    id: 'u-18', name: 'Prabha Seneviratne', email: 'prabha.s@nexpos.lk', role: 'MANAGER',
    branch: { id: 'matara-id', slug: 'matara', name: 'Matara Branch' },
    status: 'ACTIVE', lastActiveAt: minutesAgo(150), lastActive: minutesAgo(150),
    createdAt: daysAgo(62, 9, 0), updatedAt: daysAgo(62, 9, 0)
  },
  {
    id: 'u-19', name: 'Dinesh Rathnayake', email: 'dinesh.r@nexpos.lk', role: 'CASHIER',
    branch: { id: 'galle-id', slug: 'galle', name: 'Galle Branch' },
    status: 'INVITED', lastActiveAt: null, lastActive: '',
    createdAt: daysAgo(2, 9, 0), updatedAt: daysAgo(2, 9, 0)
  },
  {
    id: 'u-20', name: 'Hirunika Perera', email: 'hirunika.p@nexpos.lk', role: 'CASHIER',
    branch: { id: 'matara-id', slug: 'matara', name: 'Matara Branch' },
    status: 'ACTIVE', lastActiveAt: minutesAgo(280), lastActive: minutesAgo(280),
    createdAt: daysAgo(55, 9, 0), updatedAt: daysAgo(55, 9, 0)
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
  ADMIN: { pos: true, refunds: true, products: true, purchasing: true, reports: true, settings: true },
  MANAGER: { pos: true, refunds: true, products: true, purchasing: true, reports: true, settings: false },
  CASHIER: { pos: true, refunds: false, products: false, purchasing: false, reports: false, settings: false },
  VIEWER: { pos: false, refunds: false, products: true, purchasing: true, reports: true, settings: false }
};

export const storeSettings: StoreSettings = {
  storeName: 'NexPOS Demo',
  legalName: 'Sathosa Group (Pvt) Ltd',
  currency: 'LKR',
  taxRate: 10,
  taxLabel: 'VAT',
  receiptFooter: 'ස්තූතියි! දින 7 ක් ඇතුළත රිසිට්පත සමග හුවමාරු කරගත හැකිය. | Thank you! Exchanges within 7 days with receipt.',
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
    id: '550e8400-e29b-41d4-a716-446655440338', transferNumber: 'TRF-0338',
    fromBranch: { id: 'colombo-id', slug: 'colombo', name: 'Colombo – Main Branch' },
    toBranch: { id: 'kandy-id', slug: 'kandy', name: 'Kandy Branch' },
    from: 'colombo', to: 'kandy',
    items: [{ id: 'ti-1', product: { id: 'p-008', sku: 'DRY-AN-1000', name: 'Anchor Full Cream Milk 1L' }, productNameSnapshot: 'Anchor Full Cream Milk 1L', productSkuSnapshot: 'DRY-AN-1000', quantity: 12, productId: 'p-008', name: 'Anchor Full Cream Milk 1L', sku: 'DRY-AN-1000', qty: 12, createdAt: daysAgo(4, 11, 40), updatedAt: daysAgo(4, 11, 40) }],
    lines: [{ id: 'ti-1', product: { id: 'p-008', sku: 'DRY-AN-1000', name: 'Anchor Full Cream Milk 1L' }, productNameSnapshot: 'Anchor Full Cream Milk 1L', productSkuSnapshot: 'DRY-AN-1000', quantity: 12, productId: 'p-008', name: 'Anchor Full Cream Milk 1L', sku: 'DRY-AN-1000', qty: 12, createdAt: daysAgo(4, 11, 40), updatedAt: daysAgo(4, 11, 40) }],
    status: 'COMPLETED', note: 'Cover weekend shortfall', createdAt: daysAgo(4, 11, 40), completedAt: daysAgo(3, 15, 10), updatedAt: daysAgo(3, 15, 10)
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440339', transferNumber: 'TRF-0339',
    fromBranch: { id: 'colombo-id', slug: 'colombo', name: 'Colombo – Main Branch' },
    toBranch: { id: 'galle-id', slug: 'galle', name: 'Galle Branch' },
    from: 'colombo', to: 'galle',
    items: [
      { id: 'ti-2', product: { id: 'p-001', sku: 'BEV-CC-400', name: 'Coca-Cola 400ml' }, productNameSnapshot: 'Coca-Cola 400ml', productSkuSnapshot: 'BEV-CC-400', quantity: 48, productId: 'p-001', name: 'Coca-Cola 400ml', sku: 'BEV-CC-400', qty: 48, createdAt: daysAgo(0, 8, 15), updatedAt: daysAgo(0, 8, 15) },
      { id: 'ti-3', product: { id: 'p-005', sku: 'SNK-MC-190', name: 'Munchee Cream Crackers 190g' }, productNameSnapshot: 'Munchee Cream Crackers 190g', productSkuSnapshot: 'SNK-MC-190', quantity: 24, productId: 'p-005', name: 'Munchee Cream Crackers 190g', sku: 'SNK-MC-190', qty: 24, createdAt: daysAgo(0, 8, 15), updatedAt: daysAgo(0, 8, 15) }
    ],
    lines: [
      { id: 'ti-2', product: { id: 'p-001', sku: 'BEV-CC-400', name: 'Coca-Cola 400ml' }, productNameSnapshot: 'Coca-Cola 400ml', productSkuSnapshot: 'BEV-CC-400', quantity: 48, productId: 'p-001', name: 'Coca-Cola 400ml', sku: 'BEV-CC-400', qty: 48, createdAt: daysAgo(0, 8, 15), updatedAt: daysAgo(0, 8, 15) },
      { id: 'ti-3', product: { id: 'p-005', sku: 'SNK-MC-190', name: 'Munchee Cream Crackers 190g' }, productNameSnapshot: 'Munchee Cream Crackers 190g', productSkuSnapshot: 'SNK-MC-190', quantity: 24, productId: 'p-005', name: 'Munchee Cream Crackers 190g', sku: 'SNK-MC-190', qty: 24, createdAt: daysAgo(0, 8, 15), updatedAt: daysAgo(0, 8, 15) }
    ],
    status: 'IN_TRANSIT', note: 'Van dispatched 8:15 AM', createdAt: daysAgo(0, 8, 15), updatedAt: daysAgo(0, 8, 15)
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440340', transferNumber: 'TRF-0340',
    fromBranch: { id: 'kandy-id', slug: 'kandy', name: 'Kandy Branch' },
    toBranch: { id: 'matara-id', slug: 'matara', name: 'Matara Branch' },
    from: 'kandy', to: 'matara',
    items: [{ id: 'ti-4', product: { id: 'p-004', sku: 'BEV-LT-100', name: 'Lipton Ceylon Tea 100 Bags' }, productNameSnapshot: 'Lipton Ceylon Tea 100 Bags', productSkuSnapshot: 'BEV-LT-100', quantity: 10, productId: 'p-004', name: 'Lipton Ceylon Tea 100 Bags', sku: 'BEV-LT-100', qty: 10, createdAt: daysAgo(6, 10, 0), updatedAt: daysAgo(6, 10, 0) }],
    lines: [{ id: 'ti-4', product: { id: 'p-004', sku: 'BEV-LT-100', name: 'Lipton Ceylon Tea 100 Bags' }, productNameSnapshot: 'Lipton Ceylon Tea 100 Bags', productSkuSnapshot: 'BEV-LT-100', quantity: 10, productId: 'p-004', name: 'Lipton Ceylon Tea 100 Bags', sku: 'BEV-LT-100', qty: 10, createdAt: daysAgo(6, 10, 0), updatedAt: daysAgo(6, 10, 0) }],
    status: 'COMPLETED', note: 'Matara opening stock supplement', createdAt: daysAgo(6, 10, 0), completedAt: daysAgo(5, 14, 30), updatedAt: daysAgo(5, 14, 30)
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440341', transferNumber: 'TRF-0341',
    fromBranch: { id: 'colombo-id', slug: 'colombo', name: 'Colombo – Main Branch' },
    toBranch: { id: 'negombo-id', slug: 'negombo', name: 'Negombo Branch' },
    from: 'colombo', to: 'negombo',
    items: [
      { id: 'ti-5', product: { id: 'p-073', sku: 'PRC-DV-100', name: 'Dove Soap Bar 100g' }, productNameSnapshot: 'Dove Soap Bar 100g', productSkuSnapshot: 'PRC-DV-100', quantity: 30, productId: 'p-073', name: 'Dove Soap Bar 100g', sku: 'PRC-DV-100', qty: 30, createdAt: daysAgo(3, 9, 0), updatedAt: daysAgo(3, 9, 0) },
      { id: 'ti-6', product: { id: 'p-012', sku: 'HHD-SL-1000', name: 'Sunlight Detergent Powder 1kg' }, productNameSnapshot: 'Sunlight Detergent Powder 1kg', productSkuSnapshot: 'HHD-SL-1000', quantity: 15, productId: 'p-012', name: 'Sunlight Detergent Powder 1kg', sku: 'HHD-SL-1000', qty: 15, createdAt: daysAgo(3, 9, 0), updatedAt: daysAgo(3, 9, 0) }
    ],
    lines: [
      { id: 'ti-5', product: { id: 'p-073', sku: 'PRC-DV-100', name: 'Dove Soap Bar 100g' }, productNameSnapshot: 'Dove Soap Bar 100g', productSkuSnapshot: 'PRC-DV-100', quantity: 30, productId: 'p-073', name: 'Dove Soap Bar 100g', sku: 'PRC-DV-100', qty: 30, createdAt: daysAgo(3, 9, 0), updatedAt: daysAgo(3, 9, 0) },
      { id: 'ti-6', product: { id: 'p-012', sku: 'HHD-SL-1000', name: 'Sunlight Detergent Powder 1kg' }, productNameSnapshot: 'Sunlight Detergent Powder 1kg', productSkuSnapshot: 'HHD-SL-1000', quantity: 15, productId: 'p-012', name: 'Sunlight Detergent Powder 1kg', sku: 'HHD-SL-1000', qty: 15, createdAt: daysAgo(3, 9, 0), updatedAt: daysAgo(3, 9, 0) }
    ],
    status: 'COMPLETED', note: 'Negombo stock top-up', createdAt: daysAgo(3, 9, 0), completedAt: daysAgo(2, 11, 30), updatedAt: daysAgo(2, 11, 30)
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440342', transferNumber: 'TRF-0342',
    fromBranch: { id: 'colombo-id', slug: 'colombo', name: 'Colombo – Main Branch' },
    toBranch: { id: 'kandy-id', slug: 'kandy', name: 'Kandy Branch' },
    from: 'colombo', to: 'kandy',
    items: [
      { id: 'ti-7', product: { id: 'p-041', sku: 'SNK-KB-050', name: 'Kandos Milk Chocolate Bar 50g' }, productNameSnapshot: 'Kandos Milk Chocolate Bar 50g', productSkuSnapshot: 'SNK-KB-050', quantity: 20, productId: 'p-041', name: 'Kandos Milk Chocolate Bar 50g', sku: 'SNK-KB-050', qty: 20, createdAt: daysAgo(1, 14, 0), updatedAt: daysAgo(1, 14, 0) }
    ],
    lines: [
      { id: 'ti-7', product: { id: 'p-041', sku: 'SNK-KB-050', name: 'Kandos Milk Chocolate Bar 50g' }, productNameSnapshot: 'Kandos Milk Chocolate Bar 50g', productSkuSnapshot: 'SNK-KB-050', quantity: 20, productId: 'p-041', name: 'Kandos Milk Chocolate Bar 50g', sku: 'SNK-KB-050', qty: 20, createdAt: daysAgo(1, 14, 0), updatedAt: daysAgo(1, 14, 0) }
    ],
    status: 'IN_TRANSIT', note: 'Festival season demand boost', createdAt: daysAgo(1, 14, 0), updatedAt: daysAgo(1, 14, 0)
  }
];
