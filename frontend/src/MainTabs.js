import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StampPage from './StampPage';
import BoothLayout from './BoothLayout';
import ClubActivities from './ClubActivities';
import './MainTabs.css'; // 탭 바 스타일을 위한 CSS 파일

function MainTabs({ studentId, onLogout }) {
  const [activeTab, setActiveTab] = useState('stamp');
  const navigate = useNavigate();

  const renderContent = () => {
    switch (activeTab) {
      case 'layout':
        return <BoothLayout />;
      case 'stamp':
        return <StampPage studentId={studentId} />;
      case 'activities':
        return <ClubActivities />;
      default:
        return <StampPage studentId={studentId} />;
    }
  };

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
  };

  return (
    <div className="main-tabs-container">
      <div className="main-header">
        <span>{studentId}님, 미션을 달성하고 학술제를 즐겨 보세요!</span>
        <button onClick={onLogout} className="logout-button">로그아웃</button>
      </div>
      <div className="tab-content">
        {renderContent()}
      </div>
      <div className="bottom-tab-bar">
        <button
          className={activeTab === 'layout' ? 'active' : ''}
          onClick={() => handleTabClick('layout')}
        >
          부스 배치도
        </button>
        <button
          className={activeTab === 'stamp' ? 'active' : ''}
          onClick={() => handleTabClick('stamp')}
        >
          스탬프 판
        </button>
        <button
          className={activeTab === 'activities' ? 'active' : ''}
          onClick={() => handleTabClick('activities')}
        >
          활동 내용
        </button>
      </div>
    </div>
  );
}

export default MainTabs;
