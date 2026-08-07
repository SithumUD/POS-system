<h1 align="center">
  🏪 NexPOS
</h1>

<h4 align="center">Enterprise-Grade Point of Sale & Inventory Management System</h4>

<p align="center">
  <a href="#overview">Overview</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#features">Features</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#api-reference">API Reference</a> •
  <a href="#project-structure">Project Structure</a> •
  <a href="#license">License</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Spring_Boot-4.1.0-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white" alt="Spring Boot">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/Expo-57-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo">
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" alt="Java 21">
  <img src="https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" alt="MIT License">
</p>

---

## Overview

**NexPOS** is a production-grade, multi-tenant Point of Sale and Inventory Management System designed for small-to-medium retail businesses. It replaces manual stock counts and paper-based sales tracking with a real-time, role-based platform supporting barcode-driven checkout, live stock updates, and deep analytics.

The system spans **three sub-projects** in a monorepo:

| Sub-project | Description | Stack |
|---|---|---|
| [`pos-backend`](./pos-backend/) | REST API + WebSocket server | Spring Boot 4, Java 21, PostgreSQL |
| [`pos-frontend`](./pos-frontend/) | Manager & cashier web dashboard | React 18, TypeScript, Vite |
| [`pos-scanner-app`](./pos-scanner-app/) | Mobile barcode scanner companion | Expo 57, React Native |

**Key engineering highlights:**

- **Event-driven checkout** — A completed sale publishes a `SaleCompletedEvent` via RabbitMQ; independent consumers handle stock deduction, analytics, and loyalty points without coupling to the checkout code path.
- **Optimistic locking** (`@Version` on `Inventory`) prevents two simultaneous terminals from overselling the last unit under concurrent load.
- **Immutable stock ledger** — `StockMovement` is the source of truth; `Inventory.quantity_on_hand` is a derived cache, making every stock state fully auditable.
- **WebSocket (STOMP over SockJS)** broadcasts live stock updates and sales feed to all connected manager dashboards in real time.
- **Offline-capable POS** — the terminal queues offline sales locally and syncs them with idempotency keys once connectivity returns, so a network drop never blocks a sale or double-charges stock.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                           │
│                                                                 │
│   ┌───────────────────────┐    ┌───────────────────────────┐   │
│   │   pos-frontend        │    │   pos-scanner-app          │   │
│   │   React 18 + Vite     │    │   Expo / React Native      │   │
│   │   Manager Dashboard   │    │   Barcode Scanner Mobile   │   │
│   │   Cashier POS Screen  │    │   (Android / iOS)          │   │
│   └───────────┬───────────┘    └─────────────┬─────────────┘   │
└───────────────┼──────────────────────────────┼─────────────────┘
                │  REST (HTTP/JSON)             │  REST + WebSocket
                │  WebSocket (STOMP/SockJS)     │
                ▼                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         pos-backend                             │
│                  Spring Boot 4  ·  Java 21                      │
│                                                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │
│  │   auth   │ │ product  │ │inventory │ │  sales / POS     │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │
│  │purchasing│ │analytics │ │ anomaly  │ │ branch / user    │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘  │
│                     │               │                           │
│               RabbitMQ AMQP    WebSocket STOMP                  │
└─────────────────────────────────────────────────────────────────┘
         │                    │                    │
 ┌───────┴──────┐    ┌────────┴───────┐   ┌───────┴──────┐
 │  PostgreSQL  │    │     Redis      │   │   RabbitMQ   │
 │  (JPA +      │    │   (Cache &     │   │  (Event Bus) │
 │   Flyway)    │    │  Session BL)   │   │              │
 └──────────────┘    └────────────────┘   └──────────────┘
```

---

## Tech Stack

### Backend (`pos-backend`)

| Layer | Technology |
|---|---|
| Framework | Spring Boot 4.1.0 (Spring Web MVC) |
| Language | Java 21 |
| Persistence | Spring Data JPA + PostgreSQL 16 |
| Migrations | Flyway |
| Security | Spring Security + JWT (JJWT 0.12.6) |
| Messaging | Spring AMQP + RabbitMQ 3 |
| Caching | Spring Data Redis + Redis 7 |
| Real-time | Spring WebSocket (STOMP) |
| Mail | Spring Mail (Brevo SMTP) |
| API Docs | SpringDoc OpenAPI 3.0.3 (Swagger UI) |
| Validation | Spring Bean Validation |
| Testing | JUnit 5 + Testcontainers (PostgreSQL, RabbitMQ) |
| Build | Maven (wrapper included — no local Maven needed) |

### Frontend (`pos-frontend`)

| Layer | Technology |
|---|---|
| Framework | React 18.3 + TypeScript 5.5 |
| Build Tool | Vite 5 |
| Styling | Tailwind CSS 3.4 |
| Charts | Recharts 2.12 |
| Routing | React Router v6 |
| Animations | Framer Motion 11 |
| Real-time | SockJS + STOMP (`@stomp/stompjs`) |
| HTTP Client | Axios |
| Notifications | Sonner |
| Icons | Lucide React |

### Mobile Scanner (`pos-scanner-app`)

| Layer | Technology |
|---|---|
| Framework | Expo 57 + React Native 0.86 |
| Language | TypeScript 6 |
| Navigation | Expo Router (file-based) |
| Camera | `expo-camera` (barcode scanning) |
| Real-time | SockJS + STOMP |
| Storage | AsyncStorage |
| Animations | React Native Reanimated 4 |
| Platforms | Android, iOS |

### Infrastructure (Docker Compose)

| Service | Image | Port(s) |
|---|---|---|
| PostgreSQL | `postgres:16-alpine` | 5432 |
| Redis | `redis:7-alpine` | 6379 |
| RabbitMQ | `rabbitmq:3-management-alpine` | 5672, 15672 (UI) |

---

## Features

### 🖥️ POS Terminal
- Barcode scanner input (keyboard-wedge — scan populates a focused input field)
- Manual product search by name or SKU as a fallback
- Cart management: add/remove items, adjust quantities
- Line-level and cart-level discount application
- Multiple payment methods per sale (Cash, Card, split payment)
- Automatic change calculation for cash payments
- **Hold/resume (park) a cart** for later recall — common real retail feature
- Thermal receipt generation after checkout
- **Offline queue** — continue selling during network outage, sync with idempotency keys on reconnect

### 📦 Inventory Management
- Real-time stock levels per product, per branch
- **Immutable stock movement ledger** — every change (sale, purchase, adjustment, transfer, return) is a permanent audit record
- Manual stock adjustments with mandatory reason code (damage, theft, shrinkage, stocktake)
- Low-stock alerts: dashboard badge + email notification when stock < reorder threshold
- **Inter-branch stock transfers** — creates paired `TRANSFER_OUT`/`TRANSFER_IN` ledger entries

### 🛒 Purchase Orders & Suppliers
- Full supplier CRUD with contact details, payment terms, and lead time
- Purchase order lifecycle: `DRAFT → SENT → PARTIALLY_RECEIVED → RECEIVED → CLOSED`
- Partial receipt support — updates stock and cost price per shipment batch

### 📊 Analytics & Reporting
- Live KPI cards and sales feed on the manager dashboard (WebSocket)
- Revenue time-series (daily/hourly), category breakdown, top products
- **Profit & Loss statement** — Gross Sales, Discounts, Net Revenue, COGS, Gross Profit, Net Profit
- Branch profitability matrix and stock asset valuation
- Product-level margin analysis (sale price vs. cost price)
- Payment tender reconciliation (Cash vs. Card)
- **Natural-language "Ask Your Data"** — type a question, get executive financial insights

### 🔔 Anomaly & Fraud Detection
- Automated heuristic scanning: elevated void/refund rates, limit-hugging discounts, repeated stock write-offs, zero-stock fast-movers
- Alert lifecycle: `NEW → INVESTIGATING → REVIEWED → DISMISSED`
- Investigation notes per alert for audit trail

### 🏪 Multi-Branch Management
- Products and pricing can be global or branch-specific
- Per-branch stock tracking, consolidated owner-level reporting across all branches
- Branch manager assignment, operating hours, and terminal count

### 🔐 Role-Based Access Control

| Role | Capabilities |
|---|---|
| **ADMIN** | Full system access: users, branches, settings, all reports |
| **MANAGER** | Branch inventory, purchase orders, reports, anomaly review |
| **CASHIER** | POS terminal only — no access to financial or admin screens |

### 📱 Mobile Scanner Companion
- Camera-based barcode scanning (Android & iOS via `expo-camera`)
- Real-time stock lookup via backend API
- STOMP WebSocket connection for live inventory updates
- Bluetooth scanner peripheral support (Android)

---

## Getting Started

### Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| Java JDK | 21+ | Backend runtime |
| Node.js | 20+ | Frontend & mobile |
| Docker & Docker Compose | Latest | Infrastructure services |
| Expo CLI | Latest | Mobile app development |

---

### Step 1 — Start Infrastructure

Start PostgreSQL, Redis, and RabbitMQ with a single command from the `pos-backend` directory:

```bash
cd pos-backend
docker compose up -d
```

| Service | URL | Credentials |
|---|---|---|
| PostgreSQL | `localhost:5432` | postgres / admin123 (db: posdb) |
| Redis | `localhost:6379` | — |
| RabbitMQ Management UI | `http://localhost:15672` | guest / guest |

---

### Step 2 — Run the Backend

```bash
cd pos-backend

# Linux / macOS
./mvnw spring-boot:run

# Windows
mvnw.cmd spring-boot:run
```

The backend starts on **`http://localhost:8080`**.

Flyway automatically applies all database migrations from `src/main/resources/db/migration/` on startup.

> **Swagger UI:** `http://localhost:8080/swagger-ui.html`  
> **Health check:** `http://localhost:8080/actuator/health`

#### Key Environment Variables

| Variable | Default | Description |
|---|---|---|
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://localhost:5432/posdb` | PostgreSQL connection |
| `SPRING_DATASOURCE_USERNAME` | `postgres` | Database user |
| `SPRING_DATASOURCE_PASSWORD` | `admin123` | Database password |
| `SPRING_RABBITMQ_HOST` | `localhost` | RabbitMQ host |
| `SPRING_REDIS_HOST` | `localhost` | Redis host |
| `JWT_SECRET` | _(set in config)_ | JWT signing key (min 256-bit) |
| `SPRING_MAIL_HOST` | _(set in config)_ | SMTP host (e.g. Brevo) |

---

### Step 3 — Run the Frontend

```bash
cd pos-frontend
npm install
npm run dev
```

The dev server starts at **`http://localhost:5173`** and proxies API calls to `http://localhost:8080/api/v1`.

```bash
# Production build
npm run build

# Preview production build locally
npm run preview
```

---

### Step 4 — Run the Mobile Scanner App

```bash
cd pos-scanner-app
npm install
npx expo start
```

Scan the QR code with **Expo Go** (available on Google Play / App Store), or run on a simulator:

```bash
# Android emulator
npm run android

# iOS simulator (macOS only)
npm run ios
```

> **Note:** The app requests **Camera** permission on first launch for barcode scanning. On Android, Bluetooth permissions are additionally requested for external scanner peripherals.

---

## API Reference

The complete REST API is documented via **Swagger UI** at `http://localhost:8080/swagger-ui.html`.

### Base URL
```
http://localhost:8080/api/v1
```

### Authentication

All endpoints (except `/auth/login` and `/auth/refresh`) require a JWT Bearer token:

```http
Authorization: Bearer <access_token>
```

### Endpoint Groups

| Group | Base Path | Description |
|---|---|---|
| Auth | `/api/v1/auth` | Login, token refresh, current user context |
| Products | `/api/v1/products` | Product catalogue CRUD, barcode lookup, duplicate |
| POS | `/api/v1/pos` | Checkout, held sales, offline batch sync |
| Sales | `/api/v1/sales` | Sales history, void, refund, receipts |
| Inventory | `/api/v1/inventory` | Stock levels, adjustments, transfers, movement ledger |
| Purchase Orders | `/api/v1/purchase-orders` | PO lifecycle and receive-stock |
| Suppliers | `/api/v1/suppliers` | Supplier CRUD |
| Analytics | `/api/v1/analytics` | Revenue, P&L, margins, NL query |
| Alerts | `/api/v1/alerts` | Anomaly alert management |
| Branches | `/api/v1/branches` | Branch CRUD |
| Settings | `/api/v1/settings` | Store configuration |
| Users | `/api/v1/users` | User & role management |

### WebSocket Topics (STOMP)

Connect via SockJS at `ws://localhost:8080/ws`:

| Topic | Payload | Description |
|---|---|---|
| `/topic/inventory/{branchId}` | `InventoryUpdateEvent` | Live stock level changes |
| `/topic/dashboard/{branchId}` | `SaleFeedEvent` | Live sales feed and KPI updates |

---

## Project Structure

```
POS-system/
├── pos-backend/                             # Spring Boot REST API
│   ├── src/main/java/com/sithumud/pos_backend/
│   │   ├── PosBackendApplication.java
│   │   ├── alert/                           # Anomaly & fraud detection
│   │   ├── analytics/                       # Sales analytics & reporting
│   │   ├── auth/                            # JWT authentication & refresh
│   │   ├── branch/                          # Multi-branch management
│   │   ├── common/                          # Shared utilities, exception handling
│   │   ├── config/                          # SecurityConfig, WebSocketConfig, RabbitConfig
│   │   ├── inventory/                       # Stock management & movement ledger
│   │   ├── pos/                             # POS checkout domain (event-driven)
│   │   ├── product/                         # Product catalogue
│   │   ├── purchasing/                      # Suppliers & purchase orders
│   │   ├── reporting/                       # Report generation & export
│   │   ├── sales/                           # Sales & transactions
│   │   ├── security/                        # JWT filter & user principal
│   │   ├── setting/                         # Store settings
│   │   ├── user/                            # User management
│   │   └── websocket/ & ws/                 # STOMP WebSocket controllers
│   ├── src/main/resources/
│   │   ├── application.yml
│   │   └── db/migration/                    # Flyway SQL migrations (V1, V2, V3…)
│   ├── docker-compose.yml                   # Local infrastructure services
│   └── pom.xml
│
├── pos-frontend/                            # React web dashboard
│   ├── src/
│   │   ├── api/                             # Axios API clients per domain
│   │   ├── components/                      # Reusable UI components
│   │   ├── contexts/                        # Auth & global state contexts
│   │   ├── hooks/                           # Custom hooks (WebSocket, data fetching)
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx                # Live KPI cards & sales feed
│   │   │   ├── PosTerminal.tsx              # Cashier checkout screen
│   │   │   ├── Products.tsx                 # Product catalogue management
│   │   │   ├── Inventory.tsx                # Stock management
│   │   │   ├── SalesHistory.tsx             # Transaction ledger & audit
│   │   │   ├── FinanceAnalytics.tsx         # P&L, margins, cash flow
│   │   │   ├── AnomalyAlerts.tsx            # Fraud & shrinkage alerts
│   │   │   ├── PurchaseOrders.tsx           # PO management
│   │   │   ├── Suppliers.tsx                # Supplier management
│   │   │   ├── Branches.tsx                 # Branch management
│   │   │   ├── Reports.tsx                  # Report exports
│   │   │   ├── Settings.tsx                 # Store configuration
│   │   │   └── CustomerDisplay.tsx          # Checkout customer-facing screen
│   │   ├── types/                           # TypeScript type definitions
│   │   └── utils/                           # Utility helpers
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── package.json
│
├── pos-scanner-app/                         # Expo mobile barcode scanner
│   ├── src/
│   │   ├── app/                             # Expo Router file-based screens
│   │   ├── components/                      # Native UI components
│   │   ├── contexts/                        # Auth & WebSocket contexts
│   │   ├── hooks/                           # Custom React Native hooks
│   │   └── services/                        # API & WebSocket services
│   ├── assets/                              # App icons & splash screens
│   ├── app.json                             # Expo config (Android/iOS)
│   └── package.json
│
├── LICENSE                                  # MIT License
└── README.md
```

---

## Data Model

The backend uses an **immutable ledger pattern** for inventory — the `StockMovement` table is the source of truth, and `Inventory.quantity_on_hand` is a derived cache. This mirrors production accounting systems and ensures every stock state is fully auditable.

```
User              (id, name, email, password_hash, role, branch_id, is_active)
Branch            (id, name, address, manager_id, operating_hours)
Category          (id, name, parent_id)
Product           (id, sku, barcode, name, category_id, unit_price, cost_price,
                   tax_rate, reorder_threshold, unit_of_measure, is_active)

Inventory         (id, product_id, branch_id, quantity_on_hand)
                  ↑ cached snapshot — derived from StockMovement

StockMovement     (id, product_id, branch_id,
                   type[SALE|PURCHASE|ADJUSTMENT|TRANSFER_IN|TRANSFER_OUT|RETURN],
                   quantity, reference_id, reason, created_by, created_at)
                  ↑ immutable source of truth

Supplier          (id, name, contact_email, phone, payment_terms, lead_time)
PurchaseOrder     (id, supplier_id, branch_id, status, created_by, created_at)
PurchaseOrderItem (id, po_id, product_id, qty_ordered, qty_received, unit_cost)

Sale              (id, branch_id, cashier_id, status[COMPLETED|VOIDED|REFUNDED],
                   subtotal, discount, tax, total, created_at)
SaleItem          (id, sale_id, product_id, quantity, unit_price_at_sale,
                   discount, line_total)
                  ↑ price snapshot at time of sale — never references mutable product price

Payment           (id, sale_id, method[CASH|CARD], amount)
AuditLog          (id, user_id, action, entity, entity_id, metadata, created_at)
```

---

## Running Tests

### Backend — Integration Tests (Testcontainers)

```bash
cd pos-backend
./mvnw test         # Linux / macOS
mvnw.cmd test       # Windows
```

Testcontainers spins up real PostgreSQL and RabbitMQ containers automatically — no manual service setup needed for testing.

Key test coverage:
- `SaleServiceIntegrationTest` — full checkout flow against a real Postgres container
- `InventoryConcurrencyTest` — optimistic locking prevents overselling under concurrent checkouts
- `AuthControllerTest` — JWT issue, verify, and refresh flow

### Frontend — Lint

```bash
cd pos-frontend
npm run lint
```

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for full details.

Copyright © 2026 [SITHUM UDAYANGA](https://github.com/SithumUD)

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/SithumUD">Sithum Udayanga</a>
</p>