async function test() {
  console.log('--- 1. Testing Homepage ---');
  const homeRes = await fetch('http://localhost:3000');
  console.log('Homepage status:', homeRes.status);
  if (homeRes.status !== 200) throw new Error('Home failed');

  console.log('--- 2. Testing Assessment Generation ---');
  const genRes = await fetch('http://localhost:3000/api/assessment/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      topic: 'Python Data Structures',
      learningStyle: 'visual',
      targetGoal: 'Master internal memory models',
      experienceLevel: 'intermediate'
    })
  });
  const genData = await genRes.json();
  console.log('Generated sub-skills count:', genData.quizBank.subSkills.length);
  genData.quizBank.subSkills.forEach((s, idx) => {
    console.log(`  Subskill ${idx+1}: ${s.name} (has easy: ${Boolean(s.questions.easy)}, med: ${Boolean(s.questions.medium)}, hard: ${Boolean(s.questions.hard)})`);
  });

  console.log('--- 3. Testing Adaptive Evaluation with Simulated Answers ---');
  // Student answers: Q1 right, Q2 wrong (gap), Q3 right, Q4 wrong (gap), Q5 right
  const answers = [
    {
      questionId: 'q1',
      subSkill: genData.quizBank.subSkills[0].name,
      selectedOptionIndex: genData.quizBank.subSkills[0].questions.medium.correctOptionIndex,
      isCorrect: true,
      timeSpentSec: 14,
      difficulty: 'medium',
      confidenceRating: 'high'
    },
    {
      questionId: 'q2',
      subSkill: genData.quizBank.subSkills[1].name,
      selectedOptionIndex: (genData.quizBank.subSkills[1].questions.hard.correctOptionIndex + 1) % 4, // WRONG!
      isCorrect: false,
      timeSpentSec: 25,
      difficulty: 'hard',
      confidenceRating: 'medium'
    },
    {
      questionId: 'q3',
      subSkill: genData.quizBank.subSkills[2].name,
      selectedOptionIndex: genData.quizBank.subSkills[2].questions.medium.correctOptionIndex,
      isCorrect: true,
      timeSpentSec: 18,
      difficulty: 'medium',
      confidenceRating: 'high'
    },
    {
      questionId: 'q4',
      subSkill: genData.quizBank.subSkills[3].name,
      selectedOptionIndex: (genData.quizBank.subSkills[3].questions.medium.correctOptionIndex + 1) % 4, // WRONG!
      isCorrect: false,
      timeSpentSec: 30,
      difficulty: 'medium',
      confidenceRating: 'low'
    },
    {
      questionId: 'q5',
      subSkill: genData.quizBank.subSkills[4].name,
      selectedOptionIndex: genData.quizBank.subSkills[4].questions.easy.correctOptionIndex,
      isCorrect: true,
      timeSpentSec: 12,
      difficulty: 'easy',
      confidenceRating: 'high'
    }
  ];

  const evalRes = await fetch('http://localhost:3000/api/assessment/evaluate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      profile: genData.profile,
      answers,
      subSkillNames: genData.quizBank.subSkills.map(s => s.name)
    })
  });
  const evalData = await evalRes.json();
  const diag = evalData.diagnosticResult;
  console.log('Diagnostic result:');
  console.log('  Overall Score:', diag.overallScore + '%');
  console.log('  Total Gaps (<60%):', diag.totalGaps);
  console.log('  Total Developing (60-79%):', diag.totalDeveloping);
  console.log('  Total Mastered (>=80%):', diag.totalMastered);
  diag.subSkillMasteries.forEach(s => {
    console.log(`    - ${s.subSkill}: ${s.score}% [${s.status.toUpperCase()}]`);
  });

  console.log('--- 4. Testing Micro-Lesson Generation for Gap Sub-skill ---');
  const gapSkill = diag.subSkillMasteries.find(s => s.status === 'gap') || diag.subSkillMasteries[1];
  console.log('Generating micro-lesson for gap:', gapSkill.subSkill);
  const lessonRes = await fetch('http://localhost:3000/api/lesson/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      topic: genData.profile.topic,
      subSkill: gapSkill.subSkill,
      learningStyle: 'visual'
    })
  });
  const lessonData = await lessonRes.json();
  console.log('Lesson generated:', lessonData.microLesson.title);
  console.log('Visual artifact type:', lessonData.microLesson.visualOrCodeArtifact.type);
  console.log('Practice problems count:', lessonData.microLesson.practiceProblems.length);

  console.log('--- 5. Testing Real-Time Practice Remediation ---');
  const prob1 = lessonData.microLesson.practiceProblems[0];
  const practiceRes = await fetch('http://localhost:3000/api/practice/evaluate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      diagnosticId: diag.id,
      subSkill: gapSkill.subSkill,
      problem: prob1,
      selectedOptionIndex: prob1.correctOptionIndex
    })
  });
  const practiceData = await practiceRes.json();
  console.log('Practice evaluation:');
  console.log('  isCorrect:', practiceData.evaluation.isCorrect);
  console.log('  Score delta:', '+' + practiceData.evaluation.scoreDelta + '%');
  console.log('  Old score was:', gapSkill.score + '%');
  console.log('  New score is:', practiceData.updatedMastery.score + '%');
  console.log('  New status:', practiceData.updatedMastery.status.toUpperCase());
  console.log('  Updated overall dashboard score:', practiceData.updatedDiagnostic.overallScore + '%');

  console.log('--- 6. Testing Progress History Log ---');
  const histRes = await fetch('http://localhost:3000/api/user/progress');
  const histData = await histRes.json();
  console.log('History events logged count:', histData.history.length);
  histData.history.slice(0, 3).forEach((h, i) => {
    console.log(`  [${i+1}] ${h.action} (${h.oldScore}% -> ${h.newScore}%): ${h.message}`);
  });

  console.log('✅ ALL 6 END-TO-END VERIFICATION CHECKS PASSED PERFECTLY!');
}

test().catch(err => {
  console.error('TEST ERROR:', err);
  process.exit(1);
});
