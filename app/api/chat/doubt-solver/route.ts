import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient } from '@/lib/gemini';
import { ChatMessage, LearningStyle, StudentUser } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      messages,
      student,
      currentTopic = 'Python Data Structures',
      weakSubSkills = [],
      activeQuestion,
      customApiKey,
    }: {
      messages: ChatMessage[];
      student?: StudentUser;
      currentTopic?: string;
      weakSubSkills?: string[];
      activeQuestion?: any;
      customApiKey?: string;
    } = body;

    const studentName = student?.name || 'Student';
    const learningStyle: LearningStyle = student?.preferredLearningStyle || 'visual';

    const latestUserMessage = messages[messages.length - 1]?.content || 'Hello';

    const styleInstructions: Record<LearningStyle, string> = {
      visual:
        'The student is a VISUAL / ANALOGY-BASED learner. Explain everything using vivid spatial analogies, memory box diagrams, ASCII diagrams, or real-world physical object models (e.g. mailboxes, train cars, blueprints).',
      code:
        'The student is a CODE-FIRST learner. Ground every explanation in clean, concrete code snippets with comments, showing anti-patterns vs best practices and time/space complexity.',
      'step-by-step':
        'The student is a STEP-BY-STEP learner. Structure explanations into clear, deterministic numbered pipelines (Step 1, Step 2, Step 3) with an edge-case checklist.',
    };

    const systemPrompt = `You are Quizora AI's personalized 1-on-1 pedagogical tutor assisting ${studentName}.
Student Learning Profile:
- Name: ${studentName}
- Semester: ${student?.semester || 'Semester 5'}
- Preferred Learning Style: ${learningStyle.toUpperCase()}
${styleInstructions[learningStyle]}

Current Academic Context:
- Active Topic: "${currentTopic}"
- Identified Knowledge Gaps / Weak Sub-skills: ${
      weakSubSkills.length > 0 ? weakSubSkills.map(w => `"${w}"`).join(', ') : 'Assessing baseline'
    }
${
  activeQuestion
    ? `- Active Assessment Context: Sub-skill: "${activeQuestion.subSkill}", Question: "${activeQuestion.questionText}", Explanation: "${activeQuestion.explanation}"`
    : ''
}

Guidelines:
- Deliver direct, encouraging, high-yield guidance tailored to their preferred style.
- If asked for an analogy, provide a memorable real-world analogy.
- If asked to explain a wrong answer, pinpoint the exact underlying misconception and how to avoid it.
- Keep responses readable, structured with markdown bolding and bullet points.`;

    // Attempt Gemini API call
    const ai = getGeminiClient(customApiKey);
    if (ai) {
      try {
        const conversationHistory = messages.map(m => `${m.role === 'user' ? 'Student' : 'Tutor'}: ${m.content}`).join('\n\n');
        const fullPrompt = `${systemPrompt}\n\nConversation History:\n${conversationHistory}\n\nTutor:`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: fullPrompt,
          config: {
            temperature: 0.4,
          },
        });

        const replyText = response.text?.trim();
        if (replyText) {
          return NextResponse.json({
            success: true,
            reply: replyText,
          });
        }
      } catch (err) {
        console.warn('Gemini chat failed, using fallback tutor generator:', err);
      }
    }

    // Dynamic, context-aware fallback response generator
    const reply = generateContextualTutorReply(
      latestUserMessage,
      studentName,
      learningStyle,
      currentTopic,
      weakSubSkills,
      activeQuestion
    );

    return NextResponse.json({
      success: true,
      reply,
    });
  } catch (err: any) {
    console.error('Error in AI Doubt Solver route:', err);
    return NextResponse.json({ error: err.message || 'Chat failed' }, { status: 500 });
  }
}

function generateContextualTutorReply(
  userMessage: string,
  studentName: string,
  style: LearningStyle,
  topic: string,
  weakSubSkills: string[],
  activeQuestion?: any
): string {
  const lowerMsg = userMessage.toLowerCase();
  const primaryWeakSkill = weakSubSkills[0] || 'Dictionaries & Hash Lookups';

  // Quick Action 1: "Explain my last wrong answer simply"
  if (lowerMsg.includes('wrong answer') || lowerMsg.includes('explain my last')) {
    if (activeQuestion) {
      if (style === 'visual') {
        return `Hey ${studentName}! Let's look at **${activeQuestion.subSkill}** visually:

Imagine your data structure as a row of mailbox cubbies. When you pick that option, you're looking into the wrong box address!

**Visual Memory Map:**
\`\`\`text
Expected: [ Key Hash ] ──> [ Bucket Peg 3 ] ──> Direct Value (O(1))
What Happened: Looked up with invalid key / shallow mutation reference!
\`\`\`

**Why the correct concept works:**
${activeQuestion.explanation}

Notice how separating the pointers avoids unexpected side-effects! Does this picture make it click?`;
      } else if (style === 'code') {
        return `Hey ${studentName}! Here is the exact code breakdown for **${activeQuestion.subSkill}**:

\`\`\`python
# ❌ The Common Anti-Pattern:
# Mutating shared references or accessing missing keys directly
# val = d['missing_key']  # KeyError!

# ✅ The Idiomatic Solution:
${activeQuestion.codeSnippet || '# Use safe default retrieval / independent constructors'}
# Key Takeaway: ${activeQuestion.explanation}
\`\`\`

This guarantees $O(1)$ lookup without raising unexpected runtime exceptions!`;
      } else {
        return `Hey ${studentName}! Let's break down **${activeQuestion.subSkill}** in 3 deterministic steps:

1. **Step 1: Check Invariants** — Identify whether the object being accessed is mutable or hashable.
2. **Step 2: Trace Execution** — ${activeQuestion.explanation}
3. **Step 3: Verification Checkpoint** — Always verify that boundary conditions (such as missing keys or negative step slices) handle default fallbacks cleanly.

Follow this 3-step checklist whenever this pattern comes up!`;
      }
    }

    return `Hey ${studentName}! When you miss a question in **${topic}**, the root misconception usually comes from **${primaryWeakSkill}**. 

In Python, remember that variables are *pointers to heap objects*, not direct boxes. When you mutate an inner object, all pointers seeing that object reflect the change. Would you like a targeted code example or diagram on this?`;
  }

  // Quick Action 2: "Give me a real-world analogy"
  if (lowerMsg.includes('analogy') || lowerMsg.includes('real-world')) {
    return `Here is a memorable real-world analogy for **${primaryWeakSkill}** tailored for you, ${studentName}:

🧥 **The Coat Check Room Analogy:**
Think of a Hash Table as a coat-check room with 1,000 pegs.
- Instead of the attendant walking through 1,000 coats to find yours (which would be $O(N)$ linear time), they use a math formula (hash function) on your ticket number.
- The formula instantly says: **"Go straight to Peg #42"**.
- That's why lookups are $O(1)$ constant time regardless of whether there are 10 coats or 1,000,000 coats!

Does that mental model help solidify why sets and dictionaries are so blazingly fast?`;
  }

  // Quick Action 3: "Quiz me on my weakest sub-topic"
  if (lowerMsg.includes('quiz me') || lowerMsg.includes('weakest')) {
    return `🎯 **Quick Practice Question for ${studentName}** on your target gap: **${primaryWeakSkill}**

What is the output and behavior of the following snippet?

\`\`\`python
d = {'status': 'active'}
val = d.get('role', 'standard_user')
print(val, 'role' in d)
\`\`\`

**Options:**
- A) \`None False\`
- B) \`standard_user True\` (inserts key)
- C) \`standard_user False\` (returns fallback without modifying dict)
- D) \`KeyError\`

Reply with your answer (A, B, C, or D) and I'll evaluate your reasoning!`;
  }

  // General conversational tutor reply
  if (style === 'visual') {
    return `Hi ${studentName}! Regarding your question on **${topic}**:

Think of this concept like an architectural blueprint. In **${primaryWeakSkill}**, everything revolves around memory references:

\`\`\`text
[ Your Reference ] ───> [ Heap Memory Object ]
                              ▲
[ Second Pointer ] ───────────┘ (Shared Reference!)
\`\`\`

When you visualize data structures as pointers rather than static values, performance trade-offs and mutations become immediately intuitive. What specific part would you like me to diagram next?`;
  } else if (style === 'code') {
    return `Hi ${studentName}! Let's examine how to handle this in code for **${topic}**:

\`\`\`python
# Idiomatic implementation pattern:
def optimize_collection(data):
    # Use hash-based collections for O(1) membership checks
    lookup = set(data)
    return [item for item in data if item in lookup]
\`\`\`

Notice that using the set reduces lookup complexity from $O(N^2)$ to $O(N)$! What specific syntax pattern are you working through right now?`;
  } else {
    return `Hi ${studentName}! Let's resolve your doubt in **${topic}** step-by-step:

- **Step 1:** Establish the data contracts and Big-O constraints.
- **Step 2:** Isolate the sub-operation (e.g. ${primaryWeakSkill}).
- **Step 3:** Apply the deterministic invariant to prevent side-effects.

Which step would you like to explore deeper?`;
  }
}
