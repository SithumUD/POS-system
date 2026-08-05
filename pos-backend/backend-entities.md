# Backend Entity Fields Reference

> **Note:** This document is extracted from the frontend dummy data and TypeScript types.
> It is a **starting point only** — developers should review, add, remove, or rename fields as needed based on real business requirements.

---

## Table of Contents

1. [Branch](#1-branch)
2. [Product](#2-product)
3. [Product Stock (per Branch)](#3-product-stock-per-branch)
4. [Category](#4-category)
5. [Supplier](#5-supplier)
6. [Purchase Order](#6-purchase-order)
7. [Purchase Order Line](#7-purchase-order-line)
8. [Purchase Order Event (Activity Log)](#8-purchase-order-event-activity-log)
9. [Sale](#9-sale)
10. [Sale Line (Cart Line)](#10-sale-line-cart-line)
11. [Held Sale](#11-held-sale)
12. [Stock Movement](#12-stock-movement)
13. [Stock Transfer](#13-stock-transfer)
14. [Stock Transfer Line](#14-stock-transfer-line)
15. [Anomaly Alert](#15-anomaly-alert)
16. [Alert Note](#16-alert-note)
17. [User](#17-user)
18. [Role Permissions](#18-role-permissions)
19. [Store Settings](#19-store-settings)
20. [Enums & Allowed Values](#20-enums--allowed-values)

---

## 1. Branch

Represents a physical store location.

| Field | Type | Example Value | Notes |
|-------|------|--------------|-------|
| `id` | string | `"colombo"` | Unique slug/identifier |
| `name` | string | `"Colombo – Main Branch"` | Full display name |
| `short` | string | `"Colombo – Main"` | Abbreviated name for compact UI |
| `address` | string | `"148 Galle Road, Kollupitiya, Colombo 03"` | Physical address |
| `phone` | string | `"+94 11 234 8800"` | Branch contact number |
| `manager` | string | `"Anushka Weerasinghe"` | Manager name (consider FK to User) |
| `opensAt` | string | `"07:30"` | Opening time (HH:MM format) |
| `closesAt` | string | `"22:00"` | Closing time (HH:MM format) |
| `terminals` | number | `4` | Number of POS terminals |
| `status` | enum | `"Open"` | See [BranchStatus](#20-enums--allowed-values) |
| `todaySales` | number | `128450` | Today's total sales amount (computed field) |
| `weekSales` | number | `812300` | This week's total sales (computed field) |
| `staff` | number | `12` | Number of staff assigned |

---

## 2. Product

Represents an item in the product catalogue.

| Field | Type | Example Value | Notes |
|-------|------|--------------|-------|
| `id` | string | `"p-001"` | Unique product ID |
| `name` | string | `"Coca-Cola 400ml"` | Display name |
| `sku` | string | `"BEV-CC-400"` | Stock Keeping Unit code |
| `barcode` | string | `"4792024011234"` | Barcode (EAN-13 or similar) |
| `category` | enum | `"Beverages"` | See [CategoryName](#20-enums--allowed-values) |
| `price` | number | `180` | Selling price (in store currency) |
| `cost` | number | `132` | Purchase/cost price |
| `threshold` | number | `12` | Low-stock alert threshold (units) |
| `active` | boolean | `true` | Whether the product is listed/sellable |
| `unit` | string | `"Bottle"` | Unit of sale (Bottle, Pack, Kg, etc.) |
| `supplier` | string | `"Ceylon Beverages Distributors"` | Supplier name (consider FK to Supplier) |
| `updatedAt` | datetime | `"2026-08-04T14:06:00Z"` | Last modified timestamp |

> **Note:** Stock quantities are stored per-branch — see [Product Stock](#3-product-stock-per-branch).

---

## 3. Product Stock (per Branch)

Tracks the quantity of a product at each branch. This can be a separate join table or embedded.

| Field | Type | Example Value | Notes |
|-------|------|--------------|-------|
| `productId` | string | `"p-001"` | FK → Product |
| `branchId` | string | `"colombo"` | FK → Branch |
| `quantity` | number | `42` | Current quantity on hand |

---

## 4. Category

Product categories with optional sub-categories.

| Field | Type | Example Value | Notes |
|-------|------|--------------|-------|
| `name` | string | `"Beverages"` | Top-level category name |
| `children` | array | — | Sub-categories (see below) |

**Sub-category fields:**

| Field | Type | Example Value |
|-------|------|--------------|
| `name` | string | `"Soft Drinks"` |
| `count` | number | `3` |

**Current categories and sub-categories:**

| Category | Sub-categories |
|----------|---------------|
| Beverages | Soft Drinks, Juices, Tea & Coffee |
| Snacks | Biscuits, Chips |
| Dairy | Milk, Yoghurt, Cheese & Butter |
| Household | Cleaning, Personal Care, Staples |
| Bakery | Bread, Pastries |
| Frozen | Ice Cream, Ready Meals |

---

## 5. Supplier

Represents a vendor or supplier of products.

| Field | Type | Example Value | Notes |
|-------|------|--------------|-------|
| `id` | string | `"s-1"` | Unique supplier ID |
| `name` | string | `"Ceylon Beverages Distributors"` | Company name |
| `contact` | string | `"Chaminda Rajapaksa"` | Primary contact person name |
| `phone` | string | `"+94 11 234 5567"` | Contact phone number |
| `email` | string | `"orders@ceylonbev.lk"` | Contact email |
| `address` | string | `"312 Negombo Road, Wattala"` | Physical address |
| `paymentTerms` | string | `"Net 30"` | Payment terms (Net 7/15/30/45, COD) |
| `leadTimeDays` | number | `4` | Average delivery lead time in days |
| `categories` | string[] | `["Beverages"]` | Product categories supplied |
| `status` | enum | `"Active"` | See [SupplierStatus](#20-enums--allowed-values) |
| `notes` | string | `"Delivers Mon/Wed/Fri before 10 AM."` | Free-text internal notes |
| `createdAt` | datetime | `"2025-05-11T09:00:00Z"` | Date supplier was added |

---

## 6. Purchase Order

A purchase order placed with a supplier.

| Field | Type | Example Value | Notes |
|-------|------|--------------|-------|
| `id` | string | `"PO-2043"` | Unique PO number |
| `supplierId` | string | `"s-2"` | FK → Supplier |
| `supplier` | string | `"Fonterra Sri Lanka"` | Supplier name (denormalized) |
| `branch` | string | `"colombo"` | FK → Branch — which branch ordered |
| `status` | enum | `"Partially Received"` | See [PoStatus](#20-enums--allowed-values) |
| `createdAt` | datetime | `"2026-07-16T10:15:00Z"` | When PO was created |
| `expectedAt` | datetime | `"2026-08-07T09:00:00Z"` | Expected delivery date |
| `notes` | string | `"Split delivery agreed..."` | Free-text notes |
| `lines` | array | — | See [Purchase Order Line](#7-purchase-order-line) |
| `activity` | array | — | See [PO Event](#8-purchase-order-event-activity-log) |

---

## 7. Purchase Order Line

An individual product line within a Purchase Order.

| Field | Type | Example Value | Notes |
|-------|------|--------------|-------|
| `productId` | string | `"p-008"` | FK → Product |
| `name` | string | `"Anchor Full Cream Milk 1L"` | Product name (denormalized) |
| `sku` | string | `"DRY-AN-1000"` | Product SKU (denormalized) |
| `ordered` | number | `50` | Quantity ordered |
| `received` | number | `30` | Quantity received so far |
| `unitCost` | number | `552` | Unit cost at time of order |

---

## 8. Purchase Order Event (Activity Log)

An audit trail entry for a Purchase Order.

| Field | Type | Example Value | Notes |
|-------|------|--------------|-------|
| `id` | string | `"e-1"` | Unique event ID |
| `text` | string | `"Purchase order created"` | Human-readable event description |
| `at` | datetime | `"2026-07-16T10:15:00Z"` | When the event occurred |
| `actor` | string | `"Ruwan Silva"` | User who performed the action |

---

## 9. Sale

A completed POS transaction.

| Field | Type | Example Value | Notes |
|-------|------|--------------|-------|
| `id` | string | `"SALE-10493"` | Unique sale/receipt ID |
| `at` | datetime | `"2026-08-04T13:22:00Z"` | Transaction timestamp |
| `branch` | string | `"colombo"` | FK → Branch |
| `cashier` | string | `"Nadeesha Perera"` | Cashier name (consider FK to User) |
| `payment` | enum | `"Card"` | See [PaymentMethod](#20-enums--allowed-values) |
| `status` | enum | `"Completed"` | See [SaleStatus](#20-enums--allowed-values) |
| `subtotal` | number | `680` | Sum of all line totals before discount/tax |
| `discount` | number | `0` | Discount amount applied |
| `tax` | number | `68` | Tax amount |
| `total` | number | `748` | Final amount charged |
| `tendered` | number | `800` | Cash tendered (optional, for cash payments) |
| `note` | string | `"Bulk purchase"` | Optional free-text note |
| `lines` | array | — | See [Sale Line](#10-sale-line-cart-line) |

---

## 10. Sale Line (Cart Line)

An individual product within a Sale.

| Field | Type | Example Value | Notes |
|-------|------|--------------|-------|
| `productId` | string | `"p-001"` | FK → Product |
| `name` | string | `"Coca-Cola 400ml"` | Product name (denormalized) |
| `sku` | string | `"BEV-CC-400"` | Product SKU (denormalized) |
| `unitPrice` | number | `180` | Price per unit at time of sale |
| `quantity` | number | `3` | Quantity purchased |

---

## 11. Held Sale

A temporarily saved/parked cart on a POS terminal.

| Field | Type | Example Value | Notes |
|-------|------|--------------|-------|
| `id` | string | `"held-1"` | Unique ID |
| `label` | string | `"Table 3"` | User-given label for the held sale |
| `lines` | array | — | Same as [Sale Line](#10-sale-line-cart-line) |
| `discount` | number | `0` | Discount applied to held cart |
| `heldAt` | datetime | `"2026-08-04T14:00:00Z"` | When the cart was parked |

---

## 12. Stock Movement

An audit record for any change to stock quantity.

| Field | Type | Example Value | Notes |
|-------|------|--------------|-------|
| `id` | string | `"mv-001"` | Unique movement ID |
| `productId` | string | `"p-008"` | FK → Product |
| `branch` | string | `"colombo"` | FK → Branch |
| `type` | enum | `"Sale"` | See [MovementType](#20-enums--allowed-values) |
| `qty` | number | `-2` | Quantity change (negative = reduction) |
| `reference` | string | `"SALE-10493"` | Reference ID (SALE-x, PO-x, ADJ-x, TRF-x) |
| `note` | string | `"Card payment · Terminal 1"` | Free-text note about the movement |
| `at` | datetime | `"2026-08-04T13:32:00Z"` | Timestamp of the movement |

---

## 13. Stock Transfer

A transfer of stock between two branches.

| Field | Type | Example Value | Notes |
|-------|------|--------------|-------|
| `id` | string | `"TRF-0338"` | Unique transfer ID |
| `from` | string | `"colombo"` | FK → Branch (source) |
| `to` | string | `"kandy"` | FK → Branch (destination) |
| `status` | enum | `"Completed"` | See [TransferStatus](#20-enums--allowed-values) |
| `note` | string | `"Cover weekend shortfall"` | Free-text reason/notes |
| `createdAt` | datetime | `"2026-07-31T11:40:00Z"` | When transfer was created |
| `completedAt` | datetime | `"2026-08-01T15:10:00Z"` | When transfer was completed (optional) |
| `lines` | array | — | See [Stock Transfer Line](#14-stock-transfer-line) |

---

## 14. Stock Transfer Line

An individual product line within a Stock Transfer.

| Field | Type | Example Value | Notes |
|-------|------|--------------|-------|
| `productId` | string | `"p-008"` | FK → Product |
| `name` | string | `"Anchor Full Cream Milk 1L"` | Product name (denormalized) |
| `sku` | string | `"DRY-AN-1000"` | Product SKU (denormalized) |
| `qty` | number | `12` | Quantity being transferred |

---

## 15. Anomaly Alert

An automatically detected suspicious or anomalous event.

| Field | Type | Example Value | Notes |
|-------|------|--------------|-------|
| `id` | string | `"a-1"` | Unique alert ID |
| `title` | string | `"Unusually high void rate — Kasun Fernando"` | Short summary title |
| `explanation` | string | `"6 voided sales in a 2-hour shift..."` | Detailed description |
| `severity` | enum | `"High"` | See [Severity](#20-enums--allowed-values) |
| `status` | enum | `"New"` | See [AlertStatus](#20-enums--allowed-values) |
| `branch` | string | `"Colombo – Main"` | Branch name where alert occurred |
| `window` | string | `"Today, 2:00 PM – 4:00 PM"` | Human-readable time window of the event |
| `related` | string | `"Kasun Fernando"` | Related entity (cashier, product, terminal) |
| `metric` | string | `"6 voids · avg 1.5"` | Key metric that triggered the alert |
| `at` | datetime | `"2026-08-04T12:55:00Z"` | When the alert was generated |
| `notes` | array | — | See [Alert Note](#16-alert-note) |

---

## 16. Alert Note

An investigator's note added to an Anomaly Alert.

| Field | Type | Example Value | Notes |
|-------|------|--------------|-------|
| `id` | string | `"n-1"` | Unique note ID |
| `text` | string | `"Asked Dilhani to recount the float..."` | Note content |
| `at` | datetime | `"2026-08-02T09:30:00Z"` | When note was added |
| `author` | string | `"Ruwan Silva"` | Who wrote the note |

---

## 17. User

A system user (admin, manager, or cashier).

| Field | Type | Example Value | Notes |
|-------|------|--------------|-------|
| `id` | string | `"u-1"` | Unique user ID |
| `name` | string | `"Ruwan Silva"` | Full display name |
| `email` | string | `"ruwan.silva@retailos.lk"` | Login email |
| `role` | enum | `"Admin"` | See [UserRole](#20-enums--allowed-values) |
| `branch` | string | `"All Branches"` | Assigned branch (or "All Branches") |
| `status` | enum | `"Active"` | See [UserStatus](#20-enums--allowed-values) |
| `lastActive` | datetime | `"2026-08-04T14:07:00Z"` | Last login/activity timestamp |
| `createdAt` | datetime | `"2024-06-15T09:00:00Z"` | Account creation date |

---

## 18. Role Permissions

Defines what each role is allowed to do. Can be stored as a config table or in code.

| Permission Key | Description | Admin | Manager | Cashier |
|---------------|-------------|-------|---------|---------|
| `pos` | Operate POS — ring up sales, hold/resume carts | ✅ | ✅ | ✅ |
| `refunds` | Refunds & voids — reverse completed transactions | ✅ | ✅ | ❌ |
| `products` | Manage products — create, edit, archive items | ✅ | ✅ | ❌ |
| `purchasing` | Purchasing — raise POs and receive stock | ✅ | ✅ | ❌ |
| `reports` | View reports — access analytics and exports | ✅ | ✅ | ❌ |
| `settings` | Manage settings — store, tax, user config | ✅ | ❌ | ❌ |

---

## 19. Store Settings

Global configuration for the store/business.

| Field | Type | Example Value | Notes |
|-------|------|--------------|-------|
| `storeName` | string | `"RetailOS POS"` | Trading/display name |
| `legalName` | string | `"Sathosa Group (Pvt) Ltd"` | Legal registered name |
| `currency` | string | `"LKR"` | ISO 4217 currency code |
| `taxRate` | number | `10` | Tax percentage (e.g. 10 = 10%) |
| `taxLabel` | string | `"VAT"` | Label shown on receipts |
| `receiptFooter` | string | `"Thank you for shopping..."` | Footer text on printed receipts |
| `timezone` | string | `"Asia/Colombo"` | IANA timezone identifier |
| `lowStockThreshold` | number | `12` | Default low-stock alert level (units) |
| `maxDiscountPercent` | number | `10` | Maximum discount % a cashier can apply |
| `requireManagerApproval` | boolean | `true` | Whether discounts above max need approval |
| `allowNegativeStock` | boolean | `false` | Whether stock can go below zero |
| `autoPrintReceipt` | boolean | `true` | Automatically print receipt after sale |
| `roundCashTo` | number | `1` | Cash rounding unit (e.g. 1 = nearest 1) |
| `emailAlerts` | boolean | `true` | Send anomaly alerts by email |
| `alertSensitivity` | enum | `"Balanced"` | Alert engine sensitivity level |
| `sessionTimeoutMinutes` | number | `30` | Auto-logout after inactivity (minutes) |
| `twoFactor` | boolean | `false` | Whether 2FA is enforced for login |

---

## 20. Enums & Allowed Values

### BranchStatus
| Value | Meaning |
|-------|---------|
| `Open` | Branch is operational |
| `Closed` | Branch is closed for the day |
| `Setup` | Branch is being set up, not yet live |

### CategoryName
`Beverages` · `Snacks` · `Dairy` · `Household` · `Bakery` · `Frozen`

### SupplierStatus
| Value | Meaning |
|-------|---------|
| `Active` | Supplier is active and can receive POs |
| `On Hold` | Temporarily paused (e.g. dispute) |
| `Inactive` | No longer used |

### PoStatus (Purchase Order)
| Value | Meaning |
|-------|---------|
| `Draft` | Created, not yet sent |
| `Sent` | Submitted to supplier |
| `Partially Received` | Some goods received, awaiting balance |
| `Received` | All goods received |
| `Closed` | Finalized/closed (e.g. after credit note) |
| `Cancelled` | Order was cancelled |

### SaleStatus
| Value | Meaning |
|-------|---------|
| `Completed` | Normal, successful sale |
| `Voided` | Cancelled before payment finalized |
| `Refunded` | Payment returned to customer |

### PaymentMethod
`Cash` · `Card` · `Split` *(split = partial cash + partial card)*

### MovementType (Stock Movement)
| Value | Meaning |
|-------|---------|
| `Sale` | Stock reduced due to a sale |
| `Purchase` | Stock added from a purchase order |
| `Adjustment` | Manual correction (e.g. recount, damage) |
| `Transfer` | Stock moved between branches |
| `Void` | Sale was voided, stock returned |

### TransferStatus
`In Transit` · `Completed` · `Cancelled`

### Severity (Anomaly Alert)
`High` · `Medium` · `Low`

### AlertStatus
`New` · `Investigating` · `Reviewed` · `Dismissed`

### UserRole
`Admin` · `Manager` · `Cashier`

### UserStatus
`Active` · `Suspended` · `Invited`

### AlertSensitivity
`Low` · `Balanced` · `High`

### Payment Terms (Supplier)
`Net 7` · `Net 15` · `Net 30` · `Net 45` · `Cash on delivery`

---

