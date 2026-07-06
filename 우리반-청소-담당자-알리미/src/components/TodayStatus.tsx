import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  Circle, 
  UserCheck, 
  Sparkles, 
  X, 
  Calendar,
  AlertCircle,
  Star,
  Check,
  ThumbsUp,
  User,
  ShieldCheck,
  CheckSquare
} from 'lucide-react';
import { CleaningZone, WeeklyAssignment, DailyCompletion, DayOfWeek, UserRole } from '../types';
import { CleaningIcon } from './CleaningIcon';

interface TodayStatusProps {
  zones: CleaningZone[];
  assignments: WeeklyAssignment[];
  completions: DailyCompletion[];
  selectedDay: DayOfWeek;
  onSelectDay: (day: DayOfWeek) => void;
  role: UserRole;
  onToggleCompletion: (
    zoneId: string, 
    completed: boolean, 
    completedBy?: string,
    selfChecklistChecked?: boolean,
    peerReviewer?: string,
    satisfactionScore?: number
  ) => void;
  studentsList: string[];
}

export function TodayStatus({
  zones,
  assignments,
  completions,
  selectedDay,
  onSelectDay,
  role,
  onToggleCompletion,
  studentsList = [],
}: TodayStatusProps) {
  const [selectedZoneToComplete, setSelectedZoneToComplete] = useState<CleaningZone | null>(null);
  const [selectedStudentName, setSelectedStudentName] = useState<string>('');
  const [customStudentName, setCustomStudentName] = useState<string>('');
  
  // Interactive Self-Inspection states
  const [checkedItems, setCheckedItems] = useState<boolean[]>([false, false, false]);
  const [peerReviewer, setPeerReviewer] = useState<string>('');
  const [customPeerReviewer, setCustomPeerReviewer] = useState<string>('');
  const [satisfactionScore, setSatisfactionScore] = useState<number>(5);

  const weekdays: DayOfWeek[] = ['월요일', '화요일', '수요일', '목요일', '금요일'];

  const getCompletionForZone = (zoneId: string) => {
    return completions.find(c => c.zoneId === zoneId) || { completed: false, zoneId };
  };

  const getAssignmentForZoneAndDay = (zoneId: string, day: DayOfWeek) => {
    return assignments.find(a => a.zoneId === zoneId && a.dayOfWeek === day);
  };

  // Tailored inspection checklist generator based on Zone ID
  const getChecklistForZone = (zoneId: string, zoneName: string): string[] => {
    switch (zoneId) {
      case 'zone_classroom':
        return [
          '🧹 바닥에 쓰레기나 머리카락 하나 없이 깨끗하게 쓸었나요?',
          '🪑 책상 선을 반듯하게 맞추고 모든 의자를 책상 위로 올렸나요?',
          '🧺 교실 안 미니 쓰레기통을 깨끗이 비웠나요?'
        ];
      case 'zone_blackboard':
        return [
          '🧼 칠판 지우개의 분필가루를 깨끗이 털어내고 칠판 물걸레질을 마쳤나요?',
          '🧑‍🏫 분필 받침대를 깨끗이 닦고 분필들을 가지런히 정돈했나요?',
          '🧹 교탁 위의 먼지를 닦고 주변 바닥을 깔끔히 쓸었나요?'
        ];
      case 'zone_windows':
        return [
          '🪟 창문을 모두 잠그고 창틀의 수북한 먼지를 대걸레나 물티슈로 닦았나요?',
          '🌬️ 덥거나 냄새나는 실내 공기를 충분히 환기시켰나요?',
          '🫧 유리창에 묻은 거슬리는 얼룩이나 손자국을 지웠나요?'
        ];
      case 'zone_recycling':
        return [
          '♻️ 플라스틱, 캔, 종이가 한 곳에 섞이지 않게 철저하게 분류했나요?',
          '🗑️ 꽉 찬 일반 쓰레기봉투는 단단히 묶어서 지정된 배출 장소에 두었나요?',
          '🧼 분리수거함 주변 바닥에 떨어진 오염물과 얼룩을 대걸레로 닦았나요?'
        ];
      case 'zone_hallway':
        return [
          '🧹 우리 교실 앞 복도 전구간의 먼지와 부스러기들을 깨끗이 쓸었나요?',
          '🪣 복도를 물걸레로 정성스레 밀어 반짝반짝하게 물청소했나요?',
          '🚪 앞문과 뒷문 틈새 및 신발장 주변에 널브러진 먼지를 정리했나요?'
        ];
      case 'zone_lockers':
        return [
          '🗄️ 사물함 위의 수북한 먼지와 잡동사니들을 말끔하게 닦았나요?',
          '🧹 청소도구함 내부를 쓸고 빗자루와 대걸레를 세워 단정히 보관했나요?',
          '🧴 청소에 쓴 물걸레와 행주를 깨끗이 빨아 빨래걸이에 널었나요?'
        ];
      default:
        return [
          `🧹 ${zoneName} 구역 전체를 먼지 없이 말끔히 쓸고 닦았나요?`,
          '✨ 지저분하게 놓여 있는 비품과 물건들을 올바르게 제자리에 정돈했나요?',
          '💡 전기 절약을 위해 불을 끄고 창문이 다 닫혀 있는지 최종 점검했나요?'
        ];
    }
  };

  const handleOpenCompletionModal = (zone: CleaningZone) => {
    const assignment = getAssignmentForZoneAndDay(zone.id, selectedDay);
    setSelectedZoneToComplete(zone);
    if (assignment && assignment.students.length > 0) {
      setSelectedStudentName(assignment.students[0]);
    } else if (studentsList.length > 0) {
      setSelectedStudentName(studentsList[0]);
    } else {
      setSelectedStudentName('');
    }
    setCustomStudentName('');
    setCheckedItems([false, false, false]);
    setPeerReviewer('');
    setCustomPeerReviewer('');
    setSatisfactionScore(5);
  };

  const handleToggleCheckItem = (index: number) => {
    const updated = [...checkedItems];
    updated[index] = !updated[index];
    setCheckedItems(updated);
  };

  const handleSubmitCompletion = () => {
    if (!selectedZoneToComplete) return;
    const finalName = customStudentName.trim() || selectedStudentName;
    if (!finalName) return;

    // Must pass inspection checks to submit
    const allChecked = checkedItems.every(Boolean);
    if (!allChecked) {
      alert('⚠️ 셀프 청소 점검표의 3가지 항목을 먼저 모두 체크해 주세요!');
      return;
    }

    const finalPeerReviewer = customPeerReviewer.trim() || peerReviewer;

    onToggleCompletion(
      selectedZoneToComplete.id, 
      true, 
      finalName, 
      true, // selfChecklistChecked
      finalPeerReviewer || '없음',
      satisfactionScore
    );
    setSelectedZoneToComplete(null);
  };

  const handleQuickReset = (zoneId: string) => {
    onToggleCompletion(zoneId, false);
  };

  const isSubmitDisabled = !checkedItems.every(Boolean) || (!customStudentName.trim() && !selectedStudentName);

  return (
    <div id="today-status-section" className="space-y-6">
      {/* Weekday selector */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-100 shadow-xs">
        <div className="flex items-center gap-2 px-2">
          <Calendar className="w-5 h-5 text-indigo-600" />
          <span className="font-bold text-slate-800 text-sm">요일별 구역 확인</span>
        </div>
        <div className="grid grid-cols-5 gap-1.5 p-1 bg-slate-100 rounded-xl">
          {weekdays.map((day) => {
            const isSelected = selectedDay === day;
            return (
              <button
                id={`day-tab-${day}`}
                key={day}
                onClick={() => onSelectDay(day)}
                className={`py-2 px-2 sm:px-4 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-white/50'
                }`}
              >
                {day.replace('요일', '')}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of zones */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {zones.map((zone) => {
          const assignment = getAssignmentForZoneAndDay(zone.id, selectedDay);
          const completion = getCompletionForZone(zone.id);
          const assignedStudents = assignment?.students || [];

          return (
            <motion.div
              id={`zone-card-${zone.id}`}
              key={zone.id}
              layout
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`relative bg-white rounded-2xl border transition-all overflow-hidden flex flex-col justify-between ${
                completion.completed 
                  ? 'border-emerald-200 ring-2 ring-emerald-500/10 shadow-emerald-50/50 shadow-md' 
                  : 'border-slate-200 hover:border-slate-300 shadow-slate-100/30 shadow-sm'
              }`}
            >
              {/* Card Header & Content */}
              <div className="p-5 flex-1 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className={`p-3 rounded-xl ${
                    completion.completed 
                      ? 'bg-emerald-50 text-emerald-600' 
                      : 'bg-indigo-50 text-indigo-600'
                  }`}>
                    <CleaningIcon name={zone.iconName} className="w-6 h-6" />
                  </div>
                  
                  {/* Status Tag */}
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                    completion.completed 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {completion.completed ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        스스로 검사 통과
                      </>
                    ) : (
                      <>
                        <Circle className="w-3.5 h-3.5 text-slate-400" />
                        대기 중
                      </>
                    )}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-lg tracking-tight">{zone.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 min-h-[2rem]">{zone.description}</p>
                </div>

                {/* Assigned Students */}
                <div className="pt-3 border-t border-slate-100/80">
                  <span className="text-xs font-bold text-slate-400 block mb-2">🧑‍🤝‍🧑 오늘의 담당 학생</span>
                  {assignedStudents.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {assignedStudents.map((student) => (
                        <span 
                          key={student} 
                          className="px-2 py-1 bg-slate-50 border border-slate-100 text-slate-700 rounded-md text-xs font-semibold"
                        >
                          {student}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic">담당 학생이 배정되지 않았습니다.</span>
                  )}
                </div>

                {/* Self-Inspection Details Footer */}
                {completion.completed && (
                  <div className="bg-emerald-50/60 border border-emerald-100/60 rounded-xl p-3 space-y-2 animate-fade-in">
                    <div className="flex items-start gap-2.5">
                      <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <p className="font-bold text-emerald-900">
                          {completion.completedBy} 학생이 완료함
                        </p>
                        {completion.completedAt && (
                          <p className="text-emerald-700 text-[10px] mt-0.5">
                            {new Date(completion.completedAt).toLocaleTimeString('ko-KR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })} 자가 검진 완료
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Inspection results showcase */}
                    <div className="border-t border-emerald-100/50 pt-2 flex flex-col gap-1 text-[11px] text-emerald-800 font-medium">
                      <div className="flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>점검표 3개 항목 완수인증</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>교차 확인자: <strong className="text-emerald-900">{completion.peerReviewer || '없음'}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="shrink-0">청소 만족도:</span>
                        <div className="flex gap-0.5">
                          {Array.from({ length: completion.satisfactionScore || 5 }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                          ))}
                          {Array.from({ length: 5 - (completion.satisfactionScore || 5) }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 text-emerald-200" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button Footer */}
              <div className="px-5 pb-5 pt-2 bg-slate-50/50 border-t border-slate-100 flex gap-2">
                {!completion.completed ? (
                  <button
                    id={`btn-complete-${zone.id}`}
                    onClick={() => handleOpenCompletionModal(zone)}
                    className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CheckSquare className="w-4 h-4" />
                    스스로 청소 점검 및 등록
                  </button>
                ) : (
                  <button
                    id={`btn-reset-${zone.id}`}
                    onClick={() => handleQuickReset(zone.id)}
                    className="w-full py-2.5 px-4 bg-white border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                    점검 초기화 (재청소)
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Completion Dialog with Self-Inspection & Peer Review Checklist */}
      <AnimatePresence>
        {selectedZoneToComplete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl border border-slate-150 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
              style={{ maxHeight: '90vh' }}
            >
              {/* Header */}
              <div className="bg-indigo-600 text-white p-5 flex justify-between items-start shrink-0">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold bg-indigo-500/80 px-2.5 py-1 rounded-full border border-indigo-400/30">스스로 청소 점검하기</span>
                  <h4 className="text-lg sm:text-xl font-bold tracking-tight mt-1.5">
                    {selectedZoneToComplete.name} 점검 및 체크인
                  </h4>
                </div>
                <button 
                  onClick={() => setSelectedZoneToComplete(null)}
                  className="p-1 text-indigo-200 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body (Scrollable) */}
              <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
                
                {/* 1. Who is inspecting? */}
                <div className="space-y-2">
                  <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                    1단계: 청소한 사람 선택
                  </span>
                  
                  {/* Select from assigned or custom input */}
                  <div className="grid grid-cols-2 gap-2">
                    {getAssignmentForZoneAndDay(selectedZoneToComplete.id, selectedDay)?.students.map((student) => {
                      const isSelected = selectedStudentName === student && !customStudentName;
                      return (
                        <button
                          key={student}
                          type="button"
                          onClick={() => {
                            setSelectedStudentName(student);
                            setCustomStudentName('');
                          }}
                          className={`p-2.5 rounded-xl border-2 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700'
                              : 'border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          <UserCheck className="w-3.5 h-3.5 opacity-70" />
                          {student}
                        </button>
                      );
                    })}
                  </div>

                  <input
                    id="custom-student-input"
                    type="text"
                    value={customStudentName}
                    onChange={(e) => setCustomStudentName(e.target.value)}
                    placeholder="도우미 등 명단 외 학생이 한 경우 이름 직접 입력"
                    className="w-full p-2.5 text-xs text-slate-800 border-2 border-slate-200 focus:border-indigo-500 rounded-xl outline-hidden transition-all placeholder:text-slate-400 font-bold"
                  />
                </div>

                {/* 2. Interactive Checklist (Crucial Self-Verification Step) */}
                <div className="space-y-2.5 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <span className="text-xs font-black text-indigo-900 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                      2단계: 스스로 청소 점검표 (필수)
                    </span>
                    <span className="text-[10px] text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">
                      {checkedItems.filter(Boolean).length} / 3 완료
                    </span>
                  </span>

                  <div className="space-y-2 pt-1">
                    {getChecklistForZone(selectedZoneToComplete.id, selectedZoneToComplete.name).map((item, idx) => {
                      const isChecked = checkedItems[idx];
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleToggleCheckItem(idx)}
                          className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-start gap-2.5 cursor-pointer ${
                            isChecked 
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
                              : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-200'
                          }`}
                        >
                          <div className={`mt-0.5 w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                            isChecked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300'
                          }`}>
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span className="text-xs font-bold leading-tight">{item}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Peer Validation (Double check) */}
                <div className="space-y-2">
                  <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                    3단계: 교차 확인 (검사해 준 친구)
                  </span>
                  
                  <div className="flex gap-2">
                    <select
                      value={peerReviewer}
                      onChange={(e) => {
                        setPeerReviewer(e.target.value);
                        setCustomPeerReviewer('');
                      }}
                      className="flex-1 p-2.5 text-xs text-slate-700 border-2 border-slate-200 rounded-xl focus:border-indigo-500 font-bold outline-none"
                    >
                      <option value="">검사한 친구 선택...</option>
                      {studentsList.map((student) => (
                        <option key={student} value={student}>
                          {student}
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      value={customPeerReviewer}
                      onChange={(e) => {
                        setCustomPeerReviewer(e.target.value);
                        setPeerReviewer('');
                      }}
                      placeholder="또는 직접 이름 입력"
                      className="w-1/3 p-2.5 text-xs text-slate-800 border-2 border-slate-200 focus:border-indigo-500 rounded-xl outline-hidden transition-all placeholder:text-slate-400 font-bold"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400">💡 스스로 확인하기 전 다른 조원이나 친구에게 깨끗한지 직접 보여주고 이름을 적어주세요.</p>
                </div>

                {/* 4. Self Rating score */}
                <div className="space-y-2">
                  <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                    4단계: 오늘 청소 만족도 평가
                  </span>

                  <div className="flex items-center gap-4 bg-slate-50/50 p-3 rounded-2xl border border-slate-150">
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((score) => (
                        <button
                          key={score}
                          type="button"
                          onClick={() => setSatisfactionScore(score)}
                          className="p-1 hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Star 
                            className={`w-7 h-7 ${
                              score <= satisfactionScore 
                                ? 'fill-amber-400 text-amber-400' 
                                : 'text-slate-300'
                            }`} 
                          />
                        </button>
                      ))}
                    </div>
                    <span className="text-xs font-black text-slate-700">
                      {satisfactionScore === 5 ? '💯 완벽함! 빛이 납니다' :
                       satisfactionScore === 4 ? '😊 훌륭해요! 만족스러워요' :
                       satisfactionScore === 3 ? '😐 보통이에요! 할 일 완수' :
                       satisfactionScore === 2 ? '😞 약간 아쉬워요' : '😢 재청소가 필요할 것 같아요'}
                    </span>
                  </div>
                </div>

              </div>

              {/* Footer Actions */}
              <div className="bg-slate-50 p-5 flex justify-between items-center border-t border-slate-100 shrink-0">
                <span className="text-[10px] font-bold text-slate-500">
                  ⚠️ 점검표 3가지를 체크해야 확인 완료가 활성화됩니다.
                </span>
                
                <div className="flex gap-2">
                  <button
                    id="modal-cancel-btn"
                    onClick={() => setSelectedZoneToComplete(null)}
                    className="px-4 py-2 text-xs font-bold text-slate-500 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
                  >
                    취소
                  </button>
                  <button
                    id="modal-submit-btn"
                    onClick={handleSubmitCompletion}
                    disabled={isSubmitDisabled}
                    className={`px-5 py-2 text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSubmitDisabled 
                        ? 'bg-slate-200 border border-slate-300 text-slate-400 cursor-not-allowed shadow-none' 
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    모든 기준 통과 & 등록하기
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
