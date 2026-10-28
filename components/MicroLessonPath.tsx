'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  BookOpen,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Award,
  ChevronRight,
  Code2,
  Eye,
  ListOrdered,
  RotateCw,
} from 'lucide-react';
import { DiagnosticResult, LearningStyle, MicroLesson, PracticeProblem, SubSkillMastery } from '@/lib/types';
import { triggerConfetti } from '@/lib/utils';

interface Props {
  diagnostic: DiagnosticResult;
  selectedSubSkill: string;
  onSelectSubSkill: (subSkill: string) => void;
  onUpdateDiagnostic: (updatedDiag: DiagnosticResult) => void;
  apiKey?: string;
  onReturnToDashboard: () => void;
  onAwardXP?: (amount: number, message: string) => void;
}

export function MicroLessonPath({
  diagnostic,
  selectedSubSkill,
  onSelectSubSkill,
  onUpdateDiagnostic,
  apiKey,
  onReturnToDashboard,
  onAwardXP,
}: Props) {
  const [lesson, setLesson] = useState<MicroLesson | null>(null);
  const [isLoadingLesson, setIsLoadingLesson] = useState(false);
  const [practiceAnswers, setPracticeAnswers] = useState<Record<string, number | null>>({});
  const [practiceResults, setPracticeResults] = useState<
    Record<string, { isCorrect: boolean; feedback: string; scoreDelta: number }>
  >({});
  const [isSubmittingProblemId, setIsSubmittingProblemId] = useState<string | null>(null);
  const [remediatedSkills, setRemediatedSkills] = useState<Set<string>>(new Set());

  const currentSkillMastery = diagnostic.subSkillMasteries.find(
    (s) => s.subSkill.toLowerCase() === selectedSubSkill.toLowerCase()
  ) || diagnostic.subSkillMasteries[0];

  // Fetch or generate micro-lesson when selectedSubSkill or learningStyle changes
  useEffect(() => {
    let active = true;

    async function loadLesson() {
      if (!selectedSubSkill) return;
      setIsLoadingLesson(true);
      try {
        const res = await fetch('/api/lesson/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: diagnostic.profile.topic,
            subSkill: selectedSubSkill,
            learningStyle: diagnostic.profile.learningStyle,
            customApiKey: apiKey,
          }),
        });
        const data = await res.json();
        if (active && data.microLesson) {
          setLesson(data.microLesson);
        }
      } catch (err) {
        console.error('Failed to fetch micro lesson:', err);
      } finally {
        if (active) setIsLoadingLesson(false);
      }
    }

    loadLesson();
    return () => {
      active = false;
    };
  }, [selectedSubSkill, diagnostic.profile.learningStyle, diagnostic.profile.topic, apiKey]);

  // Handle submitting targeted practice answer
  const handleSubmitPractice = async (problem: PracticeProblem) => {
    const selectedOption = practiceAnswers[problem.id];
    if (selectedOption === undefined || selectedOption === null) return;

    setIsSubmittingProblemId(problem.id);
    try {
      const res = await fetch('/api/practice/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          diagnosticId: diagnostic.id,
          subSkill: selectedSubSkill,
          problem,
          selectedOptionIndex: selectedOption,
          customApiKey: apiKey,
        }),
      });

      const data = await res.json();
      if (data.success && data.evaluation) {
        setPracticeResults((prev) => ({
          ...prev,
          [problem.id]: data.evaluation,
        }));

        if (data.evaluation.isCorrect) {
          triggerConfetti();
          if (onAwardXP) {
            onAwardXP(50, `Solved targeted practice for "${selectedSubSkill}"!`);
          }
        }

        if (data.updatedDiagnostic) {
          onUpdateDiagnostic(data.updatedDiagnostic);
          if (data.updatedMastery && data.updatedMastery.score >= 80) {
            setRemediatedSkills((prev) => new Set(prev).add(selectedSubSkill));
            if (onAwardXP) {
              onAwardXP(50, `🎉 Mastered "${selectedSubSkill}"! Knowledge gap successfully bridged.`);
            }
          }
        }
      }
    } catch (err) {
      console.error('Error submitting practice answer:', err);
    } finally {
      setIsSubmittingProblemId(null);
    }
  };

  const learningStyleIcons = {
    visual: Eye,
    code: Code2,
    'step-by-step': ListOrdered,
  };
  const StyleIcon = learningStyleIcons[diagnostic.profile.learningStyle] || Sparkles;

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 animate-fade-in space-y-8">
      {/* Navigation Sub-skill Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <button
            onClick={onReturnToDashboard}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition mb-2"
          >
            <span>← Back to Knowledge Gap Dashboard</span>
          </button>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <span>Targeted Remediation Learning Path</span>
          </h1>
        </div>

        {/* Style Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-indigo-300">
          <StyleIcon className="w-4 h-4 text-indigo-400" />
          <span>Style: <strong className="capitalize text-white">{diagnostic.profile.learningStyle}</strong></span>
        </div>
      </div>

      {/* Sub-skill Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {diagnostic.subSkillMasteries.map((skill) => {
          const isSelected = skill.subSkill.toLowerCase() === selectedSubSkill.toLowerCase();
          const isGap = skill.status === 'gap';
          const isMastered = skill.status === 'mastered';

          return (
            <button
              key={skill.subSkill}
              onClick={() => onSelectSubSkill(skill.subSkill)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition flex items-center gap-2 border ${
                isSelected
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isGap ? 'bg-rose-500' : isMastered ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              />
              <span>{skill.subSkill}</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                isSelected ? 'bg-indigo-800/80 text-white' : 'bg-slate-800 text-slate-300'
              }`}>
                {skill.score}%
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Micro-Lesson Card */}
      {isLoadingLesson ? (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-12 text-center shadow-xl">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h3 className="text-base font-bold text-white mb-1">
            Synthesizing Tailored Micro-Lesson for {selectedSubSkill}...
          </h3>
          <p className="text-xs text-slate-400">
            Applying pedagogical rules for <span className="capitalize text-indigo-300">{diagnostic.profile.learningStyle}</span> learners
          </p>
        </div>
      ) : lesson ? (
        <div className="space-y-6">
          {/* Lesson Header Banner */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                  Targeted Micro-Lesson
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-0.5">
                  {lesson.title}
                </h2>
              </div>

              {/* Live Sub-skill Mastery Badge */}
              <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-800 px-4 py-2 rounded-2xl shrink-0">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Current Mastery</p>
                  <p className="text-sm font-extrabold text-white">
                    {currentSkillMastery?.score || 0}%
                  </p>
                </div>
                <div
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    (currentSkillMastery?.score || 0) >= 80
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : (currentSkillMastery?.score || 0) >= 60
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {(currentSkillMastery?.score || 0) >= 80
                    ? 'Mastered'
                    : (currentSkillMastery?.score || 0) >= 60
                    ? 'Developing'
                    : 'Gap Alert'}
                </div>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed max-w-3xl mb-6">
              {lesson.overview}
            </p>

            {/* Core Explanation Paragraphs */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 mb-6 text-xs sm:text-sm text-slate-200 leading-relaxed space-y-3">
              <p>{lesson.coreConceptExplanation}</p>
            </div>

            {/* Learning Style Specialized Artifact (Diagram / Code / Step List) */}
            {lesson.visualOrCodeArtifact && (
              <div className="mb-6 rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-950 shadow-inner">
                <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <StyleIcon className="w-4 h-4 text-indigo-400" />
                    <span>{lesson.visualOrCodeArtifact.title}</span>
                  </div>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {lesson.visualOrCodeArtifact.type}
                  </span>
                </div>
                <pre className="p-4 overflow-x-auto text-xs sm:text-sm font-mono text-cyan-200 whitespace-pre leading-relaxed">
                  <code>{lesson.visualOrCodeArtifact.content}</code>
                </pre>
              </div>
            )}

            {/* Pitfall & Takeaway side-by-side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-wider mb-1">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Common Pitfall to Avoid</span>
                </div>
                <p className="text-xs text-rose-200/90 leading-relaxed">{lesson.commonPitfall}</p>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  <span>Key Mental Takeaway</span>
                </div>
                <p className="text-xs text-emerald-200/90 leading-relaxed">{lesson.keyTakeaway}</p>
              </div>
            </div>
          </div>

          {/* Targeted Practice Section (2 Problems to Close Gap) */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>Targeted Practice Exercises</span>
                </div>
                <h3 className="text-lg font-bold text-white">
                  Solve 2 Problems to Remediate "{selectedSubSkill}"
                </h3>
              </div>
              <span className="text-xs text-slate-400">
                Each correct solution awards <strong className="text-emerald-400">+25% Mastery</strong>
              </span>
            </div>

            {/* Practice Problems List */}
            <div className="space-y-6">
              {lesson.practiceProblems?.map((prob, pIdx) => {
                const result = practiceResults[prob.id];
                const selectedOption = practiceAnswers[prob.id];
                const isSubmitting = isSubmittingProblemId === prob.id;

                return (
                  <div
                    key={prob.id}
                    className="p-5 sm:p-6 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-4"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-indigo-400 uppercase">
                        Problem {pIdx + 1} of {lesson.practiceProblems.length}
                      </span>
                      {result && (
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            result.isCorrect
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {result.isCorrect ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Solved (+{result.scoreDelta}%)</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5 text-rose-400" />
                              <span>Attempted</span>
                            </>
                          )}
                        </span>
                      )}
                    </div>

                    <h4 className="text-base font-bold text-white">{prob.title}</h4>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {prob.scenario}
                    </p>

                    {prob.codeSnippet && (
                      <pre className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-indigo-200 overflow-x-auto whitespace-pre">
                        <code>{prob.codeSnippet}</code>
                      </pre>
                    )}

                    {/* Options list if multiple choice */}
                    {prob.options && (
                      <div className="space-y-2 pt-1">
                        {prob.options.map((opt, oIdx) => {
                          const isOptionSelected = selectedOption === oIdx;
                          const isCorrectOption = prob.correctOptionIndex === oIdx;

                          let style =
                            'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-900 hover:border-slate-700';

                          if (result) {
                            if (isCorrectOption) {
                              style = 'bg-emerald-500/20 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500/30';
                            } else if (isOptionSelected && !isCorrectOption) {
                              style = 'bg-rose-500/20 border-rose-500 text-rose-200';
                            } else {
                              style = 'bg-slate-900/30 border-slate-800/40 text-slate-500 opacity-60';
                            }
                          } else if (isOptionSelected) {
                            style = 'bg-indigo-600/20 border-indigo-500 text-white ring-1 ring-indigo-500/30';
                          }

                          return (
                            <button
                              key={oIdx}
                              type="button"
                              disabled={Boolean(result)}
                              onClick={() =>
                                setPracticeAnswers((prev) => ({
                                  ...prev,
                                  [prob.id]: oIdx,
                                }))
                              }
                              className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm transition flex items-center justify-between gap-3 ${style}`}
                            >
                              <div className="flex items-center gap-2.5">
                                <span className="w-5 h-5 rounded-md bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400 shrink-0">
                                  {String.fromCharCode(65 + oIdx)}
                                </span>
                                <span>{opt}</span>
                              </div>
                              {result && isCorrectOption && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Result Feedback Banner */}
                    {result && (
                      <div
                        className={`p-3.5 rounded-xl border text-xs leading-relaxed animate-slide-up ${
                          result.isCorrect
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                            : 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                        }`}
                      >
                        <p className="font-semibold mb-0.5">
                          {result.isCorrect ? '🎉 Knowledge Gap Bridged!' : 'Review Feedback:'}
                        </p>
                        <p>{result.feedback}</p>
                      </div>
                    )}

                    {/* Submit Problem Button */}
                    {!result && (
                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          disabled={selectedOption === undefined || isSubmitting}
                          onClick={() => handleSubmitPractice(prob)}
                          className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:pointer-events-none shadow-md shadow-indigo-600/30 transition flex items-center gap-2"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              <span>Evaluating Solution...</span>
                            </>
                          ) : (
                            <>
                              <span>Submit Practice Solution</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-400">
                Mastery updates synchronize automatically to your visual dashboard.
              </div>

              <button
                onClick={onReturnToDashboard}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition flex items-center justify-center gap-2"
              >
                <span>Return to Knowledge Gap Dashboard</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
