# RetailOS Enterprise POS — Complete Frontend API Integration Guide

This guide is designed for frontend developers building the Web POS UI, Admin Dashboard, and API Client services. It details **every single endpoint** with explicit **Request Body** and **Response Body** JSON examples, query parameters, header requirements, and TypeScript interface definitions.

---

## 1. Core Architecture & Axios Setup

### Base URL & Environment
* **Development Base URL**: `http://localhost:8080/api/v1`
* **Swagger UI / OpenAPI Interactive Spec**: `http://localhost:8080/swagger-ui.html`

### Standard Request Headers
```http
Content-Type: application/json
Authorization: Bearer <jwt_access_token>
```

### Standard Response Envelopes

#### 1. Single Entity / Generic Response (`ApiResponse<T>`)
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "timestamp": "2026-08-06T10:00:00Z"
}
```

#### 2. Paginated List Response (`ApiResponse<Page<T>>`)
```json
{
  "success": true,
  "message": "Items retrieved successfully",
  "data": {
    "content": [ ... ],
    "pageable": {
      "pageNumber": 0,
      "pageSize": 20,
      "sort": { "sorted": true, "empty": false, "unsorted": false }
    },
    "totalElements": 150,
    "totalPages": 8,
    "size": 20,
    "number": 0,
    "first": true,
    "last": false,
    "empty": false
  },
  "timestamp": "2026-08-06T10:00:00Z"
}
```

#### 3. Standard Error Envelope (`ApiResponse<Void>`)
```json
{
  "success": false,
  "message": "Insufficient stock for product SKU: DRY-AN-400 at Colombo Store",
  "errorCode": "INSUFFICIENT_STOCK",
  "timestamp": "2026-08-06T10:00:00Z"
}
```

---

## 2. Authentication & Session Security (`/api/v1/auth`)

### 1. User Login
* **`POST /api/v1/auth/login`**
* **Request Body**:
```json
{
  "email": "ruwan@retailos.lk",
  "password": "password123"
}
```
* **Response Body `200 OK`**:
```json
{
  "success": true,
  "message": "Authentication successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJydXdhbkByZXRhaWxvcy5sayIs...",
    "refreshToken": "d8a1c9e0-3f4b-4b2a-8c9d-1e2f3a4b5c6d",
    "user": {
      "id": "c1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c",
      "name": "Ruwan Silva",
      "email": "ruwan@retailos.lk",
      "role": "CASHIER",
      "status": "ACTIVE",
      "branchSlug": "colombo",
      "branchName": "Colombo Store",
      "avatarUrl": "https://cdn.retailos.lk/avatars/ruwan.jpg"
    }
  },
  "timestamp": "2026-08-06T10:00:00Z"
}
```

### 2. Refresh Token
* **`POST /api/v1/auth/refresh`**
* **Request Body**:
```json
{
  "refreshToken": "d8a1c9e0-3f4b-4b2a-8c9d-1e2f3a4b5c6d"
}
```
* **Response Body `200 OK`**:
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9.new_jwt_access_token..."
  },
  "timestamp": "2026-08-06T10:00:00Z"
}
```

### 3. Get Current User Profile
* **`GET /api/v1/auth/me`**
* **Request Body**: *None*
* **Response Body `200 OK`**:
```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "id": "c1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c",
    "name": "Ruwan Silva",
    "email": "ruwan@retailos.lk",
    "role": "CASHIER",
    "status": "ACTIVE",
    "branchSlug": "colombo",
    "branchName": "Colombo Store",
    "avatarUrl": "https://cdn.retailos.lk/avatars/ruwan.jpg"
  },
  "timestamp": "2026-08-06T10:00:00Z"
}
```

---

## 3. Products & Catalogue (`/api/v1/categories`, `/api/v1/products`)

### 1. Flat Category List
* **`GET /api/v1/categories`**
* **Request Body**: *None*
* **Response Body `200 OK`**:
```json
{
  "success": true,
  "message": "Categories retrieved successfully",
  "data": [
    {
      "id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
      "slug": "dairy",
      "name": "Dairy & Milk Products",
      "description": "Fresh milk, powder, cheese, and butter",
      "parentId": null,
      "parentName": null
    }
  ],
  "timestamp": "2026-08-06T10:00:00Z"
}
```

### 2. Category Tree Hierarchy
* **`GET /api/v1/categories/tree`**
* **Request Body**: *None*
* **Response Body `200 OK`**:
```json
{
  "success": true,
  "message": "Category tree retrieved successfully",
  "data": [
    {
      "id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
      "slug": "dairy",
      "name": "Dairy Products",
      "description": "Dairy department",
      "children": [
        {
          "id": "f8e7d6c5-b4a3-2f1e-0d9c-8b7a6f5e4d3c",
          "slug": "milk-powder",
          "name": "Milk Powder",
          "description": "Full cream powder packets",
          "children": []
        }
      ]
    }
  ],
  "timestamp": "2026-08-06T10:00:00Z"
}
```

### 3. Create Category
* **`POST /api/v1/categories`**
* **Request Body**:
```json
{
  "name": "Beverages",
  "slug": "beverages",
  "parentId": null,
  "description": "Soft drinks, juices, and mineral water"
}
```
* **Response Body `201 Created`**:
```json
{
  "success": true,
  "message": "Category created successfully",
  "data": {
    "id": "b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e",
    "slug": "beverages",
    "name": "Beverages",
    "description": "Soft drinks, juices, and mineral water",
    "parentId": null,
    "parentName": null
  },
  "timestamp": "2026-08-06T10:00:00Z"
}
```

### 4. Paginated Product List
* **`GET /api/v1/products?page=0&size=20&search=anchor&categorySlug=dairy&active=true`**
* **Request Body**: *None*
* **Response Body `200 OK`**:
```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": {
    "content": [
      {
        "id": "e72b1a48-bbd0-434a-b50d-bc13aac258a9",
        "sku": "DRY-AN-400",
        "barcode": "4792001123456",
        "name": "Anchor Milk Powder 400g",
        "categorySlug": "dairy",
        "categoryName": "Dairy & Milk Products",
        "unitPrice": 1150.00,
        "costPrice": 920.00,
        "taxRate": 10.00,
        "unitOfMeasure": "PACKET",
        "active": true,
        "imageUrl": "https://cdn.retailos.lk/products/anchor-400.jpg"
      }
    ],
    "totalElements": 1,
    "totalPages": 1,
    "size": 20,
    "number": 0
  },
  "timestamp": "2026-08-06T10:00:00Z"
}
```

### 5. Create Product
* **`POST /api/v1/products`**
* **Request Body**:
```json
{
  "sku": "BEV-CC-400",
  "barcode": "5449000000996",
  "name": "Coca-Cola 400ml Bottle",
  "categorySlug": "beverages",
  "unitPrice": 220.00,
  "costPrice": 170.00,
  "taxRate": 10.00,
  "unitOfMeasure": "BOTTLE",
  "active": true,
  "imageUrl": "https://cdn.retailos.lk/products/coke-400.jpg"
}
```
* **Response Body `201 Created`**: Returns created `ProductDto`.

### 6. Toggle Product Active Status
* **`PATCH /api/v1/products/{id}/status?active=false`**
* **Request Body**: *None*
* **Response Body `200 OK`**: Returns updated `ProductDto` with `active: false`.

### 7. Duplicate Product Template
* **`POST /api/v1/products/{id}/duplicate`**
* **Request Body**: *None*
* **Response Body `201 Created`**: Returns new draft `ProductDto` with SKU suffix `-COPY`.

---

## 4. POS Terminal & Checkout (`/api/v1/pos`, `/api/v1/sales`)

### 1. Fast Cashier Search
* **`GET /api/v1/pos/products?branchSlug=colombo&query=anchor`**
* **Request Body**: *None*
* **Response Body `200 OK`**:
```json
{
  "success": true,
  "message": "POS product search completed",
  "data": [
    {
      "id": "e72b1a48-bbd0-434a-b50d-bc13aac258a9",
      "sku": "DRY-AN-400",
      "barcode": "4792001123456",
      "name": "Anchor Milk Powder 400g",
      "categorySlug": "dairy",
      "unitPrice": 1150.00,
      "taxRate": 10.00,
      "unitOfMeasure": "PACKET",
      "quantityOnHand": 48
    }
  ],
  "timestamp": "2026-08-06T10:00:00Z"
}
```

### 2. Atomic Sales Checkout
* **`POST /api/v1/pos/checkout`**
* **Request Headers**:
```http
Content-Type: application/json
Authorization: Bearer <token>
Idempotency-Key: a9b8c7d6-e5f4-3210-9876-543210fedcba
```
* **Request Body**:
```json
{
  "branchSlug": "colombo",
  "registerId": "REG-01",
  "idempotencyKey": "a9b8c7d6-e5f4-3210-9876-543210fedcba",
  "subtotal": 2300.00,
  "discount": 100.00,
  "tax": 220.00,
  "total": 2420.00,
  "items": [
    {
      "productId": "e72b1a48-bbd0-434a-b50d-bc13aac258a9",
      "sku": "DRY-AN-400",
      "name": "Anchor Milk Powder 400g",
      "quantity": 2,
      "unitPrice": 1150.00,
      "discount": 50.00,
      "lineTotal": 2250.00
    }
  ],
  "payments": [
    {
      "method": "CASH",
      "amount": 2420.00,
      "tenderedAmount": 3000.00
    }
  ]
}
```
* **Response Body `201 Created`**:
```json
{
  "success": true,
  "message": "Checkout completed successfully",
  "data": {
    "id": "f9a8b7c6-d5e4-3210-9876-543210fedcba",
    "receiptNumber": "INV-COL-2026-00421",
    "branchSlug": "colombo",
    "branchName": "Colombo Store",
    "cashierId": "c1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c",
    "cashierName": "Ruwan Silva",
    "subtotal": 2300.00,
    "discount": 100.00,
    "tax": 220.00,
    "total": 2420.00,
    "status": "COMPLETED",
    "createdAt": "2026-08-06T10:00:00Z",
    "items": [
      {
        "productId": "e72b1a48-bbd0-434a-b50d-bc13aac258a9",
        "sku": "DRY-AN-400",
        "name": "Anchor Milk Powder 400g",
        "quantity": 2,
        "unitPrice": 1150.00,
        "discount": 50.00,
        "lineTotal": 2250.00
      }
    ],
    "payments": [
      {
        "method": "CASH",
        "amount": 2420.00,
        "tenderedAmount": 3000.00,
        "changeGiven": 580.00
      }
    ]
  },
  "timestamp": "2026-08-06T10:00:00Z"
}
```

### 3. Offline Batch Sync (Replay Engine)
* **`POST /api/v1/pos/sync-batch`**
* **Request Body**: Array of `CheckoutRequest` payloads collected while offline:
```json
[
  { "branchSlug": "colombo", "idempotencyKey": "uuid-1", "total": 1150.00, ... },
  { "branchSlug": "colombo", "idempotencyKey": "uuid-2", "total": 440.00, ... }
]
```
* **Response Body `200 OK`**:
```json
{
  "success": true,
  "message": "Batch sales sync completed",
  "data": {
    "syncedCount": 2,
    "sales": [ { ... }, { ... } ]
  },
  "timestamp": "2026-08-06T10:00:00Z"
}
```

### 4. Parked Carts (Held Sales)
* **`GET /api/v1/pos/held-sales?branchSlug=colombo`**
* **Response Body `200 OK`**: Array of parked carts.

* **`POST /api/v1/pos/held-sales`**
* **Request Body**:
```json
{
  "branchSlug": "colombo",
  "customerName": "Kamal Perera",
  "note": "Awaiting wallet in car",
  "items": [ { "productId": "...", "quantity": 1, "unitPrice": 1150.00 } ]
}
```
* **Response Body `201 Created`**: Returns created `HeldSaleDto`.

### 5. Sales Ledger & Receipts
* **`GET /api/v1/sales?branchSlug=colombo&status=COMPLETED`**: Paginated sales history.
* **`POST /api/v1/sales/{id}/void`**:
* **Request Body**: `{ "reason": "Customer changed mind before leaving counter" }`
* **Response Body `200 OK`**: Returns updated `SaleDto` with `status: "VOIDED"`. Stock is auto-restored.

* **`GET /api/v1/sales/{id}/receipt`**
* **Response Body `200 OK`**:
```json
{
  "success": true,
  "message": "Receipt formatted successfully",
  "data": "========================================\n           RetailOS POS           \n          Colombo Store           \nReceipt #: INV-COL-2026-00421     \nDate: 2026-08-06 10:00            \n----------------------------------------\nAnchor Milk Powder 400g           \n  2 x 1,150.00          2,300.00  \n----------------------------------------\nSubtotal:               2,300.00  \nDiscount:                -100.00  \nTax (VAT 10%):            220.00  \nTOTAL:                  2,420.00  \n----------------------------------------\nCash Tendered:          3,000.00  \nChange Given:             580.00  \n========================================\n   Thank you for shopping with us!     \n",
  "timestamp": "2026-08-06T10:00:00Z"
}
```

---

## 5. Inventory Control & Stock Movements (`/api/v1/inventory`)

### 1. Query Branch Stock
* **`GET /api/v1/inventory/stock?branchSlug=colombo&lowStockOnly=true&page=0&size=20`**
* **Request Body**: *None*
* **Response Body `200 OK`**:
```json
{
  "success": true,
  "message": "Branch inventory retrieved successfully",
  "data": {
    "content": [
      {
        "id": "c9b8a7f6-e5d4-3210-9876-543210fedcba",
        "productId": "e72b1a48-bbd0-434a-b50d-bc13aac258a9",
        "productSku": "DRY-AN-400",
        "productName": "Anchor Milk Powder 400g",
        "branchSlug": "colombo",
        "branchName": "Colombo Store",
        "quantityOnHand": 8,
        "reorderLevel": 12,
        "isLowStock": true
      }
    ],
    "totalElements": 1,
    "totalPages": 1
  },
  "timestamp": "2026-08-06T10:00:00Z"
}
```

### 2. Manual Stock Adjustment
* **`POST /api/v1/inventory/adjust`**
* **Request Body**:
```json
{
  "branchSlug": "colombo",
  "productId": "e72b1a48-bbd0-434a-b50d-bc13aac258a9",
  "adjustmentType": "ADD",
  "quantity": 20,
  "reason": "Direct warehouse stock drop"
}
```
* **Allowed `adjustmentType`**: `ADD`, `REMOVE`, `CORRECTION`.
* **Response Body `200 OK`**: Returns updated `InventoryDto`.

### 3. Movement Audit Ledger
* **`GET /api/v1/inventory/movements?branchSlug=colombo&page=0&size=20`**
* **Response Body `200 OK`**: Paginated stock audit logs (`type: "SALE" | "PURCHASE" | "ADJUSTMENT" | "TRANSFER_IN" | "TRANSFER_OUT" | "VOID" | "RETURN"`).

### 4. Inter-Branch Stock Transfers
* **`POST /api/v1/inventory/transfers`**
* **Request Body**:
```json
{
  "sourceBranchSlug": "colombo",
  "targetBranchSlug": "kandy-city",
  "notes": "Emergency stock shift for weekend promo",
  "items": [
    {
      "productId": "e72b1a48-bbd0-434a-b50d-bc13aac258a9",
      "quantity": 15
    }
  ]
}
```
* **Response Body `201 Created`**: Returns created `StockTransferDto` with `status: "IN_TRANSIT"`.

* **`POST /api/v1/inventory/transfers/{id}/complete`**
* **Response Body `200 OK`**: Finalizes transfer, deducts stock from source branch, credits target branch stock, and updates status to `"COMPLETED"`.

---

## 6. Purchasing & Suppliers (`/api/v1/suppliers`, `/api/v1/purchase-orders`)

### 1. Create Supplier
* **`POST /api/v1/suppliers`**
* **Request Body**:
```json
{
  "name": "Fonterra Sri Lanka",
  "contactPerson": "Nimal Fernando",
  "phone": "+94112445566",
  "email": "orders@fonterra.lk",
  "categorySlug": "dairy",
  "paymentTerms": "Net 30",
  "leadTimeDays": 3,
  "status": "ACTIVE"
}
```
* **Response Body `201 Created`**: Returns created `SupplierDto`.

### 2. Create Purchase Order
* **`POST /api/v1/purchase-orders`**
* **Request Body**:
```json
{
  "supplierId": "884e53e2-d5f1-40c5-bd05-3575c7d47c62",
  "branchSlug": "colombo",
  "expectedAt": "2026-08-10T10:00:00Z",
  "notes": "Urgent restock of dairy items",
  "items": [
    {
      "productId": "e72b1a48-bbd0-434a-b50d-bc13aac258a9",
      "quantityOrdered": 50,
      "unitCost": 920.00
    }
  ]
}
```
* **Response Body `201 Created`**: Returns created `PurchaseOrderDto` with `status: "DRAFT"` and `totalAmount: 46000.00`.

### 3. Receive Stock Shipment Against Purchase Order
* **`POST /api/v1/purchase-orders/{id}/receive`**
* **Request Body**:
```json
{
  "receivedItems": [
    {
      "productId": "e72b1a48-bbd0-434a-b50d-bc13aac258a9",
      "quantityReceived": 50
    }
  ],
  "note": "All 50 units delivered in good condition"
}
```
* **Response Body `200 OK`**: Updates PO status to `"RECEIVED"`, auto-credits branch physical inventory in `Inventory`, and appends `StockMovement` (`type = PURCHASE`).

---

## 7. Reports & Financial Analytics (`/api/v1/analytics`)

### 1. Sales Summary
* **`GET /api/v1/analytics/sales-summary?branchSlug=colombo`**
* **Response Body `200 OK`**:
```json
{
  "success": true,
  "message": "Sales summary retrieved successfully",
  "data": {
    "grossRevenue": 1450000.00,
    "totalDiscounts": 45000.00,
    "netRevenue": 1405000.00,
    "totalTransactions": 620,
    "averageBasketValue": 2338.71,
    "totalItemsSold": 1840
  },
  "timestamp": "2026-08-06T10:00:00Z"
}
```

### 2. Time-Series Revenue
* **`GET /api/v1/analytics/revenue-series?branchSlug=colombo&interval=DAILY`**
* **Response Body `200 OK`**:
```json
{
  "success": true,
  "message": "Revenue series retrieved successfully",
  "data": [
    { "periodLabel": "2026-08-01", "revenue": 185000.00, "transactionCount": 82 },
    { "periodLabel": "2026-08-02", "revenue": 210000.00, "transactionCount": 95 }
  ],
  "timestamp": "2026-08-06T10:00:00Z"
}
```

### 3. Profit & Loss Income Statement
* **`GET /api/v1/analytics/pnl?branchSlug=colombo`** *(Admin / Manager Only)*
* **Response Body `200 OK`**:
```json
{
  "success": true,
  "message": "P&L statement generated successfully",
  "data": {
    "grossSales": 1450000.00,
    "discounts": 45000.00,
    "netRevenue": 1405000.00,
    "costOfGoodsSold": 1020000.00,
    "grossProfit": 385000.00,
    "grossMarginPercentage": 27.40,
    "operatingOverhead": 140500.00,
    "netProfit": 244500.00
  },
  "timestamp": "2026-08-06T10:00:00Z"
}
```

### 4. Outlet Profitability & Live Stock Asset Valuation
* **`GET /api/v1/analytics/branch-profitability`** *(Admin / Manager Only)*
* **Response Body `200 OK`**:
```json
{
  "success": true,
  "message": "Branch profitability matrix generated",
  "data": [
    {
      "branchSlug": "colombo",
      "branchName": "Colombo Store",
      "grossRevenue": 1450000.00,
      "netRevenue": 1405000.00,
      "totalOrders": 620,
      "stockAssetValuation": 4850000.00
    },
    {
      "branchSlug": "kandy-city",
      "branchName": "Kandy City Store",
      "grossRevenue": 980000.00,
      "netRevenue": 950000.00,
      "totalOrders": 410,
      "stockAssetValuation": 3200000.00
    }
  ],
  "timestamp": "2026-08-06T10:00:00Z"
}
```

### 5. Executive NLP Query Assistant
* **`POST /api/v1/analytics/ask-data`**
* **Request Body**:
```json
{
  "query": "What is our total stock asset valuation across all branches?",
  "branchSlug": "colombo"
}
```
* **Response Body `200 OK`**:
```json
{
  "success": true,
  "message": "Analytics NLP query processed",
  "data": {
    "query": "What is our total stock asset valuation across all branches?",
    "intent": "STOCK_VALUATION_INQUIRY",
    "textSummary": "Total retail stock asset valuation across branches is LKR 8050000.00.",
    "metricsPayload": {
      "totalStockValuation": 8050000.00
    },
    "executiveRecommendation": "Optimize stock reorder levels for fast-moving categories to improve stock turn ratio."
  },
  "timestamp": "2026-08-06T10:00:00Z"
}
```

---

## 8. Anomaly Security & Fraud Alerts (`/api/v1/alerts`)

### 1. List Anomaly Alerts
* **`GET /api/v1/alerts?severity=HIGH&status=NEW`**
* **Response Body `200 OK`**:
```json
{
  "success": true,
  "message": "Anomaly alerts retrieved successfully",
  "data": {
    "content": [
      {
        "id": "7b8a9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d",
        "type": "ELEVATED_VOIDS",
        "severity": "HIGH",
        "status": "NEW",
        "title": "Elevated Voided Sales Activity",
        "description": "Detected 4 voided transactions in the last 24 hours.",
        "branchSlug": "colombo",
        "branchName": "Colombo Store",
        "detectedAt": "2026-08-06T09:45:00Z",
        "investigationNotes": []
      }
    ],
    "totalElements": 1
  },
  "timestamp": "2026-08-06T10:00:00Z"
}
```

### 2. Trigger Real-Time Fraud Scan
* **`POST /api/v1/alerts/scan`**
* **Response Body `200 OK`**:
```json
{
  "success": true,
  "message": "Heuristic fraud scan completed successfully",
  "data": {
    "scannedAt": "2026-08-06T10:00:00Z",
    "newAlertsGenerated": 1,
    "alerts": [ { ... } ]
  },
  "timestamp": "2026-08-06T10:00:00Z"
}
```

### 3. Add Investigation Note
* **`POST /api/v1/alerts/{id}/notes`**
* **Request Body**:
```json
{
  "note": "CCTV footage verified; cashier entered wrong item SKU by mistake."
}
```
* **Response Body `200 OK`**: Returns updated `AnomalyAlertDto` with `status: "INVESTIGATING"` and the appended note.

---

## 9. Store Branches (`/api/v1/branches`)

### 1. List Store Branches
* **`GET /api/v1/branches`**
* **Response Body `200 OK`**:
```json
{
  "success": true,
  "message": "Store branches retrieved successfully",
  "data": {
    "content": [
      {
        "id": "3a4b5c6d-7e8f-9a0b-1c2d-3e4f5a6b7c8d",
        "slug": "colombo",
        "name": "Colombo Store",
        "shortName": "Colombo Main",
        "address": "123 Galle Road, Colombo 03",
        "phone": "+94112123456",
        "managerId": "c1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c",
        "managerName": "Sunil Perera",
        "managerEmail": "sunil@retailos.lk",
        "opensAt": "08:00",
        "closesAt": "22:00",
        "terminalCount": 3,
        "status": "OPEN"
      }
    ]
  },
  "timestamp": "2026-08-06T10:00:00Z"
}
```

### 2. Create Store Branch
* **`POST /api/v1/branches`**
* **Request Body**:
```json
{
  "name": "Kandy City Store",
  "shortName": "Kandy City",
  "address": "78 Dalada Veediya, Kandy",
  "phone": "+94812234567",
  "managerId": "c1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c",
  "opensAt": "08:00",
  "closesAt": "21:00",
  "terminalCount": 2,
  "status": "OPEN"
}
```
* **Response Body `201 Created`**: Returns created `BranchDto` with auto-generated slug `"kandy-city"`.

---

## 10. Store Settings & User Administration (`/api/v1/settings`, `/api/v1/users`)

### 1. Get Store Configuration Settings
* **`GET /api/v1/settings`**
* **Response Body `200 OK`**:
```json
{
  "success": true,
  "message": "Store settings retrieved successfully",
  "data": {
    "id": "1e2f3a4b-5c6d-7e8f-9a0b-1c2d3e4f5a6b",
    "storeName": "RetailOS POS",
    "legalName": "Sathosa Group (Pvt) Ltd",
    "currency": "LKR",
    "taxRate": 10.00,
    "taxLabel": "VAT",
    "receiptFooter": "Thank you for shopping with us!",
    "timezone": "Asia/Colombo",
    "lowStockThreshold": 12,
    "maxDiscountPercent": 10.00,
    "requireManagerApproval": true,
    "allowNegativeStock": false,
    "autoPrintReceipt": true,
    "roundCashTo": 1.00,
    "emailAlerts": true,
    "alertSensitivity": "BALANCED",
    "sessionTimeoutMinutes": 30,
    "twoFactor": false
  },
  "timestamp": "2026-08-06T10:00:00Z"
}
```

### 2. Update Store Settings
* **`PUT /api/v1/settings`**
* **Request Body**: Any fields to update (e.g. `{ "taxRate": 12.00, "storeName": "RetailOS Supermarket" }`).
* **Response Body `200 OK`**: Returns updated `StoreSettingDto`.

### 3. Create Team User
* **`POST /api/v1/users`**
* **Request Body**:
```json
{
  "name": "Kamal Wickramasinghe",
  "email": "kamal@retailos.lk",
  "password": "SecurePassword123!",
  "role": "CASHIER",
  "status": "ACTIVE",
  "branchSlug": "colombo",
  "avatarUrl": "https://cdn.retailos.lk/avatars/kamal.jpg"
}
```
* **Response Body `201 Created`**: Returns created `UserDto`.

### 4. Role-Permission Access Matrix
* **`GET /api/v1/roles/permissions`**
* **Response Body `200 OK`**:
```json
{
  "success": true,
  "message": "Role-permission matrix retrieved successfully",
  "data": {
    "rolePermissions": {
      "ADMIN": [
        "POS_CHECKOUT", "CATALOGUE_MANAGE", "INVENTORY_MANAGE", "PURCHASING_MANAGE",
        "ANALYTICS_VIEW", "ALERTS_MANAGE", "BRANCHES_MANAGE", "SETTINGS_MANAGE", "USERS_MANAGE"
      ],
      "MANAGER": [
        "POS_CHECKOUT", "CATALOGUE_MANAGE", "INVENTORY_MANAGE", "PURCHASING_MANAGE",
        "ANALYTICS_VIEW", "ALERTS_MANAGE", "BRANCHES_VIEW"
      ],
      "CASHIER": [
        "POS_CHECKOUT", "CATALOGUE_VIEW", "INVENTORY_VIEW"
      ]
    }
  },
  "timestamp": "2026-08-06T10:00:00Z"
}
```

---

## 11. Complete TypeScript Interface Definitions

```typescript
// Common Envelopes
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
  errorCode?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// User & Roles
export type Role = 'ADMIN' | 'MANAGER' | 'CASHIER';
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'INVITED';

export interface UserDto {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  branchSlug: string | null;
  branchName: string | null;
  avatarUrl?: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: UserDto;
}

// Products & Catalogue
export interface ProductDto {
  id: string;
  sku: string;
  barcode: string | null;
  name: string;
  categorySlug: string | null;
  categoryName: string | null;
  unitPrice: number;
  costPrice: number;
  taxRate: number;
  unitOfMeasure: string;
  active: boolean;
  imageUrl: string | null;
}

// POS & Sales
export type PaymentMethod = 'CASH' | 'CARD' | 'SPLIT';
export type SaleStatus = 'COMPLETED' | 'VOIDED' | 'REFUNDED';

export interface CheckoutItemRequest {
  productId: string;
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  lineTotal: number;
}

export interface PaymentLegRequest {
  method: PaymentMethod;
  amount: number;
  tenderedAmount?: number;
}

export interface CheckoutRequest {
  branchSlug: string;
  registerId: string;
  idempotencyKey: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  items: CheckoutItemRequest[];
  payments: PaymentLegRequest[];
}

export interface SaleDto {
  id: string;
  receiptNumber: string;
  branchSlug: string;
  branchName: string;
  cashierId: string;
  cashierName: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: SaleStatus;
  createdAt: string;
  items: CheckoutItemRequest[];
  payments: PaymentLegRequest[];
}
```

---

## 12. Recommended Axios API Client Setup (`apiClient.ts`)

```typescript
import axios, { AxiosInstance } from 'axios';

const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request Interceptor: Inject Authorization JWT Token
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
}, (error) => Promise.reject(error));

// Response Interceptor: Handle 401 Unauthenticated & Auto-Refresh
apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error);
  }
);

export default apiClient;
```
