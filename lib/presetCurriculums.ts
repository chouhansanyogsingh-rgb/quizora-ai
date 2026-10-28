import { DifficultyLevel, LearningStyle, MicroLesson, Question } from './types';

export interface TopicCurriculum {
  topic: string;
  category: string;
  description: string;
  subSkills: {
    name: string;
    description: string;
    questions: {
      easy: Question;
      medium: Question;
      hard: Question;
    };
    lessons: Record<LearningStyle, MicroLesson>;
  }[];
}

export const PRESET_CURRICULUMS: Record<string, TopicCurriculum> = {
  "python data structures": {
    topic: "Python Data Structures",
    category: "Computer Science & Programming",
    description: "Core sequential, associative, and immutable data collections in Python, their Big-O profiles, and memory models.",
    subSkills: [
      {
        name: "List Operations & Slicing",
        description: "Zero-based indexing, step slicing, dynamic array amortization, and mutability side-effects.",
        questions: {
          easy: {
            id: "pds-q1-easy",
            subSkill: "List Operations & Slicing",
            difficulty: "easy",
            questionText: "What is the output of the following slice operation in Python?",
            codeSnippet: "nums = [10, 20, 30, 40, 50]\nprint(nums[1:4])",
            options: [
              "[10, 20, 30]",
              "[20, 30, 40]",
              "[20, 30, 40, 50]",
              "[10, 20, 30, 40]"
            ],
            correctOptionIndex: 1,
            explanation: "Python slicing is half-open: `nums[start:stop]` includes index `start` (1, value 20) up to but NOT including index `stop` (4, value 50), resulting in [20, 30, 40].",
            hint: "Recall that Python slices are inclusive of the start index and exclusive of the end index."
          },
          medium: {
            id: "pds-q1-med",
            subSkill: "List Operations & Slicing",
            difficulty: "medium",
            questionText: "Consider the following list multiplication and modification. What does `matrix` evaluate to?",
            codeSnippet: "matrix = [[0] * 2] * 2\nmatrix[0][0] = 99\nprint(matrix)",
            options: [
              "[[99, 0], [0, 0]]",
              "[[99, 0], [99, 0]]",
              "[[99, 99], [0, 0]]",
              "[[99, 99], [99, 99]]"
            ],
            correctOptionIndex: 1,
            explanation: "Multiplying a list of mutable objects with `* 2` shallow-copies the internal list reference twice! Mutating `matrix[0][0]` mutates the single shared inner list, reflecting in both rows `[[99, 0], [99, 0]]`.",
            hint: "Be cautious with shallow reference duplication when multiplying lists containing mutable sub-lists."
          },
          hard: {
            id: "pds-q1-hard",
            subSkill: "List Operations & Slicing",
            difficulty: "hard",
            questionText: "What is the amortized time complexity and underlying resizing trigger when calling `list.append(x)` in CPython?",
            codeSnippet: "# CPython list growth pattern:\n# 0, 4, 8, 16, 25, 35, 46, 58, 72, 88...",
            options: [
              "O(N) worst and amortized, because memory must always be reallocated linearly",
              "O(1) amortized, because CPython allocates extra capacity via an over-allocation formula (size += (size >> 3) + 6)",
              "O(log N) amortized, using a binary heap reallocation buffer",
              "O(1) strictly worst-case, as Python lists are implemented as doubly linked nodes"
            ],
            correctOptionIndex: 1,
            explanation: "CPython lists are dynamic arrays. Appending is O(1) amortized because whenever capacity is exceeded, memory is over-allocated geometrically (~1.125x + constant buffer), meaning expensive reallocations happen exponentially less frequently.",
            hint: "Think about how dynamic arrays avoid resizing on every single insertion."
          }
        },
        lessons: {
          visual: {
            subSkill: "List Operations & Slicing",
            title: "Mental Model: Python Lists as Train Cars with Pointers",
            learningStyle: "visual",
            overview: "Python lists do not store objects directly; they store an array of memory pointers pointing to items in the heap.",
            coreConceptExplanation: "Think of a list as a row of mailbox cubbies. When you write `matrix = [[0]*2]*2`, you didn't build two separate houses; you created two mailbox keys that both point to the exact same mailbox! Modifying one changes the contents when viewed through either key.",
            visualOrCodeArtifact: {
              type: "diagram",
              title: "Visual Memory Layout of Shallow Copy vs Deep Copy",
              content: `[matrix] ───> Row 0 ───┐
              └───> Row 1 ───┴──> [ Box 0 : (99) | Box 1 : (0) ] (Shared Memory Object!)

Independent (Correct) Construction:
[[0 for _ in range(2)] for _ in range(2)]
Row 0 ───> [ 99 | 0 ] (Unique memory allocation)
Row 1 ───> [ 0  | 0 ] (Separate memory allocation)`
            },
            commonPitfall: "Using `[[]] * N` instead of list comprehension `[[] for _ in range(N)]` when initializing multi-dimensional grids.",
            keyTakeaway: "Python list slices create a shallow copy of pointers. Always use comprehensions for independent nested structures.",
            practiceProblems: [
              {
                id: "prac-pds-1-1",
                subSkill: "List Operations & Slicing",
                title: "Practice: Reverse with Negative Step",
                scenario: "A sensor log needs to be reversed skipping every second entry.",
                problemType: "multiple_choice",
                codeSnippet: "logs = ['A', 'B', 'C', 'D', 'E']\n# Slicing: [start:stop:step]\nresult = logs[::-2]",
                options: [
                  "['E', 'C', 'A']",
                  "['E', 'D', 'C']",
                  "['D', 'B']",
                  "['A', 'C', 'E']"
                ],
                correctOptionIndex: 0,
                hint: "A negative step starts from the end of the list and walks backwards.",
                explanation: "With step -2 and omitted start/stop, it begins at index -1 ('E'), skips index -2, takes index -3 ('C'), skips index -4, and takes index -5 ('A'). Result: ['E', 'C', 'A']."
              },
              {
                id: "prac-pds-1-2",
                subSkill: "List Operations & Slicing",
                title: "Practice: Independent 2D Matrix Generation",
                scenario: "Select the correct pattern to construct an independent 3x3 grid of zeros.",
                problemType: "multiple_choice",
                options: [
                  "grid = [[0] * 3] * 3",
                  "grid = [[0] * 3 for _ in range(3)]",
                  "grid = [0 * 3] * 3",
                  "grid = list(range(3)) * 3"
                ],
                correctOptionIndex: 1,
                hint: "Ensure each row evaluates a fresh list constructor on each iteration.",
                explanation: "`[[0] * 3 for _ in range(3)]` evaluates `[0] * 3` three distinct times, creating 3 completely separate list objects in memory."
              }
            ]
          },
          code: {
            subSkill: "List Operations & Slicing",
            title: "Code-First: Safe Slicing & Amortized Allocation",
            learningStyle: "code",
            overview: "Direct code patterns contrasting dangerous shallow aliases with idiomatic slicing techniques.",
            coreConceptExplanation: "Slicing `arr[a:b:c]` invokes Python's slice descriptor `slice(a, b, c)`. Python handles negative indices and out-of-bounds gracefully without IndexError.",
            visualOrCodeArtifact: {
              type: "code",
              title: "Idiomatic Python List Manipulation Patterns",
              content: `# 1. Safe copy vs reference trap:
original = [1, 2, [3, 4]]
shallow = original[:]        # [:] creates shallow copy
deep = [item[:] if isinstance(item, list) else item for item in original]

# 2. Replacing sub-segment in-place (O(k + N)):
nums = [1, 2, 3, 4, 5]
nums[1:4] = [20, 30]         # Mutates in-place: nums becomes [1, 20, 30, 5]

# 3. Dynamic array capacity inspection (sys.getsizeof):
import sys
arr = []
print(sys.getsizeof(arr))    # ~56 bytes header
arr.append(1)
print(sys.getsizeof(arr))    # ~88 bytes (allocates chunk of 4)`
            },
            commonPitfall: "Modifying a list while iterating over it via index without using a reversed iterator or copy.",
            keyTakeaway: "Use `nums[::]` for shallow copies, list comprehension for 2D grids, and generator expressions for memory efficiency.",
            practiceProblems: [
              {
                id: "prac-pds-1-1",
                subSkill: "List Operations & Slicing",
                title: "Practice: Reverse with Negative Step",
                scenario: "Evaluate `logs[::-2]` on `['A', 'B', 'C', 'D', 'E']`.",
                problemType: "multiple_choice",
                options: [
                  "['E', 'C', 'A']",
                  "['E', 'D', 'C']",
                  "['D', 'B']",
                  "['A', 'C', 'E']"
                ],
                correctOptionIndex: 0,
                hint: "Negative steps move from right to left.",
                explanation: "Starts at 'E', moves backwards by 2 -> 'E', 'C', 'A'."
              },
              {
                id: "prac-pds-1-2",
                subSkill: "List Operations & Slicing",
                title: "Practice: Independent 2D Matrix Generation",
                scenario: "Identify the bug-free idiom for constructing a 3x3 matrix in Python.",
                problemType: "multiple_choice",
                options: [
                  "grid = [[0] * 3] * 3",
                  "grid = [[0] * 3 for _ in range(3)]",
                  "grid = [0 * 3] * 3",
                  "grid = list(range(3)) * 3"
                ],
                correctOptionIndex: 1,
                hint: "Look for list comprehension generating new rows.",
                explanation: "`[[0] * 3 for _ in range(3)]` creates isolated row instances."
              }
            ]
          },
          "step-by-step": {
            subSkill: "List Operations & Slicing",
            title: "Algorithmic Step-by-Step: Anatomy of Slice Resolution",
            learningStyle: "step-by-step",
            overview: "A deterministic 4-step framework to mentally calculate any slice index without guessing.",
            coreConceptExplanation: "Whenever you encounter `arr[start:stop:step]`, follow this exact evaluation pipeline.",
            visualOrCodeArtifact: {
              type: "step_list",
              title: "4-Step Slice Evaluation Algorithm",
              content: `Step 1: Check Step Direction
  - If step is positive (default +1): Scan Left -> Right. Default start = 0, default stop = len(arr).
  - If step is negative (e.g. -1): Scan Right -> Left. Default start = len(arr)-1, default stop = before index 0.

Step 2: Normalize Negative Indices
  - Any negative index k is converted to (len(arr) + k).
  - For len=5, index -1 becomes 4, index -2 becomes 3.

Step 3: Collect Elements
  - Set current = start.
  - While current has not reached stop:
      Add arr[current] to output.
      current += step.

Step 4: Return New List
  - Slicing NEVER modifies the original list; a new container is always emitted.`
            },
            commonPitfall: "Assuming `arr[-1:-3]` returns items when step is positive (it returns `[]` because start > stop with step=+1).",
            keyTakeaway: "If start > stop and step is positive, the slice is empty. Adjust step to negative when moving backwards.",
            practiceProblems: [
              {
                id: "prac-pds-1-1",
                subSkill: "List Operations & Slicing",
                title: "Practice: Reverse with Negative Step",
                scenario: "Calculate `logs[::-2]` on `['A', 'B', 'C', 'D', 'E']` using the 4-step rule.",
                problemType: "multiple_choice",
                options: [
                  "['E', 'C', 'A']",
                  "['E', 'D', 'C']",
                  "['D', 'B']",
                  "['A', 'C', 'E']"
                ],
                correctOptionIndex: 0,
                hint: "Step is -2 (scan right to left).",
                explanation: "Right to left starting from last element 'E', then 'C', then 'A'."
              },
              {
                id: "prac-pds-1-2",
                subSkill: "List Operations & Slicing",
                title: "Practice: Independent 2D Matrix Generation",
                scenario: "Which expression constructs distinct row objects?",
                problemType: "multiple_choice",
                options: [
                  "grid = [[0] * 3] * 3",
                  "grid = [[0] * 3 for _ in range(3)]",
                  "grid = [0 * 3] * 3",
                  "grid = list(range(3)) * 3"
                ],
                correctOptionIndex: 1,
                hint: "Comprehension re-executes the inner list allocation.",
                explanation: "`[[0] * 3 for _ in range(3)]` instantiates fresh lists."
              }
            ]
          }
        }
      },
      {
        name: "Dictionaries & Hash Lookups",
        description: "Hash maps, key hashing, collision handling, O(1) average lookup, and dict views.",
        questions: {
          easy: {
            id: "pds-q2-easy",
            subSkill: "Dictionaries & Hash Lookups",
            difficulty: "easy",
            questionText: "What happens when you look up a non-existent key using `d.get('missing', 'default')` versus `d['missing']`?",
            codeSnippet: "d = {'apple': 5, 'banana': 8}",
            options: [
              "Both throw a KeyError",
              "Both return 'default'",
              "`d.get()` returns 'default', while `d['missing']` throws a KeyError",
              "`d.get()` inserts the key with value 'default', while `d['missing']` returns None"
            ],
            correctOptionIndex: 2,
            explanation: "`dict.get(key, default)` gracefully handles missing keys by returning the fallback value (defaulting to None), whereas direct subscript access `dict[key]` raises a KeyError.",
            hint: "One raises an exception, the other provides safe fallback retrieval."
          },
          medium: {
            id: "pds-q2-med",
            subSkill: "Dictionaries & Hash Lookups",
            difficulty: "medium",
            questionText: "Which of the following can be used as a valid key in a standard Python dictionary?",
            options: [
              "[1, 2, 3] (a list)",
              "{1, 2, 3} (a set)",
              "(1, 2, [3, 4]) (a tuple containing a list)",
              "(1, 2, 'three') (a tuple of immutable types)"
            ],
            correctOptionIndex: 3,
            explanation: "Dictionary keys in Python must be hashable. An object is hashable only if its hash value never changes during its lifetime and all its components are hashable. A tuple containing a mutable list is NOT hashable; only tuples with purely immutable elements are hashable.",
            hint: "A hashable object cannot contain any mutable references anywhere in its hierarchy."
          },
          hard: {
            id: "pds-q2-hard",
            subSkill: "Dictionaries & Hash Lookups",
            difficulty: "hard",
            questionText: "Since Python 3.6/3.7, dictionaries are insertion-ordered and use a compact hash table design. How does this compact layout reduce memory overhead?",
            codeSnippet: "# Compact dict design (PyDictKeysObject):\n# indices = [-1, 0, 1, -1, 2]\n# entries = [hash, key, value]",
            options: [
              "It stores a dense array of [hash, key, value] tuples, indexed by a sparse array of small integers (indices), eliminating wasted padding in empty hash buckets.",
              "It compresses keys using gzip before hashing.",
              "It converts all strings into 32-bit floats.",
              "It stores elements in a balanced Red-Black Binary Search Tree."
            ],
            correctOptionIndex: 0,
            explanation: "The compact dict split representation separates the sparse hash table (which only stores small 1-byte integer indices into the dense array) from the dense array of full `[hash, key, value]` structs. This saved 20-25% memory and naturally preserved insertion order.",
            hint: "Think about separating sparse hash bucket indices from dense contiguous key-value pairs."
          }
        },
        lessons: {
          visual: {
            subSkill: "Dictionaries & Hash Lookups",
            title: "Visualizing Python Compact Dict: Hash Table + Entry Array",
            learningStyle: "visual",
            overview: "How hash codes route keys to memory locations with zero search loops.",
            coreConceptExplanation: "Imagine a coat check room with numbered pegs. When you hand in a coat (key), a hash function calculates peg number 4. In Python's compact dict, peg 4 holds an index pointing directly to the dense storage locker where your item resides.",
            visualOrCodeArtifact: {
              type: "diagram",
              title: "Compact Dict Architecture in CPython",
              content: `Key: "apple" ──> hash("apple") % 8 = 3

Sparse Indices Array (Pegs):
[ -1 | -1 | -1 |  0  | -1 |  1  | -1 | -1 ]
                  |          |
                  v          v
Dense Entries Array (Storage Lockers):
Entry 0: { hash: 0x8a3, key: "apple",  value: 5 }
Entry 1: { hash: 0x4f1, key: "banana", value: 8 }`
            },
            commonPitfall: "Assuming any tuple can be a dict key, forgetting that nested lists inside tuples break hashability.",
            keyTakeaway: "Dict lookups are O(1) average. Compact architecture saves memory and preserves insertion order.",
            practiceProblems: [
              {
                id: "prac-pds-2-1",
                subSkill: "Dictionaries & Hash Lookups",
                title: "Practice: Safe Default Aggregation",
                scenario: "Which construct safely increments a word counter without throwing KeyError?",
                problemType: "multiple_choice",
                options: [
                  "counts[word] += 1",
                  "counts[word] = counts.get(word, 0) + 1",
                  "counts[word] = counts.pop(word, 0) + 1",
                  "counts[word] = 1 if counts[word] else 0"
                ],
                correctOptionIndex: 1,
                hint: "`get(word, 0)` returns 0 if the word hasn't been seen yet.",
                explanation: "`counts.get(word, 0) + 1` safely falls back to 0 on initial discovery."
              },
              {
                id: "prac-pds-2-2",
                subSkill: "Dictionaries & Hash Lookups",
                title: "Practice: Hashability Verification",
                scenario: "Which expression is valid as a dictionary key?",
                problemType: "multiple_choice",
                options: [
                  "{'id': 101}",
                  "('user', 101, ['admin'])",
                  "('user', 101, frozenset(['admin']))",
                  "['user', 101]"
                ],
                correctOptionIndex: 2,
                hint: "`frozenset` is an immutable, hashable variant of set.",
                explanation: "A tuple containing only immutable primitives and `frozenset` is fully hashable."
              }
            ]
          },
          code: {
            subSkill: "Dictionaries & Hash Lookups",
            title: "Code-First: High-Performance Dict Patterns & Hash Contracts",
            learningStyle: "code",
            overview: "Collections.defaultdict, dict views, and implementing `__hash__` and `__eq__` correctly.",
            coreConceptExplanation: "For custom objects to work in sets or dict keys, you must implement both `__hash__` and `__eq__` consistently: if `a == b`, then `hash(a) == hash(b)` must hold true.",
            visualOrCodeArtifact: {
              type: "code",
              title: "Idiomatic Python Dict Workflows",
              content: `from collections import defaultdict

# 1. Fast grouping with defaultdict
grouped = defaultdict(list)
for dept, employee in [('Eng', 'Alice'), ('Eng', 'Bob'), ('Design', 'Carol')]:
    grouped[dept].append(employee)

# 2. Custom Hashable Object:
class UserToken:
    def __init__(self, uid: int, org: str):
        self._uid = uid
        self._org = org
    
    def __hash__(self):
        return hash((self._uid, self._org))
        
    def __eq__(self, other):
        return isinstance(other, UserToken) and (self._uid, self._org) == (other._uid, other._org)`
            },
            commonPitfall: "Modifying mutable fields of an object after using it as a hash key, corrupting hash table buckets.",
            keyTakeaway: "Use `defaultdict` for grouping and ensure keys satisfy the `__hash__` and `__eq__` consistency invariant.",
            practiceProblems: [
              {
                id: "prac-pds-2-1",
                subSkill: "Dictionaries & Hash Lookups",
                title: "Practice: Safe Default Aggregation",
                scenario: "What idiom safely increments counts in a dict?",
                problemType: "multiple_choice",
                options: [
                  "counts[word] += 1",
                  "counts[word] = counts.get(word, 0) + 1",
                  "counts[word] = counts.pop(word, 0) + 1",
                  "counts[word] = 1 if counts[word] else 0"
                ],
                correctOptionIndex: 1,
                hint: "Use the get method with default 0.",
                explanation: "`counts.get(word, 0) + 1` handles missing keys without KeyError."
              },
              {
                id: "prac-pds-2-2",
                subSkill: "Dictionaries & Hash Lookups",
                title: "Practice: Hashability Verification",
                scenario: "Which composite data structure qualifies as a valid hash key?",
                problemType: "multiple_choice",
                options: [
                  "{'id': 101}",
                  "('user', 101, ['admin'])",
                  "('user', 101, frozenset(['admin']))",
                  "['user', 101]"
                ],
                correctOptionIndex: 2,
                hint: "Ensure all elements inside the tuple are immutable.",
                explanation: "`frozenset` is immutable and valid inside a hashable tuple."
              }
            ]
          },
          "step-by-step": {
            subSkill: "Dictionaries & Hash Lookups",
            title: "Algorithmic Step-by-Step: Hash Lookup and Collision Resolution",
            learningStyle: "step-by-step",
            overview: "Trace what happens under the hood during a `d[key]` lookup in Python.",
            coreConceptExplanation: "How CPython resolves keys in O(1) average time via perturb-based open addressing.",
            visualOrCodeArtifact: {
              type: "step_list",
              title: "CPython Key Lookup Step Pipeline",
              content: `Step 1: Compute Hash
  - Execute h = hash(key). If key is unhashable, raise TypeError immediately.

Step 2: Calculate Initial Bucket
  - index = h & mask (where mask = table_size - 1).

Step 3: Probe Bucket
  - If bucket is EMPTY (-1): Key is not found -> Raise KeyError or return default.
  - If bucket has an index:
      Fetch entry at entries[index].
      Compare: Is entry.hash == h AND (entry.key is key OR entry.key == key)?
      If YES: Match found! Return entry.value.
      If NO: Hash collision occurred!

Step 4: Resolve Collision via Open Addressing
  - Recalculate index using perturbation formula:
    perturb >>= 5;
    index = (5 * index + 1 + perturb) & mask;
  - Repeat Step 3 until match found or empty bucket reached.`
            },
            commonPitfall: "Thinking Python uses separate chaining (linked lists) for collisions; Python uses open addressing.",
            keyTakeaway: "Python uses open addressing with perturbation to guarantee cache-friendly contiguous scans.",
            practiceProblems: [
              {
                id: "prac-pds-2-1",
                subSkill: "Dictionaries & Hash Lookups",
                title: "Practice: Safe Default Aggregation",
                scenario: "How to avoid KeyError on missing dictionary keys?",
                problemType: "multiple_choice",
                options: [
                  "counts[word] += 1",
                  "counts[word] = counts.get(word, 0) + 1",
                  "counts[word] = counts.pop(word, 0) + 1",
                  "counts[word] = 1 if counts[word] else 0"
                ],
                correctOptionIndex: 1,
                hint: "Use get() with a fallback.",
                explanation: "`counts.get(word, 0) + 1` safely supplies 0 when key is absent."
              },
              {
                id: "prac-pds-2-2",
                subSkill: "Dictionaries & Hash Lookups",
                title: "Practice: Hashability Verification",
                scenario: "Which candidate meets Python's hashability contract?",
                problemType: "multiple_choice",
                options: [
                  "{'id': 101}",
                  "('user', 101, ['admin'])",
                  "('user', 101, frozenset(['admin']))",
                  "['user', 101]"
                ],
                correctOptionIndex: 2,
                hint: "All nested elements must be immutable.",
                explanation: "Tuples containing only immutable items like frozenset are hashable."
              }
            ]
          }
        }
      },
      {
        name: "Tuples & Immutability Patterns",
        description: "Fixed-length sequences, write-protection, memory compactness, and namedtuple/dataclasses.",
        questions: {
          easy: {
            id: "pds-q3-easy",
            subSkill: "Tuples & Immutability Patterns",
            difficulty: "easy",
            questionText: "How do you create a single-element tuple in Python containing the integer 42?",
            options: [
              "t = (42)",
              "t = (42,)",
              "t = tuple(42)",
              "t = [42].to_tuple()"
            ],
            correctOptionIndex: 1,
            explanation: "Parentheses `(42)` alone represent an arithmetic grouping, evaluating to the int `42`. To define a single-element tuple, you must include a trailing comma `(42,)`.",
            hint: "Python requires a trailing comma to disambiguate from mathematical grouping parentheses."
          },
          medium: {
            id: "pds-q3-med",
            subSkill: "Tuples & Immutability Patterns",
            difficulty: "medium",
            questionText: "What happens when you run this code in Python?",
            codeSnippet: "t = (1, 2, [3, 4])\nt[2].append(5)\nprint(t)",
            options: [
              "TypeError: 'tuple' object does not support item assignment",
              "AttributeError: tuple has no attribute 'append'",
              "It runs successfully and prints (1, 2, [3, 4, 5])",
              "The list is duplicated and a new tuple is created"
            ],
            correctOptionIndex: 2,
            explanation: "A tuple is immutable in that its references cannot be changed (you cannot rebind `t[2] = ...`). However, if an element inside the tuple is itself mutable (like a list), mutating that list via `.append()` succeeds without modifying the tuple's pointer!",
            hint: "Distinguish between reassigning a tuple's item versus mutating the object stored at that item."
          },
          hard: {
            id: "pds-q3-hard",
            subSkill: "Tuples & Immutability Patterns",
            difficulty: "hard",
            questionText: "Consider the infamous Python statement `t = (1, 2, [3, 4]); t[2] += [5]`. What is the result?",
            options: [
              "The list becomes [3, 4, 5] and no exception is raised.",
              "A TypeError is raised, but the list STILL ends up modified to [3, 4, 5]!",
              "A TypeError is raised and the list remains unchanged as [3, 4].",
              "SyntaxError because augmented assignment is illegal on subscripted tuples."
            ],
            correctOptionIndex: 1,
            explanation: "The augmented assignment `t[2] += [5]` runs in two bytecode steps: 1) `t[2].extend([5])` succeeds in-place, updating the list. 2) The assignment step attempts `t[2] = result`, which fails with `TypeError: 'tuple' object does not support item assignment`. Hence the exception is raised AND the list is modified!",
            hint: "In-place concatenation modifies the list first before the assignment opcode fails on the immutable container."
          }
        },
        lessons: {
          visual: {
            subSkill: "Tuples & Immutability Patterns",
            title: "Visualizing Tuples: Sealed Envelopes Holding Movable Contents",
            learningStyle: "visual",
            overview: "Tuples seal the addresses of their contents, not the internal state of the contents.",
            coreConceptExplanation: "Think of a tuple as a sealed clear safe. The safe's compartments cannot be swapped or rearranged. But if compartment 2 holds an open notebook (a list), you can write inside that notebook through the glass!",
            visualOrCodeArtifact: {
              type: "diagram",
              title: "Shallow Immutability Visual Model",
              content: `Tuple Container (Frozen pointers):
[ Slot 0: Pointer to 1 ] ──> int(1)  [IMMUTABLE]
[ Slot 1: Pointer to 2 ] ──> int(2)  [IMMUTABLE]
[ Slot 2: Pointer to L ] ──> List [ 3, 4 ]  <── MUTABLE! .append(5) works!
                                    ^
Cannot rebind Slot 2, but can alter List internal elements.`
            },
            commonPitfall: "Assuming tuples are deep-immutable. If any nested element is mutable, thread-safety and hashability are compromised.",
            keyTakeaway: "Tuples guarantee fixed reference addresses. For total immutability, make sure all nested elements are also immutable.",
            practiceProblems: [
              {
                id: "prac-pds-3-1",
                subSkill: "Tuples & Immutability Patterns",
                title: "Practice: Single Element Tuple Syntax",
                scenario: "Select the correct expression that evaluates to type `tuple`.",
                problemType: "multiple_choice",
                options: [
                  "x = ('admin')",
                  "x = ('admin',)",
                  "x = tuple.from('admin')",
                  "x = {'admin',}[:1]"
                ],
                correctOptionIndex: 1,
                hint: "A comma is mandatory for single-item tuples.",
                explanation: "`('admin',)` has the trailing comma denoting a 1-tuple."
              },
              {
                id: "prac-pds-3-2",
                subSkill: "Tuples & Immutability Patterns",
                title: "Practice: Mutation Behavior in Tuples",
                scenario: "Given `t = ('status', [200])`, what happens after `t[1].append(201)`?",
                problemType: "multiple_choice",
                options: [
                  "Raises TypeError",
                  "`t` becomes ('status', [200, 201])",
                  "`t` is cloned into a new tuple",
                  "The inner list is converted into an immutable tuple"
                ],
                correctOptionIndex: 1,
                hint: "Appending to the inner list mutates it in place.",
                explanation: "The tuple's reference to the list didn't change, so the append completes successfully."
              }
            ]
          },
          code: {
            subSkill: "Tuples & Immutability Patterns",
            title: "Code-First: NamedTuples, Dataclasses & Free-List Optimization",
            learningStyle: "code",
            overview: "Tuples are faster and smaller than lists due to CPython free-list caching and lack of over-allocation.",
            coreConceptExplanation: "Because tuples have fixed sizes, CPython caches small dead tuples in free-lists (up to size 20) to reuse memory without re-requesting from the system allocator.",
            visualOrCodeArtifact: {
              type: "code",
              title: "Tuples vs NamedTuples vs Frozen Dataclasses",
              content: `from typing import NamedTuple
from dataclasses import dataclass
import sys

# 1. Plain tuple (fastest, lowest memory):
pt = (10, 20)
print(sys.getsizeof(pt))  # ~56 bytes (vs ~72 bytes for list)

# 2. NamedTuple (self-documenting, zero extra memory overhead):
class Point(NamedTuple):
    x: float
    y: float

p = Point(10.5, 20.0)
print(p.x, p[0])  # Access by name or index!

# 3. Frozen dataclass (for complex object models):
@dataclass(frozen=True)
class Config:
    api_url: str
    timeout: int = 30`
            },
            commonPitfall: "Using heavy custom classes when an immutable `NamedTuple` provides typed fields with zero memory overhead.",
            keyTakeaway: "Use `NamedTuple` for structured record data. Use plain tuples for constant coordinate lookups and dict keys.",
            practiceProblems: [
              {
                id: "prac-pds-3-1",
                subSkill: "Tuples & Immutability Patterns",
                title: "Practice: Single Element Tuple Syntax",
                scenario: "Which expression creates a 1-tuple?",
                problemType: "multiple_choice",
                options: [
                  "x = ('admin')",
                  "x = ('admin',)",
                  "x = tuple.from('admin')",
                  "x = {'admin',}[:1]"
                ],
                correctOptionIndex: 1,
                hint: "Look for the comma.",
                explanation: "`('admin',)` has the necessary trailing comma."
              },
              {
                id: "prac-pds-3-2",
                subSkill: "Tuples & Immutability Patterns",
                title: "Practice: Mutation Behavior in Tuples",
                scenario: "Predict outcome of `t = ('status', [200]); t[1].append(201)`.",
                problemType: "multiple_choice",
                options: [
                  "Raises TypeError",
                  "`t` becomes ('status', [200, 201])",
                  "`t` is cloned into a new tuple",
                  "The inner list is converted into an immutable tuple"
                ],
                correctOptionIndex: 1,
                hint: "Only reference rebinding raises TypeError, not inner object mutation.",
                explanation: "The inner list is mutated in-place."
              }
            ]
          },
          "step-by-step": {
            subSkill: "Tuples & Immutability Patterns",
            title: "Algorithmic Step-by-Step: The `+=` on Nested List Mystery",
            learningStyle: "step-by-step",
            overview: "Dissecting the Python Virtual Machine bytecode of `t[2] += [5]`.",
            coreConceptExplanation: "Why does Python both throw an error AND modify the list?",
            visualOrCodeArtifact: {
              type: "step_list",
              title: "Bytecode Execution Steps of `t[2] += [5]`",
              content: `Instruction 1: BINARY_SUBSCR
  - Fetches t[2] onto the evaluation stack (the list reference).

Instruction 2: INPLACE_ADD
  - Calls list.__iadd__([5]), which runs list.extend([5]).
  - The list in memory is now [3, 4, 5]!
  - Pushes the same list reference back onto stack.

Instruction 3: STORE_SUBSCR
  - Attempts: t[2] = stack_top
  - CPython tuple_set_item checks: "Is container a tuple?" YES.
  - Tuple responds: "Tuples are immutable; item assignment is prohibited."
  - Raises TypeError!

Result:
  - Error is raised to caller, BUT Instruction 2 already modified memory!`
            },
            commonPitfall: "Assuming transactions in Python are atomic by default.",
            keyTakeaway: "Never use augmented assignment `+=` on mutable containers embedded inside tuples.",
            practiceProblems: [
              {
                id: "prac-pds-3-1",
                subSkill: "Tuples & Immutability Patterns",
                title: "Practice: Single Element Tuple Syntax",
                scenario: "How to declare a tuple with 1 element?",
                problemType: "multiple_choice",
                options: [
                  "x = ('admin')",
                  "x = ('admin',)",
                  "x = tuple.from('admin')",
                  "x = {'admin',}[:1]"
                ],
                correctOptionIndex: 1,
                hint: "Requires trailing comma.",
                explanation: "Comma is required: `('admin',)`."
              },
              {
                id: "prac-pds-3-2",
                subSkill: "Tuples & Immutability Patterns",
                title: "Practice: Mutation Behavior in Tuples",
                scenario: "What happens when appending to a list inside a tuple?",
                problemType: "multiple_choice",
                options: [
                  "Raises TypeError",
                  "`t` becomes ('status', [200, 201])",
                  "`t` is cloned into a new tuple",
                  "The inner list is converted into an immutable tuple"
                ],
                correctOptionIndex: 1,
                hint: "The list is mutated; no error occurs.",
                explanation: "The list inside the tuple is updated in place."
              }
            ]
          }
        }
      },
      {
        name: "Sets & Deduplication (O(1) Membership)",
        description: "Set operations, mathematical intersections/unions, O(1) membership testing, and frozenset.",
        questions: {
          easy: {
            id: "pds-q4-easy",
            subSkill: "Sets & Deduplication (O(1) Membership)",
            difficulty: "easy",
            questionText: "What is the time complexity of checking `item in my_collection` for a Python `set` versus a Python `list` containing N elements?",
            options: [
              "Set: O(N), List: O(1)",
              "Set: O(1) average, List: O(N)",
              "Set: O(log N), List: O(log N)",
              "Both are O(1) strictly"
            ],
            correctOptionIndex: 1,
            explanation: "Sets use hash tables, allowing O(1) average time membership verification via hash lookups. Lists must be scanned sequentially from index 0 to N-1, requiring O(N) time.",
            hint: "Sets utilize hashing to jump straight to the item's bucket."
          },
          medium: {
            id: "pds-q4-med",
            subSkill: "Sets & Deduplication (O(1) Membership)",
            difficulty: "medium",
            questionText: "What is the result of the symmetric difference operation `a ^ b` where `a = {1, 2, 3}` and `b = {3, 4, 5}`?",
            options: [
              "{3}",
              "{1, 2, 4, 5}",
              "{1, 2, 3, 4, 5}",
              "{}"
            ],
            correctOptionIndex: 1,
            explanation: "Symmetric difference `^` returns elements that are in either `a` or `b`, but NOT in both (exclusive OR). The shared element 3 is excluded, producing `{1, 2, 4, 5}`.",
            hint: "Think of elements present in exactly one set, excluding the overlap."
          },
          hard: {
            id: "pds-q4-hard",
            subSkill: "Sets & Deduplication (O(1) Membership)",
            difficulty: "hard",
            questionText: "Why does `{1, True, 1.0}` evaluate to `{1}` when rendered in Python?",
            codeSnippet: "s = {1, True, 1.0}\nprint(s)  # Outputs {1}",
            options: [
              "Python sets only allow integer types",
              "In Python, `bool` is a subclass of `int` where `True == 1` and `hash(True) == hash(1) == hash(1.0)`, so the set considers them duplicates and keeps the first encountered entry",
              "A syntax bug in the set literal parser",
              "Floating point numbers automatically round down to booleans"
            ],
            correctOptionIndex: 1,
            explanation: "In Python, `hash(1) == hash(True) == hash(1.0)` AND `1 == True == 1.0`. Because sets determine uniqueness based on both hash equality and equality comparison (`==`), they collide as the identical key. The first encountered value (`1`) is preserved.",
            hint: "Check both the `hash()` and `==` equality between integer 1, boolean True, and float 1.0."
          }
        },
        lessons: {
          visual: {
            subSkill: "Sets & Deduplication (O(1) Membership)",
            title: "Visualizing Set Theory: Venn Diagrams in Memory",
            learningStyle: "visual",
            overview: "Map Python operators (&, |, -, ^) directly to Venn diagram regions.",
            coreConceptExplanation: "Sets are dictionaries without values. Each element is placed in a bucket based on its hash. Duplicates simply drop into the same bucket, discarding duplicates instantly.",
            visualOrCodeArtifact: {
              type: "diagram",
              title: "Venn Diagram of Set Operations",
              content: `Set A: {1, 2, 3}          Set B: {3, 4, 5}
  ┌──────────────┬──────────┬──────────────┐
  │ Only A (A-B) │ Both (A&B│ Only B (B-A) │
  │    {1, 2}    │   {3}    │    {4, 5}    │
  └──────────────┴──────────┴──────────────┘
  
  Union (A | B)                 : {1, 2, 3, 4, 5}
  Intersection (A & B)          : {3}
  Difference (A - B)            : {1, 2}
  Symmetric Difference (A ^ B)  : {1, 2, 4, 5} (Outer wings only)`
            },
            commonPitfall: "Creating an empty set with `{}` instead of `set()` (which creates an empty dictionary!).",
            keyTakeaway: "Use sets for O(1) membership lookups and instant deduplication of collections.",
            practiceProblems: [
              {
                id: "prac-pds-4-1",
                subSkill: "Sets & Deduplication (O(1) Membership)",
                title: "Practice: Empty Set Initialization",
                scenario: "How do you initialize an empty set in Python?",
                problemType: "multiple_choice",
                options: [
                  "s = {}",
                  "s = set()",
                  "s = []",
                  "s = ()"
                ],
                correctOptionIndex: 1,
                hint: "`{}` creates an empty dict.",
                explanation: "`set()` is the only way to create an empty set in Python; `{}` creates an empty dict."
              },
              {
                id: "prac-pds-4-2",
                subSkill: "Sets & Deduplication (O(1) Membership)",
                title: "Practice: Fast Collection Filtering",
                scenario: "You need to filter 1,000,000 user IDs against 5,000 banned IDs. Which approach is fastest?",
                problemType: "multiple_choice",
                options: [
                  "Keep banned IDs in a list and check `id in banned_list`",
                  "Convert banned IDs into a set once, then check `id in banned_set`",
                  "Sort banned IDs and use linear search",
                  "Loop through banned IDs for each user"
                ],
                correctOptionIndex: 1,
                hint: "O(1) membership search scales effortlessly.",
                explanation: "Checking membership in a set takes O(1) average time, reducing total run time from O(N * M) to O(N)."
              }
            ]
          },
          code: {
            subSkill: "Sets & Deduplication (O(1) Membership)",
            title: "Code-First: Fast Set Operations & Frozenset Usage",
            learningStyle: "code",
            overview: "Bitwise operators vs method calls, mutating updates, and set comprehensions.",
            coreConceptExplanation: "Set operators (like `&`, `|`) require both operands to be sets, while methods (like `.intersection()`) accept any iterable.",
            visualOrCodeArtifact: {
              type: "code",
              title: "High Performance Set Recipes in Python",
              content: `# 1. Fast deduplication preserving order (Python 3.7+):
items = ['banana', 'apple', 'banana', 'orange', 'apple']
deduped_ordered = list(dict.fromkeys(items))  # ['banana', 'apple', 'orange']

# 2. Set comprehension:
words = ["HELLO", "world", "Python", "CODE"]
lowercase_vowels = {char for word in words for char in word.lower() if char in 'aeiou'}

# 3. Frozenset as dictionary key or set element:
role_permissions = {
    frozenset(['read', 'write']): 'Editor',
    frozenset(['read']): 'Viewer'
}`
            },
            commonPitfall: "Calling set methods that mutate in-place (like `.add()`, `.update()`) expecting them to return the set.",
            keyTakeaway: "Methods like `.add()` return `None`. Use `frozenset` when you need an immutable, hashable set.",
            practiceProblems: [
              {
                id: "prac-pds-4-1",
                subSkill: "Sets & Deduplication (O(1) Membership)",
                title: "Practice: Empty Set Initialization",
                scenario: "What syntax yields an empty set?",
                problemType: "multiple_choice",
                options: [
                  "s = {}",
                  "s = set()",
                  "s = []",
                  "s = ()"
                ],
                correctOptionIndex: 1,
                hint: "Avoid the dictionary literal.",
                explanation: "`set()` instantiates an empty set."
              },
              {
                id: "prac-pds-4-2",
                subSkill: "Sets & Deduplication (O(1) Membership)",
                title: "Practice: Fast Collection Filtering",
                scenario: "Optimal structure for membership testing 1,000,000 queries?",
                problemType: "multiple_choice",
                options: [
                  "List",
                  "Set",
                  "Tuple",
                  "Deque"
                ],
                correctOptionIndex: 1,
                hint: "Hash-based membership lookup.",
                explanation: "Sets provide O(1) average lookup."
              }
            ]
          },
          "step-by-step": {
            subSkill: "Sets & Deduplication (O(1) Membership)",
            title: "Algorithmic Step-by-Step: The `True == 1 == 1.0` Deduplication Mechanism",
            learningStyle: "step-by-step",
            overview: "How Python sets decide whether two values are distinct.",
            coreConceptExplanation: "The two-step identity/equality test executed by hash tables.",
            visualOrCodeArtifact: {
              type: "step_list",
              title: "Step-by-Step Equality Resolution in Sets",
              content: `When inserting value X into a set:
Step 1: Compute hash(X)
  - hash(1)   = 1
  - hash(True) = 1
  - hash(1.0) = 1
  - All produce identical hash value 1!

Step 2: Inspect Target Bucket
  - If empty: Insert X into bucket. Done.
  - If occupied by existing item Y:
      Execute comparison: Does (X is Y) OR (X == Y)?
      For 1 and True: 1 == True is TRUE!
      For 1 and 1.0: 1 == 1.0 is TRUE!

Step 3: Discard Incoming Duplicate
  - Since hash matches AND equality evaluates to True, Python concludes X is already in the set.
  - The incoming element is ignored; the original entry remains.`
            },
            commonPitfall: "Expecting `True` and `1` to coexist in the same set or dict keys.",
            keyTakeaway: "Uniqueness in sets is defined by: `hash(a) == hash(b) AND a == b`.",
            practiceProblems: [
              {
                id: "prac-pds-4-1",
                subSkill: "Sets & Deduplication (O(1) Membership)",
                title: "Practice: Empty Set Initialization",
                scenario: "How to declare an empty set?",
                problemType: "multiple_choice",
                options: [
                  "s = {}",
                  "s = set()",
                  "s = []",
                  "s = ()"
                ],
                correctOptionIndex: 1,
                hint: "Use the constructor function.",
                explanation: "`set()` creates an empty set."
              },
              {
                id: "prac-pds-4-2",
                subSkill: "Sets & Deduplication (O(1) Membership)",
                title: "Practice: Fast Collection Filtering",
                scenario: "Which data structure enables O(1) lookup?",
                problemType: "multiple_choice",
                options: [
                  "List",
                  "Set",
                  "Tuple",
                  "Queue"
                ],
                correctOptionIndex: 1,
                hint: "Hash based collection.",
                explanation: "Sets provide average O(1) membership testing."
              }
            ]
          }
        }
      },
      {
        name: "Stacks & Queues (LIFO vs FIFO Implementations)",
        description: "LIFO vs FIFO semantics, list.pop(0) O(N) anti-pattern, and collections.deque O(1) operations.",
        questions: {
          easy: {
            id: "pds-q5-easy",
            subSkill: "Stacks & Queues (LIFO vs FIFO Implementations)",
            difficulty: "easy",
            questionText: "Which collection from Python's standard library is recommended for implementing a high-performance Double-Ended Queue (Queue / FIFO)?",
            options: [
              "`list`",
              "`collections.deque`",
              "`array.array`",
              "`heapq`"
            ],
            correctOptionIndex: 1,
            explanation: "`collections.deque` is implemented as a doubly linked list of blocks, providing guaranteed O(1) appends and pops from both ends (left and right).",
            hint: "The standard library has a dedicated 'double-ended queue' type."
          },
          medium: {
            id: "pds-q5-med",
            subSkill: "Stacks & Queues (LIFO vs FIFO Implementations)",
            difficulty: "medium",
            questionText: "What is the computational danger of implementing a FIFO queue using a standard Python `list` with `list.append()` and `list.pop(0)`?",
            codeSnippet: "q = []\nq.append(task)  # Enqueue\ntask = q.pop(0) # Dequeue",
            options: [
              "It leaks memory because items are never freed",
              "Each `pop(0)` takes O(N) linear time because all remaining elements must be shifted in memory to the left",
              "`pop(0)` has a recursion depth limit of 1000",
              "Lists cannot store more than 256 elements when indexed at 0"
            ],
            correctOptionIndex: 1,
            explanation: "In dynamic arrays, removing the element at index 0 leaves a hole. Python must shift all subsequent N-1 elements down by one position, making `pop(0)` an O(N) operation. For large queues, this turns an algorithm from O(N) into O(N^2)!",
            hint: "Think about what must happen to the memory addresses of subsequent elements when the first element is removed."
          },
          hard: {
            id: "pds-q5-hard",
            subSkill: "Stacks & Queues (LIFO vs FIFO Implementations)",
            difficulty: "hard",
            questionText: "Under the hood in CPython, how is `collections.deque` implemented, and how does it balance O(1) end-operations with cache locality?",
            options: [
              "As a single continuous dynamic array that reallocates circularly",
              "As a doubly linked list of fixed-size contiguous memory blocks (typically 64 elements each), avoiding pointer overhead per element while keeping O(1) end mutations",
              "As a binary Fibonacci heap with lazy amortized tree rotations",
              "As a memory-mapped FIFO ring buffer bounded to operating system page size"
            ],
            correctOptionIndex: 1,
            explanation: "CPython's `deque` is a doubly linked list of blocks (each holding 62-64 pointers). This hybrid architecture combines the O(1) insertion/deletion of linked lists without individual node allocation overhead, maintaining good CPU L1/L2 cache locality.",
            hint: "It avoids single-element pointer bloat by grouping elements into chunked blocks linked together."
          }
        },
        lessons: {
          visual: {
            subSkill: "Stacks & Queues (LIFO vs FIFO Implementations)",
            title: "Visualizing Memory Shifts: Why `list.pop(0)` Kills Performance",
            learningStyle: "visual",
            overview: "See the domino effect of array shifting compared to deque pointer updates.",
            coreConceptExplanation: "A standard list is a row of contiguous chairs. If person #0 leaves, everyone else must stand up and scoot left one chair. A `collections.deque` is a ring of train cars; you simply hook or unhook a car at either end!",
            visualOrCodeArtifact: {
              type: "diagram",
              title: "List pop(0) Shifting vs Deque O(1) Unlink",
              content: `List pop(0): [X] [B] [C] [D] [E]
                  <── <── <── <── (Shifts N-1 items! O(N) time)
Result:      [B] [C] [D] [E] [ ]

collections.deque Block Structure:
[Block A (64 items)] <=======> [Block B (64 items)] <=======> [Block C (64 items)]
   ^ left end                                                    ^ right end
   popleft() simply advances pointer inside Block A. O(1) instant time!`
            },
            commonPitfall: "Using `list.pop(0)` in production queue handlers, causing latency spikes as queues grow.",
            keyTakeaway: "Use `list` for LIFO stacks (`append` + `pop`). Always use `collections.deque` for FIFO queues (`append` + `popleft`).",
            practiceProblems: [
              {
                id: "prac-pds-5-1",
                subSkill: "Stacks & Queues (LIFO vs FIFO Implementations)",
                title: "Practice: Ideal FIFO Queue Operations",
                scenario: "Which pair of methods provides O(1) enqueue and dequeue with `collections.deque`?",
                problemType: "multiple_choice",
                options: [
                  "enqueue: `.append()`, dequeue: `.popleft()`",
                  "enqueue: `.insert(0, x)`, dequeue: `.pop()`",
                  "enqueue: `.push()`, dequeue: `.shift()`",
                  "enqueue: `[0] = x`, dequeue: `del [0]`"
                ],
                correctOptionIndex: 0,
                hint: "Append to the back, pop from the left front.",
                explanation: "`.append(x)` and `.popleft()` are guaranteed O(1) operations on a `deque`."
              },
              {
                id: "prac-pds-5-2",
                subSkill: "Stacks & Queues (LIFO vs FIFO Implementations)",
                title: "Practice: LIFO Stack with Native Lists",
                scenario: "When implementing a LIFO stack using Python's built-in `list`, which methods are O(1)?",
                problemType: "multiple_choice",
                options: [
                  "`.append()` to push, `.pop()` to pop from the end",
                  "`.insert(0)` to push, `.pop(0)` to pop",
                  "`.extend()` to push, `.remove()` to pop",
                  "`.push()` to push, `.pull()` to pop"
                ],
                correctOptionIndex: 0,
                hint: "Operations at the end of a dynamic array do not require shifting other items.",
                explanation: "Operating at the right end of a list (`.append()` and `.pop()`) is O(1) amortized."
              }
            ]
          },
          code: {
            subSkill: "Stacks & Queues (LIFO vs FIFO Implementations)",
            title: "Code-First: High-Throughput Queue and Bounded Ring Buffers",
            learningStyle: "code",
            overview: "Building bounded ring buffers and thread-safe queues with `collections.deque`.",
            coreConceptExplanation: "The `maxlen` parameter on `deque` automatically discards oldest items when full, making it the perfect fixed-size moving average or circular log buffer.",
            visualOrCodeArtifact: {
              type: "code",
              title: "High Throughput Deque Implementations",
              content: `from collections import deque
import time

# 1. Circular / Bounded Ring Buffer (O(1) sliding window):
recent_events = deque(maxlen=3)
recent_events.append("Login")
recent_events.append("ViewDashboard")
recent_events.append("ClickButton")
recent_events.append("SignOut")  # "Login" is automatically dropped!
print(list(recent_events))       # ['ViewDashboard', 'ClickButton', 'SignOut']

# 2. Performance benchmark contrast:
# List pop(0) vs Deque popleft():
# For 100,000 items:
# list.pop(0) takes ~1.8 seconds (O(N^2) total)
# deque.popleft() takes ~0.007 seconds (O(N) total) -> 250x FASTER!`
            },
            commonPitfall: "Accessing items in the middle of a deque with `dq[i]` (random access is O(N); lists are O(1) for random access).",
            keyTakeaway: "Use `list` if you need random index access `arr[i]`. Use `deque` when modifying the ends.",
            practiceProblems: [
              {
                id: "prac-pds-5-1",
                subSkill: "Stacks & Queues (LIFO vs FIFO Implementations)",
                title: "Practice: Ideal FIFO Queue Operations",
                scenario: "What methods provide O(1) queue operations on `collections.deque`?",
                problemType: "multiple_choice",
                options: [
                  "enqueue: `.append()`, dequeue: `.popleft()`",
                  "enqueue: `.insert(0, x)`, dequeue: `.pop()`",
                  "enqueue: `.push()`, dequeue: `.shift()`",
                  "enqueue: `[0] = x`, dequeue: `del [0]`"
                ],
                correctOptionIndex: 0,
                hint: "Use append and popleft.",
                explanation: "`.append()` and `.popleft()` run in O(1) time."
              },
              {
                id: "prac-pds-5-2",
                subSkill: "Stacks & Queues (LIFO vs FIFO Implementations)",
                title: "Practice: LIFO Stack with Native Lists",
                scenario: "Which list methods implement an efficient O(1) stack?",
                problemType: "multiple_choice",
                options: [
                  "`.append()` and `.pop()`",
                  "`.insert(0)` and `.pop(0)`",
                  "`.extend()` and `.remove()`",
                  "`.push()` and `.pull()`"
                ],
                correctOptionIndex: 0,
                hint: "Work with the end of the array.",
                explanation: "Appending and popping from the end avoids memory shifts."
              }
            ]
          },
          "step-by-step": {
            subSkill: "Stacks & Queues (LIFO vs FIFO Implementations)",
            title: "Algorithmic Step-by-Step: Choosing Between List, Deque, and Queue",
            learningStyle: "step-by-step",
            overview: "A decision tree to pick the right linear collection in Python every time.",
            coreConceptExplanation: "Match your algorithmic access pattern to the data structure's memory layout.",
            visualOrCodeArtifact: {
              type: "step_list",
              title: "Linear Collection Selection Framework",
              content: `Step 1: Do you need random index access (e.g. arr[42] or sorting)?
  - YES: Use standard built-in 'list'. (O(1) indexing, contiguous cache lines).
  - NO: Proceed to Step 2.

Step 2: Are you pushing and popping only from the END (LIFO Stack)?
  - YES: Use standard built-in 'list'. 'append()' and 'pop()' are already O(1).
  - NO: Proceed to Step 3.

Step 3: Are you adding or removing from the FRONT or BOTH ENDS (FIFO Queue)?
  - Do you need multi-threaded safety with locks?
      - YES: Use 'queue.Queue' (thread-safe, blocking primitives).
      - NO: Use 'collections.deque' (ultra-fast, non-blocking, O(1) both ends).`
            },
            commonPitfall: "Using `queue.Queue` in single-threaded code (adds unnecessary mutex locking overhead).",
            keyTakeaway: "List = random access & LIFO stack. Deque = fast FIFO & double-ended mutations. Queue = multi-threaded worker pools.",
            practiceProblems: [
              {
                id: "prac-pds-5-1",
                subSkill: "Stacks & Queues (LIFO vs FIFO Implementations)",
                title: "Practice: Ideal FIFO Queue Operations",
                scenario: "How to operate collections.deque as a FIFO queue?",
                problemType: "multiple_choice",
                options: [
                  "enqueue: `.append()`, dequeue: `.popleft()`",
                  "enqueue: `.insert(0, x)`, dequeue: `.pop()`",
                  "enqueue: `.push()`, dequeue: `.shift()`",
                  "enqueue: `[0] = x`, dequeue: `del [0]`"
                ],
                correctOptionIndex: 0,
                hint: "Append to tail, pop from head.",
                explanation: "`.append()` + `.popleft()` gives O(1) FIFO queueing."
              },
              {
                id: "prac-pds-5-2",
                subSkill: "Stacks & Queues (LIFO vs FIFO Implementations)",
                title: "Practice: LIFO Stack with Native Lists",
                scenario: "Which operations give an O(1) stack on lists?",
                problemType: "multiple_choice",
                options: [
                  "`.append()` and `.pop()`",
                  "`.insert(0)` and `.pop(0)`",
                  "`.extend()` and `.remove()`",
                  "`.push()` and `.pull()`"
                ],
                correctOptionIndex: 0,
                hint: "End of list operations.",
                explanation: "`.append()` and `.pop()` operate at the list end without shifting."
              }
            ]
          }
        }
      }
    ]
  }
};
