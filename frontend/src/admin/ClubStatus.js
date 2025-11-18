import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

function ClubStatus() {
  const navigate = useNavigate();
  const [clubStats, setClubStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'stampCount', direction: 'descending' });

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

        // Fetch all clubs and all student stamps data concurrently
        const [clubsRes, stampsRes] = await Promise.all([
          fetch('/api/clubs'),
          fetch('/api/admin/all-student-stamps', { headers })
        ]);

        if (!clubsRes.ok) throw new Error('Failed to fetch clubs');
        if (!stampsRes.ok) throw new Error('Failed to fetch student stamps data');

        const clubsData = await clubsRes.json();
        const stampsData = await stampsRes.json();

        // Calculate stamp count for each club
        const stats = clubsData.map(club => {
          const stampCount = stampsData.stampsData.reduce((count, student) => {
            return student.stamps && student.stamps[club.id] ? count + 1 : count;
          }, 0);
          return { ...club, stampCount };
        });

        setClubStats(stats);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const sortedClubs = useMemo(() => {
    let sortableItems = [...clubStats];
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
  }, [clubStats, sortConfig]);

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
    <section className="club-list-section">
      <h2>동아리별 참여 현황</h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>동아리명</th>
            <th>위치</th>
            <th onClick={() => requestSort('stampCount')} className="sortable-header">
              스탬프 획득 수 {sortConfig.key === 'stampCount' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedClubs.map(club => (
            <tr key={club.id}>
              <td>{club.name}</td>
              <td>{club.location}</td>
              <td>{club.stampCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export default ClubStatus;
