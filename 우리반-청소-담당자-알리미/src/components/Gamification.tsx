import React from 'react';
import { motion } from 'motion/react';
import { Award, Sparkles, TrendingUp, Compass, Flame } from 'lucide-react';
import { DailyCompletion, CleaningZone } from '../types';

interface GamificationProps {
  completions: DailyCompletion[];
  zones: CleaningZone[];
}

export function Gamification({ completions, zones }: GamificationProps) {
  const completedCount = completions.filter(c => c.completed).length;
  const totalCount = zones.length;
  const score = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Encouraging feedback messages
  let levelMessage = '아직 청소 시작 전입니다. 깨끗한 교실을 함께 만들어요! 🧹';
  let levelColor = 'text-slate-500';
  let badgeText = '청소 전';

  if (score > 0 && score < 40) {
    levelMessage = '좋은 시작이에요! 조금씩 교실이 맑아지고 있습니다. 🌟';
    levelColor = 'text-blue-500';
    badgeText = '준비 완료';
  } else if (score >= 40 && score < 80) {
    levelMessage = '우와! 절반 이상 청소되었습니다. 조금만 더 힘을 내요! 💪';
    levelColor = 'text-indigo-500';
    badgeText = '청소 요정';
  } else if (score >= 80 && score < 100) {
    levelMessage = '정말 깨끗해요! 거의 완벽한 상태의 아름다운 교실입니다! ✨';
    levelColor = 'text-violet-500';
    badgeText = '청소 전문가';
  } else if (score === 100 && totalCount > 0) {
    levelMessage = '퍼펙트! 100점 만점! 깨끗하고 건강한 교실 완성! 🥳🎉';
    levelColor = 'text-emerald-500';
    badgeText = '우리반 챔피언';
  }

  // Get a list of student names who checked in today
  const activeHelpers = completions
    .filter(c => c.completed && c.completedBy)
    .map(c => c.completedBy as string);

  return (
    <div id="gamification-container" className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* Box 1: Dynamic Score Card */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 block">오늘의 청소 점수</span>
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700`}>
            {badgeText}
          </span>
        </div>

        <div className="py-4 flex items-baseline gap-2">
          <span className="text-4xl font-black text-slate-800 tracking-tight">{score}</span>
          <span className="text-lg font-bold text-slate-400">/ 100 점</span>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <motion.div 
              className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          <p className="text-[11px] text-slate-500 font-medium">완료 {completedCount}개 / 총 {totalCount}개 구역</p>
        </div>
      </div>

      {/* Box 2: Encouraging Level Card */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex flex-col justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4.5 h-4.5 text-amber-500" />
          <span className="text-xs font-bold text-slate-400 block">실시간 상태 및 격려</span>
        </div>

        <div className="py-2">
          <p className={`text-sm font-bold leading-relaxed ${levelColor}`}>
            {levelMessage}
          </p>
        </div>

        <div className="text-[11px] text-slate-400 font-medium pt-2 border-t border-slate-50">
          청소 완료 확인은 실시간으로 학생들과 공유됩니다.
        </div>
      </div>

      {/* Box 3: Today's Heroes */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex flex-col justify-between">
        <div className="flex items-center gap-2">
          <Award className="w-4.5 h-4.5 text-emerald-500" />
          <span className="text-xs font-bold text-slate-400 block">오늘의 청소 도우미</span>
        </div>

        <div className="py-3">
          {activeHelpers.length > 0 ? (
            <div className="flex flex-wrap gap-1 max-h-[56px] overflow-y-auto">
              {Array.from(new Set(activeHelpers)).map((helper) => (
                <span 
                  key={helper} 
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-md text-[10px] font-bold"
                >
                  <Flame className="w-3 h-3 text-emerald-600" />
                  {helper}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">아직 완료 체크인을 수행한 학생이 없습니다.</p>
          )}
        </div>

        <div className="text-[11px] text-slate-400 font-medium pt-2 border-t border-slate-50">
          깨끗한 교실을 만드는 소중한 손길들입니다!
        </div>
      </div>
    </div>
  );
}
