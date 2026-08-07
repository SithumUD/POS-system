# NexPOS — Enterprise Point of Sale & Inventory System

A full-stack **Point of Sale and Inventory Management** platform built for multi-branch retail businesses.

## Tech Stack

### Frontend
- **React 18** + **TypeScript** — component-driven UI
- **Vite** — lightning-fast dev server and build tool
- **Tailwind CSS** — utility-first styling with a custom design system
- **Recharts** — analytics and reporting charts
- **React Router v6** — client-side routing with role-based route protection
- **Framer Motion** — micro-animations and transitions
- **Sonner** — toast notifications
- **Lucide React** — icon system
- **SockJS + STOMP** — real-time WebSocket integration

### Backend
- **Spring Boot** (Java) — REST API + WebSocket server
- **JWT Authentication** — secure, role-based access control

## Features

- 🖥️ **POS Terminal** — fast checkout with barcode scanning support
- 📦 **Inventory Management** — real-time multi-branch stock tracking
- 📊 **Analytics Dashboard** — live revenue charts, KPI cards, trend analysis
- 💰 **Finance & Analytics** — detailed financial reporting (Admin/Manager only)
- 🔔 **Anomaly Alerts** — AI-powered stock and sales anomaly detection
- 🏪 **Multi-Branch Support** — manage multiple store locations from one platform
- 🛒 **Purchase Orders** — supplier ordering and receiving workflow
- 📋 **Sales History** — complete transaction audit trail
- 🔐 **Role-Based Access** — ADMIN, MANAGER, and CASHIER permission levels
- 👤 **Customer Display** — secondary screen output for checkout

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Environment

The frontend connects to the Spring Boot backend at `http://localhost:8080/api/v1` by default.

---

Built with ❤️ by Sithum Udayanga
