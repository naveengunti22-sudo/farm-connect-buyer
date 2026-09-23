import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import ErrorBoundary from './components/ErrorBoundary';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FarmerDashboard from './pages/FarmerDashboard';
import BuyerDashboard from './pages/BuyerDashboard';
import ProduceListingsPage from './pages/ProduceListingsPage';
import DemandRequirementsPage from './pages/DemandRequirementsPage';
import SmartMatchesPage from './pages/SmartMatchesPage';
import OffersNegotiationPage from './pages/OffersNegotiationPage';
import OrdersPage from './pages/OrdersPage';
import MarketPricesPage from './pages/MarketPricesPage';
import AIAssistantPage from './pages/AIAssistantPage';
import FarmerCarePage from './pages/FarmerCarePage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/AdminDashboard';
import NotFoundPage from './pages/NotFoundPage';

// Smart Dashboard Router based on authenticated role
function DashboardRedirect() {
  const { user, isFarmer, isBuyer, isAdmin, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (isAdmin) return <AdminDashboard />;
  if (isBuyer) return <BuyerDashboard />;
  return <FarmerDashboard />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Navbar />
              <main style={{ flex: 1 }}>
                <Routes>
                  {/* Public Marketplace Discovery Routes */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/produce" element={<ProduceListingsPage />} />
                  <Route path="/demand" element={<DemandRequirementsPage />} />
                  <Route path="/matches" element={<SmartMatchesPage />} />
                  <Route path="/market-prices" element={<MarketPricesPage />} />
                  <Route path="/assistant" element={<AIAssistantPage />} />
                  <Route path="/help" element={<FarmerCarePage />} />

                  {/* Authenticated Routes */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <DashboardRedirect />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/offers"
                    element={
                      <ProtectedRoute>
                        <OffersNegotiationPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/orders"
                    element={
                      <ProtectedRoute>
                        <OrdersPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* 404 Catch All */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}
