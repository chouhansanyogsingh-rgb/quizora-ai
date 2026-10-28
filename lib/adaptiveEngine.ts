import { AssessmentAnswer, DifficultyLevel, LearnerProfile, Question, SkillStatus, SubSkillMastery } from './types';

/**
 * Calculates next question difficulty based on student's performance on the current question.
 * Adaptive Item Response principle:
 * - Correct answer -> escalate difficulty (Easy -> Medium -> Hard)
 * - Incorrect answer -> reduce difficulty (Hard -> Medium -> Easy)
 */
export function getNextDifficulty(
  currentDifficulty: DifficultyLevel,
  isCorrect: boolean,
  timeSpentSec?: number
): DifficultyLevel {
  if (isCorrect) {
    if (currentDifficulty === 'easy') return 'medium';
    if (currentDifficulty === 'medium') return 'hard';
    return 'hard'; // Cap at hard
  } else {
    if (currentDifficulty === 'hard') return 'medium';
    if (currentDifficulty === 'medium') return 'easy';
    return 'easy'; // Floor at easy
  }
}

/**
 * Calculates Mastery score (0-100) for a sub-skill based on answer accuracy,
 * difficulty weights, and optional confidence rating.
 */
export function calculateSubSkillMastery(
  subSkill: string,
  answers: AssessmentAnswer[]
): SubSkillMastery {
  const skillAnswers = answers.filter(a => a.subSkill.toLowerCase() === subSkill.toLowerCase());

  if (skillAnswers.length === 0) {
    return {
      subSkill,
      score: 40,
      totalQuestions: 0,
      correctCount: 0,
      status: 'gap',
      description: 'Not yet assessed.',
      recommendation: 'Complete diagnostic questions to evaluate your current knowledge baseline.',
    };
  }

  let totalScore = 0;
  let correctCount = 0;

  for (const ans of skillAnswers) {
    if (ans.isCorrect) {
      correctCount++;
      if (ans.difficulty === 'hard') totalScore += 95;
      else if (ans.difficulty === 'medium') totalScore += 82;
      else totalScore += 68;

      // Small bonus if fast & confident
      if (ans.confidenceRating === 'high') totalScore += 5;
    } else {
      if (ans.difficulty === 'hard') totalScore += 45; // at least they attempted a hard problem
      else if (ans.difficulty === 'medium') totalScore += 30;
      else totalScore += 15; // missed an easy question -> pronounced gap
    }
  }

  const rawAverage = Math.round(totalScore / skillAnswers.length);
  const score = Math.min(100, Math.max(10, rawAverage));

  let status: SkillStatus = 'gap';
  let description = '';
  let recommendation = '';

  if (score >= 80) {
    status = 'mastered';
    description = `Strong conceptual clarity and execution in ${subSkill}.`;
    recommendation = 'Ready for advanced synthesis, real-world edge cases, and mentoring peers.';
  } else if (score >= 60) {
    status = 'developing';
    description = `Basic comprehension present, but minor edge-case lapses detected.`;
    recommendation = 'Needs targeted practice on complex problem variants and syntax fluency.';
  } else {
    status = 'gap';
    description = `Critical foundational misconceptions or hesitation identified in ${subSkill}.`;
    recommendation = 'Requires micro-lesson intervention with structured conceptual breakdown before moving forward.';
  }

  return {
    subSkill,
    score,
    totalQuestions: skillAnswers.length,
    correctCount,
    status,
    description,
    recommendation,
  };
}

/**
 * Updates a sub-skill mastery score after student solves a targeted practice problem.
 */
export function applyPracticeRemediation(
  currentMastery: SubSkillMastery,
  isCorrect: boolean,
  deltaPoints: number = 25
): SubSkillMastery {
  const newScore = isCorrect
    ? Math.min(100, currentMastery.score + deltaPoints)
    : Math.max(10, currentMastery.score - 5);

  let newStatus: SkillStatus = 'gap';
  if (newScore >= 80) newStatus = 'mastered';
  else if (newScore >= 60) newStatus = 'developing';

  return {
    ...currentMastery,
    score: newScore,
    status: newStatus,
    description: isCorrect
      ? `Gap addressed! Score boosted to ${newScore}%.`
      : `Practice attempted. Review explanation to reinforce understanding.`,
  };
}
