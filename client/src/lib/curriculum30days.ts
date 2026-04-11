// 30-Day Memory Training Curriculum
// Progressive difficulty: Days 1-10 (Colors/Easy), Days 11-20 (Numbers/Medium), Days 21-30 (Words/Hard)

export const CURRICULUM_30_DAYS = [
  // DAYS 1-10: MEMORY TECHNIQUES (Easy - Colors)
  {
    day: 1,
    title: "Spaced Repetition",
    category: "study",
    difficulty: "easy",
    context: {
      definition: "A learning technique where you review information at increasing intervals to move it from short-term to long-term memory.",
      example: "Review on Day 1, then Day 3, Day 7, Day 14, Day 30. Each review strengthens the memory trace.",
      importance: "Increases retention from ~50% (cramming) to ~90% (spaced repetition). This is the foundation of effective learning."
    },
    workingMemoryType: "colors" // Days 1-10 use color challenges
  },
  {
    day: 2,
    title: "Active Recall",
    category: "study",
    difficulty: "easy",
    context: {
      definition: "Retrieving information from memory without looking at the source. Testing yourself is far more effective than re-reading.",
      example: "Instead of re-reading notes, close the book and try to write what you remember. Then check.",
      importance: "Testing yourself creates stronger memory traces than passive review. It's the most effective study method."
    },
    workingMemoryType: "colors"
  },
  {
    day: 3,
    title: "Chunking",
    category: "study",
    difficulty: "easy",
    context: {
      definition: "Grouping individual pieces of information into larger meaningful units to increase working memory capacity.",
      example: "Remember 1-800-555-0123 as chunks (1-800, 555, 0123) instead of 10 separate digits.",
      importance: "Increases working memory capacity from ~7 items to ~7 chunks. Makes complex information manageable."
    },
    workingMemoryType: "colors"
  },
  {
    day: 4,
    title: "Method of Loci (Memory Palace)",
    category: "study",
    difficulty: "easy",
    context: {
      definition: "Visualizing items you want to remember placed in specific locations of a familiar place (your home, a route, etc.).",
      example: "To remember a shopping list, imagine milk in your front door, bread on the couch, eggs in the kitchen.",
      importance: "Used by memory champions. Can help remember 100+ items by leveraging spatial memory."
    },
    workingMemoryType: "colors"
  },
  {
    day: 5,
    title: "Elaboration",
    category: "study",
    difficulty: "easy",
    context: {
      definition: "Connecting new information to existing knowledge by asking 'why' and 'how' questions.",
      example: "When learning 'photosynthesis', connect it to: plants need energy, sunlight is energy, CO2 is fuel, oxygen is waste.",
      importance: "Deep processing creates stronger, more retrievable memories. Prevents shallow memorization."
    },
    workingMemoryType: "colors"
  },
  {
    day: 6,
    title: "Interleaving",
    category: "study",
    difficulty: "easy",
    context: {
      definition: "Mixing different topics or problem types during study instead of blocking (studying one topic at a time).",
      example: "Study math problems: algebra, geometry, algebra, calculus, geometry. Not: all algebra, then all geometry.",
      importance: "Improves transfer of knowledge and problem-solving ability by ~40% compared to blocked practice."
    },
    workingMemoryType: "colors"
  },
  {
    day: 7,
    title: "Dual Coding",
    category: "study",
    difficulty: "easy",
    context: {
      definition: "Encoding information in two ways: both verbal (words) and visual (images/diagrams).",
      example: "Learn a concept by reading about it AND drawing a diagram. Both representations strengthen memory.",
      importance: "Dual coding increases retention by ~50% because you have two retrieval paths instead of one."
    },
    workingMemoryType: "colors"
  },
  {
    day: 8,
    title: "Metacognition",
    category: "study",
    difficulty: "easy",
    context: {
      definition: "Thinking about your thinking. Monitoring what you know and don't know, and adjusting your learning strategy.",
      example: "After studying, ask: 'Can I explain this to someone else? What parts am I unsure about? Do I need more practice?'",
      importance: "Metacognitive awareness helps you study more efficiently and identify knowledge gaps early."
    },
    workingMemoryType: "colors"
  },
  {
    day: 9,
    title: "Retrieval Practice",
    category: "study",
    difficulty: "easy",
    context: {
      definition: "Practicing retrieving information from memory repeatedly. Each retrieval strengthens the memory trace.",
      example: "Use flashcards, quizzes, or practice problems. The struggle to retrieve is what makes memory stronger.",
      importance: "The testing effect: retrieval practice produces better long-term retention than additional studying."
    },
    workingMemoryType: "colors"
  },
  {
    day: 10,
    title: "Sleep & Memory Consolidation",
    category: "health",
    difficulty: "easy",
    context: {
      definition: "During sleep, the brain consolidates memories by replaying neural patterns and strengthening synapses.",
      example: "Learn something new in the morning, sleep well that night, and you'll remember it better the next day.",
      importance: "Sleep is essential for memory consolidation. Skipping sleep reduces memory retention by 40%."
    },
    workingMemoryType: "colors"
  },

  // DAYS 11-20: NEUROSCIENCE OF MEMORY (Medium - Numbers)
  {
    day: 11,
    title: "Hippocampus & Memory Formation",
    category: "study",
    difficulty: "medium",
    context: {
      definition: "The hippocampus is the brain region responsible for forming new memories and transferring them to long-term storage.",
      example: "Damage to the hippocampus prevents forming new memories, but old memories remain (as in the movie 'Memento').",
      importance: "Understanding where memories form helps explain why certain techniques (spaced repetition, sleep) are effective."
    },
    workingMemoryType: "numbers"
  },
  {
    day: 12,
    title: "Synaptic Plasticity",
    category: "study",
    difficulty: "medium",
    context: {
      definition: "The ability of synapses (connections between neurons) to strengthen or weaken over time based on activity.",
      example: "When you learn something, synapses involved in that learning become stronger. Unused synapses weaken.",
      importance: "This is the biological basis of memory. 'Neurons that fire together, wire together' (Hebb's Law)."
    },
    workingMemoryType: "numbers"
  },
  {
    day: 13,
    title: "Long-Term Potentiation (LTP)",
    category: "study",
    difficulty: "medium",
    context: {
      definition: "A long-lasting increase in synaptic strength after high-frequency stimulation. The mechanism underlying learning.",
      example: "Repeated stimulation of a synapse increases its response strength, making future signals stronger.",
      importance: "LTP is the cellular basis of memory formation. It's why repetition works."
    },
    workingMemoryType: "numbers"
  },
  {
    day: 14,
    title: "Neurotransmitters & Memory",
    category: "study",
    difficulty: "medium",
    context: {
      definition: "Chemical messengers (like acetylcholine, dopamine, norepinephrine) that transmit signals between neurons and affect memory.",
      example: "Acetylcholine is crucial for memory formation. Dopamine strengthens rewarding memories.",
      importance: "Understanding neurotransmitters explains why attention, emotion, and reward affect memory formation."
    },
    workingMemoryType: "numbers"
  },
  {
    day: 15,
    title: "Working Memory vs Long-Term Memory",
    category: "study",
    difficulty: "medium",
    context: {
      definition: "Working memory holds ~7 items temporarily (seconds to minutes). Long-term memory stores unlimited information (years/lifetime).",
      example: "Remembering a phone number while dialing = working memory. Remembering your childhood = long-term memory.",
      importance: "Most learning techniques aim to transfer information from working memory to long-term memory."
    },
    workingMemoryType: "numbers"
  },
  {
    day: 16,
    title: "Encoding Specificity",
    category: "study",
    difficulty: "medium",
    context: {
      definition: "Memory retrieval is best when the context at retrieval matches the context at encoding.",
      example: "If you study in silence, you'll remember better in silence. If you study with music, you'll remember better with music.",
      importance: "Explains why studying in varied contexts improves retrieval. Helps you prepare for real-world use."
    },
    workingMemoryType: "numbers"
  },
  {
    day: 17,
    title: "Interference & Forgetting",
    category: "study",
    difficulty: "medium",
    context: {
      definition: "Forgetting occurs when similar memories interfere with each other (proactive or retroactive interference).",
      example: "Learning Spanish makes it harder to remember French (proactive). Learning French makes you forget Spanish (retroactive).",
      importance: "Understanding interference helps you space learning of similar topics and use distinctive encoding."
    },
    workingMemoryType: "numbers"
  },
  {
    day: 18,
    title: "Reconsolidation & Memory Updating",
    category: "study",
    difficulty: "medium",
    context: {
      definition: "When you retrieve a memory, it becomes temporarily unstable and must be reconsolidated. This is when you can update it.",
      example: "If you remember a fact incorrectly, then learn the correct version, the memory updates during reconsolidation.",
      importance: "Explains why retrieval practice is so powerful—it's not just testing, it's also updating memories."
    },
    workingMemoryType: "numbers"
  },
  {
    day: 19,
    title: "Emotional Memory Enhancement",
    category: "study",
    difficulty: "medium",
    context: {
      definition: "Emotional arousal during learning increases memory strength by activating the amygdala and releasing neurotransmitters.",
      example: "You remember traumatic events vividly (emotional). You forget boring lectures (no emotion).",
      importance: "Adding emotion or personal relevance to learning dramatically improves retention."
    },
    workingMemoryType: "numbers"
  },
  {
    day: 20,
    title: "Neuroplasticity & Brain Training",
    category: "study",
    difficulty: "medium",
    context: {
      definition: "The brain's ability to reorganize itself by forming new neural connections throughout life. Memory training can improve brain function.",
      example: "London taxi drivers develop larger hippocampi from memorizing complex routes. Musicians have larger auditory cortex.",
      importance: "Your brain is not fixed. Regular memory training can improve cognitive function at any age."
    },
    workingMemoryType: "numbers"
  },

  // DAYS 21-30: PRACTICAL APPLICATIONS (Hard - Words/Patterns)
  {
    day: 21,
    title: "Learning Languages: Vocabulary",
    category: "language",
    difficulty: "hard",
    context: {
      definition: "Building vocabulary by learning words with context, pronunciation, and usage examples, then spacing reviews.",
      example: "Learn 'serendipity' with: definition, pronunciation, example sentence, and visual association.",
      importance: "Vocabulary is the foundation of language learning. Spaced repetition + context = fluency."
    },
    workingMemoryType: "words"
  },
  {
    day: 22,
    title: "Memorizing Names & Faces",
    category: "study",
    difficulty: "hard",
    context: {
      definition: "Using techniques like face-name association, elaboration, and visualization to remember people's names.",
      example: "When meeting 'John', visualize him with a toilet (john = toilet) or connect to someone famous named John.",
      importance: "Remembering names is crucial for social and professional relationships. Most people fail because they don't try."
    },
    workingMemoryType: "words"
  },
  {
    day: 23,
    title: "Memorizing Numbers & Dates",
    category: "study",
    difficulty: "hard",
    context: {
      definition: "Using the Major System or Peg System to convert numbers into memorable images and stories.",
      example: "Convert 1984 to 'TaiL PaiR' (1=T, 9=P, 8=V, 4=R) and visualize a story with those sounds.",
      importance: "Memory champions use these systems to memorize 100+ digits in minutes. Applicable to any numbers."
    },
    workingMemoryType: "words"
  },
  {
    day: 24,
    title: "Procedural Memory: Skills & Habits",
    category: "procedures",
    difficulty: "hard",
    context: {
      definition: "Implicit memory for skills and procedures (like riding a bike). Learned through repetition and practice, not conscious recall.",
      example: "You don't consciously remember how to tie your shoes—your procedural memory does it automatically.",
      importance: "Procedural memory is durable and automatic. Key to mastering skills through deliberate practice."
    },
    workingMemoryType: "words"
  },
  {
    day: 25,
    title: "Semantic Memory: Knowledge & Facts",
    category: "study",
    difficulty: "hard",
    context: {
      definition: "Explicit memory for facts, concepts, and general knowledge. Learned through understanding and elaboration.",
      example: "Knowing that Paris is the capital of France, or understanding photosynthesis.",
      importance: "Semantic memory is what most people think of as 'memory'. Built through spaced repetition and elaboration."
    },
    workingMemoryType: "words"
  },
  {
    day: 26,
    title: "Episodic Memory: Personal Experiences",
    category: "study",
    difficulty: "hard",
    context: {
      definition: "Memory for specific events and experiences with context (time, place, emotions). Most personal and detailed.",
      example: "Remembering your first day at school, a vacation, or a conversation with a friend.",
      importance: "Episodic memory is what makes life meaningful. Strengthened by attention, emotion, and rehearsal."
    },
    workingMemoryType: "words"
  },
  {
    day: 27,
    title: "Attention & Selective Focus",
    category: "study",
    difficulty: "hard",
    context: {
      definition: "Attention is the gateway to memory. Only attended information is encoded into memory.",
      example: "You don't remember what people said if you weren't paying attention. Distractions prevent encoding.",
      importance: "Improving attention is the first step to improving memory. Meditation and mindfulness help."
    },
    workingMemoryType: "words"
  },
  {
    day: 28,
    title: "Motivation & Goal-Setting",
    category: "study",
    difficulty: "hard",
    context: {
      definition: "Clear goals and intrinsic motivation dramatically improve memory performance and learning outcomes.",
      example: "You remember information better when it's relevant to your goals. Motivation activates dopamine reward system.",
      importance: "Motivation affects attention, effort, and persistence. It's crucial for long-term learning success."
    },
    workingMemoryType: "words"
  },
  {
    day: 29,
    title: "Stress Management & Memory",
    category: "health",
    difficulty: "hard",
    context: {
      definition: "Chronic stress impairs memory formation and retrieval by damaging the hippocampus and increasing cortisol.",
      example: "High stress = poor memory. Relaxation techniques, exercise, and sleep improve memory under stress.",
      importance: "Managing stress is essential for optimal memory function. Stress is one of the biggest memory killers."
    },
    workingMemoryType: "words"
  },
  {
    day: 30,
    title: "Lifelong Learning & Brain Health",
    category: "health",
    difficulty: "hard",
    context: {
      definition: "Continuous learning, cognitive challenges, and mental stimulation maintain brain health and prevent cognitive decline.",
      example: "People who engage in lifelong learning have better cognitive function in old age. Learning new skills builds neural reserves.",
      importance: "Memory training is not just about remembering—it's about maintaining brain health and cognitive vitality throughout life."
    },
    workingMemoryType: "words"
  }
];

export type CurriculumDay = typeof CURRICULUM_30_DAYS[0];
