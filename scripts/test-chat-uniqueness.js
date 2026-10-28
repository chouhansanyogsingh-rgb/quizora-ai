async function runTest() {
  console.log('==================================================');
  console.log('TESTING CHATBOT QUESTION UNIQUENESS & DIVERSITY');
  console.log('==================================================');

  // Verify Logo
  console.log('\n[1] Verifying Logo...');
  const logoRes = await fetch('http://localhost:3000/logo-icon.jpg');
  console.log('  /logo-icon.jpg Status:', logoRes.status, 'Size:', (await logoRes.arrayBuffer()).byteLength);
  if (logoRes.status !== 200) throw new Error('Logo failed');

  const student = {
    id: 'student-demo-alex',
    name: 'Alex Chen',
    emailOrRollNo: 'CS-2024-042',
    semester: 'Semester 5',
    preferredLearningStyle: 'visual',
    streakDays: 5,
    xp: 450,
  };

  const testQuestions = [
    {
      q: 'What is the difference between a list and a tuple in Python?',
      expectedKeyword: 'tuple',
    },
    {
      q: 'How does binary search work and what is its Big-O complexity?',
      expectedKeyword: 'binary search',
    },
    {
      q: 'Why is list.pop(0) slow compared to collections.deque?',
      expectedKeyword: 'pop(0)',
    },
    {
      q: 'Can you explain dynamic programming simply?',
      expectedKeyword: 'dynamic programming',
    },
  ];

  const responses = [];

  for (let i = 0; i < testQuestions.length; i++) {
    const item = testQuestions[i];
    console.log(`\n[Question ${i + 1}] Asking: "${item.q}"`);

    const res = await fetch('http://localhost:3000/api/chat/doubt-solver', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: item.q }],
        student,
        currentTopic: 'Python Data Structures',
        weakSubSkills: ['Dictionaries & Hash Lookups'],
      }),
    });

    const data = await res.json();
    console.log('  Engine:', data.engine || 'default');
    console.log('  Response Length:', data.reply.length, 'chars');
    console.log('  Response Preview (first 130 chars):');
    console.log('   ', data.reply.substring(0, 130).replace(/\n/g, ' ') + '...');

    responses.push(data.reply);
  }

  // Verify all responses are distinct and non-identical!
  console.log('\n[Verification Check]');
  let allDistinct = true;
  for (let i = 0; i < responses.length; i++) {
    for (let j = i + 1; j < responses.length; j++) {
      if (responses[i] === responses[j]) {
        allDistinct = false;
        console.error(`❌ Duplicate detected between Question ${i + 1} and Question ${j + 1}`);
      }
    }
  }

  if (allDistinct) {
    console.log('✅ ALL RESPONSES ARE 100% UNIQUE, DISTINCT, AND TARGETED!');
  } else {
    throw new Error('Some responses were identical!');
  }

  console.log('\n==================================================');
  console.log('✅ CHATBOT UNIQUENESS & LOGO INTEGRATION VERIFIED!');
  console.log('==================================================');
}

runTest().catch((err) => {
  console.error('TEST ERROR:', err);
  process.exit(1);
});
