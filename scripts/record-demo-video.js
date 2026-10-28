const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function runDemoRecording() {
  const publicDir = path.join(process.cwd(), 'public');
  const tempVideoDir = path.join(process.cwd(), 'videos_temp');
  if (!fs.existsSync(tempVideoDir)) fs.mkdirSync(tempVideoDir, { recursive: true });

  console.log('====================================================');
  console.log('🎥 RECORDING QUIZORA AI OFFICIAL DEMO WALKTHROUGH');
  console.log('====================================================');

  console.log('\n[1/8] Initializing Chromium Headless with 720p HD Video Recording...');
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });

  const context = await browser.newContext({
    recordVideo: {
      dir: tempVideoDir,
      size: { width: 1280, height: 720 },
    },
    viewport: { width: 1280, height: 720 },
  });

  const page = await context.newPage();

  // Inject High-Tech HUD & Presenter Subtitles
  await page.addInitScript(() => {
    window.addEventListener('DOMContentLoaded', () => {
      // 1. Top HUD Pill
      const hud = document.createElement('div');
      hud.id = 'presenter-hud';
      hud.innerHTML = `
        <div style="display:flex;align-items:center;gap:10px;">
          <img src="/logo-icon.jpg" style="width:24px;height:24px;border-radius:6px;object-fit:contain;background:#0b0e23;border:1px solid rgba(99,102,241,0.5);padding:1px;" />
          <span style="font-weight:900;font-size:13px;letter-spacing:0.5px;color:#fff;">QUIZORA AI</span>
          <span style="color:#6366f1;font-weight:800;">•</span>
          <span id="hud-step-tag" style="background:rgba(99,102,241,0.25);border:1px solid rgba(99,102,241,0.4);color:#a5b4fc;font-size:10px;font-weight:800;padding:2px 8px;border-radius:999px;text-transform:uppercase;">DEMO WALKTHROUGH</span>
        </div>
        <div style="height:14px;width:1px;background:rgba(255,255,255,0.2);"></div>
        <span id="hud-title" style="font-size:12px;font-weight:700;color:#e2e8f0;">Intelligent Adaptive Learning System</span>
      `;
      hud.style.cssText = `
        position: fixed;
        top: 12px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 999999;
        background: rgba(11, 14, 35, 0.94);
        backdrop-filter: blur(14px);
        border: 1px solid rgba(99, 102, 241, 0.45);
        box-shadow: 0 10px 30px rgba(0,0,0,0.6), 0 0 20px rgba(99,102,241,0.25);
        border-radius: 999px;
        padding: 6px 18px;
        display: flex;
        align-items: center;
        gap: 12px;
        font-family: system-ui, -apple-system, sans-serif;
        color: white;
        pointer-events: none;
        transition: all 0.3s ease;
      `;
      document.body.appendChild(hud);

      // 2. Bottom Narration Subtitle Bar
      const caption = document.createElement('div');
      caption.id = 'caption-bar';
      caption.innerHTML = `
        <div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#4f46e5,#06b6d4);display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 0 12px rgba(79,70,229,0.5);">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
        </div>
        <div style="flex:1;">
          <div id="caption-speaker" style="font-size:10px;font-weight:800;color:#818cf8;text-transform:uppercase;letter-spacing:1px;margin-bottom:2px;">NARRATION &amp; LIVE DEMO SCRIPT</div>
          <div id="caption-text" style="font-size:13px;font-weight:600;color:#f8fafc;line-height:1.45;">Welcome to Quizora AI. Initializing stateful demonstration...</div>
        </div>
      `;
      caption.style.cssText = `
        position: fixed;
        bottom: 14px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 999999;
        width: min(92%, 840px);
        background: rgba(15, 23, 42, 0.94);
        backdrop-filter: blur(16px);
        border: 1px solid rgba(99, 102, 241, 0.45);
        box-shadow: 0 16px 40px rgba(0, 0, 0, 0.75), 0 0 24px rgba(79, 70, 229, 0.2);
        border-radius: 16px;
        padding: 10px 18px;
        color: #f1f5f9;
        font-family: system-ui, -apple-system, sans-serif;
        pointer-events: none;
        display: flex;
        align-items: center;
        gap: 12px;
        transition: all 0.3s ease;
      `;
      document.body.appendChild(caption);

      // 3. Custom Visible Animated Cursor
      const cursor = document.createElement('div');
      cursor.id = 'custom-cursor';
      cursor.style.cssText = `
        position: fixed;
        top: 250px;
        left: 250px;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: rgba(99, 102, 241, 0.95);
        border: 2px solid #ffffff;
        box-shadow: 0 0 14px rgba(99, 102, 241, 0.9);
        pointer-events: none;
        z-index: 1000000;
        transform: translate(-50%, -50%);
        transition: transform 0.12s linear, width 0.15s, height 0.15s, background 0.15s;
      `;
      document.body.appendChild(cursor);

      // Mouse ripple effect on click
      window.addEventListener('click', (e) => {
        const ripple = document.createElement('div');
        ripple.style.cssText = `
          position: fixed;
          top: ${e.clientY}px;
          left: ${e.clientX}px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          border: 2px solid #38bdf8;
          box-shadow: 0 0 10px #38bdf8;
          transform: translate(-50%, -50%) scale(1);
          opacity: 1;
          pointer-events: none;
          z-index: 999999;
          transition: transform 0.4s ease-out, opacity 0.4s ease-out;
        `;
        document.body.appendChild(ripple);
        requestAnimationFrame(() => {
          ripple.style.transform = 'translate(-50%, -50%) scale(5)';
          ripple.style.opacity = '0';
        });
        setTimeout(() => ripple.remove(), 450);
      });
    });
  });

  // Presenter Helper Functions
  async function updatePresenter(stepTag, title, text, durationMs = 3500) {
    console.log(`  [Narrator | ${stepTag}] ${title}: "${text}"`);
    await page.evaluate(({ stepTag, title, text }) => {
      const tagEl = document.getElementById('hud-step-tag');
      const titleEl = document.getElementById('hud-title');
      const textEl = document.getElementById('caption-text');
      if (tagEl) tagEl.innerText = stepTag;
      if (titleEl) titleEl.innerText = title;
      if (textEl) {
        textEl.style.opacity = '0';
        setTimeout(() => {
          textEl.innerText = text;
          textEl.style.opacity = '1';
        }, 150);
      }
    }, { stepTag, title, text });

    if (durationMs > 0) {
      await page.waitForTimeout(durationMs);
    }
  }

  async function moveCursorTo(selector, click = true, delayAfter = 1200) {
    try {
      const el = typeof selector === 'string' ? await page.$(selector) : selector;
      if (!el) return;
      const box = await el.boundingBox();
      if (!box) return;

      const targetX = Math.round(box.x + box.width / 2);
      const targetY = Math.round(box.y + box.height / 2);

      await page.evaluate(({ targetX, targetY }) => {
        const cursor = document.getElementById('custom-cursor');
        if (cursor) {
          cursor.style.left = `${targetX}px`;
          cursor.style.top = `${targetY}px`;
        }
      }, { targetX, targetY });

      await page.waitForTimeout(450);

      if (click) {
        await page.evaluate(() => {
          const cursor = document.getElementById('custom-cursor');
          if (cursor) {
            cursor.style.transform = 'translate(-50%, -50%) scale(0.8)';
            cursor.style.background = '#38bdf8';
            setTimeout(() => {
              cursor.style.transform = 'translate(-50%, -50%) scale(1)';
              cursor.style.background = 'rgba(99, 102, 241, 0.95)';
            }, 200);
          }
        });

        await el.click();
      }

      await page.waitForTimeout(delayAfter);
    } catch (e) {
      console.warn('moveCursorTo error:', e.message);
    }
  }

  async function smoothScrollTo(scrollY, durationMs = 1500) {
    await page.evaluate(({ scrollY, durationMs }) => {
      const start = window.scrollY;
      const change = scrollY - start;
      const startTime = performance.now();

      function step(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / durationMs, 1);
        const ease = 0.5 - Math.cos(progress * Math.PI) / 2;
        window.scrollTo(0, start + change * ease);
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }, { scrollY, durationMs });

    await page.waitForTimeout(durationMs + 300);
  }

  // --- ACT 1: APP STARTUP & AUTHENTICATION WALL ---
  console.log('\n[2/8] Act 1: Student Authentication Wall & 1-Click Fast Login...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  await updatePresenter(
    '01 / 05',
    'Student Authentication & Fast Demo Verification',
    'Welcome to Quizora AI — an intelligent adaptive learning platform designed to diagnose and repair knowledge gaps.',
    4200
  );

  await updatePresenter(
    '01 / 05',
    '1-Click Demo Profile for Instant Judging',
    'To speed up judging and live demos, evaluators can click "1-Click Demo Student Login" to load Alex Chen’s profile instantly.',
    4500
  );

  await moveCursorTo('button:has-text("1-Click Demo Student Login")', true, 2200);

  // --- ACT 2: STREAK & GAMIFICATION NAVBAR ---
  console.log('\n[3/8] Act 2: Gamification Bar & Study Streak...');
  await updatePresenter(
    '02 / 05',
    'Student Streak & Gamification Header',
    'The top navigation header immediately persists Alex Chen’s profile with a 5-Day Study Streak and 450 Mastery XP.',
    4500
  );

  await moveCursorTo('div:has-text("5 Day Streak")', false, 2800);

  // --- ACT 3: TOPIC SETUP & ADAPTIVE PROFILE ---
  console.log('\n[4/8] Act 3: Topic & Adaptive Profile Setup...');
  await updatePresenter(
    '03 / 05',
    'Topic & Pedagogical Profile Setup',
    'Students select their target topic — such as Python Data Structures — and choose their preferred learning style.',
    4200
  );

  await moveCursorTo('button:has-text("Visual / Analogy-based")', true, 2200);

  await updatePresenter(
    '03 / 05',
    'Dynamic Adaptive Quiz Bank Generation',
    'Launching the diagnostic! Quizora AI generates a multi-tier calibrated question bank across 5 core sub-skills.',
    3500
  );

  await moveCursorTo('button:has-text("Launch Adaptive Diagnostic")', true, 3500);

  await page.waitForSelector('text=Question 1 of 5', { timeout: 15000 });
  await page.waitForTimeout(1500);

  // --- ACT 4: STATEFUL ADAPTIVE ASSESSMENT ---
  console.log('\n[5/8] Act 4: Stateful Adaptive Diagnostic Assessment...');
  
  // Q1: List Operations (Medium tier) -> Answer correctly
  await updatePresenter(
    '04 / 05',
    'Item Response Difficulty Adaptation (Q1)',
    'Question 1 assesses List Operations & Slicing at Medium tier. Watch the Item Response engine dynamically adapt.',
    5000
  );

  // Select Option B (correct)
  const q1Buttons = await page.$$('.space-y-3 button');
  if (q1Buttons[1]) {
    await moveCursorTo(q1Buttons[1], true, 1200);
  }
  await moveCursorTo('button:has-text("Confirm Answer")', true, 2500);

  await updatePresenter(
    '04 / 05',
    'Dynamic Difficulty Upgrade: Promoted to Hard',
    'Correct answer confirmed! Due to high confidence and quick time, Quizora AI dynamically escalates Question 2 to Hard.',
    4500
  );

  await moveCursorTo('button:has-text("Got It — Next Question")', true, 2200);

  // Q2: Dictionaries & Hash Lookups (Hard tier) -> Select WRONG answer to showcase Instant Explanation Card!
  await page.waitForSelector('text=Question 2 of 5');
  await updatePresenter(
    'Core Feature',
    'Instant Wrong-Answer Explanation Card',
    'On Question 2 (Dictionaries & Hash Lookups), let’s intentionally select a common trap option.',
    4800
  );

  const q2Buttons = await page.$$('.space-y-3 button');
  // Select Option C (wrong trap)
  if (q2Buttons[2]) {
    await moveCursorTo(q2Buttons[2], true, 1200);
  }
  await moveCursorTo('button:has-text("Confirm Answer")', true, 2500);

  await updatePresenter(
    'Core Feature',
    'Immediate Misconception & Principle Analysis',
    'The quiz halts immediately! It flags the chosen option in red, highlights the correct answer in green, and displays the concept card.',
    5500
  );

  await smoothScrollTo(260, 1200);
  await page.waitForTimeout(2500);

  await updatePresenter(
    'Core Feature',
    'Sealing The Knowledge Gap On The Spot',
    'Students understand the root cause of the error before proceeding. Click "Got It — Next Question" to advance.',
    4500
  );

  await moveCursorTo('button:has-text("Got It — Next Question")', true, 2000);

  // Complete Q3, Q4, Q5
  console.log('  Answering remaining questions...');
  // Q3
  await page.waitForSelector('text=Question 3 of 5');
  await updatePresenter(
    '04 / 05',
    'Continuous Knowledge Mapping (Q3 - Tuples)',
    'Question 3 evaluates Tuples & Immutability, recalibrated to consolidate student fundamentals.',
    3200
  );
  const q3Buttons = await page.$$('.space-y-3 button');
  if (q3Buttons[0]) await q3Buttons[0].click();
  await page.waitForTimeout(600);
  await page.click('button:has-text("Confirm Answer")').catch(() => {});
  await page.waitForTimeout(1000);
  await page.click('button:has-text("Got It — Next Question")').catch(() => {});
  await page.waitForTimeout(1500);

  // Q4
  await page.waitForSelector('text=Question 4 of 5');
  await updatePresenter(
    '04 / 05',
    'Continuous Knowledge Mapping (Q4 - Sets)',
    'Question 4 evaluates Hash Sets & Uniqueness guarantees.',
    3000
  );
  const q4Buttons = await page.$$('.space-y-3 button');
  if (q4Buttons[1]) await q4Buttons[1].click();
  await page.waitForTimeout(600);
  await page.click('button:has-text("Confirm Answer")').catch(() => {});
  await page.waitForTimeout(1000);
  await page.click('button:has-text("Got It — Next Question")').catch(() => {});
  await page.waitForTimeout(1500);

  // Q5
  await page.waitForSelector('text=Question 5 of 5');
  await updatePresenter(
    '04 / 05',
    'Final Diagnostic Question (Q5 - Deques & Queues)',
    'Question 5 tests Collections Deques and asymptotic complexity.',
    3000
  );
  const q5Buttons = await page.$$('.space-y-3 button');
  if (q5Buttons[0]) await q5Buttons[0].click();
  await page.waitForTimeout(600);
  await page.click('button:has-text("Confirm Answer")').catch(() => {});
  await page.waitForTimeout(1500);

  await moveCursorTo('button:has-text("Got It — View Diagnostic Results")', true, 3000);

  // --- ACT 5: KNOWLEDGE GAP ANALYTICS DASHBOARD ---
  console.log('\n[6/8] Act 5: Knowledge Gap Analytics Dashboard...');
  await page.waitForSelector('text=Diagnostic Assessment Report', { timeout: 15000 });
  await page.waitForTimeout(1500);

  await updatePresenter(
    '05 / 05',
    'Knowledge Gap Analytics Dashboard (Recharts)',
    'The diagnostic is complete! A celebration banner awards XP and logs our study streak.',
    4500
  );

  await updatePresenter(
    '05 / 05',
    'Multidimensional Radar & Mastery Bar Charts',
    'Recharts visualizes dimensional strengths: Mastered skills in green, and Knowledge Gaps (<60%) highlighted in red.',
    5000
  );

  await smoothScrollTo(360, 1500);
  await page.waitForTimeout(3000);

  await updatePresenter(
    '05 / 05',
    'Personalized Remediation Trigger',
    'Alex Chen has an identified knowledge gap in Dictionaries & Hash Lookups. Let’s trigger its targeted micro-lesson.',
    4500
  );

  await moveCursorTo('button:has-text("Remediate Priority Gap")', true, 3000);

  // --- ACT 6: PERSONALIZED MICRO-LESSON & PRACTICE ---
  console.log('\n[7/8] Act 6: Automated Micro-Lesson Path & Targeted Practice...');
  await page.waitForSelector('text=Targeted Micro-Lesson', { timeout: 15000 });
  await page.waitForTimeout(1500);

  await updatePresenter(
    'Remediation',
    'Style-Tailored Micro-Lesson Generator',
    'Quizora AI synthesizes a personalized micro-lesson using Alex’s "Visual" learning style with ASCII mental models.',
    5000
  );

  await smoothScrollTo(280, 1200);
  await page.waitForTimeout(3000);

  await updatePresenter(
    'Remediation',
    'Targeted Practice Problem Execution',
    'Students immediately solve targeted practice exercises to verify conceptual mastery and bridge the gap.',
    4500
  );

  await smoothScrollTo(550, 1200);
  await page.waitForTimeout(1500);

  // Select practice option
  const practiceOptions = await page.$$('div.space-y-2 button');
  if (practiceOptions.length > 0) {
    await moveCursorTo(practiceOptions[0], true, 1200);
    await moveCursorTo('button:has-text("Submit Practice Solution")', true, 3000);
  }

  await updatePresenter(
    'Remediation',
    'Knowledge Gap Bridged (+25% Mastery Recalibration)',
    'Gap solved! Mastery score dynamically increases from 40% to 65%, permanently updating the student’s mastery profile.',
    4500
  );

  await moveCursorTo('button:has-text("Return to Knowledge Gap Dashboard")', true, 2500);

  // --- ACT 7: REAL-TIME RECALIBRATION & HISTORY DRAWER ---
  console.log('\n[8/8] Act 7: Live Recalibrated Dashboard & Progression History...');
  await updatePresenter(
    'Progression',
    'Live Recalibrated Dashboard & Mastery Progression',
    'Back on the dashboard, the mastery score is dynamically updated. Click History in the navbar to inspect the timeline.',
    4500
  );

  await moveCursorTo('button[title="View Real-Time Progress History Log"]', true, 3000);
  await page.waitForTimeout(3500);

  // Close history drawer
  await page.click('button[title="View Real-Time Progress History Log"]').catch(() => {});
  await page.waitForTimeout(1000);

  // --- OUTRO ---
  await updatePresenter(
    'Quizora AI',
    'LEARN • PRACTICE • IMPROVE',
    'Quizora AI delivers complete adaptive mastery in under 4 minutes — powered by Next.js, Tailwind CSS, Recharts, and Gemini API!',
    6500
  );

  console.log('\nFinalizing video and rendering to disk...');
  await page.waitForTimeout(2000);
  await context.close();
  await browser.close();

  // Find generated webm video
  const videoFiles = fs.readdirSync(tempVideoDir).filter(f => f.endsWith('.webm'));
  if (videoFiles.length > 0) {
    const rawVideoPath = path.join(tempVideoDir, videoFiles[0]);
    const finalVideoPath = path.join(publicDir, 'quizora-demo-video.webm');
    fs.copyFileSync(rawVideoPath, finalVideoPath);
    console.log('\n====================================================');
    console.log('🎉 DEMO VIDEO RECORDED & SAVED SUCCESSFULLY!');
    console.log('Location:', finalVideoPath);

    const stats = fs.statSync(finalVideoPath);
    console.log(`Video File Size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
    console.log('====================================================');
  } else {
    throw new Error('No video file produced in temporary video directory');
  }
}

runDemoRecording().catch(err => {
  console.error('Demo Recording Failed:', err);
  process.exit(1);
});
