import { GoogleGenAI } from '@google/genai';
import { DifficultyLevel, LearningStyle, MicroLesson, PracticeProblem, Question } from './types';
import { PRESET_CURRICULUMS } from './presetCurriculums';

export function getGeminiClient(customApiKey?: string): GoogleGenAI | null {
  const apiKey =
    customApiKey ||
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GOOGLE_GENAI_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey === 'test') {
    return null;
  }

  try {
    return new GoogleGenAI({ apiKey });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
    return null;
  }
}

/**
 * Generates an adaptive diagnostic quiz bank for a topic.
 * Returns 5 subskills, each with an easy, medium, and hard question so difficulty adapts dynamically.
 */
export async function generateAdaptiveQuizBank(
  topic: string,
  experienceLevel: string = 'intermediate',
  customApiKey?: string
): Promise<{
  subSkills: {
    name: string;
    description: string;
    questions: {
      easy: Question;
      medium: Question;
      hard: Question;
    };
  }[];
}> {
  // Check if we have a rich preset curriculum first
  const normalizedTopic = topic.trim().toLowerCase();
  for (const [key, preset] of Object.entries(PRESET_CURRICULUMS)) {
    if (normalizedTopic.includes(key) || key.includes(normalizedTopic)) {
      return {
        subSkills: preset.subSkills.map(s => ({
          name: s.name,
          description: s.description,
          questions: s.questions,
        })),
      };
    }
  }

  // Attempt to call Gemini API if key is present
  const ai = getGeminiClient(customApiKey);
  if (ai) {
    try {
      const prompt = `You are an expert diagnostic pedagogical AI.
Generate a structured 5-part diagnostic curriculum for the topic: "${topic}" (Student level: ${experienceLevel}).

Output STRICT JSON with the following schema:
{
  "subSkills": [
    {
      "name": "Sub-skill name",
      "description": "Brief description of the concept",
      "questions": {
        "easy": {
          "id": "q1-easy",
          "subSkill": "Sub-skill name",
          "difficulty": "easy",
          "questionText": "Conceptual baseline question",
          "codeSnippet": "Optional code if relevant, or omit",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctOptionIndex": 0,
          "explanation": "Clear explanation why option A is correct",
          "hint": "Gentle nudge without giving away the answer"
        },
        "medium": {
          "id": "q1-med",
          "subSkill": "Sub-skill name",
          "difficulty": "medium",
          "questionText": "Applied problem with edge cases",
          "codeSnippet": "Optional code",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctOptionIndex": 1,
          "explanation": "Detailed explanation",
          "hint": "Clue focusing on common mistakes"
        },
        "hard": {
          "id": "q1-hard",
          "subSkill": "Sub-skill name",
          "difficulty": "hard",
          "questionText": "Complex synthesis, internal memory model, or performance trade-off question",
          "codeSnippet": "Optional code",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctOptionIndex": 2,
          "explanation": "Deep architectural explanation",
          "hint": "Think about low-level invariants or asymptotical constraints"
        }
      }
    }
  ]
}

Ensure exactly 5 distinct subSkills covering the core breadth of "${topic}". Make options realistic and unambiguous.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const text = response.text?.trim() || '';
      if (text) {
        const parsed = JSON.parse(text);
        if (parsed.subSkills && parsed.subSkills.length >= 3) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Gemini API call failed for quiz bank, falling back to dynamic synthesizer:', err);
    }
  }

  // Resilient fallback generator for any custom topic
  return generateDynamicFallbackQuizBank(topic);
}

/**
 * Generates an automated micro-lesson and 2 targeted practice problems tailored to learning style.
 */
export async function generateTargetedMicroLesson(
  topic: string,
  subSkill: string,
  learningStyle: LearningStyle,
  customApiKey?: string
): Promise<MicroLesson> {
  // Check preset first
  const normalizedTopic = topic.trim().toLowerCase();
  for (const [key, preset] of Object.entries(PRESET_CURRICULUMS)) {
    if (normalizedTopic.includes(key) || key.includes(normalizedTopic)) {
      const found = preset.subSkills.find(
        s => s.name.toLowerCase() === subSkill.toLowerCase() || subSkill.toLowerCase().includes(s.name.toLowerCase())
      );
      if (found && found.lessons[learningStyle]) {
        return found.lessons[learningStyle];
      }
    }
  }

  // Attempt Gemini API
  const ai = getGeminiClient(customApiKey);
  if (ai) {
    try {
      const styleGuidelines = {
        visual: 'Use ASCII/text diagrams, mental models, spatial analogies, and visual memory maps.',
        code: 'Emphasize concrete syntax patterns, anti-patterns vs best practices, and runnable snippets.',
        'step-by-step': 'Provide a deterministic numbered algorithmic framework, edge case checklist, and proof-like derivation.',
      }[learningStyle];

      const prompt = `You are a personalized AI tutor specializing in adaptive learning remediation.
The student has a critical KNOWLEDGE GAP in "${subSkill}" within the broader topic "${topic}".
Their preferred learning style is: "${learningStyle.toUpperCase()}". ${styleGuidelines}

Generate an engaging, highly targeted micro-lesson and exactly 2 targeted practice problems to remediate this gap.

Output STRICT JSON with the schema:
{
  "subSkill": "${subSkill}",
  "title": "Inspiring Title tailored to ${learningStyle}",
  "learningStyle": "${learningStyle}",
  "overview": "2 sentence overview highlighting why this concept is essential",
  "coreConceptExplanation": "Rich 2-3 paragraph explanation strictly matching the ${learningStyle} pedagogical style",
  "visualOrCodeArtifact": {
    "type": "${learningStyle === 'visual' ? 'diagram' : learningStyle === 'code' ? 'code' : 'step_list'}",
    "title": "Descriptive Artifact Title",
    "content": "Well-formatted ASCII diagram, code snippet with comments, or step-by-step numbered breakdown"
  },
  "commonPitfall": "The single most common trap or misconception students fall into",
  "keyTakeaway": "1 punchy memorable rule of thumb",
  "practiceProblems": [
    {
      "id": "p1-${Date.now()}",
      "subSkill": "${subSkill}",
      "title": "Practice 1: Targeted Concept Verification",
      "scenario": "A concise scenario requiring application of the rule",
      "problemType": "multiple_choice",
      "codeSnippet": "Optional snippet",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctOptionIndex": 1,
      "hint": "Helpful hint referencing the lesson",
      "explanation": "Clear reason why this option resolves the scenario correctly"
    },
    {
      "id": "p2-${Date.now()}",
      "subSkill": "${subSkill}",
      "title": "Practice 2: Edge-Case Mastery Check",
      "scenario": "A subtle edge-case question verifying true mastery",
      "problemType": "multiple_choice",
      "codeSnippet": "Optional snippet",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctOptionIndex": 0,
      "hint": "Check the boundaries or invariant constraints",
      "explanation": "Why this handles the boundary condition safely"
    }
  ]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      const text = response.text?.trim() || '';
      if (text) {
        const parsed: MicroLesson = JSON.parse(text);
        if (parsed.title && parsed.practiceProblems?.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Gemini API call failed for micro-lesson, falling back to dynamic generator:', err);
    }
  }

  // Dynamic fallback generator
  return generateDynamicFallbackMicroLesson(topic, subSkill, learningStyle);
}

/**
 * Evaluates student's answer to a practice problem with smart feedback.
 */
export async function evaluateStudentPractice(
  problem: PracticeProblem,
  userAnswer: string,
  selectedOptionIndex?: number,
  customApiKey?: string
): Promise<{ isCorrect: boolean; feedback: string; scoreDelta: number }> {
  // If multiple choice
  if (problem.problemType === 'multiple_choice' && typeof problem.correctOptionIndex === 'number') {
    const isCorrect = selectedOptionIndex === problem.correctOptionIndex;
    const scoreDelta = isCorrect ? 25 : 0;
    const feedback = isCorrect
      ? `🎉 Excellent! Correct answer. ${problem.explanation}`
      : `Not quite. ${problem.hint} Review: ${problem.explanation}`;
    return { isCorrect, feedback, scoreDelta };
  }

  // If open code or text answer
  const ai = getGeminiClient(customApiKey);
  if (ai) {
    try {
      const prompt = `Evaluate student's answer to this practice problem:
Problem: ${problem.title}
Scenario: ${problem.scenario}
Expected solution concept: ${problem.explanation}
Student answer: "${userAnswer}"

Output strict JSON:
{
  "isCorrect": boolean,
  "feedback": "2-3 sentences of encouraging constructive feedback explaining what was correct or missing",
  "scoreDelta": number (between 0 and 30)
}`;
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' },
      });
      const parsed = JSON.parse(response.text || '{}');
      return {
        isCorrect: Boolean(parsed.isCorrect),
        feedback: parsed.feedback || (parsed.isCorrect ? 'Great job!' : 'Please check again.'),
        scoreDelta: typeof parsed.scoreDelta === 'number' ? parsed.scoreDelta : parsed.isCorrect ? 25 : 0,
      };
    } catch (err) {
      console.warn('Gemini practice eval failed, using keyword check:', err);
    }
  }

  // Heuristic evaluation fallback
  const isMatch = problem.expectedKeywords?.some(k => userAnswer.toLowerCase().includes(k.toLowerCase())) ||
    userAnswer.trim().length > 15;
  return {
    isCorrect: isMatch,
    feedback: isMatch
      ? `Well done! Your solution addresses the core principle. ${problem.explanation}`
      : `Needs revision. Remember to consider: ${problem.hint}`,
    scoreDelta: isMatch ? 25 : 0,
  };
}

/**
 * Resilient Dynamic Fallback Generator for any custom topic
 */
function generateDynamicFallbackQuizBank(topic: string) {
  const cleanTopic = topic.replace(/[^\w\s-]/g, '').trim() || 'General Computing';
  const subSkillNames = [
    `${cleanTopic} Core Fundamentals & Syntax`,
    `${cleanTopic} Memory Model & State Lifecycle`,
    `${cleanTopic} Asymptotic Complexity & Efficiency`,
    `${cleanTopic} Error Handling & Edge-Case Invariants`,
    `${cleanTopic} Architecture & Idiomatic Patterns`,
  ];

  return {
    subSkills: subSkillNames.map((name, idx) => ({
      name,
      description: `Essential foundational concepts and operational principles of ${name}.`,
      questions: {
        easy: {
          id: `dyn-q${idx + 1}-easy`,
          subSkill: name,
          difficulty: 'easy' as DifficultyLevel,
          questionText: `Which of the following is the fundamental governing principle of ${name}?`,
          options: [
            `Standard declarative interface ensuring deterministic state transitions`,
            `Unbounded dynamic allocation without runtime validation`,
            `Strictly single-threaded sequential execution without stack frames`,
            `Implicit global variable mutability across all scopes`,
          ],
          correctOptionIndex: 0,
          explanation: `In ${name}, declarative interfaces and clear state transitions prevent race conditions and maintain invariant contracts.`,
          hint: `Look for the principle emphasizing predictability, clarity, and determinism.`,
        },
        medium: {
          id: `dyn-q${idx + 1}-med`,
          subSkill: name,
          difficulty: 'medium' as DifficultyLevel,
          questionText: `When scaling operations in ${name}, what trade-off must be prioritized to prevent bottleneck degradation?`,
          options: [
            `Eliminating all caching layers to minimize RAM usage`,
            `Balancing time complexity with spatial locality to optimize cache-hit ratios`,
            `Switching entirely to linear scans for collections larger than 10,000 items`,
            `Ignoring exception boundaries during batch execution`,
          ],
          correctOptionIndex: 1,
          explanation: `Spatial locality and algorithmic complexity (e.g. O(1) vs O(N)) dominate real-world performance as data scale expands.`,
          hint: `Consider how modern CPU caches and Big-O curves interact under heavy load.`,
        },
        hard: {
          id: `dyn-q${idx + 1}-hard`,
          subSkill: name,
          difficulty: 'hard' as DifficultyLevel,
          questionText: `Under concurrent or asynchronous execution in ${name}, which mechanism guarantees invariant safety without deadlock?`,
          options: [
            `Spin-locking on un-synchronized memory flags without barriers`,
            `Fine-grained optimistic concurrency control with monotonic version tagging`,
            `Disabling interrupt flags across the operating system kernel`,
            `Duplicating every write directly into unbuffered disk I/O`,
          ],
          correctOptionIndex: 1,
          explanation: `Optimistic concurrency with version tagging allows lock-free throughput while catching concurrent conflicting mutations.`,
          hint: `Think of lockless patterns that verify state hasn't drifted before committing.`,
        },
      },
    })),
  };
}

function generateDynamicFallbackMicroLesson(
  topic: string,
  subSkill: string,
  learningStyle: LearningStyle
): MicroLesson {
  const artifacts = {
    visual: {
      type: 'diagram' as const,
      title: `Visual Architecture Map: ${subSkill}`,
      content: `[Input Request] ───> [Validation Layer]
                            │
                            ▼
                    ┌─────────────────┐
                    │  ${subSkill}    │ <─── Invariant Enforcement
                    └─────────────────┘
                            │
               ┌────────────┴────────────┐
               ▼                         ▼
      [Success: Fast Path]      [Fallback: Safe Recovery]`,
    },
    code: {
      type: 'code' as const,
      title: `Idiomatic Implementation for ${subSkill}`,
      content: `// Demonstrating safe invariant handling in ${subSkill}
function executeOperation(inputState) {
  // 1. Guard against boundary failure
  if (!inputState || typeof inputState !== 'object') {
    throw new Error('Invalid state boundary');
  }

  // 2. Perform localized transformation without side-effects
  const nextSnapshot = {
    ...inputState,
    updatedAt: Date.now(),
    status: 'remediated'
  };

  return Object.freeze(nextSnapshot); // Enforce immutability
}`,
    },
    'step-by-step': {
      type: 'step_list' as const,
      title: `Step-by-Step Remediation Protocol: ${subSkill}`,
      content: `Step 1: Identify Invariant Boundaries
  - Verify inputs against schema contracts before invoking mutation routines.

Step 2: Isolate State Side-Effects
  - Perform transformations in local memory copies to prevent polluting shared context.

Step 3: Execute Asymptotic Optimization
  - Replace nested O(N^2) iterations with O(1) hash maps or indexed pointers.

Step 4: Validate Error Recovery
  - Ensure failure modes fail-fast with explicit actionable diagnostics.`,
    },
  }[learningStyle];

  return {
    subSkill,
    title: `Remediating ${subSkill} (${learningStyle.toUpperCase()} Mastery)`,
    learningStyle,
    overview: `Master the essential mental model and mechanics behind ${subSkill} to close this knowledge gap.`,
    coreConceptExplanation: `In ${topic}, understanding ${subSkill} is critical because gaps here compound into systemic bugs, inefficient runtime bottlenecks, and difficult-to-trace state corruptions. By grounding this in ${learningStyle} thinking, you can bridge theoretical intuition directly into dependable practical execution.`,
    visualOrCodeArtifact: artifacts,
    commonPitfall: `Attempting in-place mutations without checking for shared aliases or boundary conditions.`,
    keyTakeaway: `Isolate side effects, understand underlying Big-O bounds, and enforce invariants early.`,
    practiceProblems: [
      {
        id: `prac-dyn-${Date.now()}-1`,
        subSkill,
        title: `Targeted Check: Invariant Verification`,
        scenario: `A pipeline processing data through ${subSkill} experiences intermittent state drift. What is the root fix?`,
        problemType: 'multiple_choice',
        options: [
          `Enforce immutable snapshots at every boundary stage`,
          `Rely on global variables to sync state across modules`,
          `Remove type checks to speed up runtime execution`,
          `Suppress all errors and retry indefinitely`,
        ],
        correctOptionIndex: 0,
        hint: `Immutability prevents unexpected external modifications.`,
        explanation: `Immutable snapshots guarantee that state cannot be mutated out-from-under concurrent or asynchronous consumers.`,
      },
      {
        id: `prac-dyn-${Date.now()}-2`,
        subSkill,
        title: `Targeted Check: Asymptotic Efficiency`,
        scenario: `Which data access pattern guarantees optimal performance when querying ${subSkill}?`,
        problemType: 'multiple_choice',
        options: [
          `Sequential scan across an unsorted linked list`,
          `Direct O(1) hash table lookup or indexed memory offset`,
          `Recursively reloading dataset from persistent storage on every query`,
          `Nested loop search comparing every item pairwise`,
        ],
        correctOptionIndex: 1,
        hint: `Hash-based or index-offset access provides constant time.`,
        explanation: `O(1) hash lookups scale smoothly without linear performance degradation.`,
      },
    ],
  };
}
