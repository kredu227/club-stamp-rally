import React, { useState } from 'react';
import './Login.css'; // We will create this CSS file later

function Login({ onLogin }) {
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentId, password }),
      });

      const data = await response.json();

      if (data.success) {
        onLogin(studentId); // Pass the studentId up to the App component
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Login error:', err);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>동아리 축제 스탬프 랠리</h2>
        <div className="form-group">
          <label htmlFor="studentId">학번</label>
          <input
            type="text"
            id="studentId"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">비밀번호</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit" className="login-button">로그인</button>
      </form>
    </div>
  );
}

export default Login;
