import { NextRequest, NextResponse } from 'next/server';
import { AssessmentAnswer, DiagnosticResult, LearnerProfile, SubSkillMastery } from '@/lib/types';
import { calculateSubSkillMastery } from '@/lib/adaptiveEngine';
import { saveDiagnostic } from '@/lib/storage';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { profile, answers, subSkillNames }: {
      profile: LearnerProfile;
      answers: AssessmentAnswer[];
      subSkillNames: string[];
    } = body;

    if (!profile || !answers || !Array.isArray(answers)) {
      return NextResponse.json({ error: 'Invalid profile or answers data' }, { status: 400 });
    }

    // Unique subskills from answers and provided names
    const skillSet = new Set<string>();
    subSkillNames?.forEach(s => skillSet.add(s));
    answers.forEach(a => skillSet.add(a.subSkill));

    const subSkillMasteries: SubSkillMastery[] = Array.from(skillSet).map(skill =>
      calculateSubSkillMastery(skill, answers)
    );

    const totalScore = subSkillMasteries.reduce((sum, s) => sum + s.score, 0);
    const overallScore = Math.round(totalScore / (subSkillMasteries.length || 1));

    const totalGaps = subSkillMasteries.filter(s => s.status === 'gap').length;
    const totalDeveloping = subSkillMasteries.filter(s => s.status === 'developing').length;
    const totalMastered = subSkillMasteries.filter(s => s.status === 'mastered').length;

    // Generate actionable insights
    const insights: string[] = [];
    if (totalGaps > 0) {
      const gapNames = subSkillMasteries.filter(s => s.status === 'gap').map(s => `"${s.subSkill}"`).join(', ');
      insights.push(`Identified ${totalGaps} critical knowledge gap(s) in ${gapNames}. Targeted micro-lessons ready for remediation.`);
    } else {
      insights.push(`No severe knowledge gaps detected! Solid foundation established across core sub-skills.`);
    }

    if (totalMastered > 0) {
      const masteredNames = subSkillMasteries.filter(s => s.status === 'mastered').map(s => `"${s.subSkill}"`).join(', ');
      insights.push(`Strong proficiency demonstrated in ${masteredNames}.`);
    }

    const fastestAnswer = [...answers].sort((a, b) => a.timeSpentSec - b.timeSpentSec)[0];
    if (fastestAnswer && fastestAnswer.isCorrect) {
      insights.push(`High conceptual fluency on "${fastestAnswer.subSkill}" (answered correctly in ${fastestAnswer.timeSpentSec}s).`);
    }

    const diagnosticResult: DiagnosticResult = {
      id: `diag-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      profile,
      subSkillMasteries,
      overallScore,
      totalGaps,
      totalDeveloping,
      totalMastered,
      diagnosedAt: new Date().toISOString(),
      answers,
      insights,
    };

    saveDiagnostic(diagnosticResult);

    return NextResponse.json({
      success: true,
      diagnosticResult,
    });
  } catch (err: any) {
    console.error('Error evaluating assessment:', err);
    return NextResponse.json({ error: err.message || 'Evaluation failed' }, { status: 500 });
  }
}
