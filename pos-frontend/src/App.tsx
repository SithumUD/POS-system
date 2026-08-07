import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { StoreProvider } from './contexts/StoreContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Login } from './pages/Login';
import AcceptInvite from './pages/AcceptInvite';
import { PosTerminal } from './pages/PosTerminal';
import { Dashboard } from './pages/Dashboard';
import { Products } from './pages/Products';
import { Inventory } from './pages/Inventory';
import { PurchaseOrders } from './pages/PurchaseOrders';
import { PurchaseOrderDetail } from './pages/PurchaseOrderDetail';
import { Suppliers } from './pages/Suppliers';
import { SalesHistory } from './pages/SalesHistory';
import { Reports } from './pages/Reports';
import { FinanceAnalytics } from './pages/FinanceAnalytics';
import { AnomalyAlerts } from './pages/AnomalyAlerts';
import { Branches } from './pages/Branches';
import { Settings } from './pages/Settings';
import { CustomerDisplay } from './pages/CustomerDisplay';

function RootRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Login />;
}

export function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <BrowserRouter>
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                fontSize: '13px',
              },
            }}
          />
          <Routes>
            <Route path="/" element={<RootRoute />} />
            <Route path="/login" element={<RootRoute />} />
            <Route path="/accept-invite" element={<AcceptInvite />} />
            <Route
              path="/pos"
              element={
                <ProtectedRoute>
                  <PosTerminal />
                </ProtectedRoute>
              }
            />
            <Route path="/customer-display" element={<CustomerDisplay />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/products"
              element={
                <ProtectedRoute>
                  <Products />
                </ProtectedRoute>
              }
            />
            <Route
              path="/inventory"
              element={
                <ProtectedRoute>
                  <Inventory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/purchase-orders"
              element={
                <ProtectedRoute>
                  <PurchaseOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/purchase-orders/:id"
              element={
                <ProtectedRoute>
                  <PurchaseOrderDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/suppliers"
              element={
                <ProtectedRoute>
                  <Suppliers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sales-history"
              element={
                <ProtectedRoute>
                  <SalesHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/finance"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
                  <FinanceAnalytics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/alerts"
              element={
                <ProtectedRoute>
                  <AnomalyAlerts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/branches"
              element={
                <ProtectedRoute>
                  <Branches />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </StoreProvider>
    </AuthProvider>
  );
}

export default App;