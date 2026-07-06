import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Users, Edit3, Check, X, Info, Sparkles } from 'lucide-react';
import { CleaningZone, WeeklyAssignment, DayOfWeek } from '../types';
import { CleaningIcon } from './CleaningIcon';

interface WeeklyScheduleProps {
  zones: CleaningZone[];
  assignments: WeeklyAssignment[];
  selectedDay: DayOfWeek;
  onSelectDay: (day: DayOfWeek) => void;
  studentsList: string[];
  onUpdateAssignment: (zoneId: string, day: DayOfWeek, students: string[]) => void;
}

export function WeeklySchedule({
  zones,
  assignments,
  selectedDay,
  onSelectDay,
  studentsList,
  onUpdateAssignment,
}: WeeklyScheduleProps) {
  const weekdays: DayOfWeek[] = ['월요일', '화요일', '수요일', '목요일', '금요일'];

  // State for interactive cell editing
  const [editingCell, setEditingCell] = useState<{
    zoneId: string;
    zoneName: string;
    day: DayOfWeek;
  } | null>(null);

  const getAssignmentForZoneAndDay = (zoneId: string, day: DayOfWeek) => {
    return assignments.find(a => a.zoneId === zoneId && a.dayOfWeek === day);
  };

  const handleCellClick = (zone: CleaningZone, day: DayOfWeek) => {
    setEditingCell({
      zoneId: zone.id,
      zoneName: zone.name,
      day,
    });
  };

  const handleToggleStudent = (student: string) => {
    if (!editingCell) return;
    const currentAssignment = getAssignmentForZoneAndDay(editingCell.zoneId, editingCell.day);
    const currentStudents = currentAssignment?.students || [];

    let nextStudents: string[];
    if (currentStudents.includes(student)) {
      nextStudents = currentStudents.filter(s => s !== student);
    } else {
      nextStudents = [...currentStudents, student];
    }

    onUpdateAssignment(editingCell.zoneId, editingCell.day, nextStudents);
  };

  const currentEditingAssignment = editingCell 
    ? getAssignmentForZoneAndDay(editingCell.zoneId, editingCell.day)
    : null;
  const currentEditingStudents = currentEditingAssignment?.students || [];

  return (
    <div id="weekly-schedule-container" className="bg-white rounded-2xl border border-slate-150 shadow-sm p-5 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-violet-100 text-violet-700 rounded-xl">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">주간 청소 배정표</h2>
            <p className="text-xs text-slate-500">한눈에 확인하고, 칸을 클릭하여 담당 학생을 바로 배정해보세요!</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-violet-600 bg-violet-50 px-3 py-1.5 rounded-lg font-bold border border-violet-100">
          <Info className="w-3.5 h-3.5" />
          마우스로 청소 시간표의 칸을 클릭하면 바로 수정할 수 있습니다.
        </div>
      </div>

      {/* Grid Table for Desktop (sm and up) */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-150">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-150">
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-48">청소 구역</th>
              {weekdays.map((day) => (
                <th 
                  key={day} 
                  className={`p-4 text-xs font-bold uppercase tracking-wider text-center ${
                    selectedDay === day ? 'bg-indigo-50/60 text-indigo-700' : 'text-slate-500'
                  }`}
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {zones.map((zone) => (
              <tr key={zone.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-4 flex items-center gap-3 bg-slate-50/40 border-r border-slate-100">
                  <div className="p-2 bg-slate-100 text-slate-600 rounded-lg">
                    <CleaningIcon name={zone.iconName} className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 text-sm block">{zone.name}</span>
                    <span className="text-[10px] text-slate-400 font-medium line-clamp-1">{zone.description}</span>
                  </div>
                </td>
                
                {weekdays.map((day) => {
                  const assignment = getAssignmentForZoneAndDay(zone.id, day);
                  const isToday = selectedDay === day;
                  const hasStudents = assignment && assignment.students.length > 0;

                  return (
                    <td 
                      key={day} 
                      onClick={() => handleCellClick(zone, day)}
                      className={`p-3 text-center cursor-pointer transition-all hover:bg-indigo-50/30 group relative ${
                        isToday ? 'bg-indigo-50/10 font-medium' : ''
                      }`}
                      title={`${zone.name} (${day}) 배정 수정하기`}
                    >
                      {/* Hover Overlay Icon Indicator */}
                      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-500 text-white rounded p-0.5 pointer-events-none">
                        <Edit3 className="w-3 h-3" />
                      </div>

                      {hasStudents ? (
                        <div className="flex flex-col items-center justify-center gap-1">
                          <div className="flex flex-wrap justify-center gap-1 max-w-[120px]">
                            {assignment.students.map((student) => (
                              <span 
                                key={student} 
                                className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all ${
                                  isToday 
                                    ? 'bg-indigo-100 text-indigo-800 border border-indigo-200/50' 
                                    : 'bg-slate-100 text-slate-700 border border-slate-200/30 group-hover:bg-indigo-50 group-hover:text-indigo-800 group-hover:border-indigo-100'
                                }`}
                              >
                                {student}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-300 italic group-hover:text-indigo-500 font-semibold transition-colors">클릭하여 배정</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Accordion List for Mobile View (less than md) */}
      <div className="block md:hidden space-y-3">
        {weekdays.map((day) => {
          const isToday = selectedDay === day;
          return (
            <div 
              key={day} 
              className={`rounded-xl border transition-all ${
                isToday 
                  ? 'border-indigo-200 bg-indigo-50/20 shadow-xs' 
                  : 'border-slate-150 bg-white'
              }`}
            >
              <div
                className="w-full p-4 flex items-center justify-between text-left cursor-pointer"
                onClick={() => onSelectDay(day)}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${isToday ? 'bg-indigo-600' : 'bg-slate-300'}`}></span>
                  <span className={`font-bold text-sm ${isToday ? 'text-indigo-900' : 'text-slate-800'}`}>
                    {day}
                  </span>
                </div>
                <span className="text-xs font-bold text-indigo-600">구역 목록 및 배정 수정 &rarr;</span>
              </div>

              {isToday && (
                <div className="px-4 pb-4 divide-y divide-slate-100 border-t border-slate-100 bg-white rounded-b-xl">
                  {zones.map((zone) => {
                    const assignment = getAssignmentForZoneAndDay(zone.id, day);
                    const students = assignment?.students || [];
                    return (
                      <div 
                        key={zone.id} 
                        onClick={() => handleCellClick(zone, day)}
                        className="py-3 flex items-start justify-between gap-2 cursor-pointer hover:bg-slate-50 rounded px-1 transition-colors group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 bg-slate-50 text-slate-500 rounded-lg group-hover:text-indigo-600">
                            <CleaningIcon name={zone.iconName} className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{zone.name}</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 justify-end items-center max-w-[150px]">
                          {students.length > 0 ? (
                            students.map(s => (
                              <span key={s} className="px-1.5 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded text-[10px] font-bold">
                                {s}
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] text-slate-300 italic group-hover:text-indigo-600 font-bold">배정 수정</span>
                          )}
                          <Edit3 className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 ml-1" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Interactive Modal to Customize Assignment Cell */}
      <AnimatePresence>
        {editingCell && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl border border-slate-150 shadow-2xl w-full max-w-lg overflow-hidden"
            >
              {/* Modal Header */}
              <div className="bg-indigo-600 text-white p-5 flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-xs font-bold bg-indigo-500/80 px-2.5 py-1 rounded-full border border-indigo-400/30">배정표 실시간 편집</span>
                  <h4 className="text-lg sm:text-xl font-bold tracking-tight mt-1.5">
                    {editingCell.zoneName} • {editingCell.day}
                  </h4>
                </div>
                <button 
                  onClick={() => setEditingCell(null)}
                  className="p-1 text-indigo-200 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-xl p-3 text-indigo-900">
                  <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                  <p className="text-xs font-semibold">
                    이름을 누르면 배정 여부가 바로 토글됩니다. ({currentEditingStudents.length}명 배정됨)
                  </p>
                </div>

                {/* Grid of Student Names */}
                <div className="border border-slate-150 rounded-2xl max-h-[250px] overflow-y-auto p-3 bg-slate-50/50">
                  {studentsList.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {studentsList.map((student) => {
                        const isAssigned = currentEditingStudents.includes(student);
                        return (
                          <button
                            key={student}
                            onClick={() => handleToggleStudent(student)}
                            className={`p-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-between cursor-pointer ${
                              isAssigned
                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                                : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/10'
                            }`}
                          >
                            <span className="truncate">{student}</span>
                            {isAssigned && <Check className="w-3.5 h-3.5" />}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-12 text-center text-xs text-slate-400">
                      등록된 학생 명단이 없습니다. 관리자 탭에서 학생 이름을 추가해주세요.
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="bg-slate-50 p-5 flex justify-end gap-2 border-t border-slate-100">
                <button
                  onClick={() => setEditingCell(null)}
                  className="px-5 py-2.5 text-xs font-bold text-slate-600 bg-white hover:bg-slate-100 border border-slate-250 rounded-xl transition-colors cursor-pointer"
                >
                  완료 및 닫기
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
