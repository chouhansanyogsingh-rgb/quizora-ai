# Quizora AI — Learn • Practice • Improve

Quizora AI is a next-generation adaptive learning web application designed to systematically identify student knowledge gaps and dynamically adapt their learning path. Unlike standard conversational chatbots, Quizora AI models student cognitive state using Item Response difficulty adjustments, visual knowledge analytics, and style-tailored micro-lessons.

---

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS (Polished Modern Dark Mode with glassmorphic cards and glowing accents)
- **Visual Analytics**: Recharts (Horizontal Sub-Skill Mastery Bar Chart, 5-Axis Knowledge Radar/Spider Chart, Radial Overall Readiness Gauge)
- **Icons**: Lucide React
- **AI Integration**: Google Gemini API (`@google/genai`) with structured JSON schema outputs + built-in pedagogical curriculum synthesizer fallback (100% resilient with zero crashes)
- **State & Persistence**: Server-side JSON store (`.data/adaptlearn_store.json`) with client-side `localStorage` caching and live event timeline

---

## 🌟 Core Features & 4-Screen Workflow

### 1. Topic & Learner Profile Setup (Screen 1)
- Enter any custom technical subject or pick from one-click presets (*"Python Data Structures"*, *"Machine Learning Fundamentals"*, *"SQL & Relational Databases"*, *"Algorithms & Complexity"*).
- Select your cognitive learning style:
  - 🎨 **Visual / Analogy-based**: Mental models, ASCII memory architecture maps, and real-world analogies.
  - 💻 **Code-first**: Runnable syntax patterns, anti-patterns vs best practices, and memory/time benchmarks.
  - 🔢 **Step-by-step**: Deterministic 4-step pipelines, boundary condition checklists, and proof derivations.
- Specify prior baseline experience (Beginner, Intermediate, Advanced) and target learning goal.

### 2. Stateful Adaptive Assessment (Screen 2)
- 5-question diagnostic quiz where each question maps to a distinct sub-skill (e.g. for Python Data Structures: *List Operations & Slicing*, *Dictionaries & Hash Lookups*, *Tuples & Immutability*, *Sets & Deduplication*, *Stacks & Queues*).
- **Dynamic Difficulty Adjustment**:
  - Starts calibrated at Medium difficulty.
  - Answering correctly escalates the next question to Hard (with higher mastery weighting).
  - Answering incorrectly dynamically recalibrates the next question downward to diagnose foundational root causes.
- Includes question timer, hint toggle, confidence self-rating (Low/Medium/High), and immediate feedback with full conceptual explanations.

### 3. Knowledge Gap Analytics Dashboard (Screen 3)
- Real-time visual analytics powered by **Recharts**:
  - **Sub-skill Mastery Bar Chart**: Visualizes accuracy across all 5 sub-skills with a dashed 60% Knowledge Gap reference line.
  - **Radar / Spider Chart**: Displays multi-dimensional profile symmetry, highlighting structural knowledge deficits.
  - **Radial Readiness Score**: Shows overall competency percentage.
- Clear classification tags:
  - 🔴 **Knowledge Gap** (< 60% mastery)
  - 🟡 **Developing** (60% - 79% mastery)
  - 🟢 **Mastered** (≥ 80% mastery)
- AI Diagnostic Observations synthesizing accuracy, response time, and conceptual hesitation.

### 4. Automated Learning Path & Micro-Lessons (Screen 4 & 5)
- Automated micro-lesson generator tailored strictly to the student's chosen learning style:
  - Visual learners receive ASCII architecture diagrams and spatial analogies.
  - Code-first learners receive concrete implementation recipes and benchmark metrics.
  - Step-by-step learners receive deterministic algorithmic walkthroughs.
- Includes "Common Pitfall to Avoid" and "Key Mental Takeaway" cards.
- **2 Targeted Practice Problems per gap**:
  - Interactive evaluation with immediate pedagogical feedback.
  - Solving problems awards **+25% Mastery** dynamically.
  - Upgrades sub-skill status in real-time (Gap → Developing → Mastered).
  - Triggers celebratory confetti bursts upon mastering a gap!
  - Synchronizes changes back to the dashboard analytics and logs progression events to the History Drawer.

---

## 🛠️ Running Locally

1. **Start the production server**:
   ```powershell
   npm start
   ```
   Or run development server:
   ```powershell
   npm run dev
   ```
2. Open your browser to:
   ```
   http://localhost:3000
   ```
3. Optional Gemini API Key:
   - Click the **Gear icon (Settings)** in the top right navbar.
   - Enter your Google Gemini API Key.
   - If left blank, AdaptLearn AI seamlessly utilizes its built-in pedagogical curriculum engine without downtime or rate-limit issues.

---

## 🧪 Verification & End-to-End Testing

Run the automated verification suite:
```powershell
node scripts/test-e2e.js
```
The test verifies:
- Homepage availability (HTTP 200)
- Assessment generation with 5 calibrated sub-skills and 3 difficulty tiers each
- Adaptive evaluation calculations and gap threshold classifications
- Micro-lesson generation tailored to learning style
- Real-time practice scoring and score progression (+25% delta)
- Progress history event logging
