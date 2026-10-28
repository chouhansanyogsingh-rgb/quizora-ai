'use client';

import React from 'react';
import { Flame, Zap, Award, Check, Calendar, TrendingUp, Sparkles } from 'lucide-react';
import { StudentUser } from '@/lib/types';

interface NavbarGamificationProps {
  student: StudentUser;
  onClickStreak?: () => void;
}

export function NavbarGamification({ student, onClickStreak }: NavbarGamificationProps) {
  const level = Math.floor((student.xp || 0) / 200) + 1;
  const currentLevelXP = (student.xp || 0) % 200;
  const progressPercent = Math.min(100, Math.round((currentLevelXP / 200) * 100));

  return (
    <div className="flex items-center gap-2">
      {/* Daily Streak Pill */}
      <div
        onClick={onClickStreak}
        title={`${student.streakDays} Day Continuous Learning Streak! Active this week: ${student.activeDaysThisWeek?.join(', ') || 'Mon'}`}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 hover:border-amber-500/40 text-amber-400 cursor-pointer transition select-none group"
      >
        <Flame className="w-4 h-4 fill-amber-400 text-amber-400 group-hover:scale-110 transition-transform animate-pulse" />
        <span className="text-xs font-black tracking-tight">{student.streakDays} Day Streak</span>
      </div>

      {/* XP & Level Badge */}
      <div
        title={`Level ${level} Scholar • ${student.xp} Total XP (${currentLevelXP}/200 XP to Level ${level + 1})`}
        className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold cursor-default select-none"
      >
        <Zap className="w-3.5 h-3.5 fill-indigo-400 text-indigo-400" />
        <span>{student.xp} XP</span>
        <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300">
          Lvl {level}
        </span>
      </div>
    </div>
  );
}

interface CalendarWidgetProps {
  student: StudentUser;
}

export function StreakCalendarWidget({ student }: CalendarWidgetProps) {
  const daysOfWeek = [
    { key: 'Mon', label: 'M' },
    { key: 'Tue', label: 'T' },
    { key: 'Wed', label: 'W' },
    { key: 'Thu', label: 'T' },
    { key: 'Fri', label: 'F' },
    { key: 'Sat', label: 'S' },
    { key: 'Sun', label: 'S' },
  ];

  const todayIndex = new Date().getDay(); // 0 is Sunday, 1 is Monday
  const dayMap: Record<number, string> = {
    1: 'Mon',
    2: 'Tue',
    3: 'Wed',
    4: 'Thu',
    5: 'Fri',
    6: 'Sat',
    0: 'Sun',
  };
  const currentDayKey = dayMap[todayIndex];

  const activeDays = new Set(student.activeDaysThisWeek || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  const level = Math.floor((student.xp || 0) / 200) + 1;
  const currentLevelXP = (student.xp || 0) % 200;
  const progressPercent = Math.min(100, Math.round((currentLevelXP / 200) * 100));

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl backdrop-blur-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Flame className="w-4 h-4 fill-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>7-Day Study Streak</span>
                <span className="text-amber-400 font-extrabold">{student.streakDays} Days</span>
              </h3>
              <p className="text-[11px] text-slate-400">Weekly active learning consistency</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-black text-indigo-400">{student.xp} XP</span>
            <span className="text-[10px] text-slate-500 block">Level {level} Scholar</span>
          </div>
        </div>

        {/* 7-Day Bubble Row */}
        <div className="grid grid-cols-7 gap-2 my-4">
          {daysOfWeek.map((day) => {
            const isActive = activeDays.has(day.key);
            const isToday = day.key === currentDayKey;

            return (
              <div
                key={day.key}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition ${
                  isActive
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                    : 'bg-slate-800/40 border-slate-800 text-slate-500'
                } ${isToday ? 'ring-2 ring-indigo-500/50' : ''}`}
              >
                <span className="text-[10px] font-bold uppercase">{day.label}</span>
                <div className="mt-1">
                  {isActive ? (
                    <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mx-auto" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-slate-700 mx-auto my-1" />
                  )}
                </div>
                <span className="text-[9px] text-slate-400 mt-0.5">{day.key}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Level XP Progress Bar */}
      <div className="pt-2 border-t border-slate-800/80">
        <div className="flex justify-between items-center text-[11px] mb-1.5">
          <span className="text-slate-400 font-medium">Level {level} Mastery Progress</span>
          <span className="text-indigo-300 font-bold">{currentLevelXP} / 200 XP</span>
        </div>
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-500 to-amber-400 h-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}

interface CelebrationBannerProps {
  message: string;
  xpEarned: number;
  streakDays?: number;
  onDismiss: () => void;
}

export function GamificationCelebrationBanner({
  message,
  xpEarned,
  streakDays,
  onDismiss,
}: CelebrationBannerProps) {
  return (
    <div className="fixed top-20 right-4 z-50 max-w-sm bg-gradient-to-r from-indigo-900/90 via-slate-900/90 to-amber-950/90 border border-amber-500/40 rounded-2xl p-4 shadow-2xl backdrop-blur-md animate-slide-up text-white flex items-start gap-3">
      <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
        <Sparkles className="w-5 h-5 animate-spin" />
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-black uppercase tracking-wider text-amber-400">
            Achievement Unlocked!
          </span>
          <span className="text-xs font-extrabold text-emerald-400 bg-emerald-500/20 px-2 py-0.2 rounded-md">
            +{xpEarned} XP
          </span>
        </div>
        <p className="text-xs text-slate-200 leading-snug">{message}</p>
        {streakDays && (
          <p className="text-[11px] text-amber-300 mt-1 font-semibold flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 fill-amber-400" />
            <span>Streak extended to {streakDays} days!</span>
          </p>
        )}
      </div>

      <button
        onClick={onDismiss}
        className="text-slate-400 hover:text-white text-xs p-1 rounded-md"
      >
        ✕
      </button>
    </div>
  );
}
