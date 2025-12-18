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
  console.log(`[LOG] Fetching stamp status for studentId: ${studentId}`); // 로그 추가
  try {
    const status = await db.getStudentStampStatus(studentId);
    console.log(`[LOG] Successfully fetched status for ${studentId}:`, status); // 성공 로그 추가
    res.json(status);
  } catch (error) {
    console.error(`[ERROR] Error getting student status for ${studentId}:`, error); // 에러 로그 강화
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// Use coupon endpoint
app.post('/api/coupon/use', async (req, res) => {
  const { studentId } = req.body;
  if (!studentId) {
    return res.status(400).json({ success: false, message: 'Student ID is required.' });
  }
  try {
    const result = await db.useCoupon(studentId);
    res.json(result);
  } catch (error) {
    console.error('Error using coupon:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// Admin login endpoint
// Admin login endpoint
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === process.env.ADMIN_PASSWORD) {
    res.json({ success: true, role: 'super' });
  } else if (password === (process.env.VIEWER_PASSWORD || 'adminpt')) {
    res.json({ success: true, role: 'viewer' });
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
  
  if (password === process.env.ADMIN_PASSWORD) {
    req.adminRole = 'super';
    next();
  } else if (password === (process.env.VIEWER_PASSWORD || 'adminpt')) {
    req.adminRole = 'viewer';
    next();
  } else {
    res.status(403).json({ success: false, message: 'Not authorized' });
  }
};

const requireSuperAdmin = (req, res, next) => {
  if (req.adminRole === 'super') {
    next();
  } else {
    res.status(403).json({ success: false, message: '권한이 부족합니다. (Requires Super Admin)' });
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

// 전체 학생 스탬프 데이터 API (동아리별 집계를 위해 추가)
adminRouter.get('/all-student-stamps', async (req, res) => {
  try {
    const stampsData = await db.getAllStudentStamps();
    res.json({ success: true, stampsData });
  } catch (error) {
    console.error('Error getting all student stamps:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 스탬프 수동 관리 API
adminRouter.post('/manage-stamp', requireSuperAdmin, async (req, res) => {
  const { studentId, clubId, action } = req.body;
  if (!studentId || !clubId || !action) {
    return res.status(400).json({ success: false, message: 'Student ID, Club ID, and action are required.' });
  }
  try {
    const result = await db.manageStamp(studentId, clubId, action);
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json({ success: false, message: result.message });
    }
  } catch (error) {
    console.error('Error managing stamp:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 스탬프 일괄 삭제 API
adminRouter.post('/delete-stamps-bulk', requireSuperAdmin, async (req, res) => {
  const { studentId, clubIds } = req.body;
  if (!studentId || !clubIds || !Array.isArray(clubIds)) {
    return res.status(400).json({ success: false, message: 'Student ID and list of Club IDs are required.' });
  }
  try {
    const result = await db.deleteStampsBulk(studentId, clubIds);
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json({ success: false, message: result.message });
    }
  } catch (error) {
    console.error('Error deleting stamps bulk:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 쿠폰 사용 초기화 API
adminRouter.post('/reset-coupon', requireSuperAdmin, async (req, res) => {
  const { studentId } = req.body;
  if (!studentId) {
    return res.status(400).json({ success: false, message: 'Student ID is required.' });
  }
  try {
    const result = await db.resetCoupon(studentId);
    res.json(result);
  } catch (error) {
    console.error('Error resetting coupon:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

app.use('/api/admin', adminRouter); // '/api/admin' 경로에 adminRouter 등록

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});

module.exports = app;
