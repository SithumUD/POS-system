# Backend API Endpoints Specification

This document lists all required API endpoints identified from the frontend POS & ERP system analysis. Each entry includes the HTTP method, endpoint URI, and a concise explanation of its purpose. Backend developers may structure internal database schemas, DTOs, frameworks, and architecture as appropriate for their stack.

---

## 1. Authentication & Session Management (`/api/v1/auth`)

* **`POST /api/v1/auth/login`**: Authenticates user credentials and returns JWT access and refresh tokens along with user profile and branch permissions.
* **`POST /api/v1/auth/refresh`**: Issues a new JWT access token using a valid refresh token.
* **`GET /api/v1/auth/me`**: Fetches the currently authenticated user's context, assigned branch, and active role permissions.

---

## 2. Products & Catalogue (`/api/v1/products`)

* **`GET /api/v1/products`**: Retrieves a paginated list of product SKUs with search, category, supplier, stock status, and branch stock quantity filters.
* **`GET /api/v1/products/:id`**: Fetches comprehensive details for a single product SKU, including stock distribution across all branches.
* **`POST /api/v1/products`**: Creates a new product SKU in the catalogue with initial stock levels.
* **`PUT /api/v1/products/:id`**: Updates product details, prices, cost, tax rate, reorder threshold, and preferred supplier.
* **`PATCH /api/v1/products/:id/toggle-active`**: Toggles product active/inactive status.
* **`POST /api/v1/products/:id/duplicate`**: Duplicates an existing product into a draft copy with a new SKU.
* **`DELETE /api/v1/products/:id`**: Removes or archives a product from the catalogue.

---

## 3. POS Terminal & Checkout (`/api/v1/pos`)

* **`POST /api/v1/pos/checkout`**: Processes an atomic POS sale transaction, deducts branch stock, applies discounts and taxes, and records payment tenders. Supports idempotency keys for zero double-charging.
* **`POST /api/v1/pos/sync-batch`**: Synchronizes a batch of offline sales queued by a terminal during network outages.
* **`POST /api/v1/pos/held-sales`**: Parks/holds an active POS cart for later recall.
* **`GET /api/v1/pos/held-sales`**: Retrieves held/parked carts for the active branch.
* **`DELETE /api/v1/pos/held-sales/:id`**: Discards a held sale basket.
* **`POST /api/v1/sales/:id/void`**: Voids a completed sale, records a shift void audit entry, and restores inventory quantities.
* **`POST /api/v1/sales/:id/refund`**: Processes a full or partial sale refund.
* **`GET /api/v1/sales/:id/receipt`**: Returns receipt data formatted for thermal receipt printers and customer viewing.

---

## 4. Sales History & Ledger (`/api/v1/sales`)

* **`GET /api/v1/sales`**: Retrieves a paginated list of historical sales with filters for date range, branch, cashier, payment method, transaction status, and receipt search.
* **`GET /api/v1/sales/:id`**: Fetches full transaction ledger details, item snapshots, and payment tenders for a single sale.

---

## 5. Inventory Control & Stock Movements (`/api/v1/inventory`)

* **`GET /api/v1/inventory/stock`**: Fetches live stock quantities per product per branch.
* **`POST /api/v1/inventory/adjustments`**: Records manual stock adjustments (Add, Remove, Correction) for spoilage, theft, damage, or stocktakes.
* **`GET /api/v1/inventory/movements`**: Retrieves stock movement audit logs (Sales, Purchases, Adjustments, Transfers, Voids).
* **`GET /api/v1/inventory/transfers`**: Lists stock transfers between branches with status filtering.
* **`POST /api/v1/inventory/transfers`**: Creates a stock transfer request between two store branches.
* **`POST /api/v1/inventory/transfers/:id/complete`**: Completes a stock transfer and credits destination branch stock.
* **`POST /api/v1/inventory/transfers/:id/cancel`**: Cancels an in-transit stock transfer.

---

## 6. Purchasing & Suppliers (`/api/v1/purchasing` & `/api/v1/suppliers`)

* **`GET /api/v1/suppliers`**: Lists registered suppliers, contact persons, payment terms, and supplied categories.
* **`POST /api/v1/suppliers`**: Registers a new supplier.
* **`PUT /api/v1/suppliers/:id`**: Updates supplier contact details, payment terms, lead time, and status.
* **`DELETE /api/v1/suppliers/:id`**: Deletes a supplier record.
* **`GET /api/v1/purchase-orders`**: Retrieves purchase orders filtered by branch, supplier, and PO status.
* **`GET /api/v1/purchase-orders/:id`**: Fetches purchase order details, item lines, expected delivery, and activity timeline.
* **`POST /api/v1/purchase-orders`**: Creates a new purchase order draft or marks it as sent.
* **`PUT /api/v1/purchase-orders/:id`**: Updates purchase order lines and notes.
* **`PATCH /api/v1/purchase-orders/:id/status`**: Updates purchase order status (`DRAFT`, `SENT`, `CLOSED`, `CANCELLED`).
* **`POST /api/v1/purchase-orders/:id/receive`**: Receives stock shipment against a purchase order and updates inventory stock.
* **`DELETE /api/v1/purchase-orders/:id`**: Cancels or deletes a purchase order.

---

## 7. Reports & Financial Analytics (`/api/v1/analytics`)

* **`GET /api/v1/analytics/sales-summary`**: Returns overall summary statistics (Gross Revenue, Transactions, Average Basket, Items Sold, Discounts).
* **`GET /api/v1/analytics/revenue-series`**: Returns time-series revenue and transaction count data (daily or hourly).
* **`GET /api/v1/analytics/category-breakdown`**: Returns revenue and volume breakdown by product category.
* **`GET /api/v1/analytics/pnl`**: Generates Profit & Loss Income Statement (Gross Sales, Discounts, Net Revenue, COGS, Gross Profit, Operating Overhead, Net Profit). Restricted to Manager/Admin.
* **`GET /api/v1/analytics/branch-profitability`**: Generates comparative outlet profitability matrix and stock asset valuations. Restricted to Manager/Admin.
* **`GET /api/v1/analytics/cash-flow`**: Returns payment settlement distribution (Cash, Card, Split) and tender reconciliation.
* **`GET /api/v1/analytics/product-margins`**: Returns SKU-level profit margin analysis and cost-to-retail ratios.
* **`POST /api/v1/analytics/ask-data`**: Processes natural language analytical queries to return executive financial and operational insights.

---

## 8. Anomaly Security & Fraud Alerts (`/api/v1/alerts`)

* **`GET /api/v1/alerts`**: Lists flagged anomaly alerts (elevated voids, limit-hugging discounts, stock write-offs, zero-stock fast movers).
* **`POST /api/v1/alerts/scan`**: Triggers real-time heuristic anomaly detection scan against recent sales and movement ledgers.
* **`PATCH /api/v1/alerts/:id/status`**: Updates alert review status (`NEW`, `INVESTIGATING`, `REVIEWED`, `DISMISSED`).
* **`POST /api/v1/alerts/:id/notes`**: Adds an investigation note to an anomaly alert.

---

## 9. Store Branches (`/api/v1/branches`)

* **`GET /api/v1/branches`**: Lists store branches, manager details, operating hours, terminal count, and status.
* **`POST /api/v1/branches`**: Creates a new store branch.
* **`PUT /api/v1/branches/:id`**: Updates branch details, address, phone, manager, and operating hours.
* **`DELETE /api/v1/branches/:id`**: Deactivates or removes a branch.

---

## 10. Store Settings & User Administration (`/api/v1/settings` & `/api/v1/users`)

* **`GET /api/v1/settings`**: Retrieves store configuration, tax rates, cash rounding, receipt footers, discount approval thresholds, and security sensitivity settings.
* **`PUT /api/v1/settings`**: Updates store configuration settings.
* **`GET /api/v1/users`**: Lists team users, assigned branches, roles (`ADMIN`, `MANAGER`, `CASHIER`), and status.
* **`POST /api/v1/users`**: Creates/invites a new team user account.
* **`PUT /api/v1/users/:id`**: Updates user profile, email, assigned branch, role, or status.
* **`PATCH /api/v1/users/:id/status`**: Suspends or reactivates a user account.
* **`DELETE /api/v1/users/:id`**: Removes a user account.
* **`GET /api/v1/roles/permissions`**: Retrieves the role-permission access control matrix.
* **`PUT /api/v1/roles/permissions`**: Updates permissions assigned to each user role.
