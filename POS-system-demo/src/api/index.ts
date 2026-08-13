// Core Axios Client
export { default as apiClient, apiClient as client } from './client';

// API DTO Types & Envelopes
export * from './types';

// Domain Service Modules
export { default as authApi, authApi as auth } from './authApi';
export { default as productsApi, productsApi as products } from './productsApi';
export { default as posApi, posApi as pos } from './posApi';
export { default as salesApi, salesApi as sales } from './salesApi';
export { default as inventoryApi, inventoryApi as inventory } from './inventoryApi';
export { default as suppliersApi, suppliersApi as suppliers } from './suppliersApi';
export { default as purchaseOrdersApi, purchaseOrdersApi as purchaseOrders } from './purchaseOrdersApi';
export { default as analyticsApi, analyticsApi as analytics } from './analyticsApi';
export { default as alertsApi, alertsApi as alerts } from './alertsApi';
export { default as branchesApi, branchesApi as branches } from './branchesApi';
export { default as settingsApi, settingsApi as settings } from './settingsApi';
export { default as usersApi, usersApi as users } from './usersApi';
