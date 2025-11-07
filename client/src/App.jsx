import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { authService } from './services/authService';

// Import pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import AssignmentPage from './pages/AssignmentPage';
import AssignmentDetailsPage from './pages/AssignmentDetailsPage';
import PracticePage from './pages/PracticePage';
import PracticeDetailsPage from './pages/PracticeDetailsPage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      try {
        const sessionRestored = await authService.initializeSession();
        setIsAuthenticated(sessionRestored);
        console.log('🔐 Auth initialized:', sessionRestored);
      } catch (error) {
        console.error('❌ Auth error:', error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    }

    initAuth();
  }, []);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '5px solid #f3f3f3',
          borderTop: '5px solid #0063a3',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <h2 style={{ color: '#0063a3' }}>Loading LingoBee... 🐝</h2>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); }}`}</style>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Auth Routes */}
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/homepage" replace /> : <LoginPage />} 
        />
        <Route 
          path="/register" 
          element={isAuthenticated ? <Navigate to="/homepage" replace /> : <RegisterPage />} 
        />
        
        {/* Protected Routes */}
        <Route 
          path="/homepage" 
          element={isAuthenticated ? <HomePage /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/practice" 
          element={isAuthenticated ? <PracticePage /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/practice/:sectionId/:nodeId" 
          element={isAuthenticated ? <PracticeDetailsPage /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/assignment" 
          element={isAuthenticated ? <AssignmentPage /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/assignment/:id" 
          element={isAuthenticated ? <AssignmentDetailsPage /> : <Navigate to="/login" replace />} 
        />
        
        {/* 404 Catch All */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;