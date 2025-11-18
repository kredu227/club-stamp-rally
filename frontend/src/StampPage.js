import React, { useState, useEffect } from 'react';
import './StampPage.css';

function StampPage({ studentId }) {
  const [stampStatus, setStampStatus] = useState(null);
  const [clubs, setClubs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
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

        setError(null); // 성공 시 이전 오류 메시지 제거
        setStampStatus(statusData);
        setClubs(clubsData);

      } catch (err) {
        console.error('데이터 로딩 중 오류:', err);
        setError('데이터 로딩 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData(); // 데이터 로딩 실행

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

  const 본관_clubs = clubs.filter(club => club.location === '본관');
  const 후관_clubs_raw = clubs.filter(club => club.location === '후관');

  // 후관 그리드 항목 재배열 (3x4, 마지막 줄 양 끝 빈칸)
  const 후관_grid_items = [];
  if (후관_clubs_raw.length > 0) {
    // 첫 9개 동아리 채우기
    for (let i = 0; i < 9; i++) {
      후관_grid_items.push(후관_clubs_raw[i] || { id: `placeholder-${i}`, empty: true });
    }
    // 마지막 줄: [빈칸, 10번째 동아리, 빈칸]
    후관_grid_items.push({ id: 'empty-left', empty: true });
    후관_grid_items.push(후관_clubs_raw[9] || { id: 'placeholder-9', empty: true });
    후관_grid_items.push({ id: 'empty-right', empty: true });
  }


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

      <div className="club-list-section">
        <div className="club-group">
          <h3>🏢 본관</h3>
          <div className="club-grid 본관">
            {본관_clubs.map(club => (
              <div key={club.id} className={`club-item ${stampedClubs.includes(club.id) ? 'stamped' : ''}`}>
                {club.name}
              </div>
            ))}
          </div>
        </div>
        <div className="club-group">
          <h3>🏫 후관</h3>
          <div className="club-grid 후관">
            {후관_grid_items.map(item => (
              item.empty ?
              <div key={item.id} className="club-item empty"></div> :
              <div key={item.id} className={`club-item ${stampedClubs.includes(item.id) ? 'stamped' : ''}`}>
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
