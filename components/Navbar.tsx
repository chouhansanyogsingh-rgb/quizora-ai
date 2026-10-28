'use client';

import React from 'react';
import {
  Brain,
  Sparkles,
  Settings,
  History,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  LogOut,
  User,
  Video,
} from 'lucide-react';
import { DiagnosticResult, StudentUser } from '@/lib/types';
import { NavbarGamification } from './StreakGamificationBar';

interface Props {
  currentScreen: 'setup' | 'assessment' | 'dashboard' | 'lesson';
  onNavigate: (screen: 'setup' | 'assessment' | 'dashboard' | 'lesson') => void;
  diagnosticResult: DiagnosticResult | null;
  student: StudentUser | null;
  onLogout: () => void;
  onOpenSettings: () => void;
  onToggleHistory: () => void;
  hasHistory: boolean;
}

export function Navbar({
  currentScreen,
  onNavigate,
  diagnosticResult,
  student,
  onLogout,
  onOpenSettings,
  onToggleHistory,
  hasHistory,
}: Props) {
  const steps = [
    { id: 'setup', label: '1. Topic Setup' },
    { id: 'assessment', label: '2. Diagnostic Quiz' },
    { id: 'dashboard', label: '3. Gap Analytics' },
    { id: 'lesson', label: '4. Micro-Lessons' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Brand */}
        <div
          onClick={() => onNavigate('setup')}
          className="flex items-center gap-2.5 cursor-pointer group shrink-0"
        >
          <div className="w-9 h-9 rounded-xl overflow-hidden border border-indigo-500/40 shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 group-hover:scale-105 transition-all bg-[#0b0e23] flex items-center justify-center shrink-0 p-0.5">
            <img
              src="/logo-icon.jpg"
              alt="Quizora AI Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm sm:text-base tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                Quizora AI
              </span>
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                PRO
              </span>
            </div>
            <p className="hidden md:block text-[9px] text-indigo-300/80 font-semibold tracking-wider uppercase">
              LEARN • PRACTICE • IMPROVE
            </p>
          </div>
        </div>

        {/* Navigation Step Breadcrumbs */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-1 rounded-xl text-xs">
          {steps.map((step, idx) => {
            const isActive = currentScreen === step.id;
            const isClickable =
              step.id === 'setup' ||
              (step.id === 'assessment' && diagnosticResult !== null) ||
              (step.id === 'dashboard' && diagnosticResult !== null) ||
              (step.id === 'lesson' && diagnosticResult !== null);

            return (
              <React.Fragment key={step.id}>
                {idx > 0 && <span className="text-slate-600 text-xs px-0.5">/</span>}
                <button
                  disabled={!isClickable}
                  onClick={() => onNavigate(step.id as any)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : isClickable
                      ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      : 'text-slate-600 cursor-not-allowed'
                  }`}
                >
                  {step.label}
                </button>
              </React.Fragment>
            );
          })}
        </nav>

        {/* Right Section: Streak/XP Bar + Student Profile & Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Feature 2: Gamification Streak & XP Bar */}
          {student && (
            <NavbarGamification
              student={student}
              onClickStreak={() => onNavigate('dashboard')}
            />
          )}

          {/* Diagnostic score pill if available */}
          {diagnosticResult && (
            <div
              onClick={() => onNavigate('dashboard')}
              className="hidden xl:flex items-center gap-2 px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700 transition"
            >
              <div className="text-right">
                <p className="text-[9px] text-slate-400 uppercase font-semibold">Mastery</p>
                <p className="text-xs font-bold text-indigo-300">{diagnosticResult.overallScore}%</p>
              </div>
              {diagnosticResult.totalGaps > 0 ? (
                <div className="flex items-center gap-1 text-[10px] text-rose-400 font-medium bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                  <AlertTriangle className="w-3 h-3" />
                  <span>{diagnosticResult.totalGaps} Gap{diagnosticResult.totalGaps > 1 ? 's' : ''}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  <CheckCircle className="w-3 h-3" />
                  <span>Mastered</span>
                </div>
              )}
            </div>
          )}

          {/* Demo Video Showcase Link */}
          <a
            href="/demo.html"
            target="_blank"
            rel="noopener noreferrer"
            title="Watch Official 3-Minute Demo Video"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 hover:text-white text-xs font-bold transition shadow-sm"
          >
            <Video className="w-3.5 h-3.5 text-indigo-400" />
            <span>Demo Video</span>
          </a>

          {/* Progress History Drawer Toggle */}
          <button
            onClick={onToggleHistory}
            title="View Real-Time Progress History Log"
            className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl transition relative"
          >
            <History className="w-4 h-4" />
            {hasHistory && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-slate-950 animate-pulse" />
            )}
          </button>

          {/* AI Settings Modal */}
          <button
            onClick={onOpenSettings}
            title="AI Engine Configuration"
            className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl transition"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Feature 1: Student User Pill & Logout Button */}
          {student && (
            <div className="flex items-center gap-1.5 pl-1 border-l border-slate-800">
              <div
                title={`${student.name} • ${student.emailOrRollNo} • ${student.semester}`}
                className="hidden md:flex items-center gap-2 px-2.5 py-1 bg-slate-900/80 border border-slate-800 rounded-xl"
              >
                <div className="w-6 h-6 rounded-lg bg-indigo-600/30 text-indigo-400 flex items-center justify-center text-[11px] font-black">
                  {student.name.charAt(0)}
                </div>
                <div className="text-left">
                  <p className="text-[11px] font-bold text-white truncate max-w-[80px] leading-tight">
                    {student.name}
                  </p>
                  <p className="text-[9px] text-slate-400 leading-none truncate max-w-[80px]">
                    {student.semester.split(' ')[0]}
                  </p>
                </div>
              </div>

              <button
                onClick={onLogout}
                title="Logout Student Session"
                className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl border border-transparent hover:border-rose-500/30 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
