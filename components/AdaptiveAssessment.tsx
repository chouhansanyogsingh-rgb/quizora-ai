'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  Flame,
  Lightbulb,
  AlertTriangle,
  BookOpen,
} from 'lucide-react';
import { AssessmentAnswer, DifficultyLevel, LearnerProfile, Question } from '@/lib/types';
import { getNextDifficulty } from '@/lib/adaptiveEngine';

interface Props {
  profile: LearnerProfile;
  quizBank: {
    subSkills: {
      name: string;
      description: string;
      questions: {
        easy: Question;
        medium: Question;
        hard: Question;
      };
    }[];
  };
  onCompleteQuiz: (answers: AssessmentAnswer[]) => void;
  isEvaluating: boolean;
  onActiveQuestionChange?: (question: Question | null) => void;
}

export function AdaptiveAssessment({
  profile,
  quizBank,
  onCompleteQuiz,
  isEvaluating,
  onActiveQuestionChange,
}: Props) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // 0 to 4
  const [currentDifficulty, setCurrentDifficulty] = useState<DifficultyLevel>('medium');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [confidence, setConfidence] = useState<'low' | 'medium' | 'high'>('medium');
  const [showHint, setShowHint] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [recordedAnswers, setRecordedAnswers] = useState<AssessmentAnswer[]>([]);
  const [adaptationMessage, setAdaptationMessage] = useState<string | null>(null);

  const currentSubSkillGroup = quizBank.subSkills[currentQuestionIndex];
  const currentQuestion: Question = currentSubSkillGroup
    ? currentSubSkillGroup.questions[currentDifficulty] ||
      currentSubSkillGroup.questions['medium'] ||
      currentSubSkillGroup.questions['easy']
    : ({} as Question);

  const totalQuestions = quizBank.subSkills.length || 5;

  // Sync active question to parent context for AI doubt solver
  useEffect(() => {
    if (onActiveQuestionChange && currentQuestion?.questionText) {
      onActiveQuestionChange(currentQuestion);
    }
  }, [currentQuestion, onActiveQuestionChange]);

  // Timer per question
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (!isAnswerSubmitted) {
      interval = setInterval(() => {
        setTimeSpent((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isAnswerSubmitted]);

  const handleSubmitAnswer = () => {
    if (selectedOption === null) return;

    const isCorrect = selectedOption === currentQuestion.correctOptionIndex;
    setIsAnswerSubmitted(true);

    const answerRecord: AssessmentAnswer = {
      questionId: currentQuestion.id,
      subSkill: currentSubSkillGroup.name,
      selectedOptionIndex: selectedOption,
      isCorrect,
      timeSpentSec: timeSpent,
      difficulty: currentDifficulty,
      confidenceRating: confidence,
    };

    const nextAnswers = [...recordedAnswers, answerRecord];
    setRecordedAnswers(nextAnswers);

    // Compute dynamic difficulty transition for the NEXT question
    const nextDiff = getNextDifficulty(currentDifficulty, isCorrect, timeSpent);
    if (currentQuestionIndex + 1 < totalQuestions) {
      if (isCorrect) {
        setAdaptationMessage(
          nextDiff === currentDifficulty
            ? `Top tier maintained! Next question will test advanced application at ${nextDiff.toUpperCase()} difficulty.`
            : `Great accuracy! Dynamic engine escalated difficulty from ${currentDifficulty.toUpperCase()} → ${nextDiff.toUpperCase()} (+mastery weighting).`
        );
      } else {
        setAdaptationMessage(
          `Misconception identified. Dynamic engine recalibrated next question from ${currentDifficulty.toUpperCase()} → ${nextDiff.toUpperCase()} to isolate foundational root causes.`
        );
      }
    }
  };

  const handleNextQuestion = () => {
    const isCorrect = selectedOption === currentQuestion.correctOptionIndex;
    const nextDiff = getNextDifficulty(currentDifficulty, isCorrect, timeSpent);

    if (currentQuestionIndex + 1 < totalQuestions) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setCurrentDifficulty(nextDiff);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      setShowHint(false);
      setTimeSpent(0);
      setAdaptationMessage(null);
      setConfidence('medium');
    } else {
      // Quiz complete!
      onCompleteQuiz(recordedAnswers);
    }
  };

  const difficultyColors = {
    easy: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    medium: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    hard: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  };

  const isCurrentSelectionCorrect = selectedOption === currentQuestion.correctOptionIndex;

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 animate-fade-in">
      {/* Assessment Header & Live Progress */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 mb-6 shadow-xl backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Adaptive Diagnostic:
            </span>
            <span className="text-sm font-extrabold text-white">{profile.topic}</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Dynamic Difficulty Badge */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold tracking-wide uppercase ${
                difficultyColors[currentDifficulty]
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>{currentDifficulty} Tier</span>
            </div>

            {/* Time spent */}
            <div className="flex items-center gap-1 text-xs text-slate-400 font-mono bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>{timeSpent}s</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
          <div
            className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full transition-all duration-500"
            style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-xs text-slate-400">
          <span>
            Question <strong className="text-white">{currentQuestionIndex + 1}</strong> of {totalQuestions}
          </span>
          <span className="font-medium text-indigo-300">
            Sub-skill {currentQuestionIndex + 1}: {currentSubSkillGroup?.name}
          </span>
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative backdrop-blur-sm">
        {/* Dynamic Adaptation Notice (if previous question updated difficulty) */}
        {adaptationMessage && !isAnswerSubmitted && (
          <div className="mb-4 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center gap-2.5 text-xs text-indigo-300 animate-slide-up">
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>{adaptationMessage}</span>
          </div>
        )}

        {/* Sub-skill context tag */}
        <div className="inline-block px-3 py-1 rounded-md bg-slate-800 border border-slate-700 text-xs text-slate-300 font-medium mb-4">
          Diagnostic Target: <strong className="text-white">{currentSubSkillGroup?.name}</strong>
        </div>

        {/* Question Text */}
        <h2 className="text-lg sm:text-xl font-bold text-white mb-4 leading-relaxed">
          {currentQuestion.questionText}
        </h2>

        {/* Code snippet if present */}
        {currentQuestion.codeSnippet && (
          <div className="mb-6 rounded-xl overflow-hidden border border-slate-700/80 bg-slate-950 font-mono text-xs sm:text-sm text-indigo-200 p-4 shadow-inner">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[11px] text-slate-500">
              <span>Code Snippet</span>
              <span>Python / Algorithmic</span>
            </div>
            <pre className="overflow-x-auto whitespace-pre leading-relaxed">
              <code>{currentQuestion.codeSnippet}</code>
            </pre>
          </div>
        )}

        {/* Options List */}
        <div className="space-y-3 mb-6">
          {currentQuestion.options?.map((option, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrectOption = idx === currentQuestion.correctOptionIndex;

            let cardStyle =
              'bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700';

            if (!isAnswerSubmitted) {
              if (isSelected) {
                cardStyle = 'bg-indigo-600/20 border-indigo-500 ring-2 ring-indigo-500/30 text-white';
              }
            } else {
              // Answer submitted state: Highlight chosen in red if wrong, and correct in green!
              if (isCorrectOption) {
                cardStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-200 font-semibold ring-2 ring-emerald-500/40 shadow-emerald-500/10 shadow-lg';
              } else if (isSelected && !isCorrectOption) {
                cardStyle = 'bg-rose-500/20 border-rose-500 text-rose-200 ring-2 ring-rose-500/40 shadow-rose-500/10 shadow-lg';
              } else {
                cardStyle = 'bg-slate-800/20 border-slate-800/60 text-slate-500 opacity-50';
              }
            }

            return (
              <button
                key={idx}
                type="button"
                disabled={isAnswerSubmitted}
                onClick={() => setSelectedOption(idx)}
                className={`w-full text-left p-4 rounded-xl border transition flex items-center justify-between gap-3 ${cardStyle}`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                      isSelected && !isAnswerSubmitted
                        ? 'bg-indigo-600 text-white'
                        : isAnswerSubmitted && isCorrectOption
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : isAnswerSubmitted && isSelected
                        ? 'bg-rose-500 text-white shadow-sm'
                        : 'bg-slate-700/60 text-slate-400'
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="text-sm">{option}</span>
                </div>

                {isAnswerSubmitted && isCorrectOption && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Correct Answer</span>
                  </div>
                )}
                {isAnswerSubmitted && isSelected && !isCorrectOption && (
                  <div className="flex items-center gap-1.5 text-xs text-rose-400 font-bold bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/30">
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>Your Selection</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Hint Section (before submission) */}
        {!isAnswerSubmitted && currentQuestion.hint && (
          <div className="mb-6">
            <button
              type="button"
              onClick={() => setShowHint(!showHint)}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-300 transition"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>{showHint ? 'Hide Hint' : 'Need a subtle hint?'}</span>
            </button>
            {showHint && (
              <div className="mt-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-200 animate-fade-in">
                💡 {currentQuestion.hint}
              </div>
            )}
          </div>
        )}

        {/* Confidence Self-Rating (before submission) */}
        {!isAnswerSubmitted && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Your confidence:</span>
              {(['low', 'medium', 'high'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setConfidence(lvl)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize border transition ${
                    confidence === lvl
                      ? 'bg-slate-700 border-indigo-400 text-white'
                      : 'bg-slate-800/40 border-slate-700/50 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            <button
              type="button"
              disabled={selectedOption === null}
              onClick={handleSubmitAnswer}
              className="w-full sm:w-auto px-7 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:pointer-events-none text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition"
            >
              Confirm Answer
            </button>
          </div>
        )}

        {/* Feature 3: Immediate High-Visibility Wrong / Correct Answer Explanation Card */}
        {isAnswerSubmitted && (
          <div className="pt-6 border-t border-slate-800 animate-slide-up space-y-4">
            <div
              className={`p-5 rounded-2xl border ${
                isCurrentSelectionCorrect
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-100 shadow-xl shadow-emerald-950/20'
                  : 'bg-rose-950/30 border-rose-500/40 text-rose-100 shadow-xl shadow-rose-950/20'
              }`}
            >
              <div className="flex items-center justify-between gap-3 mb-3 border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2 font-extrabold text-sm sm:text-base">
                  {isCurrentSelectionCorrect ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      <span className="text-emerald-300">Great Job! Correct Concept Applied</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                      <span className="text-rose-300">Why This Happens &amp; Correct Concept</span>
                    </>
                  )}
                </div>

                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                    isCurrentSelectionCorrect
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {isCurrentSelectionCorrect ? 'Mastery +' : 'Knowledge Gap Identified'}
                </span>
              </div>

              {/* Misconception Alert if wrong */}
              {!isCurrentSelectionCorrect && (
                <div className="mb-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-200 space-y-1">
                  <p className="font-bold flex items-center gap-1.5 text-rose-300">
                    <XCircle className="w-3.5 h-3.5 text-rose-400" />
                    <span>The Underlying Misconception:</span>
                  </p>
                  <p className="leading-relaxed opacity-90">
                    Option {String.fromCharCode(65 + (selectedOption ?? 0))} is a classic trap. Students frequently overlook that Python references mutable sub-objects by address, or assume lookup operations incur linear traversal when hashed collections provide constant time.
                  </p>
                </div>
              )}

              {/* Core Concept Breakdown */}
              <div className="space-y-1.5 text-xs sm:text-sm leading-relaxed">
                <p className="font-bold text-white flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-300" />
                  <span>The Fundamental Principle:</span>
                </p>
                <p className="text-slate-200 opacity-95">{currentQuestion.explanation}</p>
              </div>
            </div>

            {/* Dynamic difficulty adaptation notice */}
            {adaptationMessage && (
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-indigo-300 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>{adaptationMessage}</span>
              </div>
            )}

            {/* Feature 3: Explicit "Got It — Next Question" Action Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <span className="text-[11px] text-slate-400">
                Read the concept explanation above before continuing to seal the gap.
              </span>

              <button
                type="button"
                disabled={isEvaluating}
                onClick={handleNextQuestion}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs sm:text-sm font-extrabold rounded-xl shadow-lg shadow-indigo-600/40 transition transform active:scale-95"
              >
                {isEvaluating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Analyzing Sub-Skill Knowledge Gaps...</span>
                  </>
                ) : currentQuestionIndex + 1 < totalQuestions ? (
                  <>
                    <span>Got It — Next Question</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>Got It — View Diagnostic Results</span>
                    <Sparkles className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
