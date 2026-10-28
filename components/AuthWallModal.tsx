'use client';

import React, { useState } from 'react';
import {
  Brain,
  Sparkles,
  Zap,
  User,
  Mail,
  GraduationCap,
  Eye,
  Code2,
  ListOrdered,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { DEMO_STUDENT, LearningStyle, StudentUser } from '@/lib/types';

interface Props {
  isOpen: boolean;
  onLogin: (student: StudentUser) => void;
}

export function AuthWallModal({ isOpen, onLogin }: Props) {
  const [mode, setMode] = useState<'demo' | 'manual'>('demo');
  const [name, setName] = useState('');
  const [emailOrRollNo, setEmailOrRollNo] = useState('');
  const [semester, setSemester] = useState('Semester 5');
  const [learningStyle, setLearningStyle] = useState<LearningStyle>('visual');

  if (!isOpen) return null;

  const handleDemoLogin = () => {
    onLogin(DEMO_STUDENT);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newStudent: StudentUser = {
      id: `student-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      emailOrRollNo: emailOrRollNo.trim() || 'STU-' + Math.floor(1000 + Math.random() * 9000),
      semester: semester || 'Semester 1',
      preferredLearningStyle: learningStyle,
      streakDays: 1,
      xp: 100,
      lastActiveDate: new Date().toISOString(),
      activeDaysThisWeek: ['Mon'],
      createdAt: new Date().toISOString(),
    };

    onLogin(newStudent);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-xl rounded-3xl p-6 sm:p-8 shadow-2xl relative text-slate-100 my-8">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-1/2 translate-x-1/2 -mt-16 w-64 h-32 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="relative group">
              <img
                src="/logo.jpg"
                alt="Quizora AI"
                className="h-16 sm:h-20 w-auto rounded-2xl border border-indigo-500/40 shadow-2xl shadow-indigo-500/30 object-contain bg-[#0b0e23] p-1.5 group-hover:scale-105 transition-transform"
              />
            </div>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Student Verification Portal</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight mb-0.5">
            Welcome to <span className="text-indigo-400">Quizora AI</span>
          </h2>
          <p className="text-[11px] font-bold text-indigo-300 uppercase tracking-widest mb-2">
            LEARN • PRACTICE • IMPROVE
          </p>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            Log in to initiate your stateful adaptive learning path, daily streak tracking, and personalized gap remediation.
          </p>
        </div>

        {/* 1-Click Demo Login Banner (Top Priority For Judges) */}
        <div className="mb-6 bg-gradient-to-r from-indigo-950/90 via-slate-900 to-indigo-950/90 border-2 border-indigo-500/60 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden group">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 text-indigo-300 font-extrabold text-sm sm:text-base">
              <Zap className="w-5 h-5 text-amber-400 fill-amber-400 animate-pulse" />
              <span>Recommended: Instant Demo Access</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
              For Judges
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs mb-4 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Student</span>
              <strong className="text-white text-xs truncate block">{DEMO_STUDENT.name}</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Roll / ID</span>
              <span className="text-slate-300 text-xs font-mono">{DEMO_STUDENT.emailOrRollNo}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Streak</span>
              <span className="text-amber-400 font-bold text-xs">🔥 {DEMO_STUDENT.streakDays} Days</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Style</span>
              <span className="text-cyan-400 font-semibold text-xs capitalize">{DEMO_STUDENT.preferredLearningStyle}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDemoLogin}
            className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 shadow-lg shadow-indigo-600/40 transition transform active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4 fill-white" />
            <span>1-Click Demo Student Login</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex py-2 items-center mb-6">
          <div className="flex-grow border-t border-slate-800" />
          <span className="flex-shrink mx-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            or sign up with custom credentials
          </span>
          <div className="flex-grow border-t border-slate-800" />
        </div>

        {/* Custom Form */}
        <form onSubmit={handleManualSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-400" />
                <span>Student Full Name</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Jordan Lee"
                required
                className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
                <span>Email or Roll No.</span>
              </label>
              <input
                type="text"
                value={emailOrRollNo}
                onChange={(e) => setEmailOrRollNo(e.target.value)}
                placeholder="e.g. CS-2025-099"
                required
                className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
              <span>Current Semester / Year</span>
            </label>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Semester 1">Semester 1 (Freshman)</option>
              <option value="Semester 2">Semester 2 (Freshman)</option>
              <option value="Semester 3">Semester 3 (Sophomore)</option>
              <option value="Semester 4">Semester 4 (Sophomore)</option>
              <option value="Semester 5">Semester 5 (Junior)</option>
              <option value="Semester 6">Semester 6 (Junior)</option>
              <option value="Semester 7">Semester 7 (Senior)</option>
              <option value="Semester 8">Semester 8 (Senior / Capstone)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Preferred Learning Style
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                {
                  id: 'visual' as LearningStyle,
                  label: 'Visual / Analogy',
                  icon: Eye,
                  color: 'text-cyan-400',
                },
                {
                  id: 'code' as LearningStyle,
                  label: 'Code-First',
                  icon: Code2,
                  color: 'text-indigo-400',
                },
                {
                  id: 'step-by-step' as LearningStyle,
                  label: 'Step-by-Step',
                  icon: ListOrdered,
                  color: 'text-amber-400',
                },
              ].map((style) => {
                const Icon = style.icon;
                const isSelected = learningStyle === style.id;
                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setLearningStyle(style.id)}
                    className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1.5 ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500 ring-2 ring-indigo-500/30 text-white'
                        : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${style.color}`} />
                    <span className="text-[11px] font-semibold">{style.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition flex items-center justify-center gap-2 mt-2"
          >
            <span>Create Student Profile & Begin</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-5 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Local session persisted • Resilient fallback engine enabled</span>
        </div>
      </div>
    </div>
  );
}
