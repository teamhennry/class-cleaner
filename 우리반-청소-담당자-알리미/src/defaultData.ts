import { CleaningZone, WeeklyAssignment, DayOfWeek, CleaningNotice } from './types';

export const defaultStudents = [
  '김민준', '이서연', '박지훈', '최예은', '정우진',
  '강다현', '조현우', '윤서아', '장민서', '한지아',
  '임도현', '오지민', '신유진', '서건우', '권다은',
  '황현우', '안소희', '송민규', '유채원', '배주원'
];

export const defaultZones: CleaningZone[] = [
  {
    id: 'zone_classroom',
    name: '교실 내부',
    description: '바닥 쓸고 닦기, 책상 선 맞추기 및 의자 올리기',
    iconName: 'Home'
  },
  {
    id: 'zone_blackboard',
    name: '칠판 및 단상',
    description: '칠판 지우기, 분필가루 청소, 교탁 주변 정돈',
    iconName: 'Presentation'
  },
  {
    id: 'zone_windows',
    name: '창틀 및 유리',
    description: '창문 먼지 제거, 창틀 물걸레질, 환기 상태 확인',
    iconName: 'Grid'
  },
  {
    id: 'zone_recycling',
    name: '분리수거 및 쓰레기통',
    description: '재활용품 분류 배출, 일반 쓰레기봉투 교체',
    iconName: 'Trash2'
  },
  {
    id: 'zone_hallway',
    name: '복도 청소',
    description: '우리 교실 앞 복도 쓸고 닦기, 물걸레질',
    iconName: 'Sparkles'
  },
  {
    id: 'zone_lockers',
    name: '사물함 및 비품함',
    description: '사물함 위 먼지 제거, 청소 도구 정돈 및 도구함 청소',
    iconName: 'Archive'
  }
];

export const defaultNotice: CleaningNotice = {
  id: 'notice_1',
  content: '🧹 이번 주 금요일은 대청소의 날입니다! 각자 구역을 평소보다 더 꼼꼼히 청소해 주세요. 특히 창틀 먼지 제거에 신경 써주길 바랍니다. 완료 후 선생님께 꼭 확인받으세요! 😊',
  updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
  author: '담임 선생님'
};

const days: DayOfWeek[] = ['월요일', '화요일', '수요일', '목요일', '금요일'];

// Generate some balanced default weekly assignments using defaultStudents
export const generateDefaultAssignments = (): WeeklyAssignment[] => {
  const assignments: WeeklyAssignment[] = [];
  let studentIdx = 0;

  defaultZones.forEach((zone) => {
    days.forEach((day) => {
      // Pick 2-3 students for each zone/day
      const numStudents = zone.id === 'zone_classroom' || zone.id === 'zone_hallway' ? 3 : 2;
      const assigned: string[] = [];
      
      for (let i = 0; i < numStudents; i++) {
        assigned.push(defaultStudents[studentIdx % defaultStudents.length]);
        studentIdx++;
      }

      assignments.push({
        id: `${zone.id}_${day}`,
        zoneId: zone.id,
        dayOfWeek: day,
        students: assigned
      });
    });
  });

  return assignments;
};
