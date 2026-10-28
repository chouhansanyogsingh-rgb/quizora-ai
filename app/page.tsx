'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { TopicProfileSetup } from '@/components/TopicProfileSetup';
import { AdaptiveAssessment } from '@/components/AdaptiveAssessment';
import { KnowledgeGapDashboard } from '@/components/KnowledgeGapDashboard';
import { MicroLessonPath } from '@/components/MicroLessonPath';
import { SettingsModal } from '@/components/SettingsModal';
import { HistoryDrawer } from '@/components/HistoryDrawer';
import { AuthWallModal } from '@/components/AuthWallModal';
import { GamificationCelebrationBanner } from '@/components/StreakGamificationBar';
import {
  AssessmentAnswer,
  DiagnosticResult,
  LearnerProfile,
  LearningStyle,
  ProgressHistoryItem,
  Question,
  StudentUser,
  DEMO_STUDENT,
} from '@/lib/types';
import { triggerConfetti } from '@/lib/utils';

export default function HomePage() {
  const [currentScreen, setCurrentScreen] = useState<'setup' | 'assessment' | 'dashboard' | 'lesson'>('setup');
  const [studentUser, setStudentUser] = useState<StudentUser | null>(null);
  const [isAuthWallOpen, setIsAuthWallOpen] = useState(false);

  const [profile, setProfile] = useState<LearnerProfile | null>(null);
  const [quizBank, setQuizBank] = useState<{
    subSkills: {
      name: string;
      description: string;
      questions: {
        easy: Question;
        medium: Question;
        hard: Question;
      };
    }[];
  } | null>(null);

  const [diagnosticResult, setDiagnosticResult] = useState<DiagnosticResult | null>(null);
  const [selectedSubSkill, setSelectedSubSkill] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>('');
  const [history, setHistory] = useState<ProgressHistoryItem[]>([]);

  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Gamification celebration banner state
  const [celebration, setCelebration] = useState<{
    message: string;
    xpEarned: number;
    streakDays?: number;
  } | null>(null);

  // Load student session and state from localStorage on mount
  useEffect(() => {
    try {
      const storedStudent = localStorage.getItem('adaptlearn_student_session');
      if (storedStudent) {
        setStudentUser(JSON.parse(storedStudent));
      } else {
        // Gate with auth wall if no student is logged in
        setIsAuthWallOpen(true);
      }

      const storedKey = localStorage.getItem('adaptlearn_api_key');
      if (storedKey) setApiKey(storedKey);

      const storedDiagnostic = localStorage.getItem('adaptlearn_last_diagnostic');
      if (storedDiagnostic) {
        const parsed = JSON.parse(storedDiagnostic);
        setDiagnosticResult(parsed);
        if (parsed.profile) setProfile(parsed.profile);
        if (parsed.subSkillMasteries?.length > 0) {
          setSelectedSubSkill(parsed.subSkillMasteries[0].subSkill);
        }
      }
    } catch (e) {
      console.warn('LocalStorage access issue:', e);
    }

    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/user/progress');
      const data = await res.json();
      if (data.history) {
        setHistory(data.history);
      }
    } catch (err) {
      console.warn('Failed to load history:', err);
    }
  };

  const handleStudentLogin = (student: StudentUser) => {
    setStudentUser(student);
    try {
      localStorage.setItem('adaptlearn_student_session', JSON.stringify(student));
    } catch (e) {}
    setIsAuthWallOpen(false);
    triggerConfetti();

    setCelebration({
      message: `Welcome back, ${student.name}! Your ${student.streakDays}-day streak is active.`,
      xpEarned: 25,
      streakDays: student.streakDays,
    });
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('adaptlearn_student_session');
    } catch (e) {}
    setStudentUser(null);
    setIsAuthWallOpen(true);
  };

  const handleAwardXP = (amount: number, message: string, extendStreak: boolean = false) => {
    if (!studentUser) return;

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const todayName = dayNames[new Date().getDay()];
    const currentActiveDays = studentUser.activeDaysThisWeek || [];
    const updatedDays = currentActiveDays.includes(todayName)
      ? currentActiveDays
      : [...currentActiveDays, todayName];

    const nextStreak = extendStreak ? (studentUser.streakDays || 1) + 1 : studentUser.streakDays;

    const updatedStudent: StudentUser = {
      ...studentUser,
      xp: (studentUser.xp || 0) + amount,
      streakDays: nextStreak,
      activeDaysThisWeek: updatedDays,
      lastActiveDate: new Date().toISOString(),
    };

    setStudentUser(updatedStudent);
    try {
      localStorage.setItem('adaptlearn_student_session', JSON.stringify(updatedStudent));
    } catch (e) {}

    setCelebration({
      message,
      xpEarned: amount,
      streakDays: extendStreak ? nextStreak : undefined,
    });

    fetchHistory();
  };

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    try {
      localStorage.setItem('adaptlearn_api_key', key);
    } catch (e) {}
  };

  const handleResetData = async () => {
    try {
      await fetch('/api/user/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' }),
      });
      localStorage.removeItem('adaptlearn_last_diagnostic');
      setDiagnosticResult(null);
      setProfile(null);
      setQuizBank(null);
      setHistory([]);
      setCurrentScreen('setup');
    } catch (e) {
      console.warn('Reset error:', e);
    }
  };

  // Launch Diagnostic Quiz from Setup Screen
  const handleStartAssessment = async (
    topic: string,
    learningStyle: LearningStyle,
    targetGoal: string,
    experienceLevel: 'beginner' | 'intermediate' | 'advanced'
  ) => {
    setIsGeneratingQuiz(true);
    try {
      const res = await fetch('/api/assessment/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          learningStyle: studentUser?.preferredLearningStyle || learningStyle,
          targetGoal,
          experienceLevel,
          customApiKey: apiKey,
        }),
      });

      const data = await res.json();
      if (data.success && data.quizBank) {
        setProfile(data.profile);
        setQuizBank(data.quizBank);
        setCurrentScreen('assessment');
      } else {
        alert(data.error || 'Failed to initialize assessment');
      }
    } catch (err: any) {
      console.error('Assessment generation error:', err);
      alert('Could not generate assessment. Check network or try again.');
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  // Diagnostic Quiz Completed -> Calculate & Render Dashboard
  const handleCompleteQuiz = async (answers: AssessmentAnswer[]) => {
    if (!profile || !quizBank) return;
    setIsEvaluating(true);

    try {
      const subSkillNames = quizBank.subSkills.map((s) => s.name);
      const res = await fetch('/api/assessment/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile,
          answers,
          subSkillNames,
        }),
      });

      const data = await res.json();
      if (data.success && data.diagnosticResult) {
        const result: DiagnosticResult = data.diagnosticResult;
        setDiagnosticResult(result);

        // Find first gap subskill to recommend for remediation
        const firstGap = result.subSkillMasteries.find((s) => s.status === 'gap');
        setSelectedSubSkill(
          firstGap ? firstGap.subSkill : result.subSkillMasteries[0]?.subSkill || ''
        );

        // Cache in localStorage
        try {
          localStorage.setItem('adaptlearn_last_diagnostic', JSON.stringify(result));
        } catch (e) {}

        // Award streak and XP for quiz completion!
        handleAwardXP(100, `Completed diagnostic quiz for "${profile.topic}" with ${result.overallScore}% mastery!`, true);
        triggerConfetti();

        await fetchHistory();
        setCurrentScreen('dashboard');
      } else {
        alert(data.error || 'Evaluation failed');
      }
    } catch (err) {
      console.error('Assessment evaluation error:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  // Launch targeted micro-lesson for a sub-skill
  const handleOpenMicroLesson = (subSkill: string) => {
    setSelectedSubSkill(subSkill);
    setCurrentScreen('lesson');
  };

  // Handle Real-time Mastery Progression updates from solved practice problems
  const handleUpdateDiagnostic = (updatedDiag: DiagnosticResult) => {
    setDiagnosticResult(updatedDiag);
    try {
      localStorage.setItem('adaptlearn_last_diagnostic', JSON.stringify(updatedDiag));
    } catch (e) {}
    fetchHistory();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 relative">
      {/* Feature 1: Student Authentication Wall (gates app if not logged in) */}
      <AuthWallModal
        isOpen={isAuthWallOpen || !studentUser}
        onLogin={handleStudentLogin}
      />

      {/* Feature 2: Celebration Banner on Streak / XP awards */}
      {celebration && (
        <GamificationCelebrationBanner
          message={celebration.message}
          xpEarned={celebration.xpEarned}
          streakDays={celebration.streakDays}
          onDismiss={() => setCelebration(null)}
        />
      )}

      {/* Global Top Navbar with Streak, XP, & Logout */}
      <Navbar
        currentScreen={currentScreen}
        onNavigate={(screen) => setCurrentScreen(screen)}
        diagnosticResult={diagnosticResult}
        student={studentUser}
        onLogout={handleLogout}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleHistory={() => setIsHistoryOpen(true)}
        hasHistory={history.length > 0}
      />

      {/* Screen Routing */}
      <main className="flex-1 pb-24">
        {currentScreen === 'setup' && (
          <TopicProfileSetup
            onStartAssessment={handleStartAssessment}
            isLoading={isGeneratingQuiz}
          />
        )}

        {currentScreen === 'assessment' && profile && quizBank && (
          <AdaptiveAssessment
            profile={profile}
            quizBank={quizBank}
            onCompleteQuiz={handleCompleteQuiz}
            isEvaluating={isEvaluating}
          />
        )}

        {currentScreen === 'dashboard' && diagnosticResult && (
          <KnowledgeGapDashboard
            diagnostic={diagnosticResult}
            student={studentUser}
            onOpenMicroLesson={handleOpenMicroLesson}
            onRetakeAssessment={() => setCurrentScreen('setup')}
          />
        )}

        {currentScreen === 'lesson' && diagnosticResult && (
          <MicroLessonPath
            diagnostic={diagnosticResult}
            selectedSubSkill={selectedSubSkill}
            onSelectSubSkill={(skill) => setSelectedSubSkill(skill)}
            onUpdateDiagnostic={handleUpdateDiagnostic}
            apiKey={apiKey}
            onReturnToDashboard={() => setCurrentScreen('dashboard')}
            onAwardXP={(amount, msg) => handleAwardXP(amount, msg, false)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-400 bg-slate-950/60">
        <div className="flex items-center justify-center gap-2 mb-1.5">
          <img src="/logo-icon.jpg" alt="Quizora AI" className="h-6 w-6 rounded-md object-contain bg-[#0b0e23] border border-indigo-500/30 p-0.5" />
          <span className="font-extrabold text-white text-sm">Quizora AI</span>
          <span className="text-slate-500">•</span>
          <span className="text-[10px] font-bold text-indigo-400 tracking-widest uppercase">Learn • Practice • Improve</span>
        </div>
        <p className="text-[11px] text-slate-500">
          Item Response Difficulty Adaptation • Knowledge Gap Diagnostics • 7-Day Consistency Streak
        </p>
      </footer>

      {/* AI Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
        onResetData={handleResetData}
      />

      {/* Progression History Timeline Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
      />
    </div>
  );
}
