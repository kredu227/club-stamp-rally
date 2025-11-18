import React, { useState, useEffect, useCallback } from 'react';
import './StampPage.css';
import QrScanner from './QrScanner';

function StampPage({ studentId }) {
  const [stampStatus, setStampStatus] = useState(null);
  const [clubs, setClubs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isManualInputOpen, setIsManualInputOpen] = useState(false);
  const [manualQrCode, setManualQrCode] = useState('');

  const fetchData = useCallback(async () => {
    // 데이터 로딩 시 항상 로딩 상태로 설정
    setIsLoading(true);
    try {
      const [statusResponse, clubsResponse] = await Promise.all([
        fetch(`/api/status/${studentId}`),
        fetch('/api/clubs'),
      ]);
      if (!statusResponse.ok || !clubsResponse.ok) {
        throw new Error('API 응답이 올바르지 않습니다.');
      }
      const statusData = await statusResponse.json();
      const clubsData = await clubsResponse.json();
      setStampStatus(statusData);
      setClubs(clubsData);
    } catch (err) {
      console.error('데이터 로딩 중 오류:', err);
      setError('데이터 로딩 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleScanSuccess = async (decodedText) => {
    setIsScannerOpen(false); // 스캐너 즉시 닫기
    alert("스캔 완료!"); // 사용자에게 즉각적인 피드백 제공

    try {
      const response = await fetch('/api/stamp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, qrCode: decodedText }),
      });
      
      // 서버 응답을 기다린 후 스탬프 상태 새로고침
      await response.json();
      fetchData(); 
      
    } catch (error) {
      // 네트워크 오류 등 실패 시 사용자에게 알림
      alert('스탬프 처리 중 오류가 발생했습니다.');
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualQrCode.trim()) {
      alert('QR 코드를 입력해주세요.');
      return;
    }
    setIsManualInputOpen(false);
    try {
      const response = await fetch('/api/stamp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, qrCode: manualQrCode.trim() }),
      });
      const data = await response.json();
      alert(data.message || '스탬프가 처리되었습니다.');
      fetchData();
    } catch (error) {
      alert('스탬프 처리 중 오류가 발생했습니다.');
    }
    setManualQrCode(''); // 입력 필드 초기화
  };

  const handleScanFailure = (error) => {
    // 스캔 실패는 사용자에게 계속 시도할 기회를 주기 위해 조용히 처리
    console.log("QR Scan Failed:", error);
  };

  if (isLoading) {
    return <div className="loading-container">로딩 중...</div>;
  }
  if (error) {
    return <div className="error-container">{error}</div>;
  }
  if (!stampStatus) {
    return <div className="loading-container">스탬프 정보를 표시할 수 없습니다.</div>;
  }

  const {
    totalStamps = 0,
    본관_stamps = 0,
    후관_stamps = 0,
    본관_mission_clear = false,
    후관_mission_clear = false,
    overall_mission_clear = false,
    stampedClubs = []
  } = stampStatus;

  const 본관_clubs = clubs.filter(club => club.location === '본관');
  const 후관_clubs_raw = clubs.filter(club => club.location === '후관');

  const 후관_grid_items = [];
  if (후관_clubs_raw.length > 0) {
    for (let i = 0; i < 9; i++) {
      후관_grid_items.push(후관_clubs_raw[i] || { id: `placeholder-${i}`, empty: true });
    }
    후관_grid_items.push({ id: 'empty-left', empty: true });
    후관_grid_items.push(후관_clubs_raw[9] || { id: 'placeholder-9', empty: true });
    후관_grid_items.push({ id: 'empty-right', empty: true });
  }

  return (
    <div className="stamp-page-container-v2">
      {isScannerOpen && (
        <div className="qr-scanner-modal">
          <div className="qr-scanner-modal-content">
            <QrScanner
              onScanSuccess={handleScanSuccess}
              onScanFailure={handleScanFailure}
            />
            <button onClick={() => setIsScannerOpen(false)} className="qr-scanner-close-button">
              닫기
            </button>
          </div>
        </div>
      )}

      {isManualInputOpen && (
        <div className="qr-scanner-modal">
          <div className="manual-input-modal-content">
            <h3>QR 코드 직접 입력</h3>
            <form onSubmit={handleManualSubmit}>
              <input
                type="text"
                value={manualQrCode}
                onChange={(e) => setManualQrCode(e.target.value)}
                placeholder="QR 코드를 입력하세요"
                className="manual-input-field"
              />
              <div className="manual-input-buttons">
                <button type="submit" className="manual-submit-button">제출</button>
                <button type="button" onClick={() => setIsManualInputOpen(false)} className="manual-close-button">취소</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="mission-status-v2">
        <h3>미션 진행 상황</h3>
        <p>총 스탬프: {totalStamps}개</p>
        <div className="location-status">
          <p>[본관] {본관_stamps} / 5개 (필수)</p>
          <div className="progress-bar-container">
            <div className="progress-bar 본관" style={{ width: `${Math.min((본관_stamps / 5) * 100, 100)}%` }}></div>
          </div>
        </div>
        <div className="location-status">
          <p>[후관] {후관_stamps} / 3개 (필수)</p>
          <div className="progress-bar-container">
            <div className="progress-bar 후관" style={{ width: `${Math.min((후관_stamps / 3) * 100, 100)}%` }}></div>
          </div>
        </div>
        {overall_mission_clear && (
          <div className="overall-mission-clear">
            <p>미션 Clear! 중앙 현관으로 가서 보상을 받으세요.</p>
          </div>
        )}
        <button onClick={() => setIsScannerOpen(true)} className="qr-scan-button">
          QR 스캔하기
        </button>
        <button onClick={() => setIsManualInputOpen(true)} className="manual-entry-button">
          QR 스캔에 오류가 있나요?
        </button>
      </div>

      <div className="club-list-section-v2">
        <div className="club-group-v2">
          <h3>🏢 본관</h3>
          <div className="club-grid-v2 main-building">
            {본관_clubs.map(club => (
              <div key={club.id} className={`club-item-v2 ${stampedClubs.includes(club.id) ? 'stamped-v2' : ''}`}>
                {club.name}
              </div>
            ))}
          </div>
        </div>
        <div className="club-group-v2">
          <h3>🏫 후관</h3>
          <div className="club-grid-v2 annex-building">
            {후관_grid_items.map(item => (
              item.empty ?
              <div key={item.id} className="club-item-v2 empty-v2"></div> :
              <div key={item.id} className={`club-item-v2 ${stampedClubs.includes(item.id) ? 'stamped-v2' : ''}`}>
                {item.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StampPage;
