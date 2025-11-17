const express = require('express');
// const cors = require('cors'); // No longer needed
const db = require('./db');

const app = express();
const port = 3001; // React app will run on 3000, so backend on 3001

// app.use(cors()); // No longer needed
app.use(express.json()); // for parsing application/json

// Login endpoint
app.post('/api/login', (req, res) => {
  const { studentId, password } = req.body;
  if (db.validateStudent(studentId, password)) {
    res.json({ success: true, studentId });
  } else {
    res.status(401).json({ success: false, message: 'Invalid student ID or password' });
  }
});

// Get all clubs endpoint
app.get('/api/clubs', (req, res) => {
  res.json(db.getClubs());
});

// Record stamp endpoint
app.post('/api/stamp', (req, res) => {
  const { studentId, clubId } = req.body;
  if (!studentId || !clubId) {
    return res.status(400).json({ success: false, message: 'Student ID and Club ID are required.' });
  }
  db.recordStamp(studentId, clubId);
  res.json({ success: true, message: 'Stamp recorded successfully.' });
});

// Get student stamp status endpoint
app.get('/api/status/:studentId', (req, res) => {
  const { studentId } = req.params;
  const status = db.getStudentStampStatus(studentId);
  res.json(status);
});

// app.listen(port, () => {
//   console.log(`Backend server listening at http://localhost:${port}`);
// });

module.exports = app;
