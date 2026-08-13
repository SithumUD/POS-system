import { Branch, BranchId } from '../types';

export const branches: Branch[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    slug: 'colombo',
    name: 'Colombo – Main Branch',
    shortName: 'Colombo',
    address: '148 Galle Road, Kollupitiya, Colombo 03',
    phone: '+94 11 234 8800',
    manager: { id: 'u-2', name: 'Anushka Weerasinghe', email: 'anushka.w@nexpos.lk', role: 'MANAGER' },
    opensAt: '07:30',
    closesAt: '22:00',
    terminalCount: 4,
    status: 'OPEN',
    todaySales: 128450,
    weekSales: 812300,
    staff: 12,
    createdAt: '2025-01-10T09:00:00Z',
    updatedAt: '2026-08-04T08:00:00Z'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    slug: 'kandy',
    name: 'Kandy Branch',
    shortName: 'Kandy',
    address: '27 Peradeniya Road, Kandy 20000',
    phone: '+94 81 220 4410',
    manager: { id: 'u-3', name: 'Ishara Jayasuriya', email: 'ishara.j@nexpos.lk', role: 'MANAGER' },
    opensAt: '08:00',
    closesAt: '21:00',
    terminalCount: 3,
    status: 'OPEN',
    todaySales: 74120,
    weekSales: 486900,
    staff: 8,
    createdAt: '2025-02-15T09:00:00Z',
    updatedAt: '2026-08-04T08:00:00Z'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    slug: 'galle',
    name: 'Galle Branch',
    shortName: 'Galle',
    address: '62 Wakwella Road, Galle 80000',
    phone: '+94 91 224 7730',
    manager: { id: 'u-6', name: 'Dilhani Wickrama', email: 'dilhani.w@nexpos.lk', role: 'MANAGER' },
    opensAt: '08:00',
    closesAt: '20:30',
    terminalCount: 2,
    status: 'OPEN',
    todaySales: 51680,
    weekSales: 331450,
    staff: 6,
    createdAt: '2025-03-20T09:00:00Z',
    updatedAt: '2026-08-04T08:00:00Z'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    slug: 'negombo',
    name: 'Negombo Branch',
    shortName: 'Negombo',
    address: '34 Sea Street, Negombo 11500',
    phone: '+94 31 222 5590',
    manager: { id: 'u-14', name: 'Chamara Bandara', email: 'chamara.b@nexpos.lk', role: 'MANAGER' },
    opensAt: '08:30',
    closesAt: '21:30',
    terminalCount: 2,
    status: 'OPEN',
    todaySales: 62340,
    weekSales: 402100,
    staff: 7,
    createdAt: '2025-05-10T09:00:00Z',
    updatedAt: '2026-08-04T08:00:00Z'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    slug: 'matara',
    name: 'Matara Branch',
    shortName: 'Matara',
    address: '18 Main Street, Matara 81000',
    phone: '+94 41 222 2200',
    manager: { id: 'u-18', name: 'Prabha Seneviratne', email: 'prabha.s@nexpos.lk', role: 'MANAGER' },
    opensAt: '08:00',
    closesAt: '20:00',
    terminalCount: 2,
    status: 'OPEN',
    todaySales: 39870,
    weekSales: 258600,
    staff: 5,
    createdAt: '2025-08-15T09:00:00Z',
    updatedAt: '2026-08-04T08:00:00Z'
  }
];

export const branchIds: BranchId[] = branches.map((b) => b.slug || b.id);

export function branchName(id: BranchId): string {
  const b = branches.find((branch) => branch.slug === id || branch.id === id);
  return b?.shortName ?? b?.name ?? id;
}
