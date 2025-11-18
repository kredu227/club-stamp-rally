import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentStatus from './StudentStatus';
import ClubStatus from './ClubStatus';
import './AdminDashboard.css';

function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('students'); // 'students' or 'clubs'

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuth');
    navigate('/admin/login');
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>관리자 대시보드</h1>
        <button onClick={handleLogout} className="logout-button">로그아웃</button>
      </header>

      <div className="admin-tabs">
        <button
          className={`tab-button ${activeTab === 'students' ? 'active' : ''}`}
          onClick={() => setActiveTab('students')}
        >
          학생별 현황
        </button>
        <button
          className={`tab-button ${activeTab === 'clubs' ? 'active' : ''}`}
          onClick={() => setActiveTab('clubs')}
        >
          동아리별 현황
        </button>
      </div>

      <main className="admin-content">
        {activeTab === 'students' ? <StudentStatus /> : <ClubStatus />}
      </main>
    </div>
  );
}

export default AdminDashboard;

