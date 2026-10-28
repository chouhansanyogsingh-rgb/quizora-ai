'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { TopicProfileSetup } from '@/components/TopicProfileSetup';
import { AdaptiveAssessment } from '@/components/AdaptiveAssessment';
import { KnowledgeGapDashboard } from '@/components/KnowledgeGapDashboard';
import { MicroLessonPath } from '@/components/MicroLessonPath';
import { SettingsModal } from '@/components/SettingsModal';
import { HistoryDrawer } from '@/components/HistoryDrawer';
import { AssessmentAnswer, DiagnosticResult, LearnerProfile, LearningStyle, ProgressHistoryItem, Question } from '@/lib/types';

export default function HomePage() {
  const [currentScreen, setCurrentScreen] = useState<'setup' | 'assessment' | 'dashboard' | 'lesson'>('setup');
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

  // Load API key and cached state from localStorage on mount
  useEffect(() => {
    try {
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

    // Fetch initial history
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
          learningStyle,
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
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Global Top Navbar */}
      <Navbar
        currentScreen={currentScreen}
        onNavigate={(screen) => setCurrentScreen(screen)}
        diagnosticResult={diagnosticResult}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleHistory={() => setIsHistoryOpen(true)}
        hasHistory={history.length > 0}
      />

      {/* Screen Routing */}
      <main className="flex-1 pb-16">
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
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-850 py-6 text-center text-xs text-slate-400 bg-slate-950/60">
        <p>AdaptLearn AI — Stateful Adaptive Learning & Knowledge Gap Remediation</p>
        <p className="mt-1 text-[11px] text-slate-400">
          Powered by Item Response Difficulty Adjustment • Google Gemini API • Structured Pedagogical Modeling
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
