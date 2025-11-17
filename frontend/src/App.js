import React, { useState, useEffect } from 'react';
import Login from './Login';
import StampPage from './StampPage';
import './App.css';

function App() {
  const [studentId, setStudentId] = useState(null);

  // Check for stored studentId on initial load (e.g., from localStorage)
  useEffect(() => {
    const storedStudentId = localStorage.getItem('studentId');
    if (storedStudentId) {
      setStudentId(storedStudentId);
    }
  }, []);

  const handleLogin = (id) => {
    setStudentId(id);
    localStorage.setItem('studentId', id); // Store studentId for persistence
  };

  const handleLogout = () => {
    setStudentId(null);
    localStorage.removeItem('studentId'); // Clear stored studentId
  };

  return (
    <div className="App">
      {studentId ? (
        <StampPage studentId={studentId} onLogout={handleLogout} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;
