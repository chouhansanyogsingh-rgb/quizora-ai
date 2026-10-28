'use client';

import React from 'react';
import {
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Brain,
  Sparkles,
  Zap,
  BarChart2,
  Compass,
  RotateCcw,
  User,
} from 'lucide-react';
import { DiagnosticResult, StudentUser, SubSkillMastery } from '@/lib/types';
import { MasteryBarChart } from './MasteryBarChart';
import { MasteryRadarChart } from './MasteryRadarChart';
import { StreakCalendarWidget } from './StreakGamificationBar';

interface Props {
  diagnostic: DiagnosticResult;
  student: StudentUser | null;
  onOpenMicroLesson: (subSkill: string) => void;
  onRetakeAssessment: () => void;
}

export function KnowledgeGapDashboard({
  diagnostic,
  student,
  onOpenMicroLesson,
  onRetakeAssessment,
}: Props) {
  const { profile, subSkillMasteries, overallScore, totalGaps, totalDeveloping, totalMastered, insights } =
    diagnostic;

  const gapSkills = subSkillMasteries.filter(s => s.status === 'gap');
  const developingSkills = subSkillMasteries.filter(s => s.status === 'developing');
  const masteredSkills = subSkillMasteries.filter(s => s.status === 'mastered');

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 animate-fade-in space-y-8">
      {/* Top Banner / Topic & Student Overview */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-sm">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
                <Brain className="w-3.5 h-3.5" />
                <span>Diagnostic Assessment Report</span>
              </span>
              {student && (
                <span className="text-xs text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700">
                  Learner: <strong className="text-white">{student.name}</strong> ({student.semester})
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Knowledge Gap Analysis: <span className="text-indigo-400">{profile.topic}</span>
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              Target Style: <strong className="text-slate-200 capitalize">{profile.learningStyle}</strong> • Goal: <span className="text-slate-300">{profile.targetGoal}</span>
            </p>
          </div>

          {/* Overall Mastery Gauge Card */}
          <div className="flex items-center gap-5 bg-slate-950/80 border border-slate-800 p-4 rounded-2xl shrink-0">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={
                    overallScore >= 80
                      ? 'text-emerald-500'
                      : overallScore >= 60
                      ? 'text-amber-500'
                      : 'text-rose-500'
                  }
                  strokeDasharray={`${overallScore}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-sm font-extrabold text-white">{overallScore}%</span>
            </div>
            <div>
              <p className="text-xs uppercase font-bold text-slate-400">Readiness Score</p>
              <p className="text-sm font-semibold text-white">
                {overallScore >= 80 ? 'Proficient' : overallScore >= 60 ? 'Developing' : 'Foundational Gap'}
              </p>
              <p className="text-[11px] text-slate-400">Based on 5 sub-skills</p>
            </div>
          </div>
        </div>

        {/* 3 Metric Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-rose-400 tracking-wider">Critical Gaps</p>
              <p className="text-2xl font-black text-white mt-0.5">{totalGaps}</p>
              <p className="text-[11px] text-rose-300/80">&lt;60% mastery threshold</p>
            </div>
            <div className="p-3 bg-rose-500/20 rounded-xl text-rose-400">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-amber-400 tracking-wider">Developing</p>
              <p className="text-2xl font-black text-white mt-0.5">{totalDeveloping}</p>
              <p className="text-[11px] text-amber-300/80">60% - 79% mastery</p>
            </div>
            <div className="p-3 bg-amber-500/20 rounded-xl text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-emerald-400 tracking-wider">Mastered</p>
              <p className="text-2xl font-black text-white mt-0.5">{totalMastered}</p>
              <p className="text-[11px] text-emerald-300/80">≥80% mastery achieved</p>
            </div>
            <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Feature 2: 7-Day Streak Calendar Widget */}
      {student && <StreakCalendarWidget student={student} />}

      {/* Visual Analytics Row: Bar Chart + Radar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Horizontal Bar Chart */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-indigo-400" />
                <span>Sub-skill Mastery Breakdown</span>
              </h3>
              <span className="text-[11px] text-slate-400">Red = Gap (&lt;60%)</span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Visualizes accuracy across all 5 sub-skill categories calibrated with difficulty weights.
            </p>
          </div>

          <MasteryBarChart subSkillMasteries={subSkillMasteries} />
        </div>

        {/* Radar Spider Chart */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-400" />
                <span>Knowledge Contour (Radar)</span>
              </h3>
              <span className="text-[11px] text-slate-400">Profile Symmetry</span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Demonstrates conceptual balance. Indented vertices highlight your specific knowledge deficits.
            </p>
          </div>

          <MasteryRadarChart subSkillMasteries={subSkillMasteries} />
        </div>
      </div>

      {/* Diagnostic Insights Panel */}
      {insights && insights.length > 0 && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3">
            <Sparkles className="w-4 h-4" />
            <span>AI Diagnostic Observations</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {insights.map((insight, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 bg-slate-800/40 p-3 rounded-xl border border-slate-800">
                <span className="text-indigo-400 font-bold">•</span>
                <span>{insight}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-Skills Remediation Cards List */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-white">Sub-Skill Diagnostic Cards</h2>
            <p className="text-xs text-slate-400">
              Click any sub-skill to generate an automated personalized micro-lesson and 2 targeted practice exercises.
            </p>
          </div>

          {gapSkills.length > 0 && (
            <button
              onClick={() => onOpenMicroLesson(gapSkills[0].subSkill)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 shadow-lg shadow-rose-600/20 transition"
            >
              <Zap className="w-4 h-4" />
              <span>Remediate Priority Gap ({gapSkills[0].subSkill})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="space-y-3">
          {subSkillMasteries.map((skill) => {
            const isGap = skill.status === 'gap';
            const isDeveloping = skill.status === 'developing';
            const isMastered = skill.status === 'mastered';

            return (
              <div
                key={skill.subSkill}
                className={`p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-sm ${
                  isGap
                    ? 'bg-rose-950/20 border-rose-500/30 hover:border-rose-500/60'
                    : isDeveloping
                    ? 'bg-amber-950/15 border-amber-500/30 hover:border-amber-500/60'
                    : 'bg-emerald-950/15 border-emerald-500/30 hover:border-emerald-500/60'
                }`}
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h3 className="text-sm font-bold text-white">{skill.subSkill}</h3>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isGap
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : isDeveloping
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {isGap ? '🔴 Knowledge Gap' : isDeveloping ? '🟡 Developing' : '🟢 Mastered'}
                    </span>
                    <span className="text-xs font-extrabold text-slate-200">
                      Score: {skill.score}%
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{skill.description}</p>
                  <p className="text-[11px] text-slate-400 italic">
                    💡 Recommendation: {skill.recommendation}
                  </p>
                </div>

                {/* Score bar & action CTA */}
                <div className="flex items-center gap-4 shrink-0">
                  <div className="w-24 sm:w-32 bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        isGap ? 'bg-rose-500' : isDeveloping ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${skill.score}%` }}
                    />
                  </div>

                  <button
                    onClick={() => onOpenMicroLesson(skill.subSkill)}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
                      isGap
                        ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                        : isDeveloping
                        ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    }`}
                  >
                    <span>{isGap ? 'Fix Knowledge Gap' : isDeveloping ? 'Strengthen Skill' : 'Review Lesson'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Retake or Change Topic Footer */}
      <div className="flex justify-center pt-4">
        <button
          onClick={onRetakeAssessment}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Start New Topic or Re-run Assessment</span>
        </button>
      </div>
    </div>
  );
}
