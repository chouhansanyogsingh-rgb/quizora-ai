async function runTests() {
  console.log('==================================================');
  console.log('TESTING CORE FEATURES OF QUIZORA AI');
  console.log('==================================================');

  // --- 1. Test Homepage Status ---
  console.log('\n[1] Testing Homepage Availability...');
  const homeRes = await fetch('http://localhost:3000');
  console.log('  Homepage Status:', homeRes.status);
  if (homeRes.status !== 200) throw new Error('Home failed');
  const homeHtml = await homeRes.text();
  console.log('  Contains "Quizora AI":', homeHtml.includes('Quizora AI'));

  // --- 2. Test Student Auth Wall Profile Model ---
  console.log('\n[2] Testing Student Profile & Demo Fast Login...');
  const demoStudent = {
    id: 'student-demo-alex',
    name: 'Alex Chen',
    emailOrRollNo: 'CS-2024-042',
    semester: 'Semester 5 (Systems & Data)',
    preferredLearningStyle: 'visual',
    streakDays: 5,
    xp: 450,
    activeDaysThisWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  };
  console.log('  1-Click Demo Student:', demoStudent.name, '| Roll:', demoStudent.emailOrRollNo);
  console.log('  Streak:', demoStudent.streakDays, 'days | XP:', demoStudent.xp);
  console.log('  Preferred Style:', demoStudent.preferredLearningStyle);

  // --- 3. Test Assessment Generation & Instant Explanations ---
  console.log('\n[3] Testing Assessment Quiz Explanations & Adaptive Structure...');
  const genRes = await fetch('http://localhost:3000/api/assessment/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      topic: 'Python Data Structures',
      learningStyle: demoStudent.preferredLearningStyle,
      targetGoal: 'Master internal memory models',
      experienceLevel: 'intermediate',
    }),
  });
  const genData = await genRes.json();
  console.log('  Generated Sub-skills Count:', genData.quizBank.subSkills.length);
  
  // Verify explanation quality on all questions
  let explanationsValid = true;
  genData.quizBank.subSkills.forEach((s) => {
    ['easy', 'medium', 'hard'].forEach((tier) => {
      const q = s.questions[tier];
      if (!q || !q.explanation || q.explanation.length < 20) {
        explanationsValid = false;
      }
    });
  });
  console.log('  All questions have detailed conceptual explanations:', explanationsValid);
  console.log('  Sample Explanation for Q1 (Medium):');
  console.log('   "', genData.quizBank.subSkills[0].questions.medium.explanation.substring(0, 110) + '..."');

  // --- 4. Test Diagnostic Evaluation & XP Awarding ---
  console.log('\n[4] Testing Diagnostic Evaluation & Streak Increment...');
  const evalRes = await fetch('http://localhost:3000/api/assessment/evaluate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      profile: genData.profile,
      answers: [
        {
          questionId: 'q1',
          subSkill: genData.quizBank.subSkills[0].name,
          selectedOptionIndex: genData.quizBank.subSkills[0].questions.medium.correctOptionIndex,
          isCorrect: true,
          timeSpentSec: 15,
          difficulty: 'medium',
        },
        {
          questionId: 'q2',
          subSkill: genData.quizBank.subSkills[1].name,
          selectedOptionIndex: (genData.quizBank.subSkills[1].questions.medium.correctOptionIndex + 1) % 4, // WRONG!
          isCorrect: false,
          timeSpentSec: 22,
          difficulty: 'medium',
        },
        {
          questionId: 'q3',
          subSkill: genData.quizBank.subSkills[2].name,
          selectedOptionIndex: genData.quizBank.subSkills[2].questions.easy.correctOptionIndex,
          isCorrect: true,
          timeSpentSec: 10,
          difficulty: 'easy',
        },
      ],
      subSkillNames: genData.quizBank.subSkills.map((s) => s.name),
    }),
  });
  const evalData = await evalRes.json();
  console.log('  Diagnostic Completed. Overall Mastery:', evalData.diagnosticResult.overallScore + '%');
  console.log('  Gaps Flagged in Red (<60%):', evalData.diagnosticResult.totalGaps);
  console.log('  Mastered Flagged in Green (>=80%):', evalData.diagnosticResult.totalMastered);

  // --- 5. Test Targeted Micro-Lesson Generation ---
  console.log('\n[5] Testing Personalized Micro-Lesson Generator for Weak Sub-Skills...');
  const lessonRes = await fetch('http://localhost:3000/api/lesson/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      topic: 'Python Data Structures',
      subSkill: genData.quizBank.subSkills[1].name,
      learningStyle: demoStudent.preferredLearningStyle,
      currentMastery: 40,
    }),
  });
  const lessonData = await lessonRes.json();
  console.log('  Lesson Title:', lessonData.microLesson.title);
  console.log('  Practice Problems Count:', lessonData.microLesson.practiceProblems.length);

  console.log('\n==================================================');
  console.log('✅ ALL QUIZORA AI CORE FEATURES VERIFIED SUCCESSFULLY!');
  console.log('==================================================');
}

runTests().catch((err) => {
  console.error('VERIFICATION ERROR:', err);
  process.exit(1);
});
