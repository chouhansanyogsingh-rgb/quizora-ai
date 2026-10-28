'use client';

import React from 'react';
import { X, History, TrendingUp, CheckCircle, Zap, Clock } from 'lucide-react';
import { ProgressHistoryItem } from '@/lib/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  history: ProgressHistoryItem[];
}

export function HistoryDrawer({ isOpen, onClose, history }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 text-slate-100 p-6 flex flex-col shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Mastery Progression Log</h3>
                <p className="text-xs text-slate-400">Real-time learning timeline</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Timeline content */}
          <div className="flex-1 overflow-y-auto py-6 space-y-4 pr-1">
            {history.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs">No progression events logged yet.</p>
                <p className="text-[11px] text-slate-600 mt-1">
                  Complete the diagnostic quiz or solve targeted practice problems to see real-time updates.
                </p>
              </div>
            ) : (
              history.map((item) => {
                const isRemediated = item.action === 'gap_remediated';
                const isPractice = item.action === 'practice_solved';
                const isQuiz = item.action === 'quiz_completed';

                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 relative"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                          isRemediated
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : isPractice
                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                            : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        }`}
                      >
                        {isRemediated ? 'Gap Remediated' : isPractice ? 'Practice Solved' : 'Diagnostic Complete'}
                      </span>

                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-xs text-slate-200 leading-relaxed">{item.message}</p>

                    {(item.oldScore > 0 || item.newScore > 0) && (
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-300 pt-1">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Mastery Delta:</span>
                        <span className="text-slate-400">{item.oldScore}%</span>
                        <span className="text-indigo-400">→</span>
                        <span className="text-emerald-400 font-black">{item.newScore}%</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
