import React, { useState, useEffect, useRef } from 'react';

function StampPage({ studentId }) {
  const [stampStatus, setStampStatus] = useState(null);
  const [clubs, setClubs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      // 첫 로딩 시에만 "로딩 중..."을 표시하여 깜빡임 방지
      if (!stampStatus && !error) {
        setIsLoading(true);
      }
      
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

        if (error) setError(null); // 성공 시 이전 오류 메시지 제거
        setStampStatus(statusData);
        setClubs(clubsData);

      } catch (err) {
        console.error('데이터 로딩 중 오류:', err);
        setError('데이터 로딩 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        // 오류 발생 시 자동 새로고침 중단
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } finally {
        if (isLoading) {
            setIsLoading(false);
        }
      }
    };

    fetchData(); // 첫 데이터 로딩 실행

    // 기존 인터벌이 있다면 정리하고 새로 설정
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(fetchData, 5000);

    // 컴포넌트가 언마운트될 때 인터벌 정리
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [studentId]);

  if (isLoading) {
    return <div className="loading-container">로딩 중...</div>;
  }



  if (error) {
    return <div className="error-container">{error}</div>;
  }

  // stampStatus가 여전히 null일 경우 (API는 성공했지만 데이터가 없는 경우 등)
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

  return (
    <div className="stamp-page-container">
      <div className="mission-status">
        <h3>미션 진행 상황</h3>
        <p>총 스탬프: {totalStamps}개</p>
        <div className="location-status">
          <p>[본관] {본관_stamps} / 5개 (필수)</p>
          <div className="progress-bar-container">
            <div className="progress-bar 본관" style={{ width: `${Math.min((본관_stamps / 5) * 100, 100)}%` }}></div>
          </div>
          {본관_mission_clear && <span className="mission-clear-text">✅ 본관 미션 완료!</span>}
        </div>
        <div className="location-status">
          <p>[후관] {후관_stamps} / 3개 (필수)</p>
          <div className="progress-bar-container">
            <div className="progress-bar 후관" style={{ width: `${Math.min((후관_stamps / 3) * 100, 100)}%` }}></div>
          </div>
          {후관_mission_clear && <span className="mission-clear-text">✅ 후관 미션 완료!</span>}
        </div>
        {overall_mission_clear && (
          <div className="overall-mission-clear">
            <p>미션 Clear! 중앙 현관으로 가서 보상을 받으세요.</p>
          </div>
        )}
      </div>

      <div className="club-list">
        <h3>동아리 목록</h3>
        <div className="club-grid">
          {clubs.map(club => (
            <div key={club.id} className={`club-item ${stampedClubs.includes(club.id) ? 'stamped' : ''}`}>
              {club.name} ({club.location})
              {stampedClubs.includes(club.id) && <span className="stamp-icon">✅</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default StampPage;
