# Frontend ↔ Backend Field Reference

> **For Frontend Developers**
> This document lists every JSON field the backend API will return for each resource.
> All field names are **camelCase** (Spring Boot default serialization).
> Use this to update forms, tables, and TypeScript types — replace dummy data with these exact field names when connecting to the real API.

---

## How to Read This Document

| Column | Meaning |
|---|---|
| **JSON Key** | Exact field name as it appears in the API response |
| **Type** | JSON type — `string`, `number`, `boolean`, `object`, `array`, `null` |
| **Required** | `✅` = always present · `❌` = may be `null` |
| **Example** | A realistic value to use as dummy data |
| **Notes** | Important details for the UI |

> **All timestamps** are ISO-8601 strings in UTC: `"2026-08-04T13:22:00Z"`
> **All IDs** are UUID strings: `"550e8400-e29b-41d4-a716-446655440000"`
> **All money fields** are decimal strings/numbers with 2 decimal places: `748.00`

---

## Table of Contents

1. [Common Fields (on every resource)](#1-common-fields-on-every-resource)
2. [Branch](#2-branch)
3. [Category](#3-category)
4. [Product](#4-product)
5. [Product Stock (Inventory)](#5-product-stock-inventory)
6. [Supplier](#6-supplier)
7. [Purchase Order](#7-purchase-order)
8. [Purchase Order Item](#8-purchase-order-item)
9. [Purchase Order Event](#9-purchase-order-event-activity-log)
10. [Sale](#10-sale)
11. [Sale Item](#11-sale-item)
12. [Payment](#12-payment)
13. [Held Sale](#13-held-sale)
14. [Held Sale Item](#14-held-sale-item)
15. [Stock Movement](#15-stock-movement)
16. [Stock Transfer](#16-stock-transfer)
17. [Stock Transfer Item](#17-stock-transfer-item)
18. [Anomaly Alert](#18-anomaly-alert)
19. [Alert Note](#19-alert-note)
20. [User](#20-user)
21. [Store Settings](#21-store-settings)
22. [Enums Reference](#22-enums-reference)

---

## 1. Common Fields (on every resource)

These fields are present on **every** API response object.

| JSON Key | Type | Required | Example | Notes |
|---|---|---|---|---|
| `id` | string (UUID) | ✅ | `"550e8400-e29b-41d4-a716-446655440000"` | Never expose or use as a URL slug — use human-readable IDs like `receiptNumber` for display |
| `createdAt` | string (ISO-8601) | ✅ | `"2026-08-04T09:00:00Z"` | When the record was created |
| `updatedAt` | string (ISO-8601) | ✅ | `"2026-08-04T14:30:00Z"` | When the record was last modified |

---

## 2. Branch

**Table name:** `branches` · **Route:** `GET /api/branches`

| JSON Key | Type | Required | Example | Notes |
|---|---|---|---|---|
| `id` | string (UUID) | ✅ | `"550e8400-..."` | — |
| `slug` | string | ✅ | `"colombo"` | URL-safe unique identifier — use this in API filter params, e.g. `?branchId=colombo` |
| `name` | string | ✅ | `"Colombo – Main Branch"` | Full display name for dropdowns and headers |
| `shortName` | string | ❌ | `"Colombo – Main"` | Abbreviated for mobile / compact UI |
| `address` | string | ❌ | `"148 Galle Road, Colombo 03"` | — |
| `phone` | string | ❌ | `"+94 11 234 8800"` | — |
| `manager` | object (User, simplified) | ❌ | `{ "id": "...", "name": "Anushka W." }` | Nested User object. `null` if no manager assigned |
| `opensAt` | string | ❌ | `"07:30"` | 24h HH:MM format |
| `closesAt` | string | ❌ | `"22:00"` | 24h HH:MM format |
| `terminalCount` | number | ✅ | `4` | Number of POS terminals |
| `status` | string (enum) | ✅ | `"OPEN"` | See [BranchStatus](#branchstatus) |
| `createdAt` | string | ✅ | `"2025-01-10T09:00:00Z"` | — |
| `updatedAt` | string | ✅ | `"2026-08-04T08:00:00Z"` | — |

> **Computed fields for the UI** (not stored, will come from the reporting API):
> `todaySales`, `weekSales`, `staffCount` — query `GET /api/reports/branch-summary?branchId=...`

---

## 3. Category

**Table name:** `categories` · **Route:** `GET /api/categories`

| JSON Key | Type | Required | Example | Notes |
|---|---|---|---|---|
| `id` | string (UUID) | ✅ | `"550e8400-..."` | — |
| `name` | string | ✅ | `"Beverages"` | Display name |
| `slug` | string | ❌ | `"beverages"` | URL/code-safe identifier |
| `parent` | object (Category, simplified) | ❌ | `{ "id": "...", "name": "Beverages", "slug": "beverages" }` | `null` = top-level category. Non-null = sub-category |
| `displayOrder` | number | ✅ | `1` | Lower = shown first in lists |
| `createdAt` | string | ✅ | — | — |
| `updatedAt` | string | ✅ | — | — |

> **Frontend note:** The API will likely return a tree structure: top-level categories with a nested `children` array. Use `parent === null` to identify top-level items.

---

## 4. Product

**Table name:** `products` · **Route:** `GET /api/products`

| JSON Key | Type | Required | Example | Notes |
|---|---|---|---|---|
| `id` | string (UUID) | ✅ | `"550e8400-..."` | — |
| `sku` | string | ✅ | `"BEV-CC-400"` | Stock Keeping Unit — unique across catalogue |
| `barcode` | string | ❌ | `"4792024011234"` | EAN-13 or similar. `null` if not barcoded |
| `name` | string | ✅ | `"Coca-Cola 400ml"` | Display name shown on POS and receipts |
| `category` | object (Category, simplified) | ❌ | `{ "id": "...", "name": "Beverages", "slug": "beverages" }` | Nested. `null` if uncategorised |
| `unitPrice` | number | ✅ | `180.00` | Current selling price |
| `costPrice` | number | ✅ | `132.00` | Purchase cost — used for margin reports |
| `taxRate` | number | ✅ | `10.00` | Product-level tax override (%). `0` = use store default |
| `reorderThreshold` | number | ✅ | `12` | Low-stock alert level. `0` = use store default |
| `unitOfMeasure` | string (enum) | ✅ | `"BOTTLE"` | See [UnitOfMeasure](#unitofmeasure) — used for logic |
| `unitLabel` | string | ❌ | `"Bottle"` | **Display** label for the unit on receipts and POS. Free-text. Use this in the UI, not `unitOfMeasure` |
| `imageUrl` | string | ❌ | `"https://cdn.example.com/products/cc400.webp"` | Product image URL for the POS grid |
| `preferredSupplier` | object (Supplier, simplified) | ❌ | `{ "id": "...", "name": "Ceylon Beverages" }` | `null` if no preferred supplier |
| `active` | boolean | ✅ | `true` | `false` = archived, cannot be sold |
| `createdAt` | string | ✅ | — | — |
| `updatedAt` | string | ✅ | — | — |

> **Stock quantities are NOT on the Product object.** They are in the [Inventory](#5-product-stock-inventory) resource, keyed by `productId + branchId`.

---

## 5. Product Stock (Inventory)

**Table name:** `inventory` · **Route:** `GET /api/inventory?branchId=...`

Tracks the quantity of a product at each branch.

| JSON Key | Type | Required | Example | Notes |
|---|---|---|---|---|
| `id` | string (UUID) | ✅ | `"550e8400-..."` | — |
| `product` | object (Product, simplified) | ✅ | `{ "id": "...", "sku": "BEV-CC-400", "name": "Coca-Cola 400ml" }` | — |
| `branch` | object (Branch, simplified) | ✅ | `{ "id": "...", "slug": "colombo", "name": "Colombo – Main Branch" }` | — |
| `quantityOnHand` | number | ✅ | `42` | **Current stock level** — the primary field to display |
| `createdAt` | string | ✅ | — | — |
| `updatedAt` | string | ✅ | — | When stock was last updated |

> **Frontend note:** `version` (optimistic lock) is a backend-internal field and will **not** be included in API responses.

---

## 6. Supplier

**Table name:** `suppliers` · **Route:** `GET /api/suppliers`

| JSON Key | Type | Required | Example | Notes |
|---|---|---|---|---|
| `id` | string (UUID) | ✅ | `"550e8400-..."` | — |
| `name` | string | ✅ | `"Ceylon Beverages Distributors"` | Company / trading name |
| `contactPerson` | string | ❌ | `"Chaminda Rajapaksa"` | Primary contact person |
| `phone` | string | ❌ | `"+94 11 234 5567"` | — |
| `contactEmail` | string | ❌ | `"orders@ceylonbev.lk"` | — |
| `address` | string | ❌ | `"312 Negombo Road, Wattala"` | — |
| `paymentTerms` | string (enum) | ❌ | `"NET_30"` | See [PaymentTerms](#paymentterms). `null` if not set |
| `leadTimeDays` | number | ❌ | `4` | Average delivery days — used to suggest PO expected date |
| `status` | string (enum) | ✅ | `"ACTIVE"` | See [SupplierStatus](#supplierstatus) |
| `notes` | string | ❌ | `"Delivers Mon/Wed/Fri before 10 AM."` | Internal notes |
| `suppliedCategories` | array of string | ✅ | `["beverages", "dairy"]` | Category slugs — always an array, may be empty `[]` |
| `createdAt` | string | ✅ | `"2025-05-11T09:00:00Z"` | — |
| `updatedAt` | string | ✅ | — | — |

---

## 7. Purchase Order

**Table name:** `purchase_orders` · **Route:** `GET /api/purchase-orders`

| JSON Key | Type | Required | Example | Notes |
|---|---|---|---|---|
| `id` | string (UUID) | ✅ | `"550e8400-..."` | — |
| `poNumber` | string | ✅ | `"PO-2043"` | **Human-readable ID** — display this in the UI, not `id` |
| `supplier` | object (Supplier, simplified) | ✅ | `{ "id": "...", "name": "Fonterra Sri Lanka" }` | — |
| `branch` | object (Branch, simplified) | ✅ | `{ "id": "...", "slug": "colombo", "name": "Colombo – Main Branch" }` | Branch that placed the order |
| `status` | string (enum) | ✅ | `"PARTIALLY_RECEIVED"` | See [PurchaseOrderStatus](#purchaseorderstatus) |
| `createdBy` | object (User, simplified) | ❌ | `{ "id": "...", "name": "Ruwan Silva" }` | `null` for system-generated POs |
| `expectedAt` | string (ISO-8601) | ❌ | `"2026-08-07T09:00:00Z"` | Expected delivery date. `null` if not confirmed |
| `notes` | string | ❌ | `"Split delivery agreed — 30 units on 7 Aug, balance on 14 Aug."` | — |
| `items` | array of [PurchaseOrderItem](#8-purchase-order-item) | ✅ | `[...]` | Always an array, may be empty |
| `events` | array of [PurchaseOrderEvent](#9-purchase-order-event-activity-log) | ✅ | `[...]` | Activity log, ordered oldest-first |
| `createdAt` | string | ✅ | `"2026-07-16T10:15:00Z"` | When PO was created |
| `updatedAt` | string | ✅ | — | — |

---

## 8. Purchase Order Item

Embedded inside a [Purchase Order](#7-purchase-order) `items` array.

| JSON Key | Type | Required | Example | Notes |
|---|---|---|---|---|
| `id` | string (UUID) | ✅ | `"550e8400-..."` | — |
| `product` | object (Product, simplified) | ✅ | `{ "id": "...", "sku": "DRY-AN-1000", "name": "Anchor Full Cream Milk 1L" }` | — |
| `quantityOrdered` | number | ✅ | `50` | How many units were ordered |
| `quantityReceived` | number | ✅ | `30` | How many units have arrived so far. `0` initially |
| `unitCost` | number | ✅ | `552.00` | Cost per unit at time of order |
| `createdAt` | string | ✅ | — | — |
| `updatedAt` | string | ✅ | — | — |

---

## 9. Purchase Order Event (Activity Log)

Embedded inside a [Purchase Order](#7-purchase-order) `events` array.

| JSON Key | Type | Required | Example | Notes |
|---|---|---|---|---|
| `id` | string (UUID) | ✅ | `"550e8400-..."` | — |
| `description` | string | ✅ | `"Purchase order created"` | Human-readable event description — display as-is |
| `occurredAt` | string (ISO-8601) | ✅ | `"2026-07-16T10:15:00Z"` | When the event happened (use this for display, not `createdAt`) |
| `actor` | object (User, simplified) | ❌ | `{ "id": "...", "name": "Ruwan Silva" }` | Who triggered this. `null` for system events |
| `createdAt` | string | ✅ | — | — |
| `updatedAt` | string | ✅ | — | — |

---

## 10. Sale

**Table name:** `sales` · **Route:** `GET /api/sales`

| JSON Key | Type | Required | Example | Notes |
|---|---|---|---|---|
| `id` | string (UUID) | ✅ | `"550e8400-..."` | — |
| `receiptNumber` | string | ✅ | `"SALE-10493"` | **Human-readable ID** — print on receipts, show in sales history |
| `branch` | object (Branch, simplified) | ✅ | `{ "id": "...", "slug": "colombo", "name": "Colombo – Main Branch" }` | — |
| `cashier` | object (User, simplified) | ✅ | `{ "id": "...", "name": "Nadeesha Perera" }` | — |
| `terminalId` | string | ❌ | `"terminal-1"` | POS terminal identifier. `null` for back-office sales |
| `status` | string (enum) | ✅ | `"COMPLETED"` | See [SaleStatus](#salestatus) |
| `soldAt` | string (ISO-8601) | ✅ | `"2026-08-04T13:22:00Z"` | **Actual transaction time** — use this for display, not `createdAt` |
| `subtotal` | number | ✅ | `680.00` | Sum of line totals before discount/tax |
| `discount` | number | ✅ | `0.00` | Discount applied to the whole sale |
| `tax` | number | ✅ | `68.00` | Tax amount |
| `total` | number | ✅ | `748.00` | Final amount charged to customer |
| `note` | string | ❌ | `"Bulk purchase"` | Optional cashier note. `null` if none |
| `idempotencyKey` | string | ❌ | `"pos-terminal-1-1722775320"` | Internal. **Do not display in the UI** |
| `items` | array of [SaleItem](#11-sale-item) | ✅ | `[...]` | Line items |
| `payments` | array of [Payment](#12-payment) | ✅ | `[...]` | Payment legs. SPLIT = two entries (CASH + CARD) |
| `createdAt` | string | ✅ | — | — |
| `updatedAt` | string | ✅ | — | — |

---

## 11. Sale Item

Embedded inside a [Sale](#10-sale) `items` array.

| JSON Key | Type | Required | Example | Notes |
|---|---|---|---|---|
| `id` | string (UUID) | ✅ | `"550e8400-..."` | — |
| `product` | object (Product, simplified) | ✅ | `{ "id": "...", "sku": "BEV-CC-400" }` | Live product reference (price may have changed) |
| `productNameSnapshot` | string | ✅ | `"Coca-Cola 400ml"` | **Name at time of sale** — always use this for receipts and history display |
| `productSkuSnapshot` | string | ❌ | `"BEV-CC-400"` | **SKU at time of sale** — use for receipt and return lookup |
| `quantity` | number | ✅ | `3` | Units purchased |
| `unitPriceAtSale` | number | ✅ | `180.00` | **Price at time of sale** — always use this, never the live product price |
| `discount` | number | ✅ | `0.00` | Line-level discount |
| `lineTotal` | number | ✅ | `540.00` | `(unitPriceAtSale × quantity) − discount` |
| `createdAt` | string | ✅ | — | — |
| `updatedAt` | string | ✅ | — | — |

---

## 12. Payment

Embedded inside a [Sale](#10-sale) `payments` array.

| JSON Key | Type | Required | Example | Notes |
|---|---|---|---|---|
| `id` | string (UUID) | ✅ | `"550e8400-..."` | — |
| `method` | string (enum) | ✅ | `"CASH"` | See [PaymentMethod](#paymentmethod). **SPLIT payments = two rows** |
| `amount` | number | ✅ | `748.00` | Amount for this payment leg |
| `tenderedAmount` | number | ❌ | `800.00` | **Cash only** — amount the customer handed over. Use `tenderedAmount − amount` for change. `null` for CARD payments |
| `createdAt` | string | ✅ | — | — |
| `updatedAt` | string | ✅ | — | — |

---

## 13. Held Sale

**Table name:** `held_sales` · **Route:** `GET /api/held-sales?branchId=...`

A parked cart — not a completed sale. When resumed and paid, a new Sale is created and this record is deleted.

| JSON Key | Type | Required | Example | Notes |
|---|---|---|---|---|
| `id` | string (UUID) | ✅ | `"550e8400-..."` | — |
| `branch` | object (Branch, simplified) | ✅ | `{ "id": "...", "slug": "colombo" }` | — |
| `cashier` | object (User, simplified) | ✅ | `{ "id": "...", "name": "Nadeesha Perera" }` | Who parked the cart |
| `terminalId` | string | ❌ | `"terminal-2"` | Where the cart was parked. `null` = unknown |
| `label` | string | ❌ | `"Table 3"` | User-given label — show this prominently in the held sales list |
| `discount` | number | ✅ | `0.00` | Discount applied to the cart |
| `heldAt` | string (ISO-8601) | ✅ | `"2026-08-04T14:00:00Z"` | When the cart was parked — use this for display |
| `items` | array of [HeldSaleItem](#14-held-sale-item) | ✅ | `[...]` | — |
| `createdAt` | string | ✅ | — | — |
| `updatedAt` | string | ✅ | — | — |

---

## 14. Held Sale Item

Embedded inside a [Held Sale](#13-held-sale) `items` array.

| JSON Key | Type | Required | Example | Notes |
|---|---|---|---|---|
| `id` | string (UUID) | ✅ | `"550e8400-..."` | — |
| `product` | object (Product, simplified) | ✅ | `{ "id": "...", "sku": "BEV-CC-400" }` | — |
| `productNameSnapshot` | string | ✅ | `"Coca-Cola 400ml"` | Name when cart was parked — use this for display |
| `productSkuSnapshot` | string | ❌ | `"BEV-CC-400"` | SKU when cart was parked |
| `unitPrice` | number | ✅ | `180.00` | Price when cart was parked |
| `quantity` | number | ✅ | `3` | — |
| `createdAt` | string | ✅ | — | — |
| `updatedAt` | string | ✅ | — | — |

---

## 15. Stock Movement

**Table name:** `stock_movements` · **Route:** `GET /api/inventory/movements?productId=...&branchId=...`

Immutable audit ledger — every stock change is one row. Rows are never edited or deleted.

| JSON Key | Type | Required | Example | Notes |
|---|---|---|---|---|
| `id` | string (UUID) | ✅ | `"550e8400-..."` | — |
| `product` | object (Product, simplified) | ✅ | `{ "id": "...", "sku": "BEV-CC-400", "name": "Coca-Cola 400ml" }` | — |
| `branch` | object (Branch, simplified) | ✅ | `{ "id": "...", "slug": "colombo" }` | — |
| `type` | string (enum) | ✅ | `"SALE"` | See [StockMovementType](#stockmovementtype) |
| `quantity` | number | ✅ | `-2` | **Signed delta** — negative = stock reduced, positive = stock added |
| `referenceId` | string | ❌ | `"SALE-10493"` | Trace back to the source document. `null` for manual adjustments |
| `note` | string | ❌ | `"Card payment · Terminal 1"` | Free-text context |
| `createdBy` | object (User, simplified) | ❌ | `{ "id": "...", "name": "Ruwan Silva" }` | `null` for system-generated movements |
| `createdAt` | string | ✅ | `"2026-08-04T13:32:00Z"` | Use this as the movement timestamp |
| `updatedAt` | string | ✅ | — | — |

---

## 16. Stock Transfer

**Table name:** `stock_transfers` · **Route:** `GET /api/stock-transfers`

| JSON Key | Type | Required | Example | Notes |
|---|---|---|---|---|
| `id` | string (UUID) | ✅ | `"550e8400-..."` | — |
| `transferNumber` | string | ✅ | `"TRF-0338"` | **Human-readable ID** — display this in the UI |
| `fromBranch` | object (Branch, simplified) | ✅ | `{ "id": "...", "slug": "colombo", "name": "Colombo – Main Branch" }` | Source branch |
| `toBranch` | object (Branch, simplified) | ✅ | `{ "id": "...", "slug": "kandy", "name": "Kandy Branch" }` | Destination branch |
| `status` | string (enum) | ✅ | `"IN_TRANSIT"` | See [TransferStatus](#transferstatus) |
| `note` | string | ❌ | `"Cover weekend shortfall"` | Reason for transfer |
| `completedAt` | string (ISO-8601) | ❌ | `"2026-08-01T15:10:00Z"` | `null` until transfer is COMPLETED |
| `createdBy` | object (User, simplified) | ❌ | `{ "id": "...", "name": "Ruwan Silva" }` | Who initiated the transfer |
| `items` | array of [StockTransferItem](#17-stock-transfer-item) | ✅ | `[...]` | — |
| `createdAt` | string | ✅ | `"2026-07-31T11:40:00Z"` | When transfer was created |
| `updatedAt` | string | ✅ | — | — |

---

## 17. Stock Transfer Item

Embedded inside a [Stock Transfer](#16-stock-transfer) `items` array.

| JSON Key | Type | Required | Example | Notes |
|---|---|---|---|---|
| `id` | string (UUID) | ✅ | `"550e8400-..."` | — |
| `product` | object (Product, simplified) | ✅ | `{ "id": "...", "sku": "DRY-AN-1000" }` | — |
| `productNameSnapshot` | string | ✅ | `"Anchor Full Cream Milk 1L"` | Name at time of transfer — use for display |
| `productSkuSnapshot` | string | ❌ | `"DRY-AN-1000"` | SKU at time of transfer |
| `quantity` | number | ✅ | `12` | Units being transferred — always positive |
| `createdAt` | string | ✅ | — | — |
| `updatedAt` | string | ✅ | — | — |

---

## 18. Anomaly Alert

**Table name:** `anomaly_alerts` · **Route:** `GET /api/anomaly-alerts`

| JSON Key | Type | Required | Example | Notes |
|---|---|---|---|---|
| `id` | string (UUID) | ✅ | `"550e8400-..."` | — |
| `branch` | object (Branch, simplified) | ✅ | `{ "id": "...", "slug": "colombo", "name": "Colombo – Main Branch" }` | Where the anomaly was detected |
| `relatedUser` | object (User, simplified) | ❌ | `{ "id": "...", "name": "Kasun Fernando" }` | The flagged user. `null` for product-level alerts |
| `title` | string | ✅ | `"Unusually high void rate — Kasun Fernando"` | Short headline — show in alert card/list |
| `explanation` | string | ✅ | `"6 voided sales in a 2-hour shift — 4× above average."` | Detailed description — show in the detail/expanded view |
| `severity` | string (enum) | ✅ | `"HIGH"` | See [AnomalySeverity](#anomalyseverity) — use to colour-code alerts |
| `status` | string (enum) | ✅ | `"NEW"` | See [AnomalyStatus](#anomalystatus) |
| `windowDescription` | string | ❌ | `"Today, 2:00 PM – 4:00 PM"` | Time window — display as-is |
| `relatedEntityLabel` | string | ❌ | `"Kasun Fernando"` | Supplemental label (use when `relatedUser` is null) |
| `metricDescription` | string | ❌ | `"6 voids · avg 1.5"` | Key metric — show in alert card as a badge/chip |
| `notes` | array of [AlertNote](#19-alert-note) | ✅ | `[...]` | Investigator notes, ordered oldest-first |
| `createdAt` | string | ✅ | `"2026-08-04T12:55:00Z"` | When the alert was generated |
| `updatedAt` | string | ✅ | — | — |

---

## 19. Alert Note

Embedded inside an [Anomaly Alert](#18-anomaly-alert) `notes` array.

| JSON Key | Type | Required | Example | Notes |
|---|---|---|---|---|
| `id` | string (UUID) | ✅ | `"550e8400-..."` | — |
| `text` | string | ✅ | `"Asked Dilhani to recount the float. Will follow up tomorrow."` | Note content |
| `author` | object (User, simplified) | ✅ | `{ "id": "...", "name": "Ruwan Silva" }` | Who wrote the note |
| `createdAt` | string | ✅ | `"2026-08-02T09:30:00Z"` | When the note was added — use as the note timestamp |
| `updatedAt` | string | ✅ | — | — |

---

## 20. User

**Table name:** `users` · **Route:** `GET /api/users`

> ⚠️ **`passwordHash` is NEVER included in any API response.** Do not add a password field to display components.

| JSON Key | Type | Required | Example | Notes |
|---|---|---|---|---|
| `id` | string (UUID) | ✅ | `"550e8400-..."` | — |
| `name` | string | ✅ | `"Ruwan Silva"` | Full display name |
| `email` | string | ✅ | `"ruwan.silva@retailos.lk"` | Login email |
| `role` | string (enum) | ✅ | `"ADMIN"` | See [Role](#role) |
| `branch` | object (Branch, simplified) | ❌ | `{ "id": "...", "slug": "colombo", "name": "Colombo – Main Branch" }` | `null` for ADMIN users (access to all branches) |
| `status` | string (enum) | ✅ | `"ACTIVE"` | See [UserStatus](#userstatus) |
| `lastActiveAt` | string (ISO-8601) | ❌ | `"2026-08-04T14:07:00Z"` | Last API activity. `null` until first login |
| `createdAt` | string | ✅ | `"2024-06-15T09:00:00Z"` | Account creation date |
| `updatedAt` | string | ✅ | — | — |

---

## 21. Store Settings

**Table name:** `store_settings` · **Route:** `GET /api/settings`

One record per tenant. Only Admins can update settings.

### Branding

| JSON Key | Type | Required | Example | Notes |
|---|---|---|---|---|
| `storeName` | string | ✅ | `"RetailOS POS"` | Trading / display name |
| `legalName` | string | ❌ | `"Sathosa Group (Pvt) Ltd"` | Legal name for tax invoices |

### Currency & Tax

| JSON Key | Type | Required | Example | Notes |
|---|---|---|---|---|
| `currency` | string | ✅ | `"LKR"` | ISO 4217 code — use to format currency in the UI |
| `taxRate` | number | ✅ | `10.00` | Default tax % — `10.00` = 10% |
| `taxLabel` | string | ✅ | `"VAT"` | Label on receipts — e.g. "VAT", "GST", "Tax" |

### Receipt

| JSON Key | Type | Required | Example | Notes |
|---|---|---|---|---|
| `receiptFooter` | string | ❌ | `"Thank you for shopping with us!"` | Text at the bottom of printed receipts |
| `autoPrintReceipt` | boolean | ✅ | `true` | Auto-trigger printer after checkout |
| `roundCashTo` | number | ✅ | `1.00` | Cash rounding unit. `1` = round to nearest whole. `0.05` = 5-cent rounding |

### Timezone

| JSON Key | Type | Required | Example | Notes |
|---|---|---|---|---|
| `timezone` | string | ✅ | `"Asia/Colombo"` | IANA timezone — use with `Intl.DateTimeFormat` for local time display |

### Stock

| JSON Key | Type | Required | Example | Notes |
|---|---|---|---|---|
| `lowStockThreshold` | number | ✅ | `12` | Default low-stock level — used when a product's own threshold is 0 |
| `allowNegativeStock` | boolean | ✅ | `false` | Whether stock can go below zero during a sale |

### Discounts

| JSON Key | Type | Required | Example | Notes |
|---|---|---|---|---|
| `maxDiscountPercent` | number | ✅ | `10.00` | Max % discount a cashier can apply without manager approval |
| `requireManagerApproval` | boolean | ✅ | `true` | If `true`, show approval prompt when discount exceeds `maxDiscountPercent` |

### Anomaly Detection

| JSON Key | Type | Required | Example | Notes |
|---|---|---|---|---|
| `emailAlerts` | boolean | ✅ | `true` | Whether anomaly alerts are sent by email |
| `alertSensitivity` | string (enum) | ✅ | `"BALANCED"` | See [AlertSensitivity](#alertsensitivity) |

### Security

| JSON Key | Type | Required | Example | Notes |
|---|---|---|---|---|
| `sessionTimeoutMinutes` | number | ✅ | `30` | Auto-logout after inactivity (minutes) |
| `twoFactorEnabled` | boolean | ✅ | `false` | Whether 2FA is enforced for all logins |

---

## 22. Enums Reference

All enum values are returned as **SCREAMING_SNAKE_CASE strings** from the API.

### BranchStatus
| Value | UI Label | Colour Hint |
|---|---|---|
| `OPEN` | Open | Green |
| `CLOSED` | Closed | Grey |
| `SETUP` | Setup | Amber |

### SupplierStatus
| Value | UI Label | Colour Hint |
|---|---|---|
| `ACTIVE` | Active | Green |
| `ON_HOLD` | On Hold | Amber |
| `INACTIVE` | Inactive | Grey |

### PaymentTerms
| Value | UI Label |
|---|---|
| `NET_7` | Net 7 |
| `NET_15` | Net 15 |
| `NET_30` | Net 30 |
| `NET_45` | Net 45 |
| `CASH_ON_DELIVERY` | Cash on Delivery |

### PurchaseOrderStatus
| Value | UI Label | Colour Hint |
|---|---|---|
| `DRAFT` | Draft | Grey |
| `SENT` | Sent | Blue |
| `PARTIALLY_RECEIVED` | Partially Received | Amber |
| `RECEIVED` | Received | Green |
| `CLOSED` | Closed | Teal |
| `CANCELLED` | Cancelled | Red |

### SaleStatus
| Value | UI Label | Colour Hint |
|---|---|---|
| `COMPLETED` | Completed | Green |
| `VOIDED` | Voided | Red |
| `REFUNDED` | Refunded | Purple |

### PaymentMethod
| Value | UI Label | Notes |
|---|---|---|
| `CASH` | Cash | `tenderedAmount` will be set on the Payment object |
| `CARD` | Card | `tenderedAmount` will be `null` |
| `SPLIT` | Split | Two Payment rows returned: one CASH + one CARD |

### StockMovementType
| Value | UI Label | Quantity Direction |
|---|---|---|
| `SALE` | Sale | Negative |
| `PURCHASE` | Purchase | Positive |
| `ADJUSTMENT` | Adjustment | Either |
| `TRANSFER_IN` | Transfer In | Positive |
| `TRANSFER_OUT` | Transfer Out | Negative |
| `VOID` | Void | Positive (stock returned) |
| `RETURN` | Customer Return | Positive |

### TransferStatus
| Value | UI Label | Colour Hint |
|---|---|---|
| `IN_TRANSIT` | In Transit | Blue |
| `COMPLETED` | Completed | Green |
| `CANCELLED` | Cancelled | Red |

### AnomalySeverity
| Value | UI Label | Colour Hint |
|---|---|---|
| `HIGH` | High | Red |
| `MEDIUM` | Medium | Amber |
| `LOW` | Low | Yellow |

### AnomalyStatus
| Value | UI Label | Colour Hint |
|---|---|---|
| `NEW` | New | Red badge |
| `INVESTIGATING` | Investigating | Blue badge |
| `REVIEWED` | Reviewed | Green badge |
| `DISMISSED` | Dismissed | Grey badge |

### Role
| Value | UI Label | Access Level |
|---|---|---|
| `ADMIN` | Admin | Full system access, all branches |
| `MANAGER` | Manager | Branch-level access, reports, inventory |
| `CASHIER` | Cashier | POS screen only |

### UserStatus
| Value | UI Label | Colour Hint |
|---|---|---|
| `ACTIVE` | Active | Green |
| `SUSPENDED` | Suspended | Red |
| `INVITED` | Invited | Amber (awaiting first login) |

### UnitOfMeasure
| Value | Common display | Notes |
|---|---|---|
| `EACH` | Each | Generic unit |
| `PCS` | Pcs | Pieces |
| `BOTTLE` | Bottle | Liquid retail |
| `PACK` | Pack | Multi-unit shrink-wrap |
| `BOX` | Box | Carton |
| `KG` | Kg | Weight |
| `G` | g | Grams |
| `L` | L | Litres |
| `ML` | mL | Millilitres |
| `DOZEN` | Dozen | 12 units |

> **Frontend note:** Always render `product.unitLabel` (free-text) in the UI, not `product.unitOfMeasure`. The enum is for backend logic only.

### AlertSensitivity
| Value | UI Label |
|---|---|
| `LOW` | Low |
| `BALANCED` | Balanced |
| `HIGH` | High |

---

## Quick Reference: Simplified Object Shapes

When a resource is **nested inside another** (e.g. `branch` inside `Sale`), the API returns a **simplified object**, not the full resource. These are the shapes to expect:

```typescript
// Simplified Branch (nested in Sales, Inventory, etc.)
{ id: string, slug: string, name: string }

// Simplified User (nested in Sales, POs, Alerts, etc.)
{ id: string, name: string, email: string, role: string }

// Simplified Product (nested in SaleItem, StockMovement, etc.)
{ id: string, sku: string, name: string }

// Simplified Category (nested in Product)
{ id: string, name: string, slug: string }

// Simplified Supplier (nested in PurchaseOrder, Product)
{ id: string, name: string }
```

> The exact fields in simplified objects will be confirmed once DTOs are implemented.
> For now, use the above as the minimum guaranteed set.

---

## TypeScript Interface Starter

```typescript
// Paste this into your types/api.ts as a starting point

export type UUID = string;
export type ISOString = string;

export interface BaseResource {
  id: UUID;
  createdAt: ISOString;
  updatedAt: ISOString;
}

export interface Branch extends BaseResource {
  slug: string;
  name: string;
  shortName: string | null;
  address: string | null;
  phone: string | null;
  manager: UserSummary | null;
  opensAt: string | null;    // "07:30"
  closesAt: string | null;   // "22:00"
  terminalCount: number;
  status: 'OPEN' | 'CLOSED' | 'SETUP';
}

export interface Product extends BaseResource {
  sku: string;
  barcode: string | null;
  name: string;
  category: CategorySummary | null;
  unitPrice: number;
  costPrice: number;
  taxRate: number;
  reorderThreshold: number;
  unitOfMeasure: UnitOfMeasure;
  unitLabel: string | null;
  imageUrl: string | null;
  preferredSupplier: SupplierSummary | null;
  active: boolean;
}

export interface Sale extends BaseResource {
  receiptNumber: string;
  branch: BranchSummary;
  cashier: UserSummary;
  terminalId: string | null;
  status: SaleStatus;
  soldAt: ISOString;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  note: string | null;
  items: SaleItem[];
  payments: Payment[];
}

export interface SaleItem extends BaseResource {
  product: ProductSummary;
  productNameSnapshot: string;
  productSkuSnapshot: string | null;
  quantity: number;
  unitPriceAtSale: number;
  discount: number;
  lineTotal: number;
}

export interface Payment extends BaseResource {
  method: 'CASH' | 'CARD' | 'SPLIT';
  amount: number;
  tenderedAmount: number | null;
}

export interface User extends BaseResource {
  name: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'CASHIER';
  branch: BranchSummary | null;
  status: 'ACTIVE' | 'SUSPENDED' | 'INVITED';
  lastActiveAt: ISOString | null;
}

// Enum types
export type SaleStatus = 'COMPLETED' | 'VOIDED' | 'REFUNDED';
export type UnitOfMeasure = 'EACH' | 'PCS' | 'BOTTLE' | 'PACK' | 'BOX' | 'KG' | 'G' | 'L' | 'ML' | 'DOZEN';
export type AnomalySeverity = 'HIGH' | 'MEDIUM' | 'LOW';
export type AnomalyStatus = 'NEW' | 'INVESTIGATING' | 'REVIEWED' | 'DISMISSED';
export type TransferStatus = 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED';
export type PurchaseOrderStatus = 'DRAFT' | 'SENT' | 'PARTIALLY_RECEIVED' | 'RECEIVED' | 'CLOSED' | 'CANCELLED';
export type SupplierStatus = 'ACTIVE' | 'ON_HOLD' | 'INACTIVE';
export type AlertSensitivity = 'LOW' | 'BALANCED' | 'HIGH';

// Summary (simplified nested) types
export interface BranchSummary { id: UUID; slug: string; name: string; }
export interface UserSummary { id: UUID; name: string; email: string; role: string; }
export interface ProductSummary { id: UUID; sku: string; name: string; }
export interface CategorySummary { id: UUID; name: string; slug: string | null; }
export interface SupplierSummary { id: UUID; name: string; }
```

---

*Generated from backend entities — `pos-backend` v0.0.1-SNAPSHOT · Updated: 2026-08-05*
