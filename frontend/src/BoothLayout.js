import React, { useState } from 'react';
import './BoothLayout.css';

// 학교 건물 구조 데이터
const schoolLayout = {
  후관: [
    {
      floor: "3층",
      rooms: [
        { name: "도서관활용실", type: "special" },
        { name: "도서실", type: "special" },
        { name: "계단", type: "facility" },
        { name: "컴퓨터실", type: "special" },
        { name: "서버실", type: "facility" }
      ]
    },
    {
      floor: "2층",
      rooms: [
        { name: "1-1", type: "classroom" },
        { name: "1-2", type: "classroom" },
        { name: "1-3", type: "classroom" },
        { name: "계단", type: "facility" },
        { name: "1-4", type: "classroom" },
        { name: "1학년교무실", type: "teacher" }
      ]
    },
    {
      floor: "1층",
      rooms: [
        { name: "1-5", type: "classroom" },
        { name: "1-6", type: "classroom" },
        { name: "1-7", type: "classroom" },
        { name: "계단", type: "facility" },
        { name: "수리과학부", type: "teacher" },
        { name: "생물실", type: "special" }
      ]
    }
  ],
  본관: [
    {
      floor: "4층",
      rooms: [
        { name: "3-8", type: "classroom" },
        { name: "3-7", type: "classroom" },
        { name: "3-6", type: "classroom" },
        { name: "3-5", type: "classroom" },
        { name: "계단", type: "facility" },
        { name: "3학년교무실", type: "teacher" },
        { name: "3-4", type: "classroom" },
        { name: "3-3", type: "classroom" },
        { name: "3-2", type: "classroom" },
        { name: "계단", type: "facility" },
        { name: "3-1", type: "classroom" },
        { name: "수학실", type: "special" }
      ]
    },
    {
      floor: "3층",
      rooms: [
        { name: "계단", type: "facility" },
        { name: "3-9", type: "classroom" },
        { name: "3-10", type: "classroom" },
        { name: "2-7", type: "classroom" },
        { name: "2-6", type: "classroom" },
        { name: "계단", type: "facility" },
        { name: "2-5", type: "classroom" },
        { name: "2-4", type: "classroom" },
        { name: "2-3", type: "classroom" },
        { name: "2-2", type: "classroom" },
        { name: "계단", type: "facility" },
        { name: "2-1", type: "classroom" },
        { name: "2학년교무실", type: "teacher" }
      ]
    },
    {
      floor: "2층",
      rooms: [
        { name: "계단", type: "facility" },
        { name: "영어실", type: "special" },
        { name: "보건실", type: "facility" },
        { name: "교육협의실", type: "teacher" },
        { name: "본교무실", type: "teacher" },
        { name: "계단", type: "facility" },
        { name: "진로상담", type: "teacher" },
        { name: "2-10", type: "classroom" },
        { name: "2-9", type: "classroom" },
        { name: "계단", type: "facility" },
        { name: "2-8", type: "classroom" }
      ]
    },
    {
      floor: "1층",
      rooms: [
        { name: "계단", type: "facility" },
        { name: "통합지원1", type: "special" },
        { name: "통합지원2", type: "special" },
        { name: "교장실", type: "teacher" },
        { name: "행정실", type: "teacher" },
        { name: "계단", type: "facility" },
        { name: "화학실", type: "special" },
        { name: "물리실", type: "special" },
        { name: "미술준비실", type: "facility" },
        { name: "계단", type: "facility" },
        { name: "서고", type: "facility" }
      ]
    }
  ],
  기타: [
    {
      floor: "운동장/별관",
      rooms: [
        { name: "운동장", type: "outdoor" },
        { name: "체육관", type: "special" },
        { name: "급식실", type: "facility" }
      ]
    }
  ]
};

// 동아리 배치 정보
const clubLocations = {
  "2-4": ["mRNA"],
  "물리실": ["가피"],
  "2-10": ["개척"],
  "영어실": ["국과수"],
  "2-2": ["그대의 말로"],
  "도서실": ["그루터기"], // 도서관 -> 도서실
  "2-1": ["글로벌리더십"],
  "2-5": ["나라사랑"],
  "1-4": ["내꿈찾아삼만리"],
  "2-7": ["농구부"],
  "1-3": ["대중문화탐구부"],
  "2-8": ["독수공방"],
  "3-10": ["또래상담"],
  "2-3": ["레드타이"],
  "생물실": ["바이오홀릭"],
  "2-6": ["방송부"],
  "1-1": ["생각의판"],
  "컴퓨터실": ["아이러닝"],
  "2-9": ["아크매틱"],
  "화학실": ["에코"],
  "통합지원1": ["여가활용부"], // 통합지원실 -> 통합지원1
  "1-6": ["역사랑"],
  "1-2": ["정치언론부"],
  "1-5": ["축구부"],
  "1-7": ["화생방"]
};

function BoothLayout() {
  const [activeBuilding, setActiveBuilding] = useState('본관');

  return (
    <div className="booth-layout-container">
      <div className="building-tabs">
        {Object.keys(schoolLayout).map(building => (
          <button
            key={building}
            className={`building-tab ${activeBuilding === building ? 'active' : ''}`}
            onClick={() => setActiveBuilding(building)}
          >
            {building}
          </button>
        ))}
      </div>

      <div className="floor-plan-container">
        {schoolLayout[activeBuilding].map((floorData, index) => (
          <div key={index} className="floor-section">
            <h3 className="floor-title">{floorData.floor}</h3>
            <div className="room-grid">
              {floorData.rooms.map((room, rIndex) => {
                const clubs = clubLocations[room.name] || [];
                return (
                  <div key={rIndex} className={`room-item type-${room.type} ${clubs.length > 0 ? 'has-club' : ''}`}>
                    <div className="room-name">{room.name}</div>
                    {clubs.length > 0 && (
                      <div className="room-clubs">
                        {clubs.map((club, cIndex) => (
                          <span key={cIndex} className="club-badge">{club}</span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      
      <div className="layout-info">
        <p>📢 <strong>동아리 위치 찾기</strong></p>
        <p>파란색 뱃지가 붙은 곳이 동아리 부스입니다.</p>
      </div>
    </div>
  );
}

export default BoothLayout;