import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Plus, 
  Trash, 
  Sparkles, 
  Check, 
  X, 
  Settings, 
  Archive, 
  UserPlus, 
  FileEdit,
  ArrowRight,
  Info,
  Key,
  Lock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { CleaningZone, WeeklyAssignment, DayOfWeek } from '../types';
import { CleaningIcon } from './CleaningIcon';

interface AssignmentEditorProps {
  zones: CleaningZone[];
  assignments: WeeklyAssignment[];
  studentsList: string[];
  onAddZone: (name: string, description: string, iconName: string) => void;
  onDeleteZone: (zoneId: string) => void;
  onUpdateAssignment: (zoneId: string, day: DayOfWeek, students: string[]) => void;
  onUpdateStudentsList: (newStudents: string[]) => void;
  teacherPin: string;
  onUpdateTeacherPin: (newPin: string) => void;
}

type EditorTab = 'ASSIGN' | 'ZONES' | 'STUDENTS' | 'SETTINGS';

export function AssignmentEditor({
  zones,
  assignments,
  studentsList,
  onAddZone,
  onDeleteZone,
  onUpdateAssignment,
  onUpdateStudentsList,
  teacherPin,
  onUpdateTeacherPin
}: AssignmentEditorProps) {
  const [activeTab, setActiveTab] = useState<EditorTab>('ASSIGN');
  
  // States for Tab A: Assignments
  const [assignZoneId, setAssignZoneId] = useState<string>(zones[0]?.id || '');
  const [assignDay, setAssignDay] = useState<DayOfWeek>('월요일');

  // States for Tab B: Zones
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneDesc, setNewZoneDesc] = useState('');
  const [newZoneIcon, setNewZoneIcon] = useState('Sparkles');

  // States for Tab C: Students
  const [newStudentName, setNewStudentName] = useState('');

  // States for Tab D: Settings (Teacher PIN change)
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinChangeSuccess, setPinChangeSuccess] = useState(false);
  const [pinChangeError, setPinChangeError] = useState('');

  const weekdays: DayOfWeek[] = ['월요일', '화요일', '수요일', '목요일', '금요일'];
  const iconOptions = ['Home', 'Presentation', 'Grid', 'Trash2', 'Sparkles', 'Archive'];

  // Get current assignment
  const currentAssignment = assignments.find(
    (a) => a.zoneId === assignZoneId && a.dayOfWeek === assignDay
  );
  const assignedStudentsForCurrent = currentAssignment?.students || [];

  const handleToggleStudentAssignment = (student: string) => {
    if (!assignZoneId) return;
    
    let nextStudents = [...assignedStudentsForCurrent];
    if (nextStudents.includes(student)) {
      nextStudents = nextStudents.filter(s => s !== student);
    } else {
      nextStudents.push(student);
    }
    onUpdateAssignment(assignZoneId, assignDay, nextStudents);
  };

  const handleAddZoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newZoneName.trim()) return;
    onAddZone(newZoneName.trim(), newZoneDesc.trim(), newZoneIcon);
    setNewZoneName('');
    setNewZoneDesc('');
    setNewZoneIcon('Sparkles');
  };

  const handleAddStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newStudentName.trim();
    if (!trimmed) return;
    if (studentsList.includes(trimmed)) {
      alert('이미 등록된 학생 이름입니다.');
      return;
    }
    onUpdateStudentsList([...studentsList, trimmed]);
    setNewStudentName('');
  };

  const handleDeleteStudent = (nameToDelete: string) => {
    onUpdateStudentsList(studentsList.filter(name => name !== nameToDelete));
    
    // Also cleanup any active assignments containing this student
    zones.forEach(zone => {
      weekdays.forEach(day => {
        const matchingAssign = assignments.find(a => a.zoneId === zone.id && a.dayOfWeek === day);
        if (matchingAssign && matchingAssign.students.includes(nameToDelete)) {
          const nextStudents = matchingAssign.students.filter(s => s !== nameToDelete);
          onUpdateAssignment(zone.id, day, nextStudents);
        }
      });
    });
  };

  const handleChangePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPinChangeSuccess(false);
    setPinChangeError('');

    if (!/^\d{4}$/.test(newPin)) {
      setPinChangeError('비밀번호는 반드시 숫자 4자리여야 합니다.');
      return;
    }

    if (newPin !== confirmPin) {
      setPinChangeError('입력하신 새 비밀번호와 확인용 비밀번호가 일치하지 않습니다.');
      return;
    }

    onUpdateTeacherPin(newPin);
    setPinChangeSuccess(true);
    setNewPin('');
    setConfirmPin('');
  };

  return (
    <div id="assignment-editor-card" className="bg-white rounded-3xl border border-indigo-100 shadow-md p-5 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500 text-white rounded-xl shadow-xs">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">선생님 청소 관리 도구</h2>
            <p className="text-xs text-slate-500">실시간으로 구역 배정, 구역 추가, 학생 명단 및 비밀번호를 관리할 수 있습니다.</p>
          </div>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl">
        <button
          id="tab-btn-assign"
          type="button"
          onClick={() => setActiveTab('ASSIGN')}
          className={`flex-1 min-w-[120px] py-2 text-xs md:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
            activeTab === 'ASSIGN' 
              ? 'bg-white text-indigo-600 shadow-xs' 
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          담당 학생 배정
        </button>
        <button
          id="tab-btn-zones"
          type="button"
          onClick={() => setActiveTab('ZONES')}
          className={`flex-1 min-w-[120px] py-2 text-xs md:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
            activeTab === 'ZONES' 
              ? 'bg-white text-indigo-600 shadow-xs' 
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Archive className="w-4 h-4" />
          구역 추가/삭제
        </button>
        <button
          id="tab-btn-students"
          type="button"
          onClick={() => setActiveTab('STUDENTS')}
          className={`flex-1 min-w-[120px] py-2 text-xs md:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
            activeTab === 'STUDENTS' 
              ? 'bg-white text-indigo-600 shadow-xs' 
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          학생 명단 관리
        </button>
        <button
          id="tab-btn-settings"
          type="button"
          onClick={() => {
            setActiveTab('SETTINGS');
            setPinChangeSuccess(false);
            setPinChangeError('');
          }}
          className={`flex-1 min-w-[120px] py-2 text-xs md:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
            activeTab === 'SETTINGS' 
              ? 'bg-white text-indigo-600 shadow-xs' 
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Key className="w-4 h-4" />
          비밀번호 변경
        </button>
      </div>

      {/* Tab Panels */}
      <AnimatePresence mode="wait">
        {activeTab === 'ASSIGN' && (
          <motion.div
            key="assign-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Selectors */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">1. 편집할 청소 구역 및 요일 선택</label>
                <div className="space-y-2">
                  <div>
                    <span className="text-xs text-slate-400 block mb-1">청소 구역</span>
                    <select
                      id="select-editor-zone"
                      value={assignZoneId}
                      onChange={(e) => setAssignZoneId(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl outline-hidden text-sm font-bold text-slate-700 transition-all"
                    >
                      {zones.map((zone) => (
                        <option key={zone.id} value={zone.id}>{zone.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block mb-1">요일</span>
                    <select
                      id="select-editor-day"
                      value={assignDay}
                      onChange={(e) => setAssignDay(e.target.value as DayOfWeek)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl outline-hidden text-sm font-bold text-slate-700 transition-all"
                    >
                      {weekdays.map((day) => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex gap-2">
                  <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-amber-800 leading-normal font-medium">
                    오른쪽 목록에서 학생의 이름을 클릭하여 이 구역의 담당자로 배정하거나 배정 취소할 수 있습니다. 변경사항은 즉시 저장됩니다.
                  </p>
                </div>
              </div>

              {/* Checkboxes of students */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  2. 담당 학생 선택 ({assignedStudentsForCurrent.length}명 배정됨)
                </label>
                <div className="border border-slate-150 rounded-2xl max-h-[220px] overflow-y-auto p-3 grid grid-cols-2 sm:grid-cols-3 gap-1.5 bg-slate-50/50">
                  {studentsList.length > 0 ? (
                    studentsList.map((student) => {
                      const isAssigned = assignedStudentsForCurrent.includes(student);
                      return (
                        <button
                          id={`assign-toggle-${student}`}
                          key={student}
                          onClick={() => handleToggleStudentAssignment(student)}
                          className={`p-2 rounded-lg text-xs font-bold border transition-all flex items-center justify-between ${
                            isAssigned
                              ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          <span className="truncate">{student}</span>
                          {isAssigned && <Check className="w-3.5 h-3.5" />}
                        </button>
                      );
                    })
                  ) : (
                    <div className="col-span-full text-center py-12 text-xs text-slate-400">
                      등록된 학생이 없습니다. 학생 명단 관리 탭을 이용해 주세요.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'ZONES' && (
          <motion.div
            key="zones-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Left: Add zone form */}
            <form onSubmit={handleAddZoneSubmit} className="space-y-4">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">새 청소 구역 등록</label>
              <div className="space-y-3">
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1 font-bold">구역 이름 (예: 복도 창틀)</span>
                  <input
                    id="new-zone-name-input"
                    type="text"
                    required
                    value={newZoneName}
                    onChange={(e) => setNewZoneName(e.target.value)}
                    placeholder="구역 이름을 입력하세요..."
                    className="w-full p-3 text-sm text-slate-800 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl outline-hidden transition-all"
                  />
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block mb-1 font-bold">구역 상세 설명 (청소 수칙)</span>
                  <textarea
                    id="new-zone-desc-input"
                    value={newZoneDesc}
                    onChange={(e) => setNewZoneDesc(e.target.value)}
                    placeholder="담당 학생들이 해야 하는 구체적인 일을 작성해 주세요..."
                    rows={2}
                    className="w-full p-3 text-sm text-slate-800 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl outline-hidden transition-all"
                  />
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block mb-1 font-bold font-mono">아이콘 선택</span>
                  <div className="grid grid-cols-6 gap-2">
                    {iconOptions.map((iconOpt) => (
                      <button
                        key={iconOpt}
                        type="button"
                        onClick={() => setNewZoneIcon(iconOpt)}
                        className={`p-3 rounded-xl border flex justify-center items-center transition-all ${
                          newZoneIcon === iconOpt
                            ? 'bg-indigo-50 border-indigo-500 text-indigo-600 shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-700'
                        }`}
                      >
                        <CleaningIcon name={iconOpt} className="w-5 h-5" />
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  id="submit-add-zone-btn"
                  type="submit"
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  새로운 구역 추가하기
                </button>
              </div>
            </form>

            {/* Right: Zone list with delete option */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">현재 등록된 청소 구역 ({zones.length}개)</label>
              <div className="border border-slate-150 rounded-2xl max-h-[320px] overflow-y-auto p-4 bg-slate-50/50 divide-y divide-slate-150">
                {zones.map((zone) => (
                  <div key={zone.id} className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                        <CleaningIcon name={zone.iconName} className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-slate-800 block">{zone.name}</span>
                        <span className="text-xs text-slate-400 mt-0.5 block line-clamp-1">{zone.description || '상세 설명 없음'}</span>
                      </div>
                    </div>
                    <button
                      id={`btn-delete-zone-${zone.id}`}
                      onClick={() => {
                        if (window.confirm(`'${zone.name}' 구역을 삭제하시겠습니까? 관련 주간 배정 데이터도 삭제됩니다.`)) {
                          onDeleteZone(zone.id);
                        }
                      }}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                      title="구역 삭제"
                      type="button"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'STUDENTS' && (
          <motion.div
            key="students-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Left: Add Student Form */}
            <form onSubmit={handleAddStudentSubmit} className="space-y-4">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">학생 이름 추가</label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    id="new-student-name-input"
                    type="text"
                    required
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    placeholder="학생 이름을 입력하세요 (예: 강하늘)"
                    className="flex-1 p-3 text-sm text-slate-800 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl outline-hidden transition-all"
                  />
                  <button
                    id="submit-add-student-btn"
                    type="submit"
                    className="px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1 shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    추가
                  </button>
                </div>
                
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <span className="text-xs font-bold text-slate-700 block mb-1">💡 팁</span>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                    등록된 학생들은 '요일별 담당 학생 배정' 탭에서 클릭만으로 아주 편리하게 배정할 수 있습니다. 전학을 가거나 명단에서 제외할 때 옆의 삭제 단추를 활용하세요.
                  </p>
                </div>
              </div>
            </form>

            {/* Right: Student List */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">학생 명단 ({studentsList.length}명)</label>
              <div className="border border-slate-150 rounded-2xl max-h-[260px] overflow-y-auto p-3 bg-slate-50/50">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {studentsList.map((student) => (
                    <div 
                      key={student} 
                      className="p-2 bg-white border border-slate-100 rounded-lg flex items-center justify-between gap-1 shadow-2xs hover:border-indigo-200 transition-colors"
                    >
                      <span className="text-xs font-bold text-slate-700 truncate">{student}</span>
                      <button
                        id={`btn-delete-student-${student}`}
                        onClick={() => handleDeleteStudent(student)}
                        className="text-slate-400 hover:text-rose-600 p-0.5 rounded transition-colors shrink-0"
                        type="button"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'SETTINGS' && (
          <motion.div
            key="settings-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* PIN change Form */}
            <form onSubmit={handleChangePinSubmit} className="space-y-4">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">선생님 모드 비밀번호 변경</label>
              
              <div className="space-y-4">
                <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 text-xs space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-indigo-900">
                    <Lock className="w-4 h-4 text-indigo-600" />
                    현재 설정된 비밀번호: <span className="underline font-black text-indigo-700 tracking-wider font-mono">{teacherPin}</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed font-medium">
                    학생들의 임의 수정을 제한하기 위해 선생님 모드 진입 시 사용하는 4자리 숫자를 직접 커스텀할 수 있습니다.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-[11px] text-slate-500 block mb-1 font-bold">새 비밀번호 (숫자 4자리)</span>
                    <input
                      id="new-pin-input"
                      type="password"
                      maxLength={4}
                      required
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="숫자 4자리"
                      className="w-full p-3 text-sm text-center text-slate-800 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl outline-hidden tracking-widest font-mono transition-all font-bold"
                    />
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-500 block mb-1 font-bold">새 비밀번호 확인</span>
                    <input
                      id="confirm-pin-input"
                      type="password"
                      maxLength={4}
                      required
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="숫자 4자리"
                      className="w-full p-3 text-sm text-center text-slate-800 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl outline-hidden tracking-widest font-mono transition-all font-bold"
                    />
                  </div>
                </div>

                {pinChangeError && (
                  <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs font-bold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{pinChangeError}</span>
                  </div>
                )}

                {pinChangeSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>비밀번호가 성공적으로 변경 및 저장되었습니다!</span>
                  </div>
                )}

                <button
                  id="submit-change-pin-btn"
                  type="submit"
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Key className="w-4 h-4" />
                  새 비밀번호로 설정하기
                </button>
              </div>
            </form>

            {/* General Settings Guideline */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">안전한 학급 관리 수칙</label>
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-150 space-y-3.5 text-xs text-slate-600 leading-relaxed font-medium">
                <div>
                  <h4 className="font-bold text-slate-800 flex items-center gap-1.5 mb-1 text-sm">
                    🔒 교사 권한 무단사용 방지
                  </h4>
                  <p>선생님 모드에서 청소 변경 작업을 마친 후에는 반드시 상단 헤더의 자물쇠 버튼을 누르거나 창을 닫아 '학생 모드'로 되돌려 주세요.</p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 flex items-center gap-1.5 mb-1 text-sm">
                    💡 비밀번호 공유 시 주의사항
                  </h4>
                  <p>비밀번호는 기본 체험값 '1234' 대신 학급 청소 부장이나 주번에게만 알려주어 임의 조작을 막는 것이 효과적입니다.</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
