export type DayOfWeek = '월요일' | '화요일' | '수요일' | '목요일' | '금요일';

export interface CleaningZone {
  id: string;
  name: string;
  description: string;
  iconName: string; // Lucide icon identifier
}

export interface WeeklyAssignment {
  id: string; // zoneId_dayOfWeek
  zoneId: string;
  dayOfWeek: DayOfWeek;
  students: string[]; // List of student names assigned
}

export interface CleaningNotice {
  id: string;
  content: string;
  updatedAt: string;
  author: string;
}

export interface DailyCompletion {
  id: string; // dateStr_zoneId
  date: string; // YYYY-MM-DD
  zoneId: string;
  completed: boolean;
  completedAt?: string;
  completedBy?: string; // Student name who checked in
  selfChecklistChecked?: boolean;
  peerReviewer?: string;
  satisfactionScore?: number;
}

export type UserRole = 'STUDENT' | 'TEACHER';

export interface CleaningStats {
  zoneId: string;
  completionCount: number;
  totalDays: number;
}
