import { NextRequest, NextResponse } from 'next/server';
import { generateTargetedMicroLesson } from '@/lib/gemini';
import { LearningStyle } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { topic, subSkill, learningStyle = 'visual', customApiKey } = body;

    if (!topic || !subSkill) {
      return NextResponse.json({ error: 'Topic and subSkill are required' }, { status: 400 });
    }

    const microLesson = await generateTargetedMicroLesson(
      topic,
      subSkill,
      learningStyle as LearningStyle,
      customApiKey
    );

    return NextResponse.json({
      success: true,
      microLesson,
    });
  } catch (err: any) {
    console.error('Error generating micro lesson:', err);
    return NextResponse.json({ error: err.message || 'Failed to generate micro-lesson' }, { status: 500 });
  }
}
