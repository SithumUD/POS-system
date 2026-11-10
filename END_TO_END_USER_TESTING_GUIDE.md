# NexPOS System: Complete End-to-End User Testing Guide

This guide provides a comprehensive, step-by-step manual testing procedure for validating the entire **NexPOS** multi-tenant Point of Sale and Inventory Management System directly through the frontend user interface.

---

## Table of Contents

1. [Environment Setup & Quick Start](#1-environment-setup--quick-start)
2. [Default Test Credentials & Roles](#2-default-test-credentials--roles)
3. [Test Scenario 1: SaaS Landing Page & Tenant Self-Signup](#test-scenario-1-saas-landing-page--tenant-self-signup)
4. [Test Scenario 2: Super Admin Tenant Approval & Plan Management](#test-scenario-2-super-admin-tenant-approval--plan-management)
5. [Test Scenario 3: Store Admin Initial Login & Store Settings](#test-scenario-3-store-admin-initial-login--store-settings)
6. [Test Scenario 4: Multi-Branch & Store Outlets Setup](#test-scenario-4-multi-branch--store-outlets-setup)
7. [Test Scenario 5: Product Catalog & Category Management](#test-scenario-5-product-catalog--category-management)
8. [Test Scenario 6: Supplier & Procurement (Purchase Orders)](#test-scenario-6-supplier--procurement-purchase-orders)
9. [Test Scenario 7: Stock Inbound Receiving & Branch Inventory](#test-scenario-7-stock-inbound-receiving--branch-inventory)
10. [Test Scenario 8: Stock Adjustments & Inter-Branch Transfers](#test-scenario-8-stock-adjustments--inter-branch-transfers)
11. [Test Scenario 9: User Staff Management & Role Permissions](#test-scenario-9-user-staff-management--role-permissions)
12. [Test Scenario 10: POS Terminal Cashiering & Checkout Flows](#test-scenario-10-pos-terminal-cashiering--checkout-flows)
13. [Test Scenario 11: Customer Dual-Screen Display & Live Sync](#test-scenario-11-customer-dual-screen-display--live-sync)
14. [Test Scenario 12: Sales History, Refunds & Transaction Voids](#test-scenario-12-sales-history-refunds--transaction-voids)
15. [Test Scenario 13: Anomaly & Fraud Security Alert Desk](#test-scenario-13-anomaly--fraud-security-alert-desk)
16. [Test Scenario 14: Financial Reports, P&L & Ask-Your-Data NLP](#test-scenario-14-financial-reports-pl--ask-your-data-nlp)
17. [Verification Checklist Summary](#17-verification-checklist-summary)

---

## 1. Environment Setup & Infrastructure Quick Start

The system supports running the entire stack (Database, Cache, Message Broker, and Backend Application) containerized via Docker at the root of the workspace.

---

### Step 1.1: Launch via Docker Compose (Root Deployment)

#### Option A: Run Entire Stack in Docker (Production-Ready)
From the repository root folder:
```bash
docker compose up -d --build
```
This automatically spins up all 4 production services:
* **Backend API (`backend`)**: `http://localhost:8080` (Built via [`pos-backend/Dockerfile`](file:///c:/Users/sithu/OneDrive/Documents/GitHub/POS-system/pos-backend/Dockerfile))
* **PostgreSQL (`postgres`)**: `localhost:5432` (Database: `posdb`, User: `postgres`, Password: `admin123`)
* **Redis (`redis`)**: `localhost:6379`
* **RabbitMQ (`rabbitmq`)**: `localhost:5672` (Management Console: `http://localhost:15672` — `guest` / `guest`)

> [!TIP]
> **Database Reset / Fresh Seed**: To clean the database and re-seed all tables from scratch:
> ```bash
> docker compose down -v
> docker compose up -d
> ```

#### Option B: Hybrid Mode (Docker Infrastructure + Local Backend Development)
If you want to run the database & broker in Docker, but run/debug the backend locally:
1. Start infrastructure services only from the root:
   ```bash
   docker compose up -d postgres redis rabbitmq
   ```
2. Start the backend locally with Maven:
   ```bash
   cd pos-backend
   ./mvnw spring-boot:run
   ```

---

### Step 1.2: Verify Backend Health
Once the backend container is running:
* **Health check**: `http://localhost:8080/api/v1/health`
* The backend will automatically connect to PostgreSQL, create schema (`ddl-auto: update`), and execute [`DataSeeder.java`](file:///c:/Users/sithu/OneDrive/Documents/GitHub/POS-system/pos-backend/src/main/java/com/sithumud/pos_backend/common/init/DataSeeder.java) & [`DemoDataSeeder.java`](file:///c:/Users/sithu/OneDrive/Documents/GitHub/POS-system/pos-backend/src/main/java/com/sithumud/pos_backend/config/DemoDataSeeder.java) to populate initial mock data and default users.

---

### Step 1.3: Launch the Main POS & Admin Frontend
Open a terminal in the frontend directory:
```bash
cd pos-frontend
npm run dev
```
* App URL: `http://localhost:5173`

---

### Step 1.4: Launch the SaaS Landing Page (Optional for Tenant Registration tests)
Open a third terminal:
```bash
cd pos-system-landing
npm run dev
```
* Landing URL: `http://localhost:3000`

---

## 2. Default Test Credentials & Roles

The system is pre-seeded with the following credentials upon initial startup:

| Role | Email | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **SUPER_ADMIN** | `superadmin@nexpos.com` *(or `superadmin@nexpos.lk`)* | `Olusha123` *(or `Admin@123`)* | Global platform management, tenant approvals, subscription plan controls |
| **ADMIN** | `admin@retailos.lk` | `admin123` | Store owner / business-wide administration & configuration |
| **MANAGER** | `manager@retailos.lk` | `manager123` | Branch inventory, purchasing, reports, approvals |
| **CASHIER** | `cashier@retailos.lk` | `cashier123` | POS checkout, barcode scanning, cart holding, receipts |
| **VIEWER** | `viewer@retailos.lk` | `viewer123` | Read-only analytics and audit logs |

---

## Test Scenario 1: SaaS Landing Page & Tenant Self-Signup

**Goal**: Verify new business owners can view pricing plans and register a new tenant account.

1. Open `http://localhost:3000` in the browser.
2. Scroll to the **Pricing Plans** section (Starter, Growth, Enterprise).
3. Click the **Get Started** button on the **Growth Plan**.
4. You will be routed to the registration form (`/register`).
5. Fill out the business details:
   - **Business Name**: `Ceylon Organic Supermarket`
   - **Contact Email**: `contact@ceylonorganic.lk`
   - **Phone**: `+94 77 123 4567`
   - **Address**: `123 Galle Road, Colombo 03`
   - **Administrator Name**: `Kasun Perera`
   - **Admin Password**: `Password@123`
6. Click **Submit Registration**.
7. **Expected Result**: A success screen displays confirming registration submission with a notice: *"Application submitted! Our team will activate your subscription upon verification."*

---

## Test Scenario 2: Super Admin Tenant Approval & Plan Management

**Goal**: Verify Super Admin can view, approve, reject, or modify tenant subscriptions.

1. Open `http://localhost:5173/login`.
2. Sign in with Super Admin credentials:
   - Email: `superadmin@nexpos.lk`
   - Password: `Admin@123`
3. Navigate to **Super Admin Panel** (`/super-admin`).
4. Locate the newly registered business `Ceylon Organic Supermarket` under the **Pending Approvals** tab.
5. Click **Approve Tenant**.
6. Switch to the **Active Tenants** tab. Verify the status changes to `ACTIVE`.
7. Change their assigned plan from `Growth` to `Enterprise` or adjust max branches/users.
8. Click **Save Changes**.
9. Sign out from the top-right profile dropdown.
10. **Expected Result**: Tenant account is activated, and administrator credentials are enabled for login.

---

## Test Scenario 3: Store Admin Initial Login & Store Settings

**Goal**: Verify Store Admin login, navigation shell, and core configuration settings.

1. Open `http://localhost:5173/login`.
2. Sign in as Store Admin:
   - Email: `admin@retailos.lk`
   - Password: `admin123`
3. Verify successful authentication and redirection to the **Dashboard** (`/dashboard`).
4. In the left navigation sidebar, click **Settings** (`/settings`).
5. Under the **Store Profile** tab:
   - Set **Store Name**: `RetailOS Flagship Store`
   - Set **Currency**: `LKR (Rs.)`
   - Set **VAT / Tax Rate**: `8.0%`
   - Set **Receipt Footer Note**: `Thank you for shopping with RetailOS! Returns accepted within 7 days.`
6. Under the **Security & Policies** tab:
   - Set **Low Stock Threshold Alert**: `10 units`
   - Set **Max Cashier Discount without Approval**: `15%`
7. Click **Save Settings**.
8. **Expected Result**: A green notification toast confirms *"Store settings saved successfully"*.

---

## Test Scenario 4: Multi-Branch & Store Outlets Setup

**Goal**: Verify creation, editing, and switching between multiple store branches.

1. Click **Branches** (`/branches`) in the sidebar.
2. Verify existing branches are listed in the cards (e.g., *Colombo Main*, *Kandy Branch*, *Galle Store*).
3. Click the **+ Add Branch** button.
4. Fill in the modal:
   - **Branch Name**: `Negombo Coastal Outlet`
   - **Branch Code / Slug**: `negombo`
   - **Address**: `45 Sea Street, Negombo`
   - **Phone**: `+94 31 223 9988`
   - **Opening / Closing Hours**: `08:00 AM - 10:00 PM`
   - **Status**: `OPEN`
5. Click **Create Branch**.
6. Verify the new branch card appears with `0 items in stock` and `Rs. 0 sales`.
7. Click the **Branch Switcher** in the top header bar and select `Negombo Coastal Outlet`.
8. Verify that the global active branch context updates across the entire application.

---

## Test Scenario 5: Product Catalog & Category Management

**Goal**: Verify adding categories and products with multi-branch stock levels.

### 5.1 Category Setup
1. Navigate to **Products** (`/products`) in the sidebar.
2. Click **Manage Categories** (or Category tab).
3. Click **+ Add Category**.
4. Enter:
   - **Name**: `Fresh Bakery & Snacks`
   - **Icon**: `Croissant / Coffee`
   - **Color Theme**: `Amber / Orange`
5. Click **Save Category**.

### 5.2 Product Creation
1. Click **+ Add Product** on the Products page.
2. Fill out product fields:
   - **Product Name**: `Artisan Sourdough Loaf 500g`
   - **SKU**: `BAK-SRD-500`
   - **Barcode**: `8901234567890`
   - **Category**: `Fresh Bakery & Snacks`
   - **Unit of Measure**: `PCS`
   - **Cost Price**: `Rs. 350.00`
   - **Retail Price**: `Rs. 580.00`
   - **Min Stock Alert**: `5`
   - **Initial Stock (Colombo Main)**: `20`
   - **Initial Stock (Negombo)**: `15`
3. Click **Save Product**.
4. **Expected Result**: Product is created, SKU and Barcode are indexed, and profit margin calculates automatically (`39.6% margin`).

---

## Test Scenario 6: Supplier & Procurement (Purchase Orders)

**Goal**: Verify creating supplier profiles and raising purchase orders for restocking.

### 6.1 Add Supplier
1. Navigate to **Suppliers** (`/suppliers`).
2. Click **+ Add Supplier**.
3. Enter:
   - **Supplier Name**: `Ceylon Grain Mills PLC`
   - **Contact Person**: `Nimal Bandara`
   - **Email**: `orders@ceylongrains.lk`
   - **Phone**: `+94 11 234 5678`
   - **Payment Terms**: `NET_30`
   - **Lead Time**: `3 Days`
4. Click **Save Supplier**.

### 6.2 Create Purchase Order
1. Navigate to **Purchase Orders** (`/purchase-orders`).
2. Click **+ Create Purchase Order**.
3. Select **Supplier**: `Ceylon Grain Mills PLC`.
4. Select **Destination Branch**: `Colombo Main`.
5. Set **Expected Delivery Date**: 3 days ahead.
6. Add Line Item:
   - Search Product: `Artisan Sourdough Loaf 500g`
   - **Order Quantity**: `50`
   - **Agreed Unit Cost**: `Rs. 340.00`
7. Click **Create PO as Draft**.
8. In the PO detail screen, click **Send to Supplier**.
9. **Expected Result**: PO status transitions from `DRAFT` $\to$ `SENT` with an audit log timestamp.

---

## Test Scenario 7: Stock Inbound Receiving & Branch Inventory

**Goal**: Inspect and receive PO items to automatically increase on-hand inventory.

1. Open the sent Purchase Order from Scenario 6.
2. Click **Receive Goods / Inward Inspection**.
3. In the Receiving modal:
   - Enter **Quantity Received**: `50` (or `45` to test partial receiving).
   - Enter **Batch / Note**: `Batch #B2026-08 inspected, fresh condition.`
4. Click **Confirm Inbound Stock**.
5. **Expected Result**:
   - PO Status transitions to `RECEIVED`.
   - Navigate to **Inventory** (`/inventory`).
   - Locate `Artisan Sourdough Loaf 500g`.
   - Verify stock for *Colombo Main* has incremented by +50 (from 20 to 70).

---

## Test Scenario 8: Stock Adjustments & Inter-Branch Transfers

**Goal**: Verify manual inventory corrections and stock movements between branches.

### 8.1 Manual Stock Adjustment (Damage / Expiry)
1. Go to **Inventory** (`/inventory`).
2. Click the action button on `Artisan Sourdough Loaf 500g` $\to$ **Adjust Stock**.
3. Select **Adjustment Type**: `Correction / Write-Off (Damage)`.
4. Enter **Quantity**: `-2`.
5. Enter **Reason**: `Packaging damaged during shelf display`.
6. Click **Save Adjustment**.
7. Verify stock count reduces from 70 to 68.

### 8.2 Inter-Branch Stock Transfer
1. Go to **Branches** (`/branches`) $\to$ Click **Transfer Stock**.
2. Source Branch: `Colombo Main`.
3. Destination Branch: `Negombo Coastal Outlet`.
4. Select Product: `Artisan Sourdough Loaf 500g`.
5. Quantity to Transfer: `10`.
6. Click **Initiate Transfer**.
7. Switch to the **Transfers** tab. Locate the transfer with status `IN_TRANSIT`.
8. Click **Mark Completed / Receive at Destination**.
9. **Expected Result**:
   - Colombo Main stock becomes `58`.
   - Negombo stock increments from `15` to `25`.
   - Transfer status marks as `COMPLETED`.

---

## Test Scenario 9: User Staff Management & Role Permissions

**Goal**: Verify inviting staff members, assigning roles, and role permission enforcement.

1. Go to **Settings** (`/settings`) $\to$ **Users & Permissions**.
2. Click **+ Invite User**.
3. Enter:
   - **Name**: `Dinesh Fernando`
   - **Email**: `dinesh.cashier@retailos.lk`
   - **Role**: `CASHIER`
   - **Assigned Branch**: `Colombo Main`
4. Click **Send Invitation**.
5. Locate the generated invitation token link in the UI (e.g. `/accept-invite?token=...`).
6. In a private/incognito window, open the invitation link:
   - Verify user details are pre-filled.
   - Enter new password: `Cashier@123`.
   - Click **Activate Account & Sign In**.
7. **Verify Role Restrictions for Cashier**:
   - Verify the user is routed to **POS Terminal** (`/pos`).
   - Try navigating to `/settings` or `/reports`.
   - **Expected Result**: System displays permission restriction or redirects away, preventing unauthorized access.

---

## Test Scenario 10: POS Terminal Cashiering & Checkout Flows

**Goal**: Test high-speed point of sale cashier workflows, discounts, holding carts, and payments.

Sign in as Cashier (`cashier@retailos.lk` or `dinesh.cashier@retailos.lk`) and navigate to the **POS Terminal** (`/pos`).

### 10.1 Cart Operations & Barcode Search
1. Search product by typing `Sourdough` or entering barcode `8901234567890`.
2. Click the item to add it to the cart.
3. Increase quantity to `3`.
4. Add another product (e.g., `Anchor Milk Powder`).
5. Verify Subtotal, Tax (8%), and Total calculate dynamically.

### 10.2 Cart Discounts & Holding Sales
1. Click **Apply Discount**.
2. Select **Percentage Discount**: `10%`.
3. Verify discount is deducted from total.
4. Customer asks to fetch another item $\to$ Click **Hold Cart**.
5. Enter Note: `Customer at aisle 4`.
6. Verify cart clears and a held badge appears on the **Held Carts (1)** icon.
7. Ring up a separate quick sale.
8. Click **Held Carts** $\to$ Click **Resume** on the held sale.
9. Verify the previous items and 10% discount are restored perfectly.

### 10.3 Checkout: Cash Payment with Change Due
1. Click the green **Pay / Checkout** button.
2. Select **Payment Method**: `CASH`.
3. Total due: `Rs. 2,120.00`.
4. Enter **Tendered Amount**: `Rs. 5,000.00`.
5. Verify **Change Due** displays `Rs. 2,880.00`.
6. Click **Complete Sale**.
7. **Expected Result**:
   - A digital receipt modal displays with barcode, line items, tax breakdown, and change.
   - Click **Print Receipt** (triggers print stylesheet) or **New Sale** to start the next cart.

### 10.4 Checkout: Split Payment (Cash + Card)
1. Add items totaling `Rs. 3,000.00`.
2. Click **Checkout** $\to$ Select **Split Payment**.
3. Cash portion: `Rs. 1,000.00`.
4. Card portion: `Rs. 2,000.00`.
5. Click **Process Payment**.
6. **Expected Result**: Both payment tenders are recorded under the single transaction receipt.

---

## Test Scenario 11: Customer Dual-Screen Display & Live Sync

**Goal**: Verify real-time cart synchronization on customer-facing screens.

1. Open `http://localhost:5173/customer-display` in a secondary browser window or side-by-side tab.
2. In the primary POS window (`/pos`), add items to the cart.
3. Observe the Customer Display window:
   - Line items, quantities, unit prices, discounts, and total update in real-time.
   - When a sale completes, a *"Thank you for your purchase!"* animation appears.

---

## Test Scenario 12: Sales History, Refunds & Transaction Voids

**Goal**: Verify viewing transaction audits and processing returns with automatic restock.

1. Log in as Store Admin or Manager.
2. Navigate to **Sales History** (`/sales`).
3. Locate the completed transaction from Scenario 10.
4. Click on the transaction to open the **Transaction Details** drawer.
5. Click **Process Refund**.
6. In the modal:
   - Select item to return: `1x Artisan Sourdough Loaf`.
   - Select Refund Method: `Original Payment (Cash)`.
   - Reason: `Customer purchased wrong item`.
7. Click **Confirm Refund**.
8. **Expected Result**:
   - Transaction status updates to `REFUNDED` (or partial refund badge).
   - Navigate to **Inventory** $\to$ Verify that on-hand stock for `Artisan Sourdough Loaf` automatically increments by +1 back to stock.

---

## Test Scenario 13: Anomaly & Fraud Security Alert Desk

**Goal**: Verify automatic flagging of suspicious behavior and investigation workflows.

1. Navigate to **Security & Alerts** (`/alerts`).
2. Review the list of active anomaly triggers:
   - *Elevated Voids on Shift*
   - *High-Volume Discounting near Manager Threshold*
   - *Zero-Stock Fast-Mover Activity*
3. Click an alert (e.g. `Elevated Voids detected for Cashier`).
4. Review the timeline, cashier name, transaction IDs, and deviation percentage.
5. Click **Change Status** $\to$ Set to `INVESTIGATING`.
6. In the Notes box, enter: `Audited CCTV footage for Terminal 1 shift. No malicious intent found.`
7. Click **Post Note**.
8. Change Status $\to$ `REVIEWED` or `DISMISSED`.
9. **Expected Result**: Alert is resolved and logged in the immutable audit trail.

---

## Test Scenario 14: Financial Reports, P&L & Ask-Your-Data NLP

**Goal**: Test executive reporting, income statement calculations, and conversational analytics.

### 14.1 Financial P&L & Margins
1. Navigate to **Reports** (`/reports`) $\to$ **Finance Analytics** (`/finance`).
2. Verify KPI cards:
   - **Gross Revenue**
   - **Cost of Goods Sold (COGS)**
   - **Gross Profit Margin (%)**
   - **Net Profit After Operating Expenses**
3. Review the **Category Revenue Breakdown** donut chart.
4. Review the **Branch Profitability Matrix** comparing Colombo, Kandy, and Negombo outlets.

### 14.2 "Ask Your Data" AI Analytical Querying
1. On the Reports page, locate the **Ask Your Data** input bar.
2. Test sample queries:
   - `What is our best-selling category this month?`
   - `Which branch has the highest profit margin?`
   - `What items are currently below minimum stock level?`
   - `What is our average basket value?`
3. Click **Ask Assistant**.
4. **Expected Result**: The assistant computes the real-time dataset and renders concise executive answers, KPI chips, and recommended replenishment actions.

---

## 17. Verification Checklist Summary

| Area | Test Steps | Verified |
| :--- | :--- | :---: |
| **SaaS Onboarding** | Self-signup, Super Admin approval, multi-tenant database isolation | [ ] |
| **Store Management** | Branch creation, switching active branch context, store VAT & policies | [ ] |
| **Catalogue & Inventory** | Categories, product SKUs, multi-branch stock levels, low-stock alerts | [ ] |
| **Procurement (PO)** | Supplier creation, PO drafting, sending, and inbound receiving to stock | [ ] |
| **Operations** | Inter-branch transfers (In-Transit $\to$ Received), damage adjustments | [ ] |
| **POS Checkout** | Barcode scanning, discounts, cart holding, cash/card/split checkout | [ ] |
| **Dual Screen** | Secondary customer display synchronization | [ ] |
| **Post-Sale** | Sales audit trail, receipt reprinting, customer refunds with auto-restock | [ ] |
| **Security & Fraud** | Heuristic anomaly detection, audit notes, status lifecycle | [ ] |
| **Analytics & AI** | P&L calculation, branch profitability, natural language data querying | [ ] |

---

*NexPOS System User Testing Guide — Built for Quality Assurance and End-to-End System Validation.*
