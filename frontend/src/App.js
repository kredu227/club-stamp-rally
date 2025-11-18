import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import Login from './Login';
import MainTabs from './MainTabs';
import AdminLogin from './admin/AdminLogin'; // 추가
import AdminDashboard from './admin/AdminDashboard'; // 추가
import './App.css';

// 관리자 대시보드 접근 제어를 위한 보호된 라우트 컴포넌트
function AdminProtectedRoute({ children }) {
  const isAdminAuthenticated = !!sessionStorage.getItem('adminAuth');
  return isAdminAuthenticated ? children : <Navigate to="/admin/login" />;
}

function AppContent() {
  const [studentId, setStudentId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedStudentId = localStorage.getItem('studentId');
    if (storedStudentId) {
      setStudentId(storedStudentId);
    }
  }, []);

  const handleLogin = (id) => {
    setStudentId(id);
    localStorage.setItem('studentId', id);
    navigate('/main');
  };

  const handleLogout = () => {
    setStudentId(null);
    localStorage.removeItem('studentId');
    navigate('/login');
  };

  return (
    <div className="App">
      <Routes>
        {/* 학생용 라우트 */}
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route
          path="/main/*"
          element={studentId ? <MainTabs studentId={studentId} onLogout={handleLogout} /> : <Navigate to="/login" />}
        />

        {/* 관리자용 라우트 */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard"
          element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          }
        />

        {/* 기본 경로 리디렉션 */}
        <Route path="*" element={<Navigate to={studentId ? "/main" : "/login"} />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
