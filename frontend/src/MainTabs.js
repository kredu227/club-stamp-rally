import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StampPage from './StampPage';
import BoothLayout from './BoothLayout';
import ClubActivities from './ClubActivities';
import './MainTabs.css'; // 탭 바 스타일을 위한 CSS 파일

function MainTabs({ studentId }) {
  const [activeTab, setActiveTab] = useState('stamp'); // 기본 활성 탭은 스탬프 판
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
    // 필요하다면 URL 변경도 가능 (예: navigate(`/${tabName}`))
  };

  return (
    <div className="main-tabs-container">
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
