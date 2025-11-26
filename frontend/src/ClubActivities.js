import React from 'react';
import './ClubActivities.css';

const activities = [
  { name: "mRNA", description: "화학정원 만들기, 딸기 DNA 추출하기, 생명과학 관련 퀴즈, 호르몬 표적기관 다트 던지기" },
  { name: "가피", description: "환경을 생각하는 물리 실험 및 체험" },
  { name: "개척", description: "가짜뉴스 판별 퀴즈, 트롤리 문제 텔레파시 게임, 창의적 문제해결 챌린지" },
  { name: "국과수", description: "과목의 경계를 넘나드는 융합의 힘 지식의 롤러코스터로 즐기는 모험" },
  { name: "그대의 말로", description: "문인 스무고개와 IF결말" },
  { name: "그루터기", description: "::AI와 창의활동을 결합한 놀이·공예·퀴즈·사진·문장 만들기 체험 활동" },
  { name: "글로벌리더십", description: "생리통 견디며 미션수행, 쓰레기 농구, 식용곤충 도전하기" },
  { name: "나라사랑", description: "군번줄 만들기(전사의 표식), 사격(탕탕특공대), 포토존(사전체험), 경쟁(최후의 1인)" },
  { name: "내꿈찾아삼만리", description: "직업 활동 중 일어날 수 있는 일들을 체험하기, 대한민국 진로 장소 소개하기" },
  { name: "농구부", description: "미니 농구대에 슛을 넣는 미니게임 진행" },
  { name: "대중문화탐구부", description: "음악/게임/영화/애니메이션 4팀 체험부스" },
  { name: "독수공방", description: "수학으로 즐기는 다양한 체험과 먹을거리" },
  { name: "또래상담", description: "펑펑!! 힐링 부스 : 스트레스 해소를 위한 풍선 터트리기 및 힐링 향수 만들기" },
  { name: "레드타이", description: "인생을 걸어라! 아슬아슬 게임이론 접목형 경제 오락실" },
  { name: "바이오홀릭", description: "1. 돌아온 다윈의 야추다이스 / 2. 박테리아 키링만들기 / 3. 블랙잭 / 4. 진행한 실험결과 및 과정 게시" },
  { name: "방송부", description: "타투 스티커 붙여주기 / 퍼스널 컬러 찾기 / 폴라로이드 사진 찍기 / AI를 활용하여 간단한 영상을 제작" },
  { name: "생각의판", description: "동아리 내 구비된 보드게임 및 자체 제작 보드게임 체험" },
  { name: "아이러닝", description: "파이썬, 유니티 기반 게임 및 반도체 공정 체험 활동" },
  { name: "아크매틱", description: "건축과 기계의 융합, 구조의 원리를 체험을 통해 깨우치는 창의적 공학 부스" },
  { name: "에코", description: "화학으로 쫓는 범죄 현장의 진실" },
  { name: "여가활용부", description: "좋은 글귀를 손글씨로 써서 전시" },
  { name: "역사랑", description: "역사퀴즈 방탈출 게임" },
  { name: "정치언론부", description: "정치시사 퀴즈 및 학생 주도형 카드 전략 게임 등 여가 체험 부스" },
  { name: "축구부", description: "킹오브 풋(연승으로 왕좌를 차지하라! 개인 참가 풋살 배틀)" },
  { name: "화생방", description: "화학, 생명과학 퀴즈 및 미니게임, 과학 실험 체험" }
];

function ClubActivities() {
  return (
    <div className="activities-container">
      <div className="activities-header">
        <h2>동아리별 활동 내용</h2>
      </div>
      <div className="activities-list">
        {activities.map((activity, index) => (
          <div key={index} className="activity-card">
            <div className="activity-name">{activity.name}</div>
            <div className="activity-description">{activity.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ClubActivities;