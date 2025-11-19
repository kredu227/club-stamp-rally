import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './StampPage.css';
import QrScanner from './QrScanner';

function StampPage({ studentId }) {
  const navigate = useNavigate();
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
    setIsScannerOpen(false);

    try {
      const response = await fetch('/api/stamp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, qrCode: decodedText }),
      });
      
      const data = await response.json();

      if (data.success) {
        // 서버 응답 메시지를 먼저 보여줍니다.
        alert(data.message || '스탬프를 획득했습니다!');
        
        // 만약 방금 미션을 클리어했다면, 클리어 축하 메시지를 추가로 보여줍니다.
        if (data.justClearedMission) {
          alert("Mission Clear! 소떡소떡 교환권을 획득했습니다.");
        }
        
        // 데이터를 다시 불러와 화면을 업데이트합니다.
        fetchData();
      } else {
        // 서버에서 실패 메시지를 보냈을 경우
        alert(data.message || '스탬프 처리에 실패했습니다.');
      }
      
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
      
      if (data.success) {
        alert(data.message || '스탬프가 처리되었습니다.');
        if (data.justClearedMission) {
          alert("Mission Clear! 소떡소떡 교환권을 획득했습니다.");
        }
        fetchData();
      } else {
        alert(data.message || '스탬프 처리에 실패했습니다.');
      }

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
    overall_mission_clear = false,
    couponUsed = false, // 쿠폰 사용 여부
    stampedClubs = []
  } = stampStatus;

  const 본관_clubs = clubs.filter(club => club.location === '본관');
  // ... (기존 코드)

  return (
    // ... (기존 코드)
      <div className="mission-status-v2">
        <h3>미션 진행 상황</h3>
        <p>총 스탬프: {totalStamps}개</p>
        <div className="location-status">
          {/* ... (기존 코드) ... */}
        </div>
        <div className="location-status">
          {/* ... (기존 코드) ... */}
        </div>

        {/* --- 쿠폰 섹션 --- */}
        {overall_mission_clear && !couponUsed && (
          <div className="coupon-section">
            <button onClick={() => navigate('/coupon')} className="coupon-button-v2">
              소떡소떡 교환권 사용하기
            </button>
          </div>
        )}
        {overall_mission_clear && couponUsed && (
          <div className="coupon-section used">
            <button className="coupon-button-v2" disabled>
              소떡소떡 교환권 사용완료
            </button>
            <p className="post-coupon-message">
              학술제 투어를 계속해서 스탬프 개수 1등을 달성해 보세요!
            </p>
          </div>
        )}
        {/* --- QR 스캔 버튼 --- */}
        <button onClick={() => setIsScannerOpen(true)} className="qr-scan-button">
          QR 스캔하기
        </button>
        {/* ... (기존 코드) */}
      </div>
    // ... (기존 코드)
  );
}

export default StampPage;
