import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

function StudentStatus() {
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div>
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
          </div>
        )}
      </section>

      <section className="student-list-section">
        <h2>전체 학생 현황</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>학번</th>
              <th onClick={() => requestSort('totalStamps')} className="sortable-header">
                총 스탬프 개수 {sortConfig.key === 'totalStamps' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
              </th>
              <th onClick={() => requestSort('missionClear')} className="sortable-header">
                미션 완료 여부 {sortConfig.key === 'missionClear' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedStudents.map(student => (
              <tr key={student.studentId}>
                <td>{student.studentId}</td>
                <td>{student.totalStamps}</td>
                <td>{student.missionClear ? '✅ 완료' : '미완료'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default StudentStatus;
