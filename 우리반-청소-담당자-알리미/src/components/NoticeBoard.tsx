import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Edit2, Check, X, AlertCircle } from 'lucide-react';
import { CleaningNotice, UserRole } from '../types';

interface NoticeBoardProps {
  notice: CleaningNotice;
  role: UserRole;
  onUpdateNotice: (content: string) => void;
}

export function NoticeBoard({ notice, role, onUpdateNotice }: NoticeBoardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(notice.content);

  const handleSave = () => {
    if (editContent.trim()) {
      onUpdateNotice(editContent.trim());
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditContent(notice.content);
    setIsEditing(false);
  };

  const formattedDate = new Date(notice.updatedAt).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit'
  }) + ' (' + new Date(notice.updatedAt).toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric'
  }) + ')';

  return (
    <div id="notice-board-container" className="bg-indigo-600 rounded-2xl shadow-lg border border-indigo-500 overflow-hidden text-white">
      <div className="p-5 md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 text-white rounded-xl shadow-inner border border-white/10">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white">실시간 오늘의 알림 및 공지</h2>
              <p className="text-xs text-indigo-100 font-medium">
                작성: {notice.author} • <span>{formattedDate}</span>
              </p>
            </div>
          </div>

          {role === 'TEACHER' && !isEditing && (
            <button
              id="edit-notice-btn"
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-white/15 hover:bg-white/25 rounded-lg border border-white/20 transition-all cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              공지 수정
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {!isEditing ? (
            <motion.div
              key="view"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="mt-4"
            >
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/15 text-white text-sm md:text-base leading-relaxed whitespace-pre-wrap font-medium shadow-inner">
                {notice.content}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="edit"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="mt-4 space-y-3"
            >
              <textarea
                id="notice-edit-textarea"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={3}
                className="w-full p-4 text-sm md:text-base text-slate-900 bg-white border-2 border-indigo-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden transition-all placeholder:text-slate-400"
                placeholder="학생들에게 공지할 청소 관련 내용을 작성해 주세요..."
              />
              <div className="flex justify-end gap-2">
                <button
                  id="cancel-notice-btn"
                  onClick={handleCancel}
                  className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-white bg-white/15 hover:bg-white/25 rounded-lg transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  취소
                </button>
                <button
                  id="save-notice-btn"
                  onClick={handleSave}
                  className="flex items-center gap-1 px-4 py-2 text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 rounded-lg shadow-sm transition-all"
                >
                  <Check className="w-3.5 h-3.5" />
                  저장하기
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
