const studentsData = require('./club-stamp-rally.json');
const students = studentsData.map(s => ({ ...s, studentId: String(s.studentId) }));

const clubs = [
  { id: 'club1', name: '과학 탐구반', location: '후관' },
  { id: 'club2', name: '미술 창작반', location: '후관' },
  { id: 'club3', name: '음악 밴드부', location: '후관' },
  { id: 'club4', name: '독서 토론반', location: '후관' },
  { id: 'club5', name: '코딩 동아리', location: '후관' },
  { id: 'club6', name: '역사 연구반', location: '후관' },
  { id: 'club7', name: '영화 감상반', location: '후관' },
  { id: 'club8', name: '사진 동아리', location: '후관' },
  { id: 'club9', name: '요리 동아리', location: '후관' },
  { id: 'club10', name: '댄스 동아리', location: '후관' },
  { id: 'club11', name: '축구 동아리', location: '본관' },
  { id: 'club12', name: '농구 동아리', location: '본관' },
  { id: 'club13', name: '배드민턴 동아리', location: '본관' },
  { id: 'club14', name: '탁구 동아리', location: '본관' },
  { id: 'club15', name: '만화 애니반', location: '본관' },
  { id: 'club16', name: '글쓰기 동아리', location: '본관' },
  { id: 'club17', name: '봉사 동아리', location: '본관' },
  { id: 'club18', name: '환경 보호반', location: '본관' },
  { id: 'club19', name: '경제 연구반', location: '본관' },
  { id: 'club20', name: '시사 토론반', location: '본관' },
  { id: 'club21', name: '로봇 제작반', location: '본관' },
  { id: 'club22', name: '드론 연구반', location: '본관' },
  { id: 'club23', name: '천문 관측반', location: '본관' },
  { id: 'club24', name: '패션 디자인반', location: '본관' },
  { id: 'club25', name: '뮤지컬 동아리', location: '본관' },
];

// In-memory storage for student stamps
const studentStamps = {}; // { 'studentId': { 'clubId': true, ... } }

function validateStudent(studentId, password) {
  const student = students.find(s => s.studentId === studentId && s.password === password);
  return !!student;
}

function getClubs() {
  return clubs;
}

function recordStamp(studentId, clubId) {
  if (!studentStamps[studentId]) {
    studentStamps[studentId] = {};
  }
  studentStamps[studentId][clubId] = true;
  return true;
}

function getStudentStampStatus(studentId) {
  const stamps = studentStamps[studentId] || {};
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

module.exports = {
  validateStudent,
  getClubs,
  recordStamp,
  getStudentStampStatus,
};
