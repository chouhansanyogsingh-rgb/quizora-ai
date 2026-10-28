'use client';

import React from 'react';
import { Brain, Sparkles, Settings, History, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { DiagnosticResult } from '@/lib/types';

interface Props {
  currentScreen: 'setup' | 'assessment' | 'dashboard' | 'lesson';
  onNavigate: (screen: 'setup' | 'assessment' | 'dashboard' | 'lesson') => void;
  diagnosticResult: DiagnosticResult | null;
  onOpenSettings: () => void;
  onToggleHistory: () => void;
  hasHistory: boolean;
}

export function Navbar({
  currentScreen,
  onNavigate,
  diagnosticResult,
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div
          onClick={() => onNavigate('setup')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[1px] shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition">
            <div className="w-full h-full bg-slate-900 rounded-[11px] flex items-center justify-center">
              <Brain className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                AdaptLearn AI
              </span>
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                MVP
              </span>
            </div>
            <p className="hidden sm:block text-[10px] text-slate-400 tracking-wide">
              Adaptive Mastery & Dynamic Remediation
            </p>
          </div>
        </div>

        {/* Navigation Step Breadcrumbs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-1 rounded-xl text-xs">
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

        {/* Right Action Icons */}
        <div className="flex items-center gap-2">
          {diagnosticResult && (
            <div
              onClick={() => onNavigate('dashboard')}
              className="hidden lg:flex items-center gap-2.5 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700 transition"
            >
              <div className="text-right">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Mastery</p>
                <p className="text-xs font-bold text-indigo-300">{diagnosticResult.overallScore}%</p>
              </div>
              {diagnosticResult.totalGaps > 0 ? (
                <div className="flex items-center gap-1 text-[11px] text-rose-400 font-medium bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{diagnosticResult.totalGaps} Gap{diagnosticResult.totalGaps > 1 ? 's' : ''}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>All Clear</span>
                </div>
              )}
            </div>
          )}

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

          <button
            onClick={onOpenSettings}
            title="AI Engine Configuration"
            className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl transition"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
