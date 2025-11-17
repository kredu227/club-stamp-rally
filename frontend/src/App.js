import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import Login from './Login';
import MainTabs from './MainTabs'; // MainTabs 컴포넌트 임포트
import './App.css';

function AppContent() {
  const [studentId, setStudentId] = useState(null);
  const navigate = useNavigate();

  // Check for stored studentId on initial load (e.g., from localStorage)
  useEffect(() => {
    const storedStudentId = localStorage.getItem('studentId');
    if (storedStudentId) {
      setStudentId(storedStudentId);
      navigate('/main'); // 로그인 정보가 있으면 바로 메인 페이지로 이동
    } else {
      navigate('/login'); // 로그인 정보가 없으면 로그인 페이지로 이동
    }
  }, []); // 빈 배열로 한 번만 실행되도록 설정

  const handleLogin = (id) => {
    setStudentId(id);
    localStorage.setItem('studentId', id); // Store studentId for persistence
    navigate('/main'); // 로그인 성공 시 MainTabs 페이지로 이동
  };

  const handleLogout = () => {
    setStudentId(null);
    localStorage.removeItem('studentId'); // Clear stored studentId
    navigate('/login'); // 로그아웃 시 로그인 페이지로 이동
  };

  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route
          path="/main/*" // MainTabs 내부 라우팅을 위해 와일드카드 추가
          element={studentId ? <MainTabs studentId={studentId} onLogout={handleLogout} /> : <Navigate to="/login" />}
        />
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
