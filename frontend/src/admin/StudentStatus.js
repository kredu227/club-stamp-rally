import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// 스탬프 관리 모달 컴포넌트
function StampManagementModal({ student, onClose, onStampChange }) {
  const [stampedClubs, setStampedClubs] = useState([]);
  const [allClubs, setAllClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClubs, setSelectedClubs] = useState([]);
  const adminRole = sessionStorage.getItem('adminRole');
  const isViewer = adminRole === 'viewer';

  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        setLoading(true);
        const adminPassword = sessionStorage.getItem('adminAuth');
        const headers = { 'Authorization': `Bearer ${adminPassword}` };

        // 학생의 상세 스탬프 정보 가져오기
        const res = await fetch(`/api/status/${student.studentId}`, { headers });
        if (!res.ok) throw new Error('학생 정보를 불러오는데 실패했습니다.');
        const data = await res.json();
        
        setStampedClubs(data.stampedClubs || []);
        setAllClubs(data.allClubs || []);
        setSelectedClubs([]); // 초기화
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudentDetails();
  }, [student.studentId]);

  const handleCheckboxChange = (clubId) => {
    if (isViewer) return;
    setSelectedClubs(prev => {
      if (prev.includes(clubId)) {
        return prev.filter(id => id !== clubId);
      } else {
        return [...prev, clubId];
      }
    });
  };

  const handleSelectAll = (e) => {
    if (isViewer) return;
    if (e.target.checked) {
      setSelectedClubs(stampedClubs);
    } else {
      setSelectedClubs([]);
    }
  };

  const handleBulkDelete = async () => {
    if (isViewer) return;
    if (selectedClubs.length === 0) {
      alert('삭제할 스탬프를 선택해주세요.');
      return;
    }
    if (!window.confirm(`선택한 ${selectedClubs.length}개의 스탬프를 삭제하시겠습니까?`)) {
      return;
    }

    try {
      const adminPassword = sessionStorage.getItem('adminAuth');
      const headers = { 
        'Authorization': `Bearer ${adminPassword}`,
        'Content-Type': 'application/json'
      };
      const body = JSON.stringify({
        studentId: student.studentId,
        clubIds: selectedClubs
      });

      const res = await fetch('/api/admin/delete-stamps-bulk', { method: 'POST', headers, body });
      const data = await res.json();

      if (!res.ok || !data.success) throw new Error(data.message || '스탬프 삭제에 실패했습니다.');
      
      alert('선택한 스탬프가 삭제되었습니다.');
      setStampedClubs(data.updatedStampedClubs);
      setSelectedClubs([]); // 선택 초기화
      onStampChange(); // 부모 컴포넌트 데이터 새로고침
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCouponReset = async () => {
    if (isViewer) return;
    if (!window.confirm(`${student.studentId} 학생의 쿠폰 사용 상태를 초기화하시겠습니까?`)) {
      return;
    }
    try {
      const adminPassword = sessionStorage.getItem('adminAuth');
      const headers = { 
        'Authorization': `Bearer ${adminPassword}`,
        'Content-Type': 'application/json'
      };
      const body = JSON.stringify({ studentId: student.studentId });

      const res = await fetch('/api/admin/reset-coupon', { method: 'POST', headers, body });
      const data = await res.json();

      if (!res.ok || !data.success) throw new Error(data.message || '쿠폰 초기화에 실패했습니다.');
      
      alert(data.message);
      onStampChange(); // 부모 컴포넌트 데이터 새로고침
      onClose(); // 모달 닫기
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{student.studentId} 스탬프 {isViewer ? '상세 정보' : '관리'}</h2>
        {loading ? <p>로딩 중...</p> : (
          <>
            {stampedClubs.length > 0 ? (
              <div className="stamp-list-container">
                {!isViewer && (
                  <div className="list-header">
                    <label>
                      <input 
                        type="checkbox" 
                        checked={stampedClubs.length > 0 && selectedClubs.length === stampedClubs.length}
                        onChange={handleSelectAll}
                      />
                      전체 선택
                    </label>
                    <button onClick={handleBulkDelete} className="bulk-delete-button" disabled={selectedClubs.length === 0}>
                      선택 삭제
                    </button>
                  </div>
                )}
                <ul className="stamp-list">
                  {stampedClubs.map(clubId => {
                    const club = allClubs.find(c => c.id === clubId);
                    return (
                      <li key={clubId} className="stamp-item">
                        <label>
                          {!isViewer && (
                            <input 
                              type="checkbox" 
                              checked={selectedClubs.includes(clubId)}
                              onChange={() => handleCheckboxChange(clubId)}
                            />
                          )}
                          <span className="club-info" style={{ marginLeft: isViewer ? '0' : '8px' }}>
                            {club ? club.name : clubId} <small>({club ? club.location : '알 수 없음'})</small>
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : <p>획득한 스탬프가 없습니다.</p>}
            
            {!isViewer && (student.missionClear || student.couponUsed) && (
              <div className="coupon-actions">
                <button onClick={handleCouponReset} className="reset-coupon-button">
                  쿠폰 사용 초기화
                </button>
              </div>
            )}
          </>
        )}
        <button onClick={onClose} className="close-button">닫기</button>
      </div>
    </div>
  );
}


function StudentStatus() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'totalStamps', direction: 'descending' });
  const [selectedStudent, setSelectedStudent] = useState(null);
  const adminRole = sessionStorage.getItem('adminRole');
  const isViewer = adminRole === 'viewer';

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const adminPassword = sessionStorage.getItem('adminAuth');
      if (!adminPassword) {
        navigate('/admin/login');
        return;
      }
      const headers = { 'Authorization': `Bearer ${adminPassword}` };

      const [statsRes, studentsRes] = await Promise.all([
        fetch('/api/admin/stats', { headers }),
        fetch('/api/admin/all-student-status', { headers })
      ]);

      if (!statsRes.ok) throw new Error('Failed to fetch stats');
      const statsData = await statsRes.json();
      setStats(statsData.stats);

      if (!studentsRes.ok) throw new Error('Failed to fetch student list');
      const studentsData = await studentsRes.json();
      setStudents(studentsData.statusList);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const sortedStudents = useMemo(() => {
    let sortableItems = [...students];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [students, sortConfig]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div>
      {selectedStudent && (
        <StampManagementModal 
          student={selectedStudent} 
          onClose={() => setSelectedStudent(null)}
          onStampChange={fetchData} // 스탬프 변경 시 학생 목록 새로고침
        />
      )}

      <section className="stats-section">
        <h2>실시간 현황</h2>
        {stats && (
          <div className="stats-grid">
            <div className="stat-item">
              <h3>총 참여 학생</h3>
              <p>{stats.totalParticipants}</p>
            </div>
            <div className="stat-item">
              <h3>총 스탬프 수</h3>
              <p>{stats.totalStamps}</p>
            </div>
            <div className="stat-item">
              <h3>미션 완료 학생</h3>
              <p>{stats.missionCompleters}</p>
            </div>
            <div className="stat-item">
              <h3>쿠폰 사용 학생</h3>
              <p>{stats.couponUsedCount}</p>
            </div>
          </div>
        )}
      </section>

      <section className="student-list-section">
        <h2>전체 학생 현황</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th onClick={() => requestSort('studentId')} className="sortable-header">
                학번 {sortConfig.key === 'studentId' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
              </th>
              <th onClick={() => requestSort('totalStamps')} className="sortable-header">
                총 스탬프 개수 {sortConfig.key === 'totalStamps' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
              </th>
              <th onClick={() => requestSort('missionClear')} className="sortable-header">
                미션 완료 여부 {sortConfig.key === 'missionClear' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
              </th>
              <th onClick={() => requestSort('couponUsed')} className="sortable-header">
                쿠폰 사용 여부 {sortConfig.key === 'couponUsed' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
              </th>
              <th>{isViewer ? '상세' : '관리'}</th>
            </tr>
          </thead>
          <tbody>
            {sortedStudents.map(student => (
              <tr key={student.studentId}>
                <td>{student.studentId}</td>
                <td>{student.totalStamps}</td>
                <td>{student.missionClear ? '✅ 완료' : '미완료'}</td>
                <td>{student.couponUsed ? '✅ 사용' : '❌ 미사용'}</td>
                <td>
                  <button onClick={() => setSelectedStudent(student)} className="manage-button">
                    {isViewer ? '상세' : '관리'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default StudentStatus;