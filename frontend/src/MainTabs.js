import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StampPage from './StampPage';
import BoothLayout from './BoothLayout';
import ClubActivities from './ClubActivities';
import QrScanner from './QrScanner'; // QrScanner 컴포넌트 임포트
import './MainTabs.css'; // 탭 바 스타일을 위한 CSS 파일

function MainTabs({ studentId, onLogout }) {
  const [activeTab, setActiveTab] = useState('stamp');
  const navigate = useNavigate();

  // QR 스캔 성공 시 호출될 함수
  const handleScanSuccess = async (decodedText, decodedResult) => {
    console.log(`QR Code Scanned: ${decodedText}`);
    try {
      const response = await fetch('/api/stamp', { // 백엔드 API 엔드포인트
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentId, qrCode: decodedText }),
      });
      const data = await response.json();
      if (response.ok) {
        // 미션 완료 여부에 따라 다른 메시지 표시
        if (data.overall_mission_clear) {
          alert("미션 완료! 계속 도전해서 가장 많은 도장을 획득해 보세요!");
        } else {
          alert(data.message);
        }
        setActiveTab('stamp'); // 스탬프 페이지로 돌아가기
      } else {
        alert(`스탬프 업데이트 실패: ${data.message}`);
      }
    } catch (error) {
      console.error('스탬프 업데이트 중 오류 발생:', error);
      alert('스탬프 업데이트 중 네트워크 오류가 발생했습니다.');
    }
  };

  // QR 스캔 실패 시 호출될 함수
  const handleScanFailure = (error) => {
    console.error(`QR Scan Error: ${error}`);
    // 사용자에게 오류 메시지를 표시할 수 있습니다.
    // alert('QR 코드 스캔에 실패했습니다. 다시 시도해주세요.');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'layout':
        return <BoothLayout />;
      case 'stamp':
        return <StampPage studentId={studentId} />;
      case 'activities':
        return <ClubActivities />;
      case 'qrscan': // QR 스캔 탭 추가
        return <QrScanner onScanSuccess={handleScanSuccess} onScanFailure={handleScanFailure} />;
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
        <span>{studentId}님, 환영합니다!</span>
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
        <button // QR 스캔 탭 버튼 추가
          className={activeTab === 'qrscan' ? 'active' : ''}
          onClick={() => handleTabClick('qrscan')}
        >
          QR 스캔
        </button>
      </div>
    </div>
  );
}

export default MainTabs;
