import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'totalStamps', direction: 'descending' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        const adminPassword = sessionStorage.getItem('adminAuth');
        if (!adminPassword) {
          navigate('/admin/login');
          return;
        }

        const headers = {
          'Authorization': `Bearer ${adminPassword}`
        };

        // Fetch stats
        const statsRes = await fetch('/api/admin/stats', { headers });
        if (!statsRes.ok) throw new Error('Failed to fetch stats');
        const statsData = await statsRes.json();
        setStats(statsData.stats);

        // Fetch all student status
        const studentsRes = await fetch('/api/admin/all-student-status', { headers });
        if (!studentsRes.ok) throw new Error('Failed to fetch student list');
        const studentsData = await studentsRes.json();
        setStudents(studentsData.statusList);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

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

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuth');
    navigate('/admin/login');
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>관리자 대시보드</h1>
      <button onClick={handleLogout}>로그아웃</button>

      <h2>실시간 현황</h2>
      {stats && (
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          <li><strong>총 참여 학생:</strong> {stats.totalParticipants}</li>
          <li><strong>총 스탬프 수:</strong> {stats.totalStamps}</li>
          <li><strong>미션 완료 학생:</strong> {stats.missionCompleters}</li>
        </ul>
      )}

      <h2>전체 학생 현황</h2>
      <table border="1" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
        <thead>
          <tr>
            <th>학번</th>
            <th onClick={() => requestSort('totalStamps')} style={{ cursor: 'pointer' }}>
              총 스탬프 개수 {sortConfig.key === 'totalStamps' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
            </th>
            <th>미션 완료 여부</th>
          </tr>
        </thead>
        <tbody>
          {sortedStudents.map(student => (
            <tr key={student.studentId}>
              <td>{student.studentId}</td>
              <td>{student.totalStamps}</td>
              <td>{student.missionClear ? '완료' : '미완료'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminDashboard;
