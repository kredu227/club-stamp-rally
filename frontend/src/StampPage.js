import React, { useState, useEffect } from 'react';
import './StampPage.css'; // We will create this CSS file later

function StampPage({ studentId, onLogout }) {
  const [stampStatus, setStampStatus] = useState(null);
  const [clubs, setClubs] = useState([]);
  const [qrInput, setQrInput] = useState('');
  const [message, setMessage] = useState('');

  const fetchStampStatus = async () => {
    try {
      const response = await fetch(`/api/status/${studentId}`);
      const data = await response.json();
      setStampStatus(data);
    } catch (error) {
      console.error('Error fetching stamp status:', error);
      setMessage('스탬프 현황을 불러오는 데 실패했습니다.');
    }
  };

  const fetchClubs = async () => {
    try {
      const response = await fetch('/api/clubs');
      const data = await response.json();
      setClubs(data);
    } catch (error) {
      console.error('Error fetching clubs:', error);
      setMessage('동아리 목록을 불러오는 데 실패했습니다.');
    }
  };

  useEffect(() => {
    const fetchStampStatus = async () => {
      try {
        const response = await fetch(`/api/status/${studentId}`);
        const data = await response.json();
        setStampStatus(data);
      } catch (error) {
        console.error('Error fetching stamp status:', error);
        setMessage('스탬프 현황을 불러오는 데 실패했습니다.');
      }
    };

    fetchStampStatus();
    fetchClubs();
    const interval = setInterval(fetchStampStatus, 5000); // Refresh status every 5 seconds
    return () => clearInterval(interval);
  }, [studentId]);

  const handleQrScan = async () => {
    if (!qrInput) {
      setMessage('동아리 ID를 입력해주세요.');
      return;
    }

    try {
      const response = await fetch('/api/stamp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentId, clubId: qrInput }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage('스탬프 획득!');
        setQrInput('');
        // Manually update status to avoid waiting for the interval
        const res = await fetch(`/api/status/${studentId}`);
        const updatedData = await res.json();
        setStampStatus(updatedData);
      } else {
        setMessage(data.message || '스탬프 획득 실패.');
      }
    } catch (error) {
      setMessage('네트워크 오류. 다시 시도해주세요.');
      console.error('Stamp recording error:', error);
    }
  };

  if (!stampStatus) {
    return <div className="loading-container">로딩 중...</div>;
  }

  const 본관_stamped_count = stampStatus.본관_stamps;
  const 후관_stamped_count = stampStatus.후관_stamps;

  return (
    <div className="stamp-page-container">
      <header className="stamp-page-header">
        <h2>{studentId} 학생의 스탬프 현황</h2>
        <button onClick={onLogout} className="logout-button">로그아웃</button>
      </header>

      <div className="mission-status">
        <h3>미션 진행 상황</h3>
        <p>총 스탬프: {stampStatus.totalStamps}개</p>
        <div className="location-status">
          <p>[본관] {본관_stamped_count} / 5개 (필수)</p>
          <div className="progress-bar-container">
            <div className="progress-bar 본관" style={{ width: `${(본관_stamped_count / 5) * 100}%` }}></div>
          </div>
          {stampStatus.본관_mission_clear && <span className="mission-clear-text">✅ 본관 미션 완료!</span>}
        </div>
        <div className="location-status">
          <p>[후관] {후관_stamped_count} / 3개 (필수)</p>
          <div className="progress-bar-container">
            <div className="progress-bar 후관" style={{ width: `${(후관_stamped_count / 3) * 100}%` }}></div>
          </div>
          {stampStatus.후관_mission_clear && <span className="mission-clear-text">✅ 후관 미션 완료!</span>}
        </div>
        {stampStatus.overall_mission_clear && (
          <div className="overall-mission-clear">
            <p>미션 Clear! 중앙 현관으로 가서 보상을 받으세요.</p>
          </div>
        )}
      </div>

      <div className="club-list">
        <h3>동아리 목록</h3>
        <div className="club-grid">
          {clubs.map(club => (
            <div key={club.id} className={`club-item ${stampStatus.stampedClubs.includes(club.id) ? 'stamped' : ''}`}>
              {club.name} ({club.location})
              {stampStatus.stampedClubs.includes(club.id) && <span className="stamp-icon">✅</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="qr-scan-section">
        <h3>QR 스캔 (시뮬레이션)</h3>
        <input
          type="text"
          placeholder="동아리 ID 입력 (예: club1)"
          value={qrInput}
          onChange={(e) => setQrInput(e.target.value)}
        />
        <button onClick={handleQrScan}>스탬프 받기</button>
        {message && <p className="info-message">{message}</p>}
      </div>
    </div>
  );
}

export default StampPage;
