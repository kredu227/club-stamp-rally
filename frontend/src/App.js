import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import Login from './Login';
import MainTabs from './MainTabs';
import CouponPage from './CouponPage';
import AdminLogin from './admin/AdminLogin'; // 추가
import AdminDashboard from './admin/AdminDashboard'; // 추가
import './App.css';

// ... (기존 코드)

function AppContent() {
  // ... (기존 코드)

  return (
    <div className="App">
      <Routes>
        {/* 학생용 라우트 */}
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route
          path="/main/*"
          element={studentId ? <MainTabs studentId={studentId} onLogout={handleLogout} /> : <Navigate to="/login" />}
        />
        <Route 
          path="/coupon"
          element={studentId ? <CouponPage studentId={studentId} /> : <Navigate to="/login" />}
        />

        {/* 관리자용 라우트 */}
        <Route path="/admin/login" element={<AdminLogin />} />
        // ... (기존 코드)
      </Routes>
    </div>
  );
}

// ... (기존 코드)


function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
