import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import Login from './Login';
import MainTabs from './MainTabs';
import CouponPage from './CouponPage';
import AdminLogin from './admin/AdminLogin'; // 추가
import AdminDashboard from './admin/AdminDashboard'; // 추가
import './App.css';

// 관리자 대시보드 접근 제어를 위한 보호된 라우트 컴포넌트
function AdminProtectedRoute({ children }) {
  const isAdminAuthenticated = !!sessionStorage.getItem('adminAuth');
  return isAdminAuthenticated ? children : <Navigate to="/admin/login" />;
}

function AppContent() {
  // 컴포넌트 초기화 시점에 sessionStorage를 즉시 확인하여 상태를 설정합니다.
  // 이렇게 해야 새로고침 시 첫 렌더링에서 로그아웃(리디렉션) 되는 것을 막을 수 있습니다.
  const [studentId, setStudentId] = useState(() => sessionStorage.getItem('studentId'));
  const navigate = useNavigate();

  const handleLogin = (id) => {
    setStudentId(id);
    sessionStorage.setItem('studentId', id); // sessionStorage에 저장
    navigate('/main');
  };

  const handleLogout = () => {
    setStudentId(null);
    sessionStorage.removeItem('studentId'); // sessionStorage에서 제거
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
        <Route 
          path="/coupon"
          element={studentId ? <CouponPage studentId={studentId} /> : <Navigate to="/login" />}
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

// ... (기존 코드)


function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
