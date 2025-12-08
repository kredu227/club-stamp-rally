import React, { useState } from 'react';
import './BoothLayout.css';

// 학교 건물 구조 데이터 (구역 중심 재설계)
// ratio: 해당 구역이 차지하는 가로 비율 (Flex grow 값)
const schoolLayout = {
  후관: [
    {
      floor: "3층",
      sections: [
        { type: "rooms", ratio: 2, rooms: [{ name: "서버실", type: "facility" }, { name: "컴퓨터실", type: "special" }] },
        { type: "stairs" },
        { type: "rooms", ratio: 3, rooms: [{ name: "도서실", type: "special" }, { name: "도서관활용실", type: "special" }] }
      ]
    },
    {
      floor: "2층",
      sections: [
        { type: "rooms", ratio: 3, rooms: [{ name: "1-1", type: "classroom" }, { name: "1-2", type: "classroom" }, { name: "1-3", type: "classroom" }] },
        { type: "stairs" },
        // 1학년교무실 삭제됨 -> 1-4가 남은 공간을 모두 채움
        { type: "rooms", ratio: 2, rooms: [{ name: "1-4", type: "classroom" }] }
      ]
    },
    {
      floor: "1층",
      sections: [
        { type: "rooms", ratio: 3, rooms: [{ name: "1-5", type: "classroom" }, { name: "1-6", type: "classroom" }, { name: "1-7", type: "classroom" }] },
        { type: "stairs" },
        { type: "rooms", ratio: 2, rooms: [{ name: "수리과학부", type: "teacher" }, { name: "생물실", type: "special" }] }
      ]
    }
  ],
  본관: [
    {
      floor: "3층",
      sections: [
        { type: "stairs" },
        { type: "rooms", ratio: 4, rooms: [{ name: "3-9", type: "classroom" }, { name: "3-10", type: "classroom" }, { name: "2-7", type: "classroom" }, { name: "2-6", type: "classroom" }] },
        { type: "stairs" },
        { type: "rooms", ratio: 4, rooms: [{ name: "2-5", type: "classroom" }, { name: "2-4", type: "classroom" }, { name: "2-3", type: "classroom" }, { name: "2-2", type: "classroom" }] },
        { type: "stairs" },
        // 2학년교무실 삭제됨
        { type: "rooms", ratio: 1, rooms: [{ name: "2-1", type: "classroom" }] }
      ]
    },
    {
      floor: "2층",
      sections: [
        { type: "stairs" },
        { type: "rooms", ratio: 4, rooms: [{ name: "영어실", type: "special" }, { name: "보건실", type: "facility" }, { name: "교육협의실", type: "teacher" }, { name: "본교무실", type: "teacher" }] },
        { type: "stairs" },
        { type: "rooms", ratio: 4, rooms: [{ name: "진로상담", type: "teacher" }, { name: "2-10", type: "classroom" }, { name: "2-9", type: "classroom" }] },
        { type: "stairs" },
        { type: "rooms", ratio: 1, rooms: [{ name: "2-8", type: "classroom" }] }
      ]
    },
    {
      floor: "1층",
      sections: [
        { type: "stairs" },
        { type: "rooms", ratio: 4, rooms: [{ name: "통합지원1", type: "special" }, { name: "통합지원2", type: "special" }, { name: "교장실", type: "teacher" }, { name: "행정실", type: "teacher" }] },
        { type: "stairs" },
        // 미술준비실 삭제됨
        { type: "rooms", ratio: 4, rooms: [{ name: "화학실", type: "special" }, { name: "물리실", type: "special" }] },
        { type: "stairs" },
        // 서고 삭제됨 -> 빈 공간이지만 너비(ratio 1)는 유지하여 층별 길이 맞춤
        { type: "rooms", ratio: 1, rooms: [] }
      ]
    }
  ],
  기타: [
    {
      floor: "운동장/별관",
      sections: [
        { type: "rooms", ratio: 1, rooms: [{ name: "운동장", type: "outdoor" }, { name: "체육관", type: "special" }, { name: "급식실", type: "facility" }] }
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
  "2-2": ["그대의말로"],
  "도서실": ["그루터기"],
  "2-1": ["글로벌리더십"],
  "2-5": ["나라사랑"],
  "1-4": ["내꿈찾아삼만리"],
  "2-7": ["농구부"],
  "1-3": ["대중문화탐구"],
  "2-8": ["독수공방"],
  "3-10": ["또래상담"],
  "2-3": ["레드타이"],
  "생물실": ["BIOHOLIC"],
  "2-6": ["방송부"],
  "1-1": ["생각의판"],
  "컴퓨터실": ["아이러닝"],
  "2-9": ["아크매틱"],
  "화학실": ["에코"],
  "통합지원1": ["여가활용부"],
  "1-6": ["역사랑"],
  "1-2": ["정치언론부"],
  "1-5": ["축구부"],
  "운동장": ["축구부"],
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

        {schoolLayout[activeBuilding].map((floorData, floorIndex) => (

          <div key={floorIndex} className="floor-row">

            <div className="floor-label">

              <div>{floorData.floor.replace('층', '')}</div>

              <div>층</div>

            </div>

            <div className="floor-content">

              {floorData.sections.map((section, secIndex) => {

                if (section.type === 'stairs') {

                  return <div key={secIndex} className="stairs-section">계단</div>;

                }



                return (

                  <div

                    key={secIndex}

                    className="rooms-section"

                    style={{ flex: section.ratio }}

                  >

                    {section.rooms.length > 0 ? (

                      section.rooms.map((room, rIndex) => {

                        const clubs = clubLocations[room.name] || [];

                        const hasClubs = clubs.length > 0;

                        return (

                          <div key={rIndex} className={`room-item type-${room.type} ${hasClubs ? 'has-club' : 'no-club'}`}>

                            <div className="room-name">{room.name}</div>

                            {hasClubs && (

                              <div className="room-clubs">

                                {clubs.map((club, cIndex) => (

                                  <span key={cIndex} className="club-badge">{club}</span>

                                ))}

                              </div>

                            )}

                          </div>

                        );

                      })

                    ) : (

                      // 방이 없는 빈 섹션 (너비 유지를 위한 Spacer)

                      <div className="empty-spacer"></div>

                    )}

                  </div>

                );

              })}

            </div>

          </div>

        ))}

      </div>



      {/* 하단 설명 제거됨 */}

    </div>

  );

}

export default BoothLayout;