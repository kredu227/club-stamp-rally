import { kv } from '@vercel/kv';
const fs = require('fs');
const path = require('path');

const studentsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'club-stamp-rally.json'), 'utf8'));
const students = studentsData.map(s => ({ ...s, studentId: String(s.studentId) }));

const clubs = [
  // 본관 그룹
  { id: 'club1', name: '글로벌리더십', location: '본관', qrCode: 'qr_club1' },
  { id: 'club2', name: '그대의말로', location: '본관', qrCode: 'qr_club2' },
  { id: 'club3', name: '레드타이', location: '본관', qrCode: 'qr_club3' },
  { id: 'club4', name: 'mRNA', location: '본관', qrCode: 'qr_club4' },
  { id: 'club5', name: '나라사랑', location: '본관', qrCode: 'qr_club5' },
  { id: 'club6', name: '방송부', location: '본관', qrCode: 'qr_club6' },
  { id: 'club7', name: '농구부', location: '본관', qrCode: 'qr_club7' },
  { id: 'club8', name: '또래상담', location: '본관', qrCode: 'qr_club8' },
  { id: 'club9', name: '독수공방', location: '본관', qrCode: 'qr_club9' },
  { id: 'club10', name: '아크매틱', location: '본관', qrCode: 'qr_club10' },
  { id: 'club11', name: '개척', location: '본관', qrCode: 'qr_club11' },
  { id: 'club12', name: '국과수', location: '본관', qrCode: 'qr_club12' },
  { id: 'club13', name: '가피', location: '본관', qrCode: 'qr_club13' },
  { id: 'club14', name: '에코', location: '본관', qrCode: 'qr_club14' },
  { id: 'club15', name: '여가활용부', location: '본관', qrCode: 'qr_club15' },
  // 후관 그룹
  { id: 'club16', name: '생각의판', location: '후관', qrCode: 'qr_club16' },
  { id: 'club17', name: '정치언론부', location: '후관', qrCode: 'qr_club17' },
  { id: 'club18', name: '대중문화탐구', location: '후관', qrCode: 'qr_club18' },
  { id: 'club19', name: '내꿈찾아삼만리', location: '후관', qrCode: 'qr_club19' },
  { id: 'club20', name: '축구부', location: '후관', qrCode: 'qr_club20' },
  { id: 'club21', name: '역사랑', location: '후관', qrCode: 'qr_club21' },
  { id: 'club22', name: '화생방', location: '후관', qrCode: 'qr_club22' },
  { id: 'club23', name: 'BIOHOLIC', location: '후관', qrCode: 'qr_club23' },
  { id: 'club24', name: '아이러닝', location: '후관', qrCode: 'qr_club24' },
  { id: 'club25', name: '그루터기', location: '후관', qrCode: 'qr_club25' },
];

function validateStudent(studentId, password) {
  const student = students.find(s => s.studentId === studentId && s.password === password);
  return !!student;
}

function getClubs() {
  return clubs;
}

// Vercel KV를 사용하도록 수정 (async 함수)
async function recordStampByQrCode(studentId, qrCode) {
  const club = clubs.find(c => c.qrCode === qrCode);
  if (!club) {
    return { success: false, message: '유효하지 않은 QR 코드입니다.' };
  }
  const clubId = club.id;
  const studentStampKey = `stamps_${studentId}`;

  // KV에서 학생의 현재 스탬프 데이터를 가져옵니다.
  const currentStamps = await kv.get(studentStampKey) || {};

  if (currentStamps[clubId]) {
    return { success: false, message: '이미 스탬프를 획득한 동아리입니다.' };
  }

  // 새로운 스탬프를 추가하고 KV에 저장합니다.
  const newStamps = { ...currentStamps, [clubId]: true };
  await kv.set(studentStampKey, newStamps);

  // 스탬프 기록 후 업데이트된 학생 스탬프 현황을 가져옵니다.
  const updatedStatus = await getStudentStampStatus(studentId);

  return {
    success: true,
    message: `${club.name} 스탬프를 획득했습니다!`,
    overall_mission_clear: updatedStatus.overall_mission_clear
  };
}

// Vercel KV를 사용하도록 수정 (async 함수)
async function getStudentStampStatus(studentId) {
  const studentStampKey = `stamps_${studentId}`;
  const stamps = await kv.get(studentStampKey) || {};
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
    allClubs: clubs.map(club => ({ id: club.id, name: club.name, location: club.location, stamped: stampedClubIds.includes(club.id) }))
  };
}



// 모든 학생의 스탬프 데이터를 가져오는 함수

async function getAllStudentStamps() {

  const studentStampKeys = [];

  // 'stamps_' 접두사를 가진 모든 키를 스캔합니다.

  for await (const key of kv.scanIterator({ match: 'stamps_*' })) {

    studentStampKeys.push(key);

  }

  if (studentStampKeys.length === 0) {

    return [];

  }

  // 모든 키에 해당하는 데이터를 한 번에 가져옵니다.

  const allStampsData = await kv.mget(...studentStampKeys);

  return allStampsData.map((stamps, index) => ({

    studentId: studentStampKeys[index].replace('stamps_', ''),

    stamps: stamps || {}

  }));

}



// 관리자용 통계 데이터를 계산하는 함수

async function getAdminStats() {

  const allStudentData = await getAllStudentStamps();

  const totalParticipants = allStudentData.length;

  let totalStamps = 0;

  let missionCompleters = 0;



  allStudentData.forEach(student => {

    const stampedClubIds = Object.keys(student.stamps);

    totalStamps += stampedClubIds.length;



    const 본관_stamps = clubs.filter(c => c.location === '본관' && stampedClubIds.includes(c.id)).length;

    const 후관_stamps = clubs.filter(c => c.location === '후관' && stampedClubIds.includes(c.id)).length;



    if (본관_stamps >= 5 && 후관_stamps >= 3) {

      missionCompleters++;

    }

  });



  return { totalParticipants, totalStamps, missionCompleters };

}



// 모든 학생의 현황 정보를 가져오는 함수

async function getAllStudentStatus() {

  const allStudentData = await getAllStudentStamps();

  const allStatus = allStudentData.map(student => {

    const stampedClubIds = Object.keys(student.stamps);

    const 본관_stamps = clubs.filter(c => c.location === '본관' && stampedClubIds.includes(c.id)).length;

    const 후관_stamps = clubs.filter(c => c.location === '후관' && stampedClubIds.includes(c.id)).length;

    const mission_clear = 본관_stamps >= 5 && 후관_stamps >= 3;



    return {

      studentId: student.studentId,

      totalStamps: stampedClubIds.length,

      missionClear: mission_clear,

    };

  });



  return allStatus;

}



module.exports = {

  validateStudent,

  getClubs,

  recordStampByQrCode,

  getStudentStampStatus,

  getAllStudentStamps, // for admin

  getAdminStats,       // for admin

    getAllStudentStatus, // for admin

    manageStamp,         // for admin

  };

  

  // 스탬프를 수동으로 관리하는 함수 (추가/삭제)

  async function manageStamp(studentId, clubId, action) {

    const studentStampKey = `stamps_${studentId}`;

    const currentStamps = await kv.get(studentStampKey) || {};

  

    if (action === 'add') {

      currentStamps[clubId] = true;

    } else if (action === 'remove') {

      delete currentStamps[clubId];

    } else {

      return { success: false, message: 'Invalid action' };

    }

  

    await kv.set(studentStampKey, currentStamps);

    return { success: true, updatedStamps: currentStamps };

  }

  
