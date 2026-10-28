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
    const latestUserMessage = messages[messages.length - 1]?.content?.trim() || 'Hello';

    const styleInstructions: Record<LearningStyle, string> = {
      visual:
        'The student is a VISUAL / ANALOGY-BASED learner. Explain using vivid spatial analogies, memory box diagrams, ASCII diagrams, or real-world physical object models (e.g. mailboxes, train cars, blueprints).',
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
      weakSubSkills.length > 0 ? weakSubSkills.map((w) => `"${w}"`).join(', ') : 'Assessing baseline'
    }
${
  activeQuestion
    ? `- Active Assessment Question: "${activeQuestion.questionText}"
- Sub-skill: "${activeQuestion.subSkill}"
- Correct Concept: "${activeQuestion.explanation}"`
    : ''
}

Pedagogical Directives:
- Answer the student's EXACT question directly and comprehensively.
- Frame your response strictly in the ${learningStyle.toUpperCase()} learning style.
- Use markdown formatting with bold headers, bullet points, and code blocks where applicable.
- Keep the tone encouraging, technical, and high-yield.`;

    // Attempt Gemini API call with multiple models for resilience
    const ai = getGeminiClient(customApiKey);
    if (ai) {
      const candidateModels = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.0-flash'];
      const conversationHistory = messages
        .map((m) => `${m.role === 'user' ? 'Student' : 'Quizora AI Tutor'}: ${m.content}`)
        .join('\n\n');
      const fullPrompt = `${systemPrompt}\n\nConversation History:\n${conversationHistory}\n\nQuizora AI Tutor:`;

      for (const modelName of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: fullPrompt,
            config: {
              temperature: 0.35,
            },
          });

          const replyText = response.text?.trim();
          if (replyText) {
            return NextResponse.json({
              success: true,
              reply: replyText,
              engine: 'gemini',
              model: modelName,
            });
          }
        } catch (modelErr) {
          console.warn(`Gemini model ${modelName} call failed, trying next:`, modelErr);
        }
      }
    }

    // Comprehensive Semantic Pedagogical Solver (Fallback when API key is not present)
    const reply = resolvePedagogicalDoubt(
      latestUserMessage,
      studentName,
      learningStyle,
      currentTopic,
      weakSubSkills,
      activeQuestion,
      student
    );

    return NextResponse.json({
      success: true,
      reply,
      engine: 'quizora-knowledge-base',
    });
  } catch (err: any) {
    console.error('Error in AI Doubt Solver route:', err);
    return NextResponse.json({ error: err.message || 'Chat failed' }, { status: 500 });
  }
}

/**
 * Intelligent Pedagogical Semantic Knowledge Base
 * Answers specific computing, programming, data structures, and algorithm questions
 * tailored dynamically to Visual, Code-first, or Step-by-step learners.
 */
function resolvePedagogicalDoubt(
  rawQuery: string,
  studentName: string,
  style: LearningStyle,
  topic: string,
  weakSubSkills: string[],
  activeQuestion?: any,
  student?: StudentUser
): string {
  const query = rawQuery.toLowerCase().trim();
  const primaryWeakSkill = weakSubSkills[0] || 'Dictionaries & Hash Lookups';

  // --- 1. Quick Action Chips ---
  if (query.includes('explain my last wrong answer') || (query.includes('wrong answer') && query.includes('last'))) {
    if (activeQuestion) {
      return explainActiveWrongAnswer(studentName, style, activeQuestion);
    }
    return `Hey ${studentName}! When tackling **${topic}**, the most common root misconception relates to **${primaryWeakSkill}**.

In Python, remember:
1. Variables store **memory pointers**, not the objects themselves.
2. Modifying mutable structures inside a container modifies the shared underlying heap allocation.
3. For example, \`matrix = [[0] * 2] * 2\` copies the reference to the *same* inner list twice!

Would you like to walk through a concrete visual diagram or code pattern to lock this in?`;
  }

  if (query.includes('analogy') || query.includes('real-world')) {
    return generateMemorableAnalogy(studentName, style, primaryWeakSkill);
  }

  if (query.includes('quiz me') || query.includes('weakest sub-topic')) {
    return generateInteractivePracticeQuiz(studentName, primaryWeakSkill);
  }

  // --- 2. Interactive Option Responses (if user answers "A", "B", "C", "D" to a quiz) ---
  if (/^(option\s+)?[a-d](\s+is\s+correct)?[\.\!\?]?$/i.test(query)) {
    const choice = query.replace(/[^a-d]/gi, '').toUpperCase();
    if (choice === 'C') {
      return `🎉 **Spot on, ${studentName}! Option C is 100% correct!**

\`d.get('role', 'standard_user')\` returns the fallback value \`'standard_user'\`, but it does **NOT** insert the key into the dictionary. Therefore, \`'role' in d\` remains \`False\`.

To actually insert a key with a default if missing, you would use \`d.setdefault('role', 'standard_user')\`. Great mastery! What concept would you like to explore next?`;
    } else {
      return `Nice try, ${studentName}! But Option ${choice} is not quite right. 

The correct answer is **Option C (\`standard_user False\`)**.
- \`dict.get(key, default)\` is a **read-only** accessor. It returns the default if the key is missing, but leaves the dictionary untouched.
- If you want the dictionary to actually insert the key on miss, use \`dict.setdefault(key, default)\`.

Notice the difference? What else can I clarify for you?`;
    }
  }

  // --- 3. Conversational & Orientation Queries ---
  if (/^(hi|hello|hey|greetings|good morning|good evening)/i.test(query)) {
    return `Hello ${studentName}! 👋 I'm your **Quizora AI Tutor**. 

I'm aligned with your **${style.toUpperCase()}** learning style and ready to assist you in **${topic}**${
      weakSubSkills.length > 0 ? ` (with a focused eye on ${weakSubSkills.join(', ')})` : ''
    }.

You can ask me to:
- Explain any core concept (e.g. *"What is the difference between list and tuple?"*, *"How does Big-O work?"*)
- Break down any data structure or algorithm
- Provide real-world analogies, code snippets, or step-by-step algorithms
- Help diagnose errors or tricky edge cases

What's on your mind today?`;
  }

  if (query.includes('who are you') || query.includes('what can you do')) {
    return `I am **Quizora AI Tutor**, your context-aware pedagogical copilot! 

**Here is what makes me different from a generic chatbot:**
- 🧠 **Context-Aware**: I know your name (${studentName}), semester (${student?.semester || 'Semester 5'}), and exact identified knowledge gaps (${weakSubSkills.join(', ') || 'assessing baseline'}).
- 🎨 **Adaptive Formatting**: Every explanation is structured for your **${style.toUpperCase()}** preference (${
      style === 'visual'
        ? 'ASCII diagrams and spatial mental models'
        : style === 'code'
        ? 'concrete runnable syntax with benchmarks'
        : 'deterministic step-by-step checklists'
    }).
- 🎯 **Targeted Remediation**: I can explain your wrong quiz answers, give analogies, or quiz you on your weakest concepts.`;
  }

  // --- 4. Topic-Specific Conceptual Knowledge Base ---

  // A. Lists vs Tuples / Mutability
  if (query.includes('tuple') && (query.includes('list') || query.includes('difference') || query.includes('mutable'))) {
    if (style === 'visual') {
      return `### 📦 Lists vs. Tuples: A Visual Memory Model for ${studentName}

\`\`\`text
LIST (Mutable Dynamic Array):
[ Header | Cap: 4 | Size: 3 ] ──> [ Ptr0 | Ptr1 | Ptr2 | EmptySlot ]
                                    │      │      │
                                    ▼      ▼      ▼
                                   (10)   (20)   (30)
* Can grow, shrink, and reassign slots in-place!

TUPLE (Immutable Fixed-Length Container):
[ Header | Fixed Size: 3 ] ──────> [ Ptr0 | Ptr1 | Ptr2 ] (SEALED!)
                                    │      │      │
                                    ▼      ▼      ▼
                                   (10)   (20)   (30)
* Cannot add, remove, or rebind pointer slots.
\`\`\`

**Key Differences:**
1. **Mutability**: Lists are mutable (\`list.append()\`, \`list[0] = 99\`); tuples are immutable.
2. **Hashability**: Tuples can be dictionary keys and set elements (if all nested items are immutable); lists cannot.
3. **Memory & Performance**: Tuples use less memory (no over-allocation buffer) and CPython caches small tuples in free-lists for faster instantiation.`;
    } else if (style === 'code') {
      return `### 💻 Lists vs. Tuples: Concrete Code & Memory Profiles

\`\`\`python
import sys

# 1. Memory Footprint Contrast:
my_list = [1, 2, 3]
my_tuple = (1, 2, 3)

print("List bytes:", sys.getsizeof(my_list))    # ~88 bytes (includes dynamic resizing buffer)
print("Tuple bytes:", sys.getsizeof(my_tuple))  # ~64 bytes (fixed allocation, no buffer)

# 2. Hashability & Dict Keys:
valid_key = (1, 2, "admin")
d = {valid_key: "Access Granted"}  # ✅ Valid!

# invalid_key = [1, 2, "admin"]
# d[invalid_key] = "Error"         # ❌ TypeError: unhashable type: 'list'

# 3. Shallow Immutability Caveat:
t = (1, 2, [3, 4])
t[2].append(5)  # ✅ Mutates the inner list! The tuple's pointer didn't change!
# t[2] = [3, 4, 5] # ❌ TypeError! Cannot reassign tuple slots.
\`\`\`

**Rule of Thumb**: Use tuples for fixed heterogenous records and dict keys; use lists for homogenous collections that change size.`;
    } else {
      return `### 🔢 Lists vs. Tuples: Decision Pipeline

Follow this 3-step decision tree when choosing between a list and a tuple:

1. **Step 1: Check Lifecycle Mutability**
   - Does this collection need items added, deleted, or reordered at runtime?
   - **YES** ➔ Use \`list\`.
   - **NO** ➔ Proceed to Step 2.

2. **Step 2: Check Hash Table Usage**
   - Will this container be used as a Dictionary Key or stored inside a Set?
   - **YES** ➔ Use \`tuple\` (ensure all inner elements are also immutable primitives).
   - **NO** ➔ Proceed to Step 3.

3. **Step 3: Check Memory & Thread Safety**
   - Tuples are read-only, making them inherently thread-safe and ~25% lighter on memory due to zero resizing overhead.`;
    }
  }

  // B. Dictionaries & Hash Maps / Collisions
  if (query.includes('dict') || query.includes('hash') || query.includes('hashmap') || query.includes('hash table') || query.includes('collision')) {
    if (style === 'visual') {
      return `### 🗺️ How Python Dictionaries Work: Visual Hash Table & Collisions

\`\`\`text
Step 1: hash("apple") % 8 = 3
Step 2: Lookup in Sparse Indices Table at index 3:

Sparse Indices Array (Buckets):
Index:    [ 0 | 1 | 2 |  3  | 4 |  5  | 6 | 7 ]
Entries:  [-1 |-1 |-1 | [0] |-1 | [1] |-1 |-1 ]
                         │         │
                         ▼         ▼
Dense Entries Array (Contiguous Memory):
[0] => { hash: 0x48a, key: "apple",  value: 10 }
[1] => { hash: 0x93f, key: "banana", value: 25 }
\`\`\`

**What is a Hash Collision?**
When two different keys produce the same bucket index (e.g., \`hash("cat") % 8 == hash("dog") % 8\`).
- Python resolves collisions using **Open Addressing with Perturbation**:
  \`perturb >>= 5; index = (5 * index + 1 + perturb) & mask\`
- This jumps to a deterministic secondary bucket without needing separate linked list chains!`;
    } else if (style === 'code') {
      return `### 💻 Dictionaries & Hash Maps: Code Implementation & Big-O

\`\`\`python
# 1. Average vs Worst-Case Time Complexity:
# Lookup:    O(1) average | O(N) pathological worst-case (all keys collide)
# Insertion: O(1) amortized
# Deletion:  O(1) average

d = {"users": 100, "active": 85}

# 2. Safe Retrieval Patterns:
# ❌ d["missing"] -> Raises KeyError!
# ✅ Safe with default:
status = d.get("missing", "guest")  # Returns "guest", dict unchanged

# ✅ Safe insertion with default:
settings = {}
settings.setdefault("theme", "dark") # Inserts "theme": "dark" only if absent

# 3. What makes a key valid?
# Must be hashable: implements __hash__() and __eq__()
class APIKey:
    def __init__(self, key_id):
        self.key_id = key_id
    def __hash__(self):
        return hash(self.key_id)
    def __eq__(self, other):
        return isinstance(other, APIKey) and self.key_id == other.key_id
\`\`\``;
    } else {
      return `### 🔢 Hash Table Key Resolution Pipeline

Here is the exact step-by-step algorithm CPython executes when you write \`d[key]\`:

1. **Step 1: Compute Hash**
   - Calculates \`h = hash(key)\`. If \`key\` is mutable (e.g. a list), immediately aborts with \`TypeError: unhashable type\`.

2. **Step 2: Compute Initial Bucket Index**
   - Computes \`idx = h & (table_size - 1)\`.

3. **Step 3: Probe Sparse Array**
   - If \`indices[idx] == -1\`: Key does not exist! Raises \`KeyError\`.
   - If occupied: Fetches \`entries[indices[idx]]\`.
     - Compares: Is \`entry.hash == h\` AND (\`entry.key is key\` OR \`entry.key == key\`)?
     - **Match Found** ➔ Returns \`entry.value\` ($O(1)$ constant time).
     - **Mismatch (Collision)** ➔ Proceed to Step 4.

4. **Step 4: Recalculate Perturbed Index**
   - Recalculates index using \`idx = (5 * idx + 1 + perturb) & mask\` and repeats Step 3 until resolved.`;
    }
  }

  // C. Big-O Notation & Complexity
  if (query.includes('big o') || query.includes('complexity') || query.includes('time complexity') || query.includes('space complexity')) {
    if (style === 'visual') {
      return `### 📈 Big-O Complexity Hierarchy: Visual Scale

\`\`\`text
Operations
    ▲
    │                                  O(2^N) [Exponential: Terrible!]
    │                             O(N^2) [Quadratic: Nested Loops]
    │                        O(N log N) [Linearithmic: MergeSort/QuickSort]
    │                   O(N) [Linear: Single scan through array]
    │             O(log N) [Logarithmic: Binary Search]
    │        O(1) [Constant: Hash map lookup / array index]
    └────────────────────────────────────────────────────────► Data Size (N)
\`\`\`

**Hierarchy from Fastest to Slowest:**
1. $O(1)$ — Instant regardless of size (e.g., \`dict[key]\`, \`list.append()\`, \`arr[i]\`).
2. $O(\log N)$ — Cuts problem size in half each step (e.g., Binary Search, BST lookup).
3. $O(N)$ — Proportional to size (e.g., Linear search, \`list.pop(0)\`, \`item in list\`).
4. $O(N \log N)$ — Optimal comparison-based sorting (e.g., \`sorted()\`, TimSort, MergeSort).
5. $O(N^2)$ — Nested iteration over the same data (e.g., comparing every pair).`;
    } else {
      return `### 💻 Big-O in Python: Operations Cheat-Sheet

\`\`\`python
# O(1) Constant Time Operations:
val = my_dict["key"]       # Hash table lookup
item = my_list[42]         # Array index access
my_list.append(100)        # Amortized dynamic array append
my_deque.appendleft(100)   # Deque O(1) front push

# O(N) Linear Time Operations:
my_list.pop(0)             # Shifts all N-1 elements left!
item in my_list            # Scans every element sequentially
my_list.insert(0, "first") # Shifts all elements right

# O(log N) Logarithmic Time:
import bisect
idx = bisect.bisect_left(sorted_list, target) # Binary search

# O(N log N) Sorting:
sorted_items = sorted(my_list) # CPython TimSort
\`\`\`

**Core Law**: Always replace nested $O(N^2)$ search loops by converting the lookup collection into a \`set\` or \`dict\` for $O(1)$ membership checks, dropping total time to $O(N)$!`;
    }
  }

  // D. Stacks, Queues & Deque
  if (query.includes('stack') || query.includes('queue') || query.includes('deque') || query.includes('fifo') || query.includes('lifo') || query.includes('pop(0)')) {
    return `### 🥞 Stacks vs. Queues: The Memory Blueprint for ${studentName}

1. **Stack (LIFO — Last In, First Out)**
   - Like a stack of dinner plates: you add to the top, and take from the top.
   - **Idiom in Python**: Standard built-in \`list\`.
   - **Operations**: \`stack.append(x)\` (Push: $O(1)$) and \`stack.pop()\` (Pop: $O(1)$).

2. **Queue (FIFO — First In, First Out)**
   - Like a movie theater ticket line: first person to arrive is first to be served.
   - **Common Anti-Pattern**: Using \`list.append()\` + \`list.pop(0)\`.
     - *Why it's disastrous*: Removing index 0 leaves a hole. Python must shift all $N-1$ remaining items in memory! Doing this in a loop turns an algorithm into $O(N^2)$.
   - **Correct Idiom**: \`from collections import deque\`
     - \`q = deque()\`
     - \`q.append(task)\` (Enqueue: $O(1)$)
     - \`task = q.popleft()\` (Dequeue: $O(1)$ guaranteed!)

\`\`\`python
from collections import deque

# High-Performance O(1) Queue
q = deque(maxlen=1000) # Optional bounded buffer
q.append("Request A")
q.append("Request B")
current = q.popleft()  # "Request A" (O(1) instant pointer advance)
\`\`\``;
  }

  // E. Sets & Deduplication
  if (query.includes('set') || query.includes('deduplicat') || query.includes('intersection') || query.includes('union') || query.includes('frozenset')) {
    return `### ⭕ Python Sets: Theory & Performance

A Python \`set\` is essentially a dictionary that stores only keys without values.

**Key Invariants:**
1. **Uniqueness Contract**: Sets never store duplicates.
   - Why does \`{1, True, 1.0}\` evaluate to \`{1}\`?
   - In Python, \`bool\` is a subclass of \`int\`. \`hash(1) == hash(True) == hash(1.0)\` AND \`1 == True == 1.0\`. Since both the hash and value match, Python treats them as the same item!
2. **$O(1)$ Membership Verification**:
   - \`x in my_set\` is $O(1)$ average time.
   - \`x in my_list\` is $O(N)$ linear scan.
3. **Venn Diagram Operators**:
   - \`A | B\` (Union: all items in either)
   - \`A & B\` (Intersection: items in both)
   - \`A - B\` (Difference: items in A but not B)
   - \`A ^ B\` (Symmetric Difference: in A or B, but NOT in both)

\`\`\`python
# Fast Deduplication preserving order (Python 3.7+):
items = ['apple', 'banana', 'apple', 'cherry', 'banana']
unique_ordered = list(dict.fromkeys(items))  # ['apple', 'banana', 'cherry']
\`\`\``;
  }

  // F. Recursion & Dynamic Programming
  if (query.includes('recursion') || query.includes('dynamic programming') || query.includes('dp') || query.includes('memoiz')) {
    return `### 🔄 Recursion & Dynamic Programming: Mental Framework

1. **Recursion: Solving a problem by solving smaller instances of itself**
   - Every recursive function MUST have two parts:
     - **Base Case**: The simplest terminating condition that returns without recursion.
     - **Recursive Step**: Moves the state closer to the base case.
   - *Call Stack Alert*: Each call pushes a stack frame. Without a proper base case, you trigger \`RecursionError: maximum recursion depth exceeded\`.

2. **Dynamic Programming (DP): "Careful Brute Force with Memory"**
   - Use DP when a problem exhibits **Overlapping Subproblems** and **Optimal Substructure**.
   - **Memoization (Top-Down)**: Keep the recursive logic, but cache results in a hash map:
     \`\`\`python
     from functools import lru_cache

     @lru_cache(maxsize=None)
     def fib(n):
         if n < 2:
             return n
         return fib(n - 1) + fib(n - 2)
     # Cuts complexity from O(2^N) exponential down to O(N) linear!
     \`\`\`
   - **Tabulation (Bottom-Up)**: Build an iterative array from the smallest subproblem up to $N$.`;
  }

  // G. Binary Search & Trees
  if (query.includes('binary search') || query.includes('tree') || query.includes('bst') || query.includes('heap')) {
    return `### 🌲 Binary Search & Trees: Divide and Conquer

1. **Binary Search ($O(\log N)$)**
   - Only works on **sorted** collections.
   - Divides search space in half at each step:
     \`\`\`python
     def binary_search(arr, target):
         low, high = 0, len(arr) - 1
         while low <= high:
             mid = (low + high) // 2
             if arr[mid] == target:
                 return mid
             elif arr[mid] < target:
                 low = mid + 1
             else:
                 high = mid - 1
         return -1
     \`\`\`

2. **Binary Search Tree (BST)**
   - **Invariant**: For every node, all values in its left subtree are *strictly less*, and all values in its right subtree are *strictly greater*.
   - **In-Order Traversal** (\`Left ➔ Root ➔ Right\`) visits nodes in sorted order!`;
  }

  // H. Slicing & Python Internals
  if (query.includes('slic') || query.includes('[::-1]') || query.includes('is vs ==') || query.includes('shallow')) {
    return `### ✂️ Python Slicing & Identity Mechanics

1. **Slice Syntax: \`arr[start:stop:step]\`**
   - Slices are **half-open**: includes \`start\`, excludes \`stop\`.
   - **Negative Step (\`[::-1]\`)**: Reverses the collection because step -1 moves from right to left!
   - \`nums[1:4]\` on \`[10, 20, 30, 40, 50]\` returns indices 1, 2, 3 ➔ \`[20, 30, 40]\`.

2. **\`is\` vs \`==\` (Identity vs Equality)**
   - \`==\` checks **value equality** (calls \`__eq__\`). Does object A contain the same data as object B?
   - \`is\` checks **memory identity** (\`id(a) == id(b)\`). Are they pointing to the exact same location in RAM?
   \`\`\`python
   a = [1, 2, 3]
   b = [1, 2, 3]
   print(a == b)  # True (same values)
   print(a is b)  # False (two distinct heap allocations!)
   \`\`\``;
  }

  // --- 5. Universal Dynamic Pedagogical Synthesizer ---
  // When the question does not match a hardcoded keyword, construct a personalized, deep response
  return synthesizeCustomDoubtAnswer(rawQuery, studentName, style, topic, primaryWeakSkill);
}

function explainActiveWrongAnswer(studentName: string, style: LearningStyle, activeQuestion: any): string {
  if (style === 'visual') {
    return `Hey ${studentName}! Let's look at **${activeQuestion.subSkill}** visually:

Imagine your data structure as a row of mailbox cubbies. When you pick that option, you're looking into the wrong box address!

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

function generateMemorableAnalogy(studentName: string, style: LearningStyle, skill: string): string {
  return `Here is a memorable real-world analogy for **${skill}** tailored for you, ${studentName}:

🧥 **The Coat Check Room Analogy:**
Think of a Hash Table as a coat-check room with 1,000 numbered pegs:
- Instead of the attendant walking through 1,000 coats to find yours (which would be $O(N)$ linear time), they use a math formula (hash function) on your ticket number.
- The formula instantly says: **"Go straight to Peg #42"**.
- That's why lookups are $O(1)$ constant time regardless of whether there are 10 coats or 1,000,000 coats!

Does that mental model help solidify why sets and dictionaries are so blazingly fast?`;
}

function generateInteractivePracticeQuiz(studentName: string, skill: string): string {
  return `🎯 **Targeted Practice Question for ${studentName}** on your focus gap: **${skill}**

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

Reply with your answer (**A, B, C, or D**) and I'll evaluate your reasoning!`;
}

function synthesizeCustomDoubtAnswer(
  query: string,
  studentName: string,
  style: LearningStyle,
  topic: string,
  primaryWeakSkill: string
): string {
  const cleanSubject = query
    .replace(/(what is|how do|how does|why is|explain|can you|tell me about|how to)/gi, '')
    .trim() || query;

  if (style === 'visual') {
    return `### 🧠 Understanding "${cleanSubject}" for ${studentName}

To master **${cleanSubject}** within **${topic}**, visualize the concept spatially:

\`\`\`text
[ Initial Input / State ] ───► [ Invariant Logic: ${cleanSubject} ]
                                         │
                        ┌────────────────┴────────────────┐
                        ▼                                 ▼
             [ Fast Path: O(1)/O(logN) ]       [ Edge Case Boundary ]
\`\`\`

**3 Visual Invariants to Remember:**
1. **Memory Boundaries**: Look at where pointers are created. If an object is shared, mutations propagate to all aliases.
2. **Access Patterns**: If you are searching item-by-item, you have a linear line. If you can hash or index, you jump directly to the target box!
3. **Connection to your Knowledge Gap**: This directly reinforces your understanding of **${primaryWeakSkill}**.

Does this spatial model help, or would you like a runnable code snippet?`;
  } else if (style === 'code') {
    return `### 💻 Technical Breakdown: "${cleanSubject}"

Here is the clean, idiomatic pattern for **${cleanSubject}** in **${topic}**:

\`\`\`python
# Implementing ${cleanSubject} with optimal complexity
def process_data(collection):
    # 1. Guard against invalid bounds or empty structures
    if not collection:
        return None
    
    # 2. Leverage hashable collections or binary invariants
    # Aim for O(1) or O(log N) rather than nested O(N^2) scans
    seen = set()
    result = []
    for item in collection:
        if item not in seen:
            seen.add(item)
            result.append(item)
    return result
\`\`\`

**Performance & Best Practices:**
- Avoid in-place mutations of shared collections across function arguments.
- Always check Big-O implications of standard library operations (e.g. \`deque.popleft()\` vs \`list.pop(0)\`).

What specific edge case of **${cleanSubject}** are you implementing?`;
  } else {
    return `### 🔢 Step-by-Step Resolution: "${cleanSubject}"

Follow this 4-step execution framework to resolve **${cleanSubject}** in **${topic}**:

1. **Step 1: Define Inputs and Boundaries**
   - Identify whether the data structure is mutable, ordered, and what its capacity limits are.

2. **Step 2: Trace the Execution Pipeline**
   - Break the operation into discrete atomic stages. Ensure no intermediate stage invalidates collection invariants.

3. **Step 3: Analyze Time & Space Complexity**
   - Determine whether the operation scales as $O(1)$, $O(\log N)$, or $O(N)$. Look for opportunities to cache subproblems.

4. **Step 4: Verify Boundary & Edge Cases**
   - Test empty collections, single-element boundaries, and duplicate keys.

Would you like to step through an applied example of **${cleanSubject}** together?`;
  }
}
