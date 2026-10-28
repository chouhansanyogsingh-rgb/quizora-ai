'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  Eye,
  Code2,
  ListOrdered,
  Target,
  ArrowRight,
  Zap,
  Layers,
  GraduationCap,
  Check,
} from 'lucide-react';
import { LearningStyle } from '@/lib/types';

interface Props {
  onStartAssessment: (
    topic: string,
    learningStyle: LearningStyle,
    targetGoal: string,
    experienceLevel: 'beginner' | 'intermediate' | 'advanced'
  ) => void;
  isLoading: boolean;
}

const PRESET_TOPICS = [
  {
    name: 'Python Data Structures',
    desc: 'Lists, Dicts, Tuples, Sets, and Deques with memory models & Big-O',
    badge: 'Recommended Demo',
  },
  {
    name: 'Machine Learning Fundamentals',
    desc: 'Loss functions, Gradient Descent, Overfitting, and Regularization',
    badge: 'Popular',
  },
  {
    name: 'SQL & Relational Databases',
    desc: 'Joins, Indexes, Window Functions, and Query Planning',
    badge: 'Backend',
  },
  {
    name: 'Algorithms & Complexity',
    desc: 'Binary Search, Dynamic Programming, Graph Traversals, and Big-O',
    badge: 'Core CS',
  },
];

export function TopicProfileSetup({ onStartAssessment, isLoading }: Props) {
  const [topic, setTopic] = useState('Python Data Structures');
  const [learningStyle, setLearningStyle] = useState<LearningStyle>('visual');
  const [experienceLevel, setExperienceLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [targetGoal, setTargetGoal] = useState('Achieve production-level fluency and eliminate core misconceptions');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    onStartAssessment(topic.trim(), learningStyle, targetGoal.trim(), experienceLevel);
  };

  const styleOptions: {
    id: LearningStyle;
    title: string;
    subtitle: string;
    icon: any;
    accent: string;
    description: string;
  }[] = [
    {
      id: 'visual',
      title: 'Visual / Analogy-based',
      subtitle: 'Mental Models & Spatial Maps',
      icon: Eye,
      accent: 'from-cyan-500 to-blue-500',
      description: 'Learns through ASCII architectural diagrams, real-world analogies, and memory layouts.',
    },
    {
      id: 'code',
      title: 'Code-first',
      subtitle: 'Syntax & Implementation',
      icon: Code2,
      accent: 'from-indigo-500 to-purple-500',
      description: 'Learns through runnable syntax patterns, anti-patterns vs best practices, and benchmarks.',
    },
    {
      id: 'step-by-step',
      title: 'Step-by-step',
      subtitle: 'Deterministic Pipelines',
      icon: ListOrdered,
      accent: 'from-amber-500 to-rose-500',
      description: 'Learns through numbered algorithmic steps, rigorous checklists, and proof derivations.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 animate-fade-in">
      {/* Hero Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Intelligent Diagnostic Engine</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
          Configure Your <span className="bg-gradient-to-r from-indigo-400 via-cyan-300 to-indigo-300 bg-clip-text text-transparent">Adaptive Diagnostic</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
          Not a generic chatbot. Quizora AI runs an Item Response diagnostic, pinpoints your exact sub-skill gaps, and generates targeted micro-lessons.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1: Topic Selection Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xl relative overflow-hidden backdrop-blur-sm">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-2.5 text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">
            <BookOpen className="w-4 h-4" />
            <span>Step 1: Choose Your Learning Topic</span>
          </div>
          <h2 className="text-lg font-bold text-white mb-2">What skill or subject do you want to diagnose?</h2>

          <div className="relative mb-4">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Python Data Structures, Linear Regression, Redis Caching..."
              required
              className="w-full px-4 py-3 bg-slate-800/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          {/* Quick Presets */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
              Quick Presets (Instant Offline or AI Synthesis):
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PRESET_TOPICS.map((preset) => {
                const isSelected = topic.toLowerCase() === preset.name.toLowerCase();
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => setTopic(preset.name)}
                    className={`text-left p-3 rounded-xl border transition flex items-start justify-between gap-2 ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500/50 text-white'
                        : 'bg-slate-800/40 border-slate-800/80 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{preset.name}</span>
                        {preset.badge && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            {preset.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">{preset.desc}</p>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Step 2: Learning Style Selector */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xl relative backdrop-blur-sm">
          <div className="flex items-center gap-2.5 text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">
            <Layers className="w-4 h-4" />
            <span>Step 2: Pedagogical Learning Style</span>
          </div>
          <h2 className="text-lg font-bold text-white mb-1">
            How does your brain absorb complex technical concepts fastest?
          </h2>
          <p className="text-xs text-slate-400 mb-5">
            Micro-lessons generated to fix your knowledge gaps will be strictly formatted in your chosen style.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {styleOptions.map((opt) => {
              const isSelected = learningStyle === opt.id;
              const Icon = opt.icon;
              return (
                <div
                  key={opt.id}
                  onClick={() => setLearningStyle(opt.id)}
                  className={`relative p-5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-800/90 border-indigo-500 ring-2 ring-indigo-500/20 shadow-lg'
                      : 'bg-slate-800/30 border-slate-800 hover:bg-slate-800/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2.5 rounded-lg bg-gradient-to-br ${opt.accent} text-white shadow-md`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-white mb-0.5">{opt.title}</h3>
                  <p className="text-[11px] font-semibold text-indigo-300 mb-2">{opt.subtitle}</p>
                  <p className="text-xs text-slate-400 leading-relaxed">{opt.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 3: Learner Level & Target Goal */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xl grid grid-cols-1 md:grid-cols-2 gap-6 backdrop-blur-sm">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
              <GraduationCap className="w-4 h-4" />
              <span>Prior Familiarity</span>
            </div>
            <label className="block text-sm font-bold text-white mb-2">Your current baseline</label>
            <div className="grid grid-cols-3 gap-2">
              {(['beginner', 'intermediate', 'advanced'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setExperienceLevel(lvl)}
                  className={`py-2 text-xs font-semibold capitalize rounded-xl border transition ${
                    experienceLevel === lvl
                      ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                      : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
              <Target className="w-4 h-4" />
              <span>Diagnostic Target Goal</span>
            </div>
            <label className="block text-sm font-bold text-white mb-2">What is your learning goal?</label>
            <input
              type="text"
              value={targetGoal}
              onChange={(e) => setTargetGoal(e.target.value)}
              placeholder="e.g., Prepare for technical interview or build production API"
              className="w-full px-3.5 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>5-question stateful diagnostic with dynamic difficulty adjustment</span>
          </div>

          <button
            type="submit"
            disabled={isLoading || !topic.trim()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:from-indigo-500 hover:to-indigo-500 shadow-lg shadow-indigo-600/30 transition transform hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Generating Adaptive Quiz Bank...</span>
              </>
            ) : (
              <>
                <span>Launch Adaptive Diagnostic</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
