import { daysAgo } from '../utils/time';

export type PlanType = 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE' | 'BUSINESS';
export type TenantStatus = 'ACTIVE' | 'TRIAL' | 'SUSPENDED' | 'INVITED' | 'PENDING_APPROVAL';

export interface TenantSummaryDto {
  id: string;
  businessName: string;
  subdomain?: string;
  plan: PlanType;
  status: TenantStatus;
  ownerEmail: string;
  branchCount: number;
  userCount: number;
  createdAt: string;
}

export const demoTenants: TenantSummaryDto[] = [
  {
    id: 'tenant-001', businessName: 'Sathosa Group (Pvt) Ltd', subdomain: 'sathosa',
    plan: 'ENTERPRISE', status: 'ACTIVE', ownerEmail: 'admin@sathosa.lk',
    branchCount: 5, userCount: 20, createdAt: daysAgo(720, 9, 0)
  },
  {
    id: 'tenant-002', businessName: 'Keells Super Market', subdomain: 'keells',
    plan: 'ENTERPRISE', status: 'ACTIVE', ownerEmail: 'info@keells.lk',
    branchCount: 8, userCount: 45, createdAt: daysAgo(640, 9, 0)
  },
  {
    id: 'tenant-003', businessName: 'Odel Fashion Retail', subdomain: 'odel',
    plan: 'PROFESSIONAL', status: 'ACTIVE', ownerEmail: 'manager@odel.lk',
    branchCount: 3, userCount: 18, createdAt: daysAgo(580, 9, 0)
  },
  {
    id: 'tenant-004', businessName: 'RJ Pharmacy', subdomain: 'rjpharmacy',
    plan: 'STARTER', status: 'ACTIVE', ownerEmail: 'owner@rjpharmacy.lk',
    branchCount: 1, userCount: 4, createdAt: daysAgo(420, 9, 0)
  },
  {
    id: 'tenant-005', businessName: 'Lanka Hardware Plus', subdomain: 'lankahw',
    plan: 'STARTER', status: 'ACTIVE', ownerEmail: 'accounts@lankahw.lk',
    branchCount: 2, userCount: 6, createdAt: daysAgo(380, 9, 0)
  },
  {
    id: 'tenant-006', businessName: 'Colombo Fashion Hub', subdomain: 'cfhub',
    plan: 'PROFESSIONAL', status: 'ACTIVE', ownerEmail: 'it@cfhub.lk',
    branchCount: 4, userCount: 14, createdAt: daysAgo(340, 9, 0)
  },
  {
    id: 'tenant-007', businessName: 'Kandy Electronics Gallery', subdomain: 'kandyelec',
    plan: 'PROFESSIONAL', status: 'ACTIVE', ownerEmail: 'admin@kandyelec.lk',
    branchCount: 2, userCount: 9, createdAt: daysAgo(290, 9, 0)
  },
  {
    id: 'tenant-008', businessName: 'Sunshine Supermart', subdomain: 'sunshinemkt',
    plan: 'STARTER', status: 'TRIAL', ownerEmail: 'info@sunshinemkt.lk',
    branchCount: 1, userCount: 3, createdAt: daysAgo(18, 9, 0)
  },
  {
    id: 'tenant-009', businessName: 'Cargills Food City Jaffna', subdomain: 'cargillsjaffna',
    plan: 'PROFESSIONAL', status: 'ACTIVE', ownerEmail: 'jaffna@cargills.lk',
    branchCount: 2, userCount: 12, createdAt: daysAgo(260, 9, 0)
  },
  {
    id: 'tenant-010', businessName: 'Batticaloa Fresh Market', subdomain: 'battifresh',
    plan: 'STARTER', status: 'ACTIVE', ownerEmail: 'info@battifresh.lk',
    branchCount: 1, userCount: 5, createdAt: daysAgo(200, 9, 0)
  },
  {
    id: 'tenant-011', businessName: 'Galle Ayurveda Pharmacy', subdomain: 'gallepharm',
    plan: 'STARTER', status: 'SUSPENDED', ownerEmail: 'owner@gallepharm.lk',
    branchCount: 1, userCount: 3, createdAt: daysAgo(180, 9, 0)
  },
  {
    id: 'tenant-012', businessName: 'Negombo Sea Mart', subdomain: 'negombosea',
    plan: 'PROFESSIONAL', status: 'ACTIVE', ownerEmail: 'sales@negombosea.lk',
    branchCount: 2, userCount: 8, createdAt: daysAgo(155, 9, 0)
  },
  {
    id: 'tenant-013', businessName: 'Ratnapura Gem Boutique', subdomain: 'ratnapuragems',
    plan: 'STARTER', status: 'TRIAL', ownerEmail: 'admin@ratnapuragems.lk',
    branchCount: 1, userCount: 2, createdAt: daysAgo(7, 9, 0)
  },
  {
    id: 'tenant-014', businessName: 'Polonnaruwa Agro Centre', subdomain: 'polonagro',
    plan: 'STARTER', status: 'ACTIVE', ownerEmail: 'contact@polonagro.lk',
    branchCount: 1, userCount: 4, createdAt: daysAgo(130, 9, 0)
  },
  {
    id: 'tenant-015', businessName: 'Anuradhapura Retail Store', subdomain: 'anuraretail',
    plan: 'PROFESSIONAL', status: 'ACTIVE', ownerEmail: 'store@anuraretail.lk',
    branchCount: 2, userCount: 10, createdAt: daysAgo(110, 9, 0)
  },
  {
    id: 'tenant-016', businessName: 'Matale Spice House', subdomain: 'matalespice',
    plan: 'STARTER', status: 'ACTIVE', ownerEmail: 'info@matalespice.lk',
    branchCount: 1, userCount: 3, createdAt: daysAgo(90, 9, 0)
  },
  {
    id: 'tenant-017', businessName: 'Kurunegala Supermart', subdomain: 'kurumkt',
    plan: 'PROFESSIONAL', status: 'ACTIVE', ownerEmail: 'admin@kurumkt.lk',
    branchCount: 3, userCount: 11, createdAt: daysAgo(75, 9, 0)
  },
  {
    id: 'tenant-018', businessName: 'Hambantota Bay Mart', subdomain: 'hambamart',
    plan: 'STARTER', status: 'TRIAL', ownerEmail: 'ops@hambamart.lk',
    branchCount: 1, userCount: 2, createdAt: daysAgo(4, 9, 0)
  }
] as TenantSummaryDto[];

export const planLabels: Record<PlanType, string> = {
  STARTER: 'Starter',
  BUSINESS: 'Business',
  PROFESSIONAL: 'Professional',
  ENTERPRISE: 'Enterprise'
};

export const planColors: Record<PlanType, string> = {
  STARTER: 'bg-slate-100 text-slate-700',
  BUSINESS: 'bg-blue-100 text-blue-700',
  PROFESSIONAL: 'bg-indigo-100 text-indigo-700',
  ENTERPRISE: 'bg-amber-100 text-amber-700'
};
