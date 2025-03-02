import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import Dashboard from './components/dashboard/Dashboard';
import VisitForm from './components/visits/VisitForm';
import VisitHistory from './components/visits/VisitHistory';
import Analytics from './components/analytics/Analytics';
import Navbar from './components/layout/Navbar';
import { AuthProvider, useAuth } from './context/AuthContext';
import { VisitProvider } from './context/VisitContext';

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

function AppContent() {
  const { currentUser } = useAuth();
  
  return (
    <Router>
      {currentUser && <Navbar />}
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/login" element={!currentUser ? <Login /> : <Navigate to="/" />} />
          <Route path="/signup" element={!currentUser ? <Signup /> : <Navigate to="/" />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/add-visit" element={
            <ProtectedRoute>
              <VisitForm />
            </ProtectedRoute>
          } />
          <Route path="/edit-visit/:id" element={
            <ProtectedRoute>
              <VisitForm />
            </ProtectedRoute>
          } />
          <Route path="/history" element={
            <ProtectedRoute>
              <VisitHistory />
            </ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <VisitProvider>
        <AppContent />
      </VisitProvider>
    </AuthProvider>
  );
}

export default App;