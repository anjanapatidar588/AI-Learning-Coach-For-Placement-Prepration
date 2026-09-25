import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Dynamically resolves a GoogleGenerativeAI instance if a valid server API key is configured.
 * Safely ignores mock/placeholder keys.
 *
 * @returns {GoogleGenerativeAI|null}
 */
const getGenerativeClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || typeof apiKey !== 'string') {
    return null;
  }
  const trimmedKey = apiKey.trim();
  if (
    !trimmedKey ||
    trimmedKey === 'mock_key_for_testing' ||
    trimmedKey === 'your_gemini_api_key_here'
  ) {
    return null;
  }
  return new GoogleGenerativeAI(trimmedKey);
};

/**
 * Generates an AI response using Google Gemini API (gemini-3.8-flash with candidate model fallback).
 * Preserves the existing generateAIResponse interface.
 * Safely masks API keys and returns clean error state on failures.
 *
 * @param {object} params
 * @param {string} params.persona
 * @param {string} params.systemPrompt
 * @param {string} params.userPrompt
 * @param {object} [params.contextData]
 * @param {boolean} [params.failIfUnavailable=false]
 * @returns {Promise<string>}
 */
export const generateAIResponse = async ({ persona, systemPrompt, userPrompt, contextData, failIfUnavailable = false }) => {
  const genAI = getGenerativeClient();

  if (genAI) {
    const candidateModels = [
      process.env.GEMINI_MODEL || 'gemini-3.8-flash',
      'gemini-3-flash-preview',
      'gemini-3.1-flash-lite-preview'
    ];

    let lastError = null;

    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const fullPrompt = `${systemPrompt}\n\nContext Data: ${JSON.stringify(contextData || {})}\n\nUser Question/Input: ${userPrompt}`;
        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const responseText = response.text();

        if (responseText && typeof responseText === 'string') {
          return responseText;
        }
      } catch (error) {
        lastError = error;
        // If high demand spike (503) or model unavailable (404), try next candidate model
        if (error.message && (error.message.includes('503') || error.message.includes('high demand') || error.message.includes('not found'))) {
          continue;
        }
        break;
      }
    }

    if (lastError) {
      const rawMsg = lastError.message || 'Gemini API Error';
      const safeMsg = rawMsg.replace(/key=[^&%\s]+/gi, 'key=***').replace(/AIzaSy[A-Za-z0-9_-]+/g, 'AIzaSy***');
      console.warn('[AIService] Gemini API call failed safely:', safeMsg);
    }
  }

  if (failIfUnavailable) {
    throw new Error('Gemini API is unavailable');
  }

  // Fallback simulation for non-critical development/demo when failIfUnavailable is false
  return getSimulatedPersonaResponse(persona, userPrompt, contextData);
};

const getSimulatedPersonaResponse = (persona, userPrompt, contextData) => {
  const query = (userPrompt || '').toLowerCase();

  if (persona === 'DSA Mentor') {
    if (query.includes('two sum') || query.includes('array')) {
      return [
        "### 💡 DSA Mentor Guidance: Two Sum & Hash Map Pattern",
        "",
        "Great question! When solving Two Sum, brute-forcing with nested loops takes **O(N²)** time.",
        "",
        "**Key Insight:** ",
        "Can we trade space for time?",
        "Using a **Hash Map**, as you iterate through the array:",
        "1. For each number `x`, compute its complement: `target - x`.",
        "2. Check if the complement already exists in your map in **O(1)** time.",
        "3. If it exists, return the stored index and current index.",
        "",
        "```javascript",
        "function twoSum(nums, target) {",
        "  const map = new Map();",
        "  for (let i = 0; i < nums.length; i++) {",
        "    const complement = target - nums[i];",
        "    if (map.has(complement)) {",
        "      return [map.get(complement), i];",
        "    }",
        "    map.set(nums[i], i);",
        "  }",
        "}",
        "```",
        "**Time Complexity:** O(N) | **Space Complexity:** O(N)",
        "",
        "What edge cases should you test before submitting? (e.g. empty array, duplicate values?)"
      ].join('\n');
    }
    return [
      "### 🧠 DSA Mentor Insight",
      "",
      "Let's break down this problem systematically:",
      "1. Identify the input constraints and expected time complexity limit.",
      "2. Consider the underlying data structure (Array, Linked List, Tree, Graph, or Dynamic Programming table).",
      "3. Try solving small test cases by hand before typing code.",
      "",
      "Need a hint on space/time complexity optimization? Let me know which approach you are considering!"
    ].join('\n');
  }

  if (persona === 'Aptitude Mentor') {
    return [
      "### 📊 Aptitude Shortcut & Reasoning",
      "",
      "**Problem Analysis:**",
      "Let's solve this using the standard speed-time-distance / proportion technique.",
      "",
      "**Step-by-Step Breakdown:**",
      "1. Identify the given variables and units (convert km/h to m/s by multiplying by `5/18` if necessary).",
      "2. Set up the formula: Speed = Distance / Time.",
      "3. Simplify the equation using cross-multiplication.",
      "",
      "**Quick Mental Math Trick:**",
      "To quickly find 15% of any number, calculate 10% first (shift decimal left) and add half of that value (5%).",
      "",
      "Would you like another practice problem on this exact pattern?"
    ].join('\n');
  }

  if (persona === 'CS Core Mentor') {
    return [
      "### 💻 CS Core Mentor: Fundamental Concept",
      "",
      "**Database Indexing & B-Trees:**",
      "Think of a database index like the index at the back of a textbook. Without an index, the database engine must perform a **Full Table Scan** (reading every single row from disk).",
      "",
      "- **B+ Tree Structure:** Internal nodes store keys, leaf nodes store data/pointers and form a doubly-linked list for fast range queries.",
      "- **ACID Properties:**",
      "  - **Atomicity**: All or nothing transaction.",
      "  - **Consistency**: Database state transitions from one valid state to another.",
      "  - **Isolation**: Concurrent transactions do not interfere (Isolation levels: Read Uncommitted, Read Committed, Repeatable Read, Serializable).",
      "  - **Durability**: Committed changes persist even after power loss.",
      "",
      "Would you like a quiz on ACID isolation levels?"
    ].join('\n');
  }

  if (persona === 'Interview Coach') {
    return [
      "### 🎙️ Interview Coach Response",
      "",
      '"Thank you for sharing that experience! You structured your response well using the STAR method (Situation, Task, Action, Result).',
      "",
      "To make your answer even stronger for a senior interviewer:",
      "1. **Quantify the impact:** What exact percentage latency reduction or memory optimization did your code produce?",
      "2. **Trade-offs:** What alternative solution did you consider, and why did you choose this architecture over the alternative?",
      "",
      'Let\'s try the next technical question: *Can you explain how garbage collection works in Java / V8 Engine?*"'
    ].join('\n');
  }

  if (persona === 'Career Coach') {
    return [
      "### 🎯 Career Coach Feedback",
      "",
      "Based on your target role of **Software Engineer**:",
      "- **Current Placement Readiness Score:** 74%",
      "- **Top Priority Gap:** Advanced Dynamic Programming & DBMS Transaction Concurrency.",
      "- **Recommended Action Plan for Today:**",
      "  1. Solve 2 Medium DP problems (Knapsack / Coin Change).",
      "  2. Complete the DBMS Indexing Quiz.",
      '  3. Update your resume with quantifiable metrics (e.g., *"Optimized database queries reducing API response time by 35%"*).'
    ].join('\n');
  }

  return "### 🤖 AI Placement Coach\n\nI am here to guide your placement preparation across DSA, Aptitude, CS Core, Resume building, and Mock Interviews. What would you like to master today?";
};
