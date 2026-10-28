import { NextRequest, NextResponse } from 'next/server';
import { evaluateStudentPractice } from '@/lib/gemini';
import { applyPracticeRemediation } from '@/lib/adaptiveEngine';
import { getDiagnostic, updateSubSkillMasteryInStore } from '@/lib/storage';
import { PracticeProblem } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      diagnosticId,
      subSkill,
      problem,
      userAnswer = '',
      selectedOptionIndex,
      customApiKey,
    }: {
      diagnosticId: string;
      subSkill: string;
      problem: PracticeProblem;
      userAnswer?: string;
      selectedOptionIndex?: number;
      customApiKey?: string;
    } = body;

    if (!problem || !subSkill) {
      return NextResponse.json({ error: 'Problem and subSkill are required' }, { status: 400 });
    }

    // Evaluate answer
    const evalResult = await evaluateStudentPractice(problem, userAnswer, selectedOptionIndex, customApiKey);

    let updatedDiagnostic = null;
    let updatedMastery = null;

    if (diagnosticId) {
      const diag = getDiagnostic(diagnosticId);
      if (diag) {
        const currentMastery = diag.subSkillMasteries.find(
          s => s.subSkill.toLowerCase() === subSkill.toLowerCase()
        );
        if (currentMastery) {
          updatedMastery = applyPracticeRemediation(currentMastery, evalResult.isCorrect, evalResult.scoreDelta);
          updatedDiagnostic = updateSubSkillMasteryInStore(
            diagnosticId,
            subSkill,
            updatedMastery,
            evalResult.scoreDelta,
            problem.title
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      evaluation: evalResult,
      updatedMastery,
      updatedDiagnostic,
    });
  } catch (err: any) {
    console.error('Error evaluating practice problem:', err);
    return NextResponse.json({ error: err.message || 'Practice evaluation failed' }, { status: 500 });
  }
}
