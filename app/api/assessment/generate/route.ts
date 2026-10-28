import { NextRequest, NextResponse } from 'next/server';
import { generateAdaptiveQuizBank } from '@/lib/gemini';
import { LearnerProfile } from '@/lib/types';
import { saveProfile } from '@/lib/storage';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { topic, learningStyle = 'visual', targetGoal = '', experienceLevel = 'intermediate', customApiKey } = body;

    if (!topic || typeof topic !== 'string' || topic.trim() === '') {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    const profile: LearnerProfile = {
      id: `learner-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      topic: topic.trim(),
      learningStyle,
      targetGoal: targetGoal.trim() || `Master ${topic.trim()}`,
      experienceLevel,
      createdAt: new Date().toISOString(),
    };

    saveProfile(profile);

    // Generate 5-part subskill quiz bank
    const quizBank = await generateAdaptiveQuizBank(profile.topic, profile.experienceLevel, customApiKey);

    return NextResponse.json({
      success: true,
      profile,
      quizBank,
    });
  } catch (err: any) {
    console.error('Error in assessment generate API:', err);
    return NextResponse.json({ error: err.message || 'Failed to generate assessment' }, { status: 500 });
  }
}
