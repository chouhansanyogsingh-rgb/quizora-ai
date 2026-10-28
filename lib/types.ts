export type LearningStyle = 'visual' | 'code' | 'step-by-step';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type SkillStatus = 'gap' | 'developing' | 'mastered';

export interface LearnerProfile {
  id: string;
  topic: string;
  learningStyle: LearningStyle;
  targetGoal: string;
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  createdAt: string;
}

export interface Question {
  id: string;
  subSkill: string;
  difficulty: DifficultyLevel;
  questionText: string;
  codeSnippet?: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  hint: string;
}

export interface AssessmentAnswer {
  questionId: string;
  subSkill: string;
  selectedOptionIndex: number;
  isCorrect: boolean;
  timeSpentSec: number;
  difficulty: DifficultyLevel;
  confidenceRating?: 'low' | 'medium' | 'high';
}

export interface SubSkillMastery {
  subSkill: string;
  score: number; // 0 - 100
  totalQuestions: number;
  correctCount: number;
  status: SkillStatus; // <60% gap, 60-79% developing, >=80% mastered
  description: string;
  recommendation: string;
}

export interface DiagnosticResult {
  id: string;
  profile: LearnerProfile;
  subSkillMasteries: SubSkillMastery[];
  overallScore: number;
  totalGaps: number;
  totalDeveloping: number;
  totalMastered: number;
  diagnosedAt: string;
  answers: AssessmentAnswer[];
  insights: string[];
}

export interface PracticeProblem {
  id: string;
  subSkill: string;
  title: string;
  scenario: string;
  problemType: 'multiple_choice' | 'code_completion';
  codeSnippet?: string;
  options?: string[];
  correctOptionIndex?: number;
  expectedKeywords?: string[];
  hint: string;
  explanation: string;
}

export interface MicroLesson {
  subSkill: string;
  title: string;
  learningStyle: LearningStyle;
  overview: string;
  coreConceptExplanation: string;
  visualOrCodeArtifact: {
    type: 'diagram' | 'code' | 'step_list';
    title: string;
    content: string;
  };
  commonPitfall: string;
  keyTakeaway: string;
  practiceProblems: PracticeProblem[];
}

export interface PracticeSubmission {
  id: string;
  problemId: string;
  subSkill: string;
  userAnswer: string;
  isCorrect: boolean;
  feedback: string;
  scoreDelta: number;
  submittedAt: string;
}

export interface ProgressHistoryItem {
  id: string;
  timestamp: string;
  action: 'quiz_completed' | 'practice_solved' | 'gap_remediated' | 'lesson_read';
  subSkill: string;
  oldScore: number;
  newScore: number;
  message: string;
}
