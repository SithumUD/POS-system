# POS & Inventory Management System — Project Plan

**Stack:** Next.js (frontend) · Spring Boot (backend) · PostgreSQL (database)
**Goal:** A portfolio-grade, production-style POS/Inventory platform that demonstrates full-stack architecture, real-time data handling, security, and clean system design to recruiters.

---

## 1. Product Overview

A multi-user Point-of-Sale and Inventory Management System for small-to-medium retail businesses. It replaces manual stock counts and paper-based sales tracking with a real-time, role-based web application supporting barcode-driven checkout, live stock updates, and sales/inventory analytics.

**Target user:** A retail shop with a cashier counter, a stock room, and an owner/manager who needs visibility into sales and inventory without being on-site.

---

## 2. Why This Project Is a Strong Portfolio Piece

- Demonstrates **transactional integrity** (stock must never go negative, sales and stock updates must be atomic).
- Demonstrates **real-time systems** (live stock/dashboard updates via WebSocket).
- Demonstrates **role-based access control** and **multi-branch/multi-tenant** thinking.
- Demonstrates **reporting & analytics** (not just CRUD).
- Gives you a natural story to tell in interviews: *"I designed the schema so stock deductions and sales are atomic, used optimistic locking to prevent overselling under concurrent checkouts, and built a reporting layer with materialized views for fast dashboards."*

---

## 3. What Makes This Different From a Typical "POS Project" on a CV

Recruiters are right that basic POS/inventory CRUD apps are everywhere. The features below are what most candidates skip because they require real systems-design thinking, not just forms and tables. Pick 3–4 of these (not all — depth beats breadth) and go deep enough to explain the trade-offs in an interview.

### 3.1 Event-Driven Architecture (core differentiator)
Instead of a checkout endpoint doing everything synchronously, a completed sale publishes a `SaleCompleted` event (via RabbitMQ or an in-process event bus if you want to keep infra simple). Independent consumers react to it: stock decrement, loyalty points, low-stock check, analytics aggregation, receipt email. This is exactly the architecture pattern from your Blue Ceylon project, applied here — it shows you can decouple systems, not just call a service method.
*Interview line: "Checkout doesn't call five services directly — it publishes one event, and stock, loyalty, and analytics consume it independently, so adding a new side effect never touches the checkout code path."*

### 3.2 Offline-First POS (high "wow factor", genuinely rare on CVs)
Retail shops lose internet. A real differentiator: the POS terminal keeps working offline using a local IndexedDB queue (via a service worker), lets the cashier keep selling, and syncs completed sales to the server once connectivity returns — using idempotency keys so a retried sync never double-charges stock. This is the single feature that most makes a POS project look "production-grade" rather than "tutorial."

### 3.3 Concurrency-Safe Multi-Terminal Sync
Two cashiers, two terminals, one shared stock pool. Use optimistic locking (`@Version`) plus WebSocket broadcast so when Terminal A sells the last unit, Terminal B's cart instantly shows it as out-of-stock instead of letting both oversell it. Most tutorial POS apps assume a single terminal — handling this correctly is a real distributed-systems problem.

### 3.4 Demand Forecasting & Smart Reorder Suggestions
Instead of a static reorder threshold, compute a rolling sales velocity per product (e.g., weighted moving average over the last N weeks, accounting for day-of-week seasonality) and surface a "reorder X units by this date" suggestion on the dashboard. Start with a simple statistical model; mention it's swappable for a proper ML model later — this shows you understand where forecasting fits in the architecture without overbuilding on day one.

### 3.5 Anomaly & Shrinkage Detection
Flag suspicious patterns automatically: a cashier with an unusually high void/refund rate, repeated manual stock adjustments on the same product, or discounts consistently applied just under a manager-approval threshold. Rule-based scoring is enough to start (and to explain clearly in an interview) — this is the kind of feature that maps directly to real retail loss-prevention needs, which most student projects never touch.

### 3.6 Pluggable Payment Gateway Strategy
Design payment processing behind a `PaymentStrategy` interface (Cash, Card, PayHere/Stripe) so adding a new payment method never touches checkout logic — same pattern as your Blue Ceylon escrow payment design, reused here to show consistency in how you approach integrations.

### 3.7 Natural-Language Reporting ("Ask Your Data")
A small chat box on the dashboard where a manager can type "what were my top 5 products last week?" and get an answer. Implementation: constrain an LLM to translate the question into parameters against a **fixed set of pre-approved report queries/views** (never raw free-form SQL — that's a security risk, and being able to explain *why* you avoided it is itself a strong signal). This is a genuinely uncommon feature for a portfolio POS project and demonstrates you can integrate AI responsibly rather than just as a gimmick.

> **Recommended focus for a solo build:** 3.1 (event-driven), 3.3 (multi-terminal concurrency), and 3.4 (reorder suggestions) give you the best signal-to-effort ratio. Add 3.2 (offline-first) if you want one standout "wow" feature, and 3.7 only once the core system is solid — it's the most impressive in a demo but adds the least architectural depth.

---

## 4. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, Zustand/Context for cart state, Recharts for dashboards |
| Backend | Spring Boot 3, Spring Web, Spring Security (JWT), Spring Data JPA, Bean Validation |
| Database | PostgreSQL, Flyway for migrations |
| Real-time | WebSocket (STOMP) for live stock/dashboard updates |
| Auth | JWT access + refresh tokens, role-based authorization (Admin, Manager, Cashier) |
| Caching (optional) | Redis for dashboard aggregates / session blacklist |
| Infra | Docker Compose (local), GitHub Actions CI/CD, deploy to Render/Railway/Digital Ocean |
| Testing | JUnit 5 + Testcontainers (backend), Playwright/Cypress (E2E), Jest/RTL (frontend units) |
| Docs | OpenAPI/Swagger for the REST API |

---

## 5. Core Modules & Features

### 4.1 Authentication & User Management
- Register/login with JWT (access + refresh token rotation).
- Roles: **Admin** (full access), **Manager** (branch-level access, reports, inventory), **Cashier** (POS screen only).
- Password reset via email (token-based).
- Audit log of logins and critical actions (who changed a price, who voided a sale).

### 4.2 Product & Category Management
- CRUD for products: name, SKU, barcode, category, unit price, cost price, tax rate, unit of measure, reorder threshold, image.
- Category tree (e.g., Beverages → Soft Drinks).
- Bulk import products via CSV.
- Barcode generation/printing for products without one.

### 4.3 Inventory Management
- Real-time stock levels per product (and per branch, if multi-branch).
- Stock adjustments (damage, theft, manual correction) with a reason code — always logged, never a silent edit.
- **Stock movement ledger**: every stock change (sale, purchase, adjustment, return) is an immutable record — this is what makes "current stock" always explainable and auditable.
- Low-stock alerts (dashboard badge + optional email/notification) when stock < reorder threshold.
- Purchase orders: create a PO to a supplier, receive stock against it (partial receipt supported), auto-update stock and cost price on receipt.

### 4.4 Point of Sale (POS) Screen
- Barcode scanner input (keyboard-wedge scanner support — scanning just types into a focused input and hits Enter).
- Manual product search (name/SKU) as a fallback.
- Cart: add/remove items, adjust quantity, apply line-level or cart-level discount.
- Multiple payment methods per sale (cash, card, split payment).
- Change calculation for cash payments.
- Hold/resume a sale (park a cart and return to it later — common real POS feature).
- Print/download receipt (PDF) after checkout.
- Void/refund a completed sale (Manager/Admin approval required) — restores stock via the same stock-movement ledger.

### 4.5 Sales & Transactions
- Every sale is a transaction with line items, snapshot of price at time of sale (never reference a mutable product price after the fact).
- Sales history with filters (date range, cashier, branch, payment method).
- Daily cash-up / shift close: cashier reconciles expected vs. actual cash at end of shift.

### 4.6 Reporting & Analytics Dashboard
- Sales trends over time (daily/weekly/monthly), best-selling products, revenue by category.
- Stock valuation report (current stock × cost price).
- Low-stock and out-of-stock report.
- Profit margin report (sale price vs. cost price).
- Cashier performance (sales per cashier/shift).
- Export reports to CSV/PDF.

### 4.7 Supplier Management
- CRUD suppliers, link products to preferred suppliers.
- Purchase order lifecycle: Draft → Sent → Partially Received → Received → Closed.

### 4.8 Multi-Branch Support (stretch goal — great differentiator)
- Products and pricing can be global or branch-specific.
- Stock tracked per branch; transfer stock between branches (creates two ledger entries: OUT of source, IN to destination).
- Branch-level reporting + consolidated owner view across all branches.

### 4.9 Notifications (stretch goal)
- Real-time low-stock and "sale completed" toasts via WebSocket for managers watching the dashboard live.

---

## 6. Data Model (Core Entities)

```
User            (id, name, email, password_hash, role, branch_id, is_active)
Branch          (id, name, address)
Category        (id, name, parent_id)
Product         (id, sku, barcode, name, category_id, unit_price, cost_price,
                 tax_rate, reorder_threshold, unit_of_measure, is_active)
Inventory       (id, product_id, branch_id, quantity_on_hand)   -- current snapshot
StockMovement   (id, product_id, branch_id, type[SALE/PURCHASE/ADJUSTMENT/
                 TRANSFER_IN/TRANSFER_OUT/RETURN], quantity, reference_id,
                 reason, created_by, created_at)                -- immutable ledger
Supplier        (id, name, contact_email, phone)
PurchaseOrder   (id, supplier_id, branch_id, status, created_by, created_at)
PurchaseOrderItem (id, purchase_order_id, product_id, quantity_ordered,
                 quantity_received, unit_cost)
Sale            (id, branch_id, cashier_id, status[COMPLETED/VOIDED/REFUNDED],
                 subtotal, discount, tax, total, created_at)
SaleItem        (id, sale_id, product_id, quantity, unit_price_at_sale,
                 discount, line_total)
Payment         (id, sale_id, method[CASH/CARD], amount)
AuditLog        (id, user_id, action, entity, entity_id, metadata, created_at)
```

**Key design decision:** `Inventory.quantity_on_hand` is a derived/cached value; the `StockMovement` table is the source of truth. This mirrors how real accounting/inventory systems work (ledger + running balance) and is a strong talking point in interviews.

---

## 7. API Design (high level)

```
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/logout

GET    /api/products?query=&category=&page=
POST   /api/products
PUT    /api/products/{id}
DELETE /api/products/{id}

GET    /api/inventory?branchId=
POST   /api/inventory/adjust

POST   /api/purchase-orders
POST   /api/purchase-orders/{id}/receive

POST   /api/sales                 -- create a sale (checkout)
GET    /api/sales?from=&to=&cashierId=
POST   /api/sales/{id}/void
POST   /api/sales/{id}/refund

GET    /api/reports/sales-summary
GET    /api/reports/stock-valuation
GET    /api/reports/low-stock

WS     /topic/inventory/{branchId}   -- live stock updates
WS     /topic/dashboard/{branchId}   -- live sales feed
```

Use pagination, filtering, and sorting query params consistently. Document everything in Swagger/OpenAPI — recruiters and interviewers often check this.

---

## 8. Non-Functional Requirements (what makes it look senior, not tutorial-level)

- **Concurrency safety:** use optimistic locking (`@Version`) on `Inventory` so two simultaneous checkouts can't oversell the same last unit; on conflict, retry or reject with a clear error.
- **Transactional integrity:** a checkout (create Sale + SaleItems + StockMovements + update Inventory) happens inside a single `@Transactional` boundary — all or nothing.
- **Validation:** Bean Validation on all DTOs; meaningful 4xx error responses with a consistent error shape.
- **Security:** role-based method security (`@PreAuthorize`), password hashing with BCrypt, rate-limited login endpoint.
- **Auditability:** every stock/price/void action writes to `AuditLog`.
- **Testing:** unit tests for pricing/discount logic, integration tests (Testcontainers + Postgres) for the checkout flow, at least one E2E test covering scan → cart → checkout → stock decremented.
- **Performance:** paginate all list endpoints; index `barcode`, `sku`, and `(product_id, branch_id)` on inventory/stock tables; use a materialized view or scheduled aggregation job for the sales dashboard so it doesn't scan raw sales data on every load.

---

## 9. Complete Project Folder Structure

Two repos (recommended) so the frontend and backend can be deployed, versioned, and CI'd independently — also reads better on a CV/portfolio than one mixed repo.

### 9.1 Backend — `pos-backend/` (Spring Boot, feature-organized)

Organizing by **feature/domain** (not by technical layer alone) makes the event-driven design in Section 3.1 much cleaner, since each feature owns its own events, and it's the structure most senior Spring Boot codebases actually use.

```
pos-backend/
├── src/
│   ├── main/
│   │   ├── java/com/sithum/pos/
│   │   │   ├── PosApplication.java
│   │   │   │
│   │   │   ├── common/                      # cross-cutting concerns
│   │   │   │   ├── config/                  # SecurityConfig, WebSocketConfig, OpenApiConfig, RabbitConfig
│   │   │   │   ├── exception/                # GlobalExceptionHandler, custom exceptions
│   │   │   │   ├── security/                 # JwtService, JwtFilter, UserPrincipal
│   │   │   │   ├── audit/                     # AuditLog entity, AuditAspect (AOP-based logging)
│   │   │   │   └── util/
│   │   │   │
│   │   │   ├── auth/
│   │   │   │   ├── AuthController.java
│   │   │   │   ├── AuthService.java
│   │   │   │   ├── dto/
│   │   │   │   └── entity/User.java
│   │   │   │
│   │   │   ├── product/
│   │   │   │   ├── ProductController.java
│   │   │   │   ├── ProductService.java
│   │   │   │   ├── ProductRepository.java
│   │   │   │   ├── dto/
│   │   │   │   └── entity/ (Product.java, Category.java)
│   │   │   │
│   │   │   ├── inventory/
│   │   │   │   ├── InventoryController.java
│   │   │   │   ├── InventoryService.java
│   │   │   │   ├── StockMovementRepository.java
│   │   │   │   ├── event/ (StockLowEvent.java, StockAdjustedEvent.java)
│   │   │   │   ├── dto/
│   │   │   │   └── entity/ (Inventory.java, StockMovement.java)
│   │   │   │
│   │   │   ├── sales/                        # POS checkout domain
│   │   │   │   ├── SaleController.java
│   │   │   │   ├── SaleService.java           # transactional checkout logic
│   │   │   │   ├── SaleRepository.java
│   │   │   │   ├── event/ (SaleCompletedEvent.java, SaleVoidedEvent.java)
│   │   │   │   ├── listener/                  # consumers reacting to SaleCompletedEvent
│   │   │   │   │   ├── StockDeductionListener.java
│   │   │   │   │   ├── LoyaltyPointsListener.java
│   │   │   │   │   └── AnalyticsListener.java
│   │   │   │   ├── payment/                   # Section 3.6 — pluggable payment strategy
│   │   │   │   │   ├── PaymentStrategy.java (interface)
│   │   │   │   │   ├── CashPaymentStrategy.java
│   │   │   │   │   ├── CardPaymentStrategy.java
│   │   │   │   │   └── PayHerePaymentStrategy.java
│   │   │   │   ├── dto/
│   │   │   │   └── entity/ (Sale.java, SaleItem.java, Payment.java)
│   │   │   │
│   │   │   ├── purchasing/
│   │   │   │   ├── SupplierController.java / SupplierService.java
│   │   │   │   ├── PurchaseOrderController.java / PurchaseOrderService.java
│   │   │   │   ├── dto/
│   │   │   │   └── entity/ (Supplier.java, PurchaseOrder.java, PurchaseOrderItem.java)
│   │   │   │
│   │   │   ├── reporting/
│   │   │   │   ├── ReportController.java
│   │   │   │   ├── ReportService.java          # sales summary, stock valuation, etc.
│   │   │   │   ├── forecasting/                # Section 3.4 — demand forecasting
│   │   │   │   │   └── ReorderSuggestionService.java
│   │   │   │   └── nlquery/                    # Section 3.7 — natural-language reporting
│   │   │   │       ├── NlQueryController.java
│   │   │   │       └── NlQueryService.java     # maps NL -> whitelisted report queries only
│   │   │   │
│   │   │   ├── anomaly/                        # Section 3.5 — shrinkage/fraud detection
│   │   │   │   ├── AnomalyScanScheduler.java
│   │   │   │   └── AnomalyRuleEngine.java
│   │   │   │
│   │   │   ├── branch/                          # Section multi-branch support
│   │   │   │   ├── BranchController.java / BranchService.java
│   │   │   │   └── entity/Branch.java
│   │   │   │
│   │   │   └── ws/                              # WebSocket broadcast endpoints
│   │   │       ├── InventoryWebSocketController.java
│   │   │       └── DashboardWebSocketController.java
│   │   │
│   │   └── resources/
│   │       ├── application.yml
│   │       ├── application-dev.yml
│   │       ├── application-prod.yml
│   │       └── db/migration/                    # Flyway
│   │           ├── V1__init_schema.sql
│   │           ├── V2__add_stock_movement.sql
│   │           └── V3__add_purchase_orders.sql
│   │
│   └── test/
│       └── java/com/sithum/pos/
│           ├── sales/SaleServiceIntegrationTest.java   # Testcontainers + Postgres
│           ├── inventory/InventoryConcurrencyTest.java # optimistic-lock overselling test
│           └── auth/AuthControllerTest.java
│
├── Dockerfile
├── docker-compose.yml
├── build.gradle (or pom.xml)
└── README.md
```

### 9.2 Frontend — `pos-frontend/` (Next.js App Router)

```
pos-frontend/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── (dashboard)/                     # manager/admin area
│   │   │   ├── layout.tsx                    # role-guarded shell + sidebar
│   │   │   ├── dashboard/page.tsx             # live sales feed, low-stock, reorder suggestions
│   │   │   ├── products/
│   │   │   │   ├── page.tsx                   # product list
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── inventory/page.tsx
│   │   │   ├── purchase-orders/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── suppliers/page.tsx
│   │   │   ├── reports/
│   │   │   │   ├── page.tsx                   # charts (Recharts)
│   │   │   │   └── ask/page.tsx                # NL "ask your data" console
│   │   │   ├── anomalies/page.tsx              # flagged shrinkage/fraud alerts
│   │   │   └── branches/page.tsx
│   │   │
│   │   ├── (pos)/                            # cashier-only, minimal, fast UI
│   │   │   ├── layout.tsx
│   │   │   └── pos/page.tsx                   # barcode scan → cart → checkout
│   │   │
│   │   ├── api/                               # (only if using Next.js route handlers, e.g. BFF proxy)
│   │   ├── layout.tsx
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── ui/                                 # shadcn/ui primitives
│   │   ├── pos/ (Cart.tsx, BarcodeInput.tsx, PaymentModal.tsx, ReceiptPreview.tsx)
│   │   ├── inventory/ (StockTable.tsx, LowStockBadge.tsx, ReorderSuggestionCard.tsx)
│   │   ├── reports/ (SalesTrendChart.tsx, TopProductsChart.tsx, AskDataBox.tsx)
│   │   └── layout/ (Sidebar.tsx, Topbar.tsx, RoleGuard.tsx)
│   │
│   ├── lib/
│   │   ├── api/ (apiClient.ts, products.ts, sales.ts, inventory.ts, reports.ts)
│   │   ├── auth/ (jwt.ts, useAuth.ts)
│   │   ├── ws/ (useInventorySocket.ts, useDashboardSocket.ts)      # STOMP client hooks
│   │   ├── offline/ (offlineQueue.ts, syncManager.ts)               # Section 3.2 — offline-first
│   │   └── utils.ts
│   │
│   ├── store/                                  # Zustand: cartStore.ts, authStore.ts
│   ├── types/                                  # shared TS types mirroring backend DTOs
│   └── middleware.ts                           # route-level auth/role guard
│
├── public/
│   ├── service-worker.js                       # offline queue + background sync
│   └── manifest.json                           # PWA manifest
│
├── e2e/                                        # Playwright tests
│   └── checkout.spec.ts
│
├── next.config.js
├── tailwind.config.ts
├── package.json
└── README.md
```

### 9.3 Why This Structure Matters (for the interview)
- **Feature-based backend packages** (not `controller/`, `service/`, `repository/` split globally) mean each domain owns its DTOs, entities, and events — a reviewer can see you understand modularity, not just layering.
- **`listener/` packages** make the event-driven design (3.1) visible in the folder structure itself — it's obvious checkout doesn't call five services directly.
- **`(pos)` vs `(dashboard)` route groups** in Next.js reflect the real UX split between a fast, minimal cashier screen and a full manager dashboard — small detail, but shows product thinking, not just coding.
- **`e2e/` and Testcontainers-based integration tests** signal you test the system, not just the units.

---

## 10. Suggested Build Roadmap

**Phase 1 — Foundation**
1. Set up monorepo or two repos: `pos-backend` (Spring Boot) and `pos-frontend` (Next.js).
2. Docker Compose with Postgres; Flyway baseline migration for core tables.
3. Auth: register/login, JWT issue/verify, role guard on frontend routes.

**Phase 2 — Catalog & Inventory**
4. Product & category CRUD (backend + admin UI).
5. Inventory table + stock adjustment endpoint + movement ledger.
6. Low-stock indicator on a simple dashboard.

**Phase 3 — POS Core**
7. POS screen: barcode input, cart, checkout endpoint with transactional stock deduction.
8. Receipt generation (PDF) and sales history screen.
9. Void/refund flow with stock restoration.

**Phase 4 — Purchasing**
10. Supplier CRUD, purchase orders, receive-stock flow updating inventory + cost price.

**Phase 5 — Reporting & Polish**
11. Dashboard: sales trends, top products, stock valuation, profit margin (Recharts).
12. WebSocket live updates for stock and sales feed.
13. CSV/PDF export for reports.

**Phase 6 — Stretch (only if time allows, but high impact for recruiters)**
14. Multi-branch support + stock transfers.
15. Testcontainers integration tests + GitHub Actions CI running them on every PR.
16. Deploy (Docker on Render/Railway/DO), add a demo login on the live URL so recruiters can try it without setup.

**Phase 7 — Differentiators (Section 3) — build these once the core system is solid**
17. Refactor checkout to publish `SaleCompletedEvent`; move stock deduction, loyalty points, and analytics into independent listeners (3.1).
18. Add WebSocket broadcast + optimistic-lock conflict test proving two terminals can't oversell the same unit (3.3).
19. Build the rolling-average reorder suggestion service and surface it on the dashboard (3.4).
20. Add the offline queue + service worker sync for the POS screen (3.2) — do this last, it's the most involved.
21. (Optional, once everything else is stable) Add anomaly scoring (3.5) and the natural-language reporting console (3.7) as final showcase features.

---

## 11. What to Highlight in Your CV/Interview Once Built

- "Checkout publishes a `SaleCompletedEvent` — stock deduction, loyalty points, and analytics are independent listeners, so adding a new side effect never touches checkout logic."
- "Used optimistic locking plus a WebSocket broadcast so two terminals sharing one stock pool can't oversell the same unit."
- "Designed an immutable stock-movement ledger so every inventory change is auditable and current stock is always derivable, not just stored."
- "Built a reorder-suggestion service using rolling sales velocity, instead of a static threshold, to flag what to restock and by when."
- "The POS screen works offline via a service worker queue and syncs with idempotency keys once connectivity returns, so a network drop never blocks a sale or double-charges stock."
- "Wrapped checkout in a single transactional boundary spanning sale creation, stock deduction, and audit logging."
- "Covered the checkout flow with Testcontainers-based integration tests against real Postgres, not mocks."

---

## 12. Nice-to-Have Stretch Features (if you want to go further)

- Multi-currency / multi-tax-rate support per branch.
- Customer accounts + loyalty points.
- Offline-first POS (service worker queue, sync when back online) — advanced but very impressive.
- Role-based UI theming (Cashier gets a minimal, fast POS-only view).
- Barcode label printing integration.
