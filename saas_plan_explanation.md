# NexPOS → SaaS: Plan Explanation

## What Your Current System Looks Like

Your current system is built for **one business**. The database has:

- `branches` table — one business's branches
- `users` table — users of that one business (ADMIN / MANAGER / CASHIER / VIEWER roles)
- All products, inventory, sales, reports → belong to that one business implicitly

There is **no concept of a "Business/Tenant"** in the database today. Everyone shares the same database tables.

---

## What Needs to Change: The Core Concept

To become a SaaS, you need a new top-level layer called a **Tenant** (= a business that pays you).

```
NexPOS Platform (YOU)
│
├── Tenant: Business A  ← pays Rs. 7,500/month (BUSINESS plan)
│   ├── Branch 1
│   └── Branch 2
│
├── Tenant: Business B  ← pays Rs. 4,500/month (STARTER plan)
│   └── Branch 1
│
└── Tenant: Business C  ← pays Rs. 12,500/month (PROFESSIONAL plan)
    ├── Branch 1
    ├── Branch 2
    └── Branch 3
```

Every piece of data — products, sales, users, inventory — must be **scoped to a Tenant**.

---

## The 4 Subscription Plans Explained

### 1. STARTER — Rs. 4,500/month

| What | Limit |
|------|-------|
| Branches | 1 |
| POS terminals | 1 |
| Users | 3 |
| Products | 5,000 |

**What this means technically:**
- System checks: if tenant has 1 branch already → block creating a second one
- System checks: if user count ≥ 3 → block inviting more users
- No inter-branch transfers (only 1 branch anyway)
- No purchase orders or supplier management
- Reports are basic: only daily/weekly sales totals and simple profit

**Who this is for:** A single grocery shop, clothing store, or mobile shop with one cashier + one manager.

---

### 2. BUSINESS ⭐ — Rs. 7,500/month

| What | Limit |
|------|-------|
| Branches | 3 |
| POS terminals | 5 |
| Users | 15 |
| Products | 25,000 |

**What this means technically (everything in Starter, plus):**
- Up to 3 branches → inter-branch stock transfers become possible
- Each branch can have its own inventory levels and product pricing
- A consolidated dashboard shows all branches together
- Purchase Orders and Supplier management are unlocked
- Advanced analytics: profit & loss, product margins, stock valuation
- Payment reconciliation feature unlocked
- Mobile barcode scanner app unlocked
- Email notifications unlocked

**Who this is for:** A mini supermarket that has a main store and 2 satellite stores, or a growing retail business.

---

### 3. PROFESSIONAL — Rs. 12,500/month

| What | Limit |
|------|-------|
| Branches | 10 |
| POS terminals | 20 |
| Users | 50 |
| Products | Unlimited |

**What this means technically (everything in Business, plus):**
- Up to 10 branches, cross-branch profitability comparison
- Stock movement audit ledger (who moved what, when, from which branch)
- Anomaly / fraud detection alerts (your existing `AnomalyAlert` entity becomes a premium feature)
- Void/refund monitoring, stock shrinkage monitoring
- "Ask Your Data" AI analytics (premium differentiator)
- Supplier payment terms (credit terms, due dates)
- Advanced user permission system (fine-grained access control)
- Scheduled automated backups
- Priority support with faster response

**Who this is for:** A supermarket chain, wholesaler, or retail business with multiple branches across locations.

---

### 4. ENTERPRISE — From Rs. 25,000/month (Custom)

**No hard limits** — you negotiate with each enterprise customer.

**What this means technically:**
- Could be deployed on dedicated infrastructure (their own server or cloud account)
- Their own dedicated database (not shared with other tenants)
- Custom domain (e.g., `pos.theircompany.lk`) and custom branding/logo
- Custom reports built specifically for them
- API integrations with their accounting software (e.g., QuickBooks, custom ERP)
- Custom hardware integrations (weighing scales, label printers, etc.)
- Custom development features built on request
- SLA — you guarantee uptime (e.g., 99.9%) and a response time (e.g., 4 hours)
- Dedicated technical contact (one person they can always call)

**Who this is for:** Large supermarket chains, wholesalers, or any business too big for the Professional plan.

---

### 5. ONE-TIME LICENSE — Rs. 150,000

This is **not SaaS**. The customer pays once and gets:
- The compiled software installed on **their own server**
- They manage it themselves after 1 year of support
- No source code — just the right to run the application
- After Year 1: Rs. 30,000/year for updates and support

**Important:** The customer owns a license, not the software. They cannot resell or modify it.

---

### 6. SOURCE CODE LICENSE — Rs. 450,000

This is a **completely different product**. The customer gets:
- Your full Spring Boot backend source code
- Your full React frontend source code
- Your React Native/Expo scanner source code
- All documentation (API docs, Swagger, Docker, architecture, deployment)
- 30 days of technical assistance to help them understand the code

**Important:** This is for developers/companies who want to build their own product based on your code or deploy it themselves with full control.

---

## How Limits Are Enforced Technically

Your backend needs to:

1. **Store plan limits** — a `Subscription` or `TenantPlan` table that says: "Business A is on BUSINESS plan, max 3 branches, max 15 users"
2. **Check limits on every create operation:**
   - Creating a branch → count existing branches for tenant → if at limit, return 403
   - Inviting a user → count existing users for tenant → if at limit, return 403
   - Creating a product → count existing products for tenant → if at limit, return 403
3. **Feature flags** — some features (purchase orders, anomaly alerts, "Ask Your Data") are only accessible if the tenant's plan includes them
4. **Tenant isolation** — every database query filters by `tenant_id` so Business A never sees Business B's data

---

## Key Changes Required in Your Current Code

| Area | Current State | What Needs Adding |
|------|--------------|-------------------|
| Database | No `Tenant` concept | New `tenants` table + `tenant_id` FK on every table |
| `User` entity | `branch_id` FK only | + `tenant_id` FK |
| `Branch` entity | No tenant link | + `tenant_id` FK |
| `Role` enum | ADMIN / MANAGER / CASHIER / VIEWER | New role: `SUPER_ADMIN` (you, the platform owner) |
| Auth | Single-tenant JWT | JWT must carry `tenant_id` |
| All queries | No tenant filter | Every query: `WHERE tenant_id = ?` |
| Plan enforcement | None | New `Subscription` entity + limit-check service |
| Payment | None | Integration with a payment gateway (e.g., Stripe, PayHere) |
| Admin portal | None | New super-admin UI for you to manage all tenants |

---

## Summary

> Your current system is a **single-tenant POS**. To become SaaS, the single most important change is adding a **Tenant layer** that sits above everything else. Every business that subscribes gets their own isolated "bubble" of data inside your shared database, with limits enforced by their subscription plan.
