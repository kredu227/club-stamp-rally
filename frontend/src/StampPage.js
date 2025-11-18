import React, { useState, useEffect } from 'react';
import './StampPage.css'; // We will create this CSS file later

function StampPage({ studentId }) {
  const [stampStatus, setStampStatus] = useState(null);
  const [clubs, setClubs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // 두 fetch 요청을 병렬로 처리
        const [statusResponse, clubsResponse] = await Promise.all([
          fetch(`/api/status/${studentId}`),
          fetch('/api/clubs')
        ]);

        if (!statusResponse.ok || !clubsResponse.ok) {
          throw new Error('데이터를 불러오는 데 실패했습니다.');
        }

        const statusData = await statusResponse.json();
        const clubsData = await clubsResponse.json();

        setStampStatus(statusData);
        setClubs(clubsData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('데이터 로딩 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // 5초마다 데이터 갱신

    return () => clearInterval(interval); // 컴포넌트 언마운트 시 인터벌 정리
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
