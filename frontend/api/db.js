const { kv } = require('@vercel/kv');
const fs = require('fs');
const path = require('path');

const studentsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'club-stamp-rally.json'), 'utf8'));
const students = studentsData.map(s => ({ ...s, studentId: String(s.studentId) }));

const clubs = [
  // 본관 그룹
  { id: 'club1', name: '글로벌리더십', location: '본관', qrCode: 'a1b2c3' },
  { id: 'club2', name: '그대의말로', location: '본관', qrCode: 'd4e5f6' },
  { id: 'club3', name: '레드타이', location: '본관', qrCode: 'g7h8i9' },
  { id: 'club4', name: 'mRNA', location: '본관', qrCode: 'j0k1l2' },
  { id: 'club5', name: '나라사랑', location: '본관', qrCode: 'm3n4o5' },
  { id: 'club6', name: '방송부', location: '본관', qrCode: 'p6q7r8' },
  { id: 'club7', name: '농구부', location: '본관', qrCode: 's9t0u1' },
  { id: 'club8', name: '또래상담', location: '본관', qrCode: 'v2w3x4' },
  { id: 'club9', name: '독수공방', location: '본관', qrCode: 'y5z6a7' },
  { id: 'club10', name: '아크매틱', location: '본관', qrCode: 'b8c9d0' },
  { id: 'club11', name: '개척', location: '본관', qrCode: 'e1f2g3' },
  { id: 'club12', name: '국과수', location: '본관', qrCode: 'h4i5j6' },
  { id: 'club13', name: '가피', location: '본관', qrCode: 'k7l8m9' },
  { id: 'club14', name: '에코', location: '본관', qrCode: 'n0o1p2' },
  { id: 'club15', name: '여가활용부', location: '본관', qrCode: 'q3r4s5' },
  // 후관 그룹
  { id: 'club16', name: '생각의판', location: '후관', qrCode: 't6u7v8' },
  { id: 'club17', name: '정치언론부', location: '후관', qrCode: 'w9x0y1' },
  { id: 'club18', name: '대중문화탐구', location: '후관', qrCode: 'z2a3b4' },
  { id: 'club19', name: '내꿈찾아삼만리', location: '후관', qrCode: 'c5d6e7' },
  { id: 'club20', name: '축구부', location: '후관', qrCode: 'f8g9h0' },
  { id: 'club21', name: '역사랑', location: '후관', qrCode: 'i1j2k3' },
  { id: 'club22', name: '화생방', location: '후관', qrCode: 'l4m5n6' },
  { id: 'club23', name: 'BIOHOLIC', location: '후관', qrCode: 'o7p8q9' },
  { id: 'club24', name: '아이러닝', location: '후관', qrCode: 'r0s1t2' },
  { id: 'club25', name: '그루터기', location: '후관', qrCode: 'u3v4w5' },
];

function validateStudent(studentId, password) {
  const student = students.find(s => s.studentId === studentId && s.password === password);
  return !!student;
}

function getClubs() {
  return clubs;
}

// Vercel KV에서 학생의 모든 데이터를 가져오는 도우미 함수
async function getStudentData(studentId) {
  if (!process.env.KV_REST_API_URL) return null;
  const studentKey = `student_${studentId}`;
  let studentData = await kv.get(studentKey);

  // 새로운 형식의 데이터가 없으면, 이전 형식(stamps_...)의 데이터가 있는지 확인
  if (!studentData) {
    const oldStampKey = `stamps_${studentId}`;
    const oldStamps = await kv.get(oldStampKey);

    // 이전 형식의 데이터가 존재하면, 새로운 형식으로 변환하여 저장 (마이그레이션)
    if (oldStamps) {
      console.log(`[LOG] Migrating data for student ${studentId} from old format.`);
      studentData = { stamps: oldStamps, couponUsed: false };
      await kv.set(studentKey, studentData);
      // 선택: 이전 키를 삭제할 수도 있습니다. await kv.del(oldStampKey);
    }
  }
  
  return studentData || { stamps: {}, couponUsed: false };
}

// Vercel KV에 학생 데이터를 저장하는 도우미 함수
async function setStudentData(studentId, data) {
  if (!process.env.KV_REST_API_URL) return;
  const studentKey = `student_${studentId}`;
  await kv.set(studentKey, data);
}

// Vercel KV를 사용하도록 수정 (async 함수)
async function recordStampByQrCode(studentId, qrCode) {
  // Vercel 환경 변수가 설정되어 있지 않으면 스탬프 기록 불가
  if (!process.env.KV_REST_API_URL) {
    console.log('[LOG] Vercel KV environment variables not found. Stamp recording is disabled for local JSON file fallback.');
    return { success: false, message: '스탬프 기록은 Vercel KV가 연결된 배포 환경에서만 가능합니다.' };
  }

  const club = clubs.find(c => c.qrCode === qrCode);
  if (!club) {
    return { success: false, message: '유효하지 않은 QR 코드입니다.' };
  }
  const clubId = club.id;
  
  const studentData = await getStudentData(studentId);
  const currentStamps = studentData.stamps;

  if (currentStamps[clubId]) {
    return { success: false, message: '이미 스탬프를 획득한 동아리입니다.' };
  }

  // 새로운 스탬프를 추가
  const newStamps = { ...currentStamps, [clubId]: true };
  studentData.stamps = newStamps;
  
  await setStudentData(studentId, studentData);

  // 스탬프 기록 후 업데이트된 학생 스탬프 현황을 직접 계산합니다 (KV 호출 최소화)
  const stampedClubIds = Object.keys(newStamps).filter(clubId => newStamps[clubId]);

  const 본관_clubs_all = clubs.filter(c => c.location === '본관');
  const 후관_clubs_all = clubs.filter(c => c.location === '후관');

  const 본관_stamps = 본관_clubs_all.filter(club => stampedClubIds.includes(club.id)).length;
  const 후관_stamps = 후관_clubs_all.filter(club => stampedClubIds.includes(club.id)).length;

  const 본관_mission_clear = 본관_stamps >= 5;
  const 후관_mission_clear = 후관_stamps >= 3;
  const overall_mission_clear = 본관_mission_clear && 후관_mission_clear;

  // couponUsed는 studentData에서 직접 가져옵니다.
  const couponUsed = studentData.couponUsed;

  // 방금 스탬프를 찍어서 미션 클리어가 되었는지 확인
  const justClearedMission = !couponUsed && overall_mission_clear;

  return {
    success: true,
    message: `${club.name} 스탬프를 획득했습니다!`,
    overall_mission_clear: overall_mission_clear,
    justClearedMission: justClearedMission // 방금 미션을 클리어했는지 여부
  };
}

// Vercel KV를 사용하도록 수정 (async 함수)
async function getStudentStampStatus(studentId) {
  // Vercel 환경 변수가 설정되어 있지 않은 경우 처리
  if (!process.env.KV_REST_API_URL) {
    // 배포 환경(Vercel)인데 KV URL이 없다면 명백한 서버 설정 오류이므로 에러를 발생시킵니다.
    // 이렇게 해야 프론트엔드에서 '스탬프 0개'로 보이는 대신 '서버 오류' 화면을 띄울 수 있습니다.
    if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
      console.error('[CRITICAL] Vercel KV environment variables missing in production!');
      throw new Error('Server configuration error: Database connection missing.');
    }

    // 로컬 개발 환경에서만 편의를 위해 로컬 JSON 파일을 사용합니다.
    console.log('[LOG] Vercel KV environment variables not found. Falling back to local JSON file (Development only).');
    try {
      // 로컬 JSON 파일에서 학생 데이터를 찾습니다.
      const student = students.find(s => s.studentId === studentId);
      const stampedClubIds = student ? student.stampedClubs || [] : [];
      const couponUsed = student ? student.couponUsed || false : false;

      const 본관_clubs = clubs.filter(club => club.location === '본관');
      const 후관_clubs = clubs.filter(club => club.location === '후관');

      const 본관_stamps = 본관_clubs.filter(club => stampedClubIds.includes(club.id)).length;
      const 후관_stamps = 후관_clubs.filter(club => stampedClubIds.includes(club.id)).length;

      const 본관_mission_clear = 본관_stamps >= 5;
      const 후관_mission_clear = 후관_stamps >= 3;
      const overall_mission_clear = 본관_mission_clear && 후관_mission_clear;

      return {
        totalStamps: stampedClubIds.length,
        본관_stamps,
        후관_stamps,
        본관_mission_clear,
        후관_mission_clear,
        overall_mission_clear,
        stampedClubs: stampedClubIds,
        couponUsed, // 쿠폰 사용 여부 추가
        allClubs: clubs.map(club => ({ id: club.id, name: club.name, location: club.location, stamped: stampedClubIds.includes(club.id) }))
      };
    } catch (error) {
      console.error('[ERROR] Failed to read or process local JSON file:', error);
      throw new Error('Failed to get stamp status from local fallback.');
    }
  }

  // Vercel KV 로직 (환경 변수가 있을 때)
  try {
    const studentData = await getStudentData(studentId);
    const stamps = studentData.stamps;
    const couponUsed = studentData.couponUsed;

    const stampedClubIds = Object.keys(stamps).filter(clubId => stamps[clubId]);

    const 본관_clubs = clubs.filter(club => club.location === '본관');
    const 후관_clubs = clubs.filter(club => club.location === '후관');

    const 본관_stamps = 본관_clubs.filter(club => stampedClubIds.includes(club.id)).length;
    const 후관_stamps = 후관_clubs.filter(club => stampedClubIds.includes(club.id)).length;

    const 본관_mission_clear = 본관_stamps >= 5;
    const 후관_mission_clear = 후관_stamps >= 3;
    const overall_mission_clear = 본관_mission_clear && 후관_mission_clear;

    return {
      totalStamps: stampedClubIds.length,
      본관_stamps,
      후관_stamps,
      본관_mission_clear,
      후관_mission_clear,
      overall_mission_clear,
      stampedClubs: stampedClubIds,
      couponUsed,
      allClubs: clubs.map(club => ({ id: club.id, name: club.name, location: club.location, stamped: stampedClubIds.includes(club.id) }))
    };
  } catch (error) {
    console.error(`[CRITICAL] Error fetching data from Vercel KV for student ${studentId}:`, error);
    // KV 연결 실패 시 에러를 전파하여 '스탬프 0개'로 표시되는 것을 방지
    throw new Error('Database connection failed'); 
  }
}

// 쿠폰 사용 처리 함수
async function useCoupon(studentId) {
  // 1. 환경 변수 체크 (배포 환경)
  if (process.env.KV_REST_API_URL) {
    try {
      // 최신 상태를 가져와서 미션 클리어 여부 확인
      const currentStatus = await getStudentStampStatus(studentId);

      if (!currentStatus.overall_mission_clear) {
        return { success: false, message: '미션을 아직 완료하지 않았습니다.' };
      }

      if (currentStatus.couponUsed) {
        return { success: false, message: '이미 쿠폰을 사용했습니다.' };
      }

      // 학생 데이터를 가져와서 쿠폰 사용 플래그 설정
      const studentData = await getStudentData(studentId);
      studentData.couponUsed = true;
      
      await setStudentData(studentId, studentData);

      return { success: true, message: '쿠폰 사용이 완료되었습니다.' };
    } catch (error) {
      console.error(`Error using coupon for student ${studentId}:`, error);
      throw new Error('Failed to use coupon.');
    }
  }

  // 2. 로컬 환경 (환경 변수 없음) - 폴백
  // 로컬 개발 시 에러가 나지 않도록 처리
  console.log('[LOG] Vercel KV environment variables not found. useCoupon is disabled in local mode.');
  return { success: false, message: '로컬 환경에서는 쿠폰 사용 상태를 저장할 수 없습니다.' };
}

// 관리자용 쿠폰 초기화 함수
async function resetCoupon(studentId) {
  if (!process.env.KV_REST_API_URL) {
    return { success: false, message: '쿠폰 초기화는 Vercel KV가 연결된 배포 환경에서만 가능합니다.' };
  }
  const studentData = await getStudentData(studentId);
  studentData.couponUsed = false;
  await setStudentData(studentId, studentData);
  return { success: true, message: '쿠폰 사용 상태가 초기화되었습니다.' };
}

// 모든 학생의 스탬프 데이터를 가져오는 함수
async function getAllStudentStamps() {
  if (!process.env.KV_REST_API_URL) {
    console.log('[LOG] Vercel KV environment variables not found. Returning empty array for getAllStudentStamps.');
    return [];
  }

  const allStudentDataMap = new Map();

  // 1. 새로운 'student_*' 키를 모두 스캔하여 Map에 저장
  const studentKeys = [];
  for await (const key of kv.scanIterator({ match: 'student_*' })) {
    studentKeys.push(key);
  }
  if (studentKeys.length > 0) {
    const newFormatData = await kv.mget(...studentKeys);
    newFormatData.forEach((data, index) => {
      const studentId = studentKeys[index].replace('student_', '');
      if (data && data.stamps) {
        allStudentDataMap.set(studentId, data.stamps);
      }
    });
  }

  // 2. 이전 'stamps_*' 키를 모두 스캔
  const stampKeys = [];
  for await (const key of kv.scanIterator({ match: 'stamps_*' })) {
    stampKeys.push(key);
  }
  if (stampKeys.length > 0) {
    const oldFormatData = await kv.mget(...stampKeys);
    oldFormatData.forEach((stamps, index) => {
      const studentId = stampKeys[index].replace('stamps_', '');
      // Map에 아직 해당 학생 데이터가 없을 경우 (마이그레이션 대상) 추가
      if (!allStudentDataMap.has(studentId) && stamps) {
        allStudentDataMap.set(studentId, stamps);
      }
    });
  }

  // 3. Map을 최종 배열 형태로 변환
  const finalStudentStamps = [];
  for (const [studentId, stamps] of allStudentDataMap.entries()) {
    finalStudentStamps.push({
      studentId,
      stamps: stamps || {}
    });
  }

  return finalStudentStamps;
}



async function getAdminStats() {
  if (!process.env.KV_REST_API_URL) {
    console.log('[LOG] Vercel KV environment variables not found. Returning zero stats for getAdminStats.');
    return { totalParticipants: 0, totalStamps: 0, missionCompleters: 0, couponUsedCount: 0 };
  }

  // getAllStudentStamps 대신 getAllStudentStatus를 사용하여 완전한 데이터(couponUsed 포함)를 가져옵니다.
  const allStatus = await getAllStudentStatus();
  
  const totalParticipants = allStatus.length;
  const totalStamps = allStatus.reduce((sum, s) => sum + s.totalStamps, 0);
  const missionCompleters = allStatus.filter(s => s.missionClear).length;
  const couponUsedCount = allStatus.filter(s => s.couponUsed).length;

  return { totalParticipants, totalStamps, missionCompleters, couponUsedCount };
}



async function getAllStudentStatus() {
  if (!process.env.KV_REST_API_URL) {
    console.log('[LOG] Vercel KV environment variables not found. Returning empty array for getAllStudentStatus.');
    return [];
  }

  const studentKeys = [];
  for await (const key of kv.scanIterator({ match: 'student_*' })) {
    studentKeys.push(key);
  }

  // 마이그레이션되지 않은 옛날 데이터도 함께 조회
  const stampKeys = [];
  for await (const key of kv.scanIterator({ match: 'stamps_*' })) {
      const studentId = key.replace('stamps_', '');
      if (!studentKeys.includes(`student_${studentId}`)) {
          stampKeys.push(key);
      }
  }

  const allKeys = [...studentKeys, ...stampKeys];
  if (allKeys.length === 0) return [];

  const allData = await kv.mget(...allKeys);

  const allStatus = allData.map((data, index) => {
    const key = allKeys[index];
    const isNewFormat = key.startsWith('student_');
    const studentId = isNewFormat ? key.replace('student_', '') : key.replace('stamps_', '');
    
    const stamps = isNewFormat ? (data.stamps || {}) : (data || {});
    const couponUsed = isNewFormat ? (data.couponUsed || false) : false;

    const stampedClubIds = Object.keys(stamps);
    const 본관_stamps = clubs.filter(c => c.location === '본관' && stampedClubIds.includes(c.id)).length;
    const 후관_stamps = clubs.filter(c => c.location === '후관' && stampedClubIds.includes(c.id)).length;
    const mission_clear = 본관_stamps >= 5 && 후관_stamps >= 3;

    return {
      studentId,
      totalStamps: stampedClubIds.length,
      missionClear: mission_clear,
      couponUsed: couponUsed, // 쿠폰 사용 여부 추가
    };
  });

  return allStatus;
}



module.exports = {
  validateStudent,
  getClubs,
  recordStampByQrCode,
  getStudentStampStatus,
  useCoupon,
  resetCoupon, // 쿠폰 초기화 함수 추가
  getAllStudentStamps,
  getAdminStats,
  getAllStudentStatus,
  manageStamp,
  deleteStampsBulk,
};

  

  async function manageStamp(studentId, clubId, action) {
  if (!process.env.KV_REST_API_URL) {
    return { success: false, message: '스탬프 관리는 Vercel KV가 연결된 배포 환경에서만 가능합니다.' };
  }

  const studentData = await getStudentData(studentId);
  let newStamps;

  if (action === 'add') {
    newStamps = { ...studentData.stamps, [clubId]: true };
  } else if (action === 'remove') {
    const { [clubId]: _, ...rest } = studentData.stamps;
    newStamps = rest;
  } else {
    return { success: false, message: 'Invalid action' };
  }

  const newStudentData = { ...studentData, stamps: newStamps };
  await setStudentData(studentId, newStudentData);
  
  const updatedStampedClubs = Object.keys(newStamps);
  return { success: true, updatedStampedClubs };
}

async function deleteStampsBulk(studentId, clubIds) {
  if (!process.env.KV_REST_API_URL) {
    return { success: false, message: '스탬프 관리는 Vercel KV가 연결된 배포 환경에서만 가능합니다.' };
  }

  const studentData = await getStudentData(studentId);
  let currentStamps = { ...studentData.stamps };

  clubIds.forEach(clubId => {
    delete currentStamps[clubId];
  });

  const newStudentData = { ...studentData, stamps: currentStamps };
  await setStudentData(studentId, newStudentData);

  const updatedStampedClubs = Object.keys(currentStamps);
  return { success: true, updatedStampedClubs };
}

  
