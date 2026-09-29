// Centralized Mock Dataset for PathPilot Web Application
// Provides frontend-ready state for all routes & features.

export const initialStudentData = {
  name: "Alex Rivera",
  email: "alex.rivera@university.edu",
  college: "Indian Institute of Technology (BHU)",
  graduationYear: "2026",
  targetRole: "Software Development Engineer (SDE-1)",
  targetCompanies: ["Google", "Microsoft", "Amazon", "Uber", "Atlassian"],
  placementTargetDate: "15 December 2026",
  daysRemaining: 87,
  dailyPreparationTime: "2-3 hours",
  overallProgress: 78,
  progressIncrement: 12,
  streakDays: 14,
  accuracy: 84,
  questionsSolved: 142,
  totalQuestions: 210,
  topicsCompleted: 38,

  domainProgress: {
    dsa: 68,
    aptitude: 54,
    coreCS: 72
  },

  nextRecommendedTopic: {
    id: "binary-trees",
    title: "Binary Trees & Traversal Patterns",
    category: "DSA",
    subject: "Trees & Graphs",
    estimatedTime: "45 mins",
    reason: "Recommended based on pattern recognition gap detected in recent practice."
  }
};

export const subjectsData = [
  {
    id: "dsa",
    name: "Data Structures & Algorithms",
    code: "DSA",
    icon: "Code2",
    progress: 68,
    topicsCount: 18,
    completedTopics: 12,
    description: "Master pattern recognition in arrays, trees, dynamic programming, and graph algorithms.",
    gradient: "from-blue-600 via-indigo-600 to-cyan-500",
    topics: [
      { id: "arrays-hashing", name: "Arrays & Hashing", progress: 85, difficulty: "Easy", questionsCount: 24, completed: true },
      { id: "two-pointers", name: "Two Pointers & Sliding Window", progress: 75, difficulty: "Medium", questionsCount: 18, completed: true },
      { id: "stack-queue", name: "Stacks & Queues", progress: 90, difficulty: "Easy", questionsCount: 15, completed: true },
      { id: "binary-trees", name: "Binary Trees & BST", progress: 45, difficulty: "Medium", questionsCount: 22, completed: false, current: true },
      { id: "dp-patterns", name: "Dynamic Programming Patterns", progress: 30, difficulty: "Hard", questionsCount: 30, completed: false },
      { id: "graphs", name: "Graph Traversal & Shortest Path", progress: 20, difficulty: "Hard", questionsCount: 25, completed: false }
    ]
  },
  {
    id: "aptitude",
    name: "Quantitative & Logical Aptitude",
    code: "APT",
    icon: "Calculator",
    progress: 54,
    topicsCount: 14,
    completedTopics: 7,
    description: "Build speed, mental shortcuts, and logical problem-solving strategies for tech hiring assessments.",
    gradient: "from-cyan-500 via-teal-500 to-emerald-500",
    topics: [
      { id: "percentages", name: "Percentages & Profit-Loss", progress: 70, difficulty: "Medium", questionsCount: 20, completed: true },
      { id: "time-work", name: "Time, Speed & Distance", progress: 50, difficulty: "Medium", questionsCount: 16, completed: false, current: true },
      { id: "permutations", name: "Permutations & Probability", progress: 40, difficulty: "Hard", questionsCount: 14, completed: false },
      { id: "data-interpretation", name: "Data Interpretation Graphs", progress: 60, difficulty: "Easy", questionsCount: 12, completed: true }
    ]
  },
  {
    id: "core",
    name: "Computer Science Core Fundamentals",
    code: "CORE",
    icon: "Cpu",
    progress: 72,
    topicsCount: 25,
    completedTopics: 18,
    description: "Deep dive into DBMS, Operating Systems, Computer Networks, OOPS, and System Architecture.",
    gradient: "from-purple-600 via-violet-600 to-indigo-500",
    subjects: [
      {
        id: "oops",
        name: "Object Oriented Programming (OOPS)",
        progress: 88,
        topics: [
          { name: "Inheritance & Polymorphism", progress: 100, completed: true },
          { name: "Abstraction & Encapsulation", progress: 90, completed: true },
          { name: "Design Patterns (Singleton, Factory)", progress: 75, completed: false, current: true }
        ]
      },
      {
        id: "dbms",
        name: "Database Management Systems (DBMS)",
        progress: 74,
        topics: [
          { name: "SQL Queries & Joins", progress: 95, completed: true },
          { name: "Normalization (1NF to BCNF)", progress: 70, completed: true, current: true },
          { name: "ACID Properties & Transactions", progress: 60, completed: false },
          { name: "Indexing & B+ Trees", progress: 40, completed: false }
        ]
      },
      {
        id: "os",
        name: "Operating Systems (OS)",
        progress: 65,
        topics: [
          { name: "Process Synchronization & Mutex", progress: 80, completed: true },
          { name: "CPU Scheduling Algorithms", progress: 70, completed: true },
          { name: "Virtual Memory & Page Replacement", progress: 45, completed: false, current: true }
        ]
      },
      {
        id: "cn",
        name: "Computer Networks (CN)",
        progress: 70,
        topics: [
          { name: "OSI & TCP/IP Model", progress: 85, completed: true },
          { name: "HTTP, HTTPS & Web Sockets", progress: 75, completed: true },
          { name: "IP Addressing & Subnetting", progress: 50, completed: false, current: true }
        ]
      },
      {
        id: "coa",
        name: "Computer Organization & Architecture (COA)",
        progress: 60,
        topics: [
          { name: "Cache Memory & Mapping", progress: 65, completed: true },
          { name: "Pipelining & Hazards", progress: 55, completed: false, current: true }
        ]
      }
    ]
  }
];

export const roadmapData = [
  {
    phase: "Phase 1: Foundation",
    status: "completed",
    items: [
      { title: "C++ / Java Syntax & Data Structures Basics", status: "completed", date: "Aug 2026" },
      { title: "Time & Space Complexity Analysis (Big-O)", status: "completed", date: "Aug 2026" }
    ]
  },
  {
    phase: "Phase 2: DSA Problem Patterns",
    status: "current",
    items: [
      { title: "Arrays, Two Pointers & Hashing", status: "completed", date: "Sep 2026" },
      { title: "Binary Trees, BST & DFS Traversal Patterns", status: "current", date: "In Progress" },
      { title: "Graph Algorithms & Shortest Path (Dijkstra)", status: "upcoming", date: "Oct 2026" },
      { title: "Dynamic Programming Memoization & Tabulation", status: "upcoming", date: "Oct 2026" }
    ]
  },
  {
    phase: "Phase 3: Core CS & System Architecture",
    status: "upcoming",
    items: [
      { title: "DBMS SQL & Normalization Mastery", status: "completed", date: "Sep 2026" },
      { title: "Operating Systems Process Sync & Memory", status: "current", date: "In Progress" },
      { title: "Computer Networks TCP/IP & Protocols", status: "upcoming", date: "Nov 2026" }
    ]
  },
  {
    phase: "Phase 4: Placement Readiness & Mock Practice",
    status: "upcoming",
    items: [
      { title: "Company-Specific Question Bank (Google/MSFT)", status: "upcoming", date: "Nov 2026" },
      { title: "AI-Powered Technical & HR Mock Interviews", status: "upcoming", date: "Dec 2026" },
      { title: "Resume ATS Polish & Portfolio Review", status: "upcoming", date: "Dec 2026" }
    ]
  }
];

export const practiceQuestionsData = [
  {
    id: "two-sum",
    title: "Two Sum Pattern",
    category: "DSA",
    topic: "Arrays & Hashing",
    difficulty: "Easy",
    pattern: "Hash Map / Complement Lookup",
    problemStatement: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.`,
    examples: [
      { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]." }
    ],
    starterCode: {
      javascript: `function twoSum(nums, target) {\n  // Write your logic here using Hash Map for O(N) efficiency\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const diff = target - nums[i];\n    if (map.has(diff)) {\n      return [map.get(diff), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}`,
      python: `def twoSum(nums, target):\n    # Write Python implementation\n    seen = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in seen:\n            return [seen[diff], i]\n        seen[num] = i\n    return []`,
      java: `class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        Map<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int diff = target - nums[i];\n            if (map.containsKey(diff)) {\n                return new int[] { map.get(diff), i };\n            }\n            map.put(nums[i], i);\n        }\n        return new int[]{};\n    }\n}`
    },
    hints: [
      "Can we do this faster than a O(N^2) double loop?",
      "Try keeping track of numbers you've already seen in a Hash Map.",
      "For each element num, check if (target - num) exists in the map."
    ]
  },
  {
    id: "binary-tree-inorder",
    title: "Binary Tree Inorder Traversal",
    category: "DSA",
    topic: "Binary Trees",
    difficulty: "Medium",
    pattern: "DFS Stack Traversal / Recursion",
    problemStatement: "Given the root of a binary tree, return the inorder traversal of its nodes' values.",
    examples: [
      { input: "root = [1,null,2,3]", output: "[1,3,2]" }
    ],
    starterCode: {
      javascript: `function inorderTraversal(root) {\n  const result = [];\n  function dfs(node) {\n    if (!node) return;\n    dfs(node.left);\n    result.push(node.val);\n    dfs(node.right);\n  }\n  dfs(root);\n  return result;\n}`
    },
    hints: [
      "Inorder traversal order is: Left Subtree -> Root -> Right Subtree.",
      "You can solve this recursively or iteratively with an explicit Stack."
    ]
  }
];

export const mistakeJournalData = [
  {
    id: "m1",
    topic: "Binary Search - Rotated Array",
    category: "Edge Case Overflow",
    date: "Yesterday",
    learningNote: "Forgot that mid calculation `(low + high) / 2` can overflow integer bounds. Use `low + (high - low) / 2` instead.",
    resolved: false
  },
  {
    id: "m2",
    topic: "DBMS - BCNF vs 3NF",
    category: "Concept Gap",
    date: "3 days ago",
    learningNote: "BCNF requires every determinant to be a candidate key. In 3NF, the dependent attribute can also be a prime attribute.",
    resolved: true
  },
  {
    id: "m3",
    topic: "Aptitude - Work & Time",
    category: "Calculation Speed",
    date: "5 days ago",
    learningNote: "Use efficiency ratio method instead of fractional work days to save 45 seconds per question.",
    resolved: true
  }
];

export const revisionHubData = {
  dueForRevision: [
    { title: "Sliding Window Maximum", category: "DSA", lastStudied: "4 days ago", confidence: "Medium" },
    { title: "ACID Properties in Distributed DB", category: "Core CS", lastStudied: "6 days ago", confidence: "Low" },
    { title: "Permutation with Repetition Formulas", category: "Aptitude", lastStudied: "1 week ago", confidence: "Medium" }
  ],
  savedNotes: [
    { id: "n1", title: "Dijkstra's Algorithm Edge Cases", topic: "Graph Algorithms", content: "Cannot handle negative edge weights. Use Bellman-Ford algorithm for negative edges." },
    { id: "n2", title: "TCP vs UDP Header Differences", topic: "Computer Networks", content: "TCP header is 20-60 bytes with connection state; UDP header is fixed 8 bytes." }
  ]
};

export const mockInterviewSessions = [
  { id: "tech-dsa", title: "Technical DSA Pattern Interview", duration: "45 mins", difficulty: "Hard", completed: false },
  { id: "cs-core", title: "Core CS Fundamentals (DBMS & OS)", duration: "30 mins", difficulty: "Medium", completed: true, score: 86 },
  { id: "hr-behavioral", title: "HR Behavioral & Situational Prep", duration: "30 mins", difficulty: "Medium", completed: false }
];

export const resumeMetrics = {
  atsScore: 82,
  matchedKeywords: 18,
  missingKeywords: 4,
  suggestions: [
    "Add explicit project metrics (e.g. 'Improved database latency by 35%')",
    "Include System Design & Microservices keywords for SDE-1 roles",
    "Ensure GitHub links are hyperlinked cleanly in PDF header"
  ]
};
