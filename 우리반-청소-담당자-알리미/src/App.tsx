import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Shield, 
  User, 
  Lock, 
  Unlock, 
  Calendar, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  deleteDoc, 
  query, 
  where, 
  getDocs 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';

import { 
  CleaningZone, 
  WeeklyAssignment, 
  DailyCompletion, 
  DayOfWeek, 
  CleaningNotice, 
  UserRole 
} from './types';

import { 
  defaultZones, 
  defaultNotice, 
  defaultStudents, 
  generateDefaultAssignments 
} from './defaultData';

import { NoticeBoard } from './components/NoticeBoard';
import { TodayStatus } from './components/TodayStatus';
import { WeeklySchedule } from './components/WeeklySchedule';
import { AssignmentEditor } from './components/AssignmentEditor';
import { Gamification } from './components/Gamification';

export default function App() {
  // 1. Core States
  const [role, setRole] = useState<UserRole>('STUDENT');
  const [isTeacherLocked, setIsTeacherLocked] = useState(true);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [teacherPin, setTeacherPin] = useState<string>('1234');

  const [zones, setZones] = useState<CleaningZone[]>([]);
  const [assignments, setAssignments] = useState<WeeklyAssignment[]>([]);
  const [notice, setNotice] = useState<CleaningNotice>({ id: '', content: '', updatedAt: '', author: '' });
  const [studentsList, setStudentsList] = useState<string[]>([]);
  
  // Date-related states
  const [todayDateStr, setTodayDateStr] = useState<string>(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const date = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${date}`;
  });
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(() => {
    const today = new Date();
    const days: string[] = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    const currentDayName = days[today.getDay()];
    if (currentDayName === '일요일' || currentDayName === '토요일' || !currentDayName) {
      return '월요일';
    }
    return currentDayName as DayOfWeek;
  });
  const [completions, setCompletions] = useState<DailyCompletion[]>([]);

  // 2. Initialize and Load from Firestore with Real-time synchronization
  useEffect(() => {
    // A. Listen to config settings
    const unsubSettings = onSnapshot(doc(db, 'config', 'settings'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.teacherPin) setTeacherPin(data.teacherPin);
        if (data.studentsList) setStudentsList(data.studentsList);
      } else {
        // First-time setup bootstrap for settings
        setDoc(doc(db, 'config', 'settings'), {
          teacherPin: '1234',
          studentsList: defaultStudents
        }).catch((err) => handleFirestoreError(err, OperationType.WRITE, 'config/settings'));
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'config/settings');
    });

    // B. Listen to notice board
    const unsubNotice = onSnapshot(doc(db, 'notices', 'current'), (snapshot) => {
      if (snapshot.exists()) {
        setNotice(snapshot.data() as CleaningNotice);
      } else {
        setDoc(doc(db, 'notices', 'current'), defaultNotice).catch((err) =>
          handleFirestoreError(err, OperationType.WRITE, 'notices/current')
        );
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'notices/current');
    });

    // C. Listen to cleaning zones
    const unsubZones = onSnapshot(collection(db, 'zones'), (snapshot) => {
      if (!snapshot.empty) {
        const loadedZones: CleaningZone[] = [];
        snapshot.forEach((doc) => {
          loadedZones.push({ id: doc.id, ...doc.data() } as CleaningZone);
        });
        setZones(loadedZones);
      } else {
        // First-time setup bootstrap for zones
        defaultZones.forEach((zone) => {
          setDoc(doc(db, 'zones', zone.id), zone).catch((err) =>
            handleFirestoreError(err, OperationType.WRITE, `zones/${zone.id}`)
          );
        });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'zones');
    });

    // D. Listen to weekly assignments
    const unsubAssignments = onSnapshot(collection(db, 'assignments'), (snapshot) => {
      if (!snapshot.empty) {
        const loadedAssignments: WeeklyAssignment[] = [];
        snapshot.forEach((doc) => {
          loadedAssignments.push({ id: doc.id, ...doc.data() } as WeeklyAssignment);
        });
        setAssignments(loadedAssignments);
      } else {
        // First-time setup bootstrap for assignments
        const initialAssignments = generateDefaultAssignments();
        initialAssignments.forEach((assign) => {
          setDoc(doc(db, 'assignments', assign.id), assign).catch((err) =>
            handleFirestoreError(err, OperationType.WRITE, `assignments/${assign.id}`)
          );
        });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'assignments');
    });

    // E. Listen to completions for *this specific date*
    const q = query(collection(db, 'completions'), where('date', '==', todayDateStr));
    const unsubCompletions = onSnapshot(q, (snapshot) => {
      const loadedCompletions: DailyCompletion[] = [];
      snapshot.forEach((doc) => {
        loadedCompletions.push({ id: doc.id, ...doc.data() } as DailyCompletion);
      });
      setCompletions(loadedCompletions);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'completions');
    });

    return () => {
      unsubSettings();
      unsubNotice();
      unsubZones();
      unsubAssignments();
      unsubCompletions();
    };
  }, [todayDateStr]);

  // 3. State update helpers (with Firestore synchronization)
  const handleUpdateNotice = async (content: string) => {
    try {
      const nextNotice: CleaningNotice = {
        id: `notice_${Date.now()}`,
        content,
        updatedAt: new Date().toISOString(),
        author: '담임 선생님'
      };
      await setDoc(doc(db, 'notices', 'current'), nextNotice);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'notices/current');
    }
  };

  const handleToggleCompletion = async (
    zoneId: string, 
    completed: boolean, 
    completedBy?: string,
    selfChecklistChecked?: boolean,
    peerReviewer?: string,
    satisfactionScore?: number
  ) => {
    const docId = `${todayDateStr}_${zoneId}`;
    try {
      if (!completed) {
        await deleteDoc(doc(db, 'completions', docId));
      } else {
        await setDoc(doc(db, 'completions', docId), {
          id: docId,
          date: todayDateStr,
          zoneId,
          completed,
          completedBy: completedBy || '',
          completedAt: new Date().toISOString(),
          selfChecklistChecked: selfChecklistChecked || false,
          peerReviewer: peerReviewer || '',
          satisfactionScore: satisfactionScore || 5
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `completions/${docId}`);
    }
  };

  // Add a new zone
  const handleAddZone = async (name: string, description: string, iconName: string) => {
    const zoneId = `zone_${Date.now()}`;
    try {
      const newZone: CleaningZone = {
        id: zoneId,
        name,
        description,
        iconName
      };
      await setDoc(doc(db, 'zones', zoneId), newZone);

      // Initialize weekly empty assignments for the new zone
      const weekdays: DayOfWeek[] = ['월요일', '화요일', '수요일', '목요일', '금요일'];
      for (const day of weekdays) {
        const assignId = `${zoneId}_${day}`;
        await setDoc(doc(db, 'assignments', assignId), {
          id: assignId,
          zoneId,
          dayOfWeek: day,
          students: []
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `zones/${zoneId}`);
    }
  };

  // Delete an existing zone
  const handleDeleteZone = async (zoneId: string) => {
    try {
      await deleteDoc(doc(db, 'zones', zoneId));

      // Remove assignments related to this zone
      const weekdays: DayOfWeek[] = ['월요일', '화요일', '수요일', '목요일', '금요일'];
      for (const day of weekdays) {
        await deleteDoc(doc(db, 'assignments', `${zoneId}_${day}`));
      }

      // Clean up daily completions for this zone
      await deleteDoc(doc(db, 'completions', `${todayDateStr}_${zoneId}`));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `zones/${zoneId}`);
    }
  };

  // Update a single weekly assignment cell
  const handleUpdateAssignment = async (zoneId: string, day: DayOfWeek, students: string[]) => {
    const assignId = `${zoneId}_${day}`;
    try {
      await setDoc(doc(db, 'assignments', assignId), {
        id: assignId,
        zoneId,
        dayOfWeek: day,
        students
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `assignments/${assignId}`);
    }
  };

  // Update entire students list
  const handleUpdateStudentsList = async (newStudents: string[]) => {
    try {
      await setDoc(doc(db, 'config', 'settings'), {
        studentsList: newStudents
      }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'config/settings');
    }
  };

  const handleUpdateTeacherPin = async (newPin: string) => {
    try {
      await setDoc(doc(db, 'config', 'settings'), {
        teacherPin: newPin
      }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'config/settings');
    }
  };

  // Reset entire day completion
  const handleResetAllCompletions = async () => {
    if (window.confirm('오늘의 모든 구역 청소 완료 상태를 초기화하시겠습니까?')) {
      try {
        for (const completion of completions) {
          await deleteDoc(doc(db, 'completions', completion.id));
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, 'completions');
      }
    }
  };

  // Teacher password auth
  const handleVerifyTeacherPIN = () => {
    if (pinInput === teacherPin) {
      setRole('TEACHER');
      setIsTeacherLocked(false);
      setShowPinModal(false);
      setPinError(false);
      setPinInput('');
    } else {
      setPinError(true);
      setPinInput('');
    }
  };

  const handleLockTeacherMode = () => {
    setRole('STUDENT');
    setIsTeacherLocked(true);
  };

  // Generate date display text
  const getFormattedTodayText = () => {
    if (!todayDateStr) return '';
    const dateObj = new Date(todayDateStr);
    const dayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    return `${dateObj.getFullYear()}년 ${dateObj.getMonth() + 1}월 ${dateObj.getDate()}일 ${dayNames[dateObj.getDay()]}`;
  };

  return (
    <div id="app-root-container" className="min-h-screen bg-[#f8fafc] text-slate-900 pb-16 selection:bg-indigo-500/15 selection:text-indigo-900">
      
      {/* Top Banner & Header */}
      <header className="bg-white border-b border-slate-100 shadow-2xs sticky top-0 z-40 backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-black text-slate-900 tracking-tight leading-none">우리반 청소 담당자 알리미</h1>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-0.5">실시간 구역 확인 및 청소 확인 서비스</p>
            </div>
          </div>

          {/* Role selection switcher */}
          <div className="flex items-center gap-2">
            {role === 'STUDENT' ? (
              <button
                id="btn-teacher-lock"
                onClick={() => setShowPinModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 hover:bg-indigo-100/70 text-indigo-700 transition-all border border-indigo-100 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                선생님 모드
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-lg text-[11px] font-bold border border-emerald-100 flex items-center gap-1">
                  <Unlock className="w-3 h-3 text-emerald-600" />
                  선생님 모드 활성화됨
                </span>
                <button
                  id="btn-lock-teacher"
                  onClick={handleLockTeacherMode}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="선생님 모드 종료"
                >
                  <Lock className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-8 space-y-6 sm:space-y-8">
        
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 md:p-6 rounded-3xl border border-slate-100 shadow-3xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-full text-[10px] font-extrabold">ONLINE STATUS</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">오늘 우리반 청소 상태는 어떤가요?</h2>
            <p className="text-xs md:text-sm text-slate-500 font-medium">요일별로 배정된 구역의 청소를 마치고 완료를 기록해 주세요.</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl text-right">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">TODAY DATE</span>
              <span className="text-xs md:text-sm font-bold text-slate-700">{getFormattedTodayText()}</span>
            </div>
            {role === 'TEACHER' && (
              <button
                id="btn-reset-completions"
                onClick={handleResetAllCompletions}
                className="p-3 bg-white border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-2xl shadow-3xs transition-all flex items-center justify-center"
                title="오늘의 모든 청소 완료 상태 초기화"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Main 12-Column Responsive Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Realtime Notices & Gamification Statistics (col-span-4) */}
          <div className="lg:col-span-4 space-y-6">
            <NoticeBoard 
              notice={notice} 
              role={role} 
              onUpdateNotice={handleUpdateNotice} 
            />
            <Gamification 
              completions={completions} 
              zones={zones} 
            />
          </div>

          {/* Right Column: Active Interactive Checklists & Schedules (col-span-8) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Today's Cleaning status and Zone Cards */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">오늘의 청소 현황 ({selectedDay})</h2>
                  <p className="text-xs text-slate-500">지정된 담당 구역을 성실히 청소합시다.</p>
                </div>
              </div>
              <TodayStatus 
                zones={zones}
                assignments={assignments}
                completions={completions}
                selectedDay={selectedDay}
                onSelectDay={setSelectedDay}
                role={role}
                onToggleCompletion={handleToggleCompletion}
                studentsList={studentsList}
              />
            </div>

            {/* Weekly Schedule Matrix */}
            <WeeklySchedule 
              zones={zones}
              assignments={assignments}
              selectedDay={selectedDay}
              onSelectDay={setSelectedDay}
              studentsList={studentsList}
              onUpdateAssignment={handleUpdateAssignment}
            />
          </div>
        </div>

        {/* Teacher/Admin Assignment & Zone Editor (rendered only when role is TEACHER) */}
        {role === 'TEACHER' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-4"
          >
            <AssignmentEditor 
              zones={zones}
              assignments={assignments}
              studentsList={studentsList}
              onAddZone={handleAddZone}
              onDeleteZone={handleDeleteZone}
              onUpdateAssignment={handleUpdateAssignment}
              onUpdateStudentsList={handleUpdateStudentsList}
              teacherPin={teacherPin}
              onUpdateTeacherPin={handleUpdateTeacherPin}
            />
          </motion.div>
        )}
      </main>

      {/* Premium Bottom Status Bar (High Density Theme) */}
      <footer className="mt-16 bg-slate-900 text-slate-400 text-[10px] py-4 px-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-2">
        <div className="flex flex-wrap gap-4 items-center justify-center md:justify-start">
          <span className="flex items-center gap-1.5 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            서버 상태: 실시간 동기화 중
          </span>
          <span>● 마지막 업데이트: {new Date().toLocaleTimeString('ko-KR')}</span>
          <span>● 우리반 명단 수: {studentsList.length}명</span>
        </div>
        <div className="flex gap-2 uppercase tracking-tighter">
          <span>Privacy Policy</span>
          <span>•</span>
          <span>Support Team</span>
          <span>•</span>
          <span>© 2026 SchoolClean Manager</span>
        </div>
      </footer>

      {/* PIN Password Verification Dialog */}
      <AnimatePresence>
        {showPinModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl border border-slate-150 shadow-2xl w-full max-w-sm overflow-hidden"
            >
              <div className="bg-indigo-600 text-white p-5 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-indigo-200" />
                  <span className="font-bold text-base">선생님 본인 인증</span>
                </div>
                <button 
                  onClick={() => {
                    setShowPinModal(false);
                    setPinError(false);
                    setPinInput('');
                  }}
                  className="p-1 text-indigo-200 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-1 text-slate-600 text-xs leading-normal">
                  <p className="font-bold text-slate-700">비밀번호(인증번호)를 입력하세요.</p>
                  <p>교실 배정표를 편집하려면 권한 인증이 필요합니다.</p>
                  <p className="text-slate-400 text-[10px] mt-1">※ 최초 설정된 기본 비밀번호는 '1234'입니다.</p>
                </div>

                <div className="space-y-2">
                  <input
                    id="teacher-pin-input"
                    type="password"
                    maxLength={4}
                    value={pinInput}
                    onChange={(e) => {
                      setPinInput(e.target.value.replace(/[^0-9]/g, ''));
                      setPinError(false);
                    }}
                    placeholder="••••"
                    className="w-full text-center text-2xl tracking-widest p-3 bg-slate-50 border-2 border-slate-200 focus:border-indigo-500 rounded-xl outline-hidden transition-all font-mono"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleVerifyTeacherPIN();
                    }}
                  />
                  {pinError && (
                    <p className="text-xs text-rose-500 font-bold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      인증번호가 올바르지 않습니다. 다시 입력해 주세요.
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-slate-50 p-5 flex justify-end gap-2.5 border-t border-slate-100">
                <button
                  id="btn-pin-cancel"
                  onClick={() => {
                    setShowPinModal(false);
                    setPinError(false);
                    setPinInput('');
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-500 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
                >
                  취소
                </button>
                <button
                  id="btn-pin-submit"
                  onClick={handleVerifyTeacherPIN}
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all"
                >
                  인증하기
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
