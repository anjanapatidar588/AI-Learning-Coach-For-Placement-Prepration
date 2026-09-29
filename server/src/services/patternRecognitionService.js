import Question from '../models/Question.js';
import Topic from '../models/Topic.js';

const PATTERN_KEYWORDS = [
  { pattern: 'TWO_POINTER', keywords: ['two pointer', 'two-pointer', 'pair sum', 'opposite ends', 'left right pointer', 'two pointers'] },
  { pattern: 'SLIDING_WINDOW', keywords: ['sliding window', 'window size', 'max sum subarray', 'k elements', 'subsegment'] },
  { pattern: 'BINARY_SEARCH', keywords: ['binary search', 'search range', 'sorted array', 'log n', 'mid', 'lower bound', 'upper bound'] },
  { pattern: 'HASHING', keywords: ['hash', 'frequency', 'map', 'count occurrences', 'two sum', 'hashset', 'hashmap'] },
  { pattern: 'PREFIX_SUM', keywords: ['prefix sum', 'range sum', 'cumulative sum', 'prefix'] },
  { pattern: 'STACK', keywords: ['stack', 'balanced parentheses', 'next greater', 'postfix', 'infix'] },
  { pattern: 'QUEUE', keywords: ['queue', 'bfs', 'breadth first', 'level order'] },
  { pattern: 'LINKED_LIST', keywords: ['linked list', 'reverse list', 'detect cycle', 'singly linked', 'doubly linked'] },
  { pattern: 'TREE', keywords: ['tree', 'binary tree', 'bst', 'inorder', 'preorder', 'postorder', 'ancestor'] },
  { pattern: 'GRAPH', keywords: ['graph', 'dfs', 'topological', 'dijkstra', 'shortest path', 'connected components'] },
  { pattern: 'GREEDY', keywords: ['greedy', 'interval', 'activity selection', 'fractional knapsack'] },
  { pattern: 'DYNAMIC_PROGRAMMING', keywords: ['dynamic programming', 'dp', 'memoization', 'knapsack', 'longest common'] },
  { pattern: 'BACKTRACKING', keywords: ['backtrack', 'n-queens', 'subset', 'permutation', 'sudoku'] },
  { pattern: 'SORTING', keywords: ['sort', 'merge sort', 'quick sort', 'bubble sort', 'insertion sort'] },
  { pattern: 'RECURSION', keywords: ['recursion', 'recursive', 'factorial', 'fibonacci'] },
  { pattern: 'MATH', keywords: ['math', 'prime', 'gcd', 'lcm', 'modular', 'efficiency'] }
];

/**
 * Deterministically detects the underlying pattern or concept for a question.
 * @param {object|string} questionOrId 
 * @param {object} [topicObj] 
 * @returns {Promise<{ pattern: string, confidence: number, reasoning: string, source: string }>}
 */
export const detectQuestionPattern = async (questionOrId, topicObj = null) => {
  let question = questionOrId;
  if (typeof questionOrId === 'string' || (questionOrId && questionOrId._id && !questionOrId.problemStatement)) {
    question = await Question.findById(questionOrId).populate('topicId').lean().catch(() => null);
  }

  if (!question) {
    return {
      pattern: 'OTHER',
      confidence: 0.5,
      reasoning: 'General concept problem.',
      source: 'FALLBACK'
    };
  }

  // 1. Check stored question pattern
  if (question.pattern) {
    return {
      pattern: question.pattern,
      confidence: 0.95,
      reasoning: `Deterministic pattern metadata stored on question (${question.pattern}).`,
      source: 'STORED_METADATA'
    };
  }

  // 2. Combine searchable text
  const topic = topicObj || question.topicId || {};
  const searchCorpus = [
    question.title || '',
    question.problemStatement || '',
    question.description || '',
    topic.title || '',
    topic.subject || '',
    topic.slug || ''
  ].join(' ').toLowerCase();

  // 3. Keyword matching
  for (const item of PATTERN_KEYWORDS) {
    for (const kw of item.keywords) {
      if (searchCorpus.includes(kw)) {
        return {
          pattern: item.pattern,
          confidence: 0.85,
          reasoning: `Matched pattern keyword "${kw}" in problem statement or topic.`,
          source: 'DETERMINISTIC_HEURISTIC'
        };
      }
    }
  }

  // 4. Default by category / subject
  if (question.category === 'dsa') {
    return {
      pattern: 'TWO_POINTER', // Sensible default for array/string DSA if unclassified
      confidence: 0.6,
      reasoning: 'Default algorithmic pattern assigned.',
      source: 'DEFAULT_DSA'
    };
  }

  return {
    pattern: 'OTHER',
    confidence: 0.7,
    reasoning: `Subject-specific concept: ${topic.subject || topic.title || 'General'}.`,
    source: 'SUBJECT_CONCEPT'
  };
};
