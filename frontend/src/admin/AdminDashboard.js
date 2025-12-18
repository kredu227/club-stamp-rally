import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentStatus from './StudentStatus';
import ClubStatus from './ClubStatus';
import './AdminDashboard.css';

function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('students'); // 'students' or 'clubs'
  const adminRole = sessionStorage.getItem('adminRole');
  const isViewer = adminRole === 'viewer';

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuth');
    sessionStorage.removeItem('adminRole');
    navigate('/admin/login');
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>관리자 대시보드 {isViewer && '(뷰어)'}</h1>
        <button onClick={handleLogout} className="logout-button">로그아웃</button>
      </header>

      <div className="admin-tabs">
        <button
          className={`tab-button ${activeTab === 'students' ? 'active' : ''}`}
          onClick={() => setActiveTab('students')}
        >
          학생별 현황
        </button>
        {!isViewer && (
          <button
            className={`tab-button ${activeTab === 'clubs' ? 'active' : ''}`}
            onClick={() => setActiveTab('clubs')}
          >
            동아리별 현황
          </button>
        )}
      </div>

      <main className="admin-content">
        {activeTab === 'students' ? <StudentStatus /> : (!isViewer && <ClubStatus />)}
      </main>
    </div>
  );
}

export default AdminDashboard;

