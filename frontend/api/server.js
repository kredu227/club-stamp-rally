require('dotenv').config();
const express = require('express');
const db = require('./db');

const app = express();
const port = 3001;

app.use(express.json());

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

// Record stamp endpoint (QR 코드 기반으로 수정)
app.post('/api/stamp', async (req, res) => {
  const { studentId, qrCode } = req.body;
  if (!studentId || !qrCode) {
    return res.status(400).json({ success: false, message: 'Student ID and QR Code are required.' });
  }
  try {
    const result = await db.recordStampByQrCode(studentId, qrCode);
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error recording stamp:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// Get student stamp status endpoint
app.get('/api/status/:studentId', async (req, res) => {
  const { studentId } = req.params;
  try {
    const status = await db.getStudentStampStatus(studentId);
    res.json(status);
  } catch (error) {
    console.error('Error getting student status:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// Admin login endpoint
// Admin login endpoint
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === process.env.ADMIN_PASSWORD) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: 'Invalid password' });
  }
});

// --- Admin API Routes ---

// Admin Authentication Middleware
const adminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  // "Bearer <password>" 형식으로 비밀번호를 받습니다.
  const password = authHeader && authHeader.split(' ')[1]; 
  if (password && password === process.env.ADMIN_PASSWORD) {
    next(); // 인증 성공
  } else {
    res.status(403).json({ success: false, message: 'Not authorized' });
  }
};

const adminRouter = express.Router();
adminRouter.use(adminAuth); // 모든 adminRouter 경로에 인증 미들웨어 적용

// 관리자용 통계 데이터 API
adminRouter.get('/stats', async (req, res) => {
  try {
    const stats = await db.getAdminStats();
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Error getting admin stats:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 전체 학생 현황 API
adminRouter.get('/all-student-status', async (req, res) => {
  try {
    const statusList = await db.getAllStudentStatus();
    res.json({ success: true, statusList });
  } catch (error) {
    console.error('Error getting all student status:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 스탬프 수동 관리 API
adminRouter.post('/manage-stamp', async (req, res) => {
  const { studentId, clubId, action } = req.body;
  if (!studentId || !clubId || !action) {
    return res.status(400).json({ success: false, message: 'Student ID, Club ID, and action are required.' });
  }
  try {
    const result = await db.manageStamp(studentId, clubId, action);
    if (result.success) {
      res.json({ success: true, ...result });
    } else {
      res.status(400).json({ success: false, message: result.message });
    }
  } catch (error) {
    console.error('Error managing stamp:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

app.use('/api/admin', adminRouter); // '/api/admin' 경로에 adminRouter 등록

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});

module.exports = app;
