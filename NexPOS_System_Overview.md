# NexPOS — Enterprise Point of Sale & Inventory Management System
## System Overview Document

NexPOS is a production-grade, multi-tenant Point of Sale (POS) and Inventory Management System designed for small-to-medium retail businesses. It replaces manual stock counts and paper-based sales tracking with a real-time, role-based platform supporting barcode-driven checkout, live stock updates, and deep analytics.

---

## 1. System Architecture

The system spans three main sub-projects in a monorepo, communicating via REST APIs, WebSockets, and Message Queues (AMQP).

1.  **Backend API Server:** Core business logic, data persistence, and event processing.
2.  **Web Dashboard (Frontend):** Manager and cashier POS interface.
3.  **Mobile Scanner App:** Companion barcode scanner app.

### High-Level Flow
*   **Clients** (Web Dashboard / Mobile App) communicate with the backend via **HTTP/JSON REST APIs**.
*   **Real-time updates** (e.g., live stock deductions, live sales feeds) are pushed to the web dashboard via **WebSocket (STOMP/SockJS)**.
*   **Asynchronous Processing:** When a sale is completed, an event is published to **RabbitMQ**. Independent consumers handle stock deduction, analytics, and loyalty points without blocking the checkout flow.

---

## 2. Technology Stack

### Backend (`pos-backend`)
The backend is built for high concurrency and robust data integrity.

*   **Framework:** Spring Boot 4.1.0 (Spring Web MVC)
*   **Language:** Java 21
*   **Database:** PostgreSQL 16 (Relational DB for core data)
*   **ORM / Data Access:** Spring Data JPA / Hibernate
*   **Database Migrations:** Flyway
*   **Caching & Sessions:** Redis
*   **Message Broker:** RabbitMQ (Event-driven architecture)
*   **Real-time Comm:** Spring WebSocket (STOMP over SockJS)
*   **Security:** Spring Security + JWT (JSON Web Tokens)
*   **Build Tool:** Gradle

### Web Frontend (`pos-frontend`)
The web application provides a responsive, dark-glassmorphism UI for both cashiers (POS terminal) and managers (Admin Dashboard).

*   **Framework:** React 18
*   **Language:** TypeScript 5.5
*   **Build Tool:** Vite
*   **State Management:** React Query (Server state) & Zustand (Client state)
*   **Styling:** Tailwind CSS + Shadcn UI
*   **Routing:** React Router v6
*   **WebSocket Client:** `@stomp/stompjs`

### Mobile Scanner App (`pos-scanner-app`)
A companion app for inventory management and barcode scanning.

*   **Framework:** Expo 57 / React Native
*   **Language:** TypeScript
*   **Barcode Scanning:** `expo-camera` / `expo-barcode-scanner`
*   **State Management:** Zustand
*   **API Client:** Axios

---

## 3. Core Features

### 🛒 Point of Sale (POS) Terminal
*   **Barcode-driven Checkout:** Fast scanning and item lookup.
*   **Offline Capability:** The terminal queues offline sales locally and syncs them with idempotency keys once connectivity returns. A network drop never blocks a sale or double-charges stock.
*   **Optimistic Locking:** Prevents two simultaneous terminals from overselling the last unit of stock under heavy concurrent load.
*   **Customer Display:** Premium dark glassmorphism UI with live clock, rotating promo tickers, and clear cart/change-due states.

### 📦 Inventory Management
*   **Immutable Stock Ledger:** Every stock change (`StockMovement`) is recorded as a source of truth. The `quantity_on_hand` is a derived cache, making every stock state fully auditable.
*   **Live Stock Updates:** WebSockets broadcast stock deductions to all connected manager dashboards in real time.
*   **Inter-branch Transfers:** Move stock between different store locations.
*   **Purchase Orders & Suppliers:** Manage supplier details, track POs, and update stock automatically upon delivery.

### 🏢 Multi-Tenant Architecture (SaaS Ready)
The system is built to support multiple independent businesses (Tenants) on a single deployment.
*   **Data Isolation:** Every entity (Users, Products, Sales, etc.) is scoped to a specific Tenant via Hibernate `@TenantId`. Data from one business cannot bleed into another.
*   **Subscription Plans:** Infrastructure designed to enforce limits based on tiers (e.g., Starter, Business, Professional, Enterprise), controlling the number of branches, users, and products a tenant can have.
*   **Role-based Access Control (RBAC):** Roles include Super Admin, Admin, Manager, Cashier, and Viewer, with granular permissions.

### 📊 Analytics & Reporting
*   **Real-time Dashboards:** View daily sales, profit margins, and top-selling items.
*   **Anomaly Detection:** Built-in alerts (`AnomalyAlert`) for suspicious activities like excessive voids or stock shrinkage.

---

## 4. Why This System is Enterprise-Grade

1.  **Event-Driven Design:** By utilizing RabbitMQ, the checkout process is incredibly fast. Heavy tasks like recalculating analytics or generating loyalty points happen in the background.
2.  **Idempotency:** Network failures during a transaction won't result in double-charging or stock count errors.
3.  **Data Integrity:** The immutable stock ledger ensures that an auditor can track exactly when and why every single item entered or left the inventory.
4.  **Multi-Tenancy:** Ready to be deployed as a SaaS (Software as a Service) platform, allowing the owner to generate recurring revenue from multiple businesses.

---
*Generated for system overview and licensing purposes.*
