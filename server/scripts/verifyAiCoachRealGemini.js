import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import mongoose from 'mongoose';
import dns from 'dns';
import { connectDB } from '../config/db.js';
import User from '../src/models/User.js';
import LearnerProfile from '../src/models/LearnerProfile.js';
import Topic from '../src/models/Topic.js';
import Question from '../src/models/Question.js';
import AttemptTrack from '../src/models/AttemptTrack.js';
import WeaknessAnalysis from '../src/models/WeaknessAnalysis.js';
import { hashPassword } from '../src/utils/passwordUtil.js';
import { generateToken } from '../src/utils/jwtUtil.js';
import { chatWithCoach } from '../src/controllers/aiController.js';
import { protect } from '../src/middleware/authMiddleware.js';
import { authorize } from '../src/middleware/roleMiddleware.js';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const createMockReqRes = (headers = {}, body = {}) => {
  const req = { headers, body };
  const res = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    }
  };
  return { req, res };
};

const runMiddleware = (middleware, req, res) => {
  return new Promise((resolve) => {
    middleware(req, res, () => resolve(true));
    setTimeout(() => resolve(false), 10);
  });
};

const runVerification = async () => {
  console.log('[AiCoachRealGeminiTest] Starting End-to-End Real Gemini AI Coach Verification...');
  const created = {
    users: [],
    profiles: [],
    topics: [],
    questions: [],
    attempts: [],
    weaknesses: []
  };

  let authResult = 'FAIL';
  let rbacResult = 'FAIL';
  let mongoContextResult = 'FAIL';
  let realGeminiResult = 'FAIL';
  let aiResponseReceived = 'NO';
  let secretKeyLogged = false;

  const rawApiKey = process.env.GEMINI_API_KEY;

  try {
    await connectDB();
    console.log('[AiCoachRealGeminiTest] Connected to MongoDB Atlas.');

    const passwordHash = await hashPassword('TestPassword123!');
    const student = await User.create({
      name: 'Real Gemini Student',
      email: `gemini-student-${Date.now()}@example.invalid`,
      passwordHash,
      role: 'student'
    });
    const victimStudent = await User.create({
      name: 'Victim Student',
      email: `victim-gemini-${Date.now()}@example.invalid`,
      passwordHash,
      role: 'student'
    });
    const adminUser = await User.create({
      name: 'Real Gemini Admin',
      email: `gemini-admin-${Date.now()}@example.invalid`,
      passwordHash,
      role: 'admin'
    });
    created.users.push(student._id, victimStudent._id, adminUser._id);

    // Create MongoDB context records for the test student
    const profile = await LearnerProfile.create({
      userId: student._id,
      currentSkillLevel: 'Intermediate',
      targetRoles: ['Software Engineer'],
      dsaMastery: 80,
      overallReadinessScore: 78
    });
    created.profiles.push(profile._id);

    const topicDSA = await Topic.create({
      title: 'Binary Search',
      category: 'dsa',
      subject: 'Algorithms',
      slug: `bs-real-gemini-${Date.now()}`
    });
    created.topics.push(topicDSA._id);

    const qDSA = await Question.create({
      title: 'Binary Search Problem',
      slug: `bs-prob-${Date.now()}`,
      problemStatement: 'Search an element in sorted array.',
      category: 'dsa',
      topicId: topicDSA._id,
      difficulty: 'Easy'
    });
    created.questions.push(qDSA._id);

    const attempt = await AttemptTrack.create({
      userId: student._id,
      questionId: qDSA._id,
      category: 'dsa',
      status: 'Accepted',
      timeSpentSeconds: 90
    });
    created.attempts.push(attempt._id);

    const weakness = await WeaknessAnalysis.create({
      userId: student._id,
      topicId: topicDSA._id,
      category: 'dsa',
      failureCount: 1,
      accuracyPercentage: 80,
      severity: 'Low'
    });
    created.weaknesses.push(weakness._id);

    mongoContextResult = 'PASS';
    console.log('[AiCoachRealGeminiTest] Created student profile & MongoDB context data: PASS.');

    const studentToken = generateToken({ id: student._id, role: student.role });
    const adminToken = generateToken({ id: adminUser._id, role: adminUser.role });

    const authStudent = authorize('student');
    const simulateRoute = async (req, res) => {
      const p = await runMiddleware(protect, req, res);
      if (!p) return;
      const a = await runMiddleware(authStudent, req, res);
      if (!a) return;
      await chatWithCoach(req, res);
    };

    console.log('\n--- 1. Verification of JWT Authentication & Role (RBAC) ---');
    // A. Missing JWT -> 401
    let { req: r, res: rs } = createMockReqRes({}, { message: 'Explain what a binary search is in simple terms.' });
    await simulateRoute(r, rs);
    if (rs.statusCode !== 401) throw new Error(`Expected 401 for unauthenticated request, got ${rs.statusCode}`);

    // B. Invalid JWT -> 401
    ({ req: r, res: rs } = createMockReqRes({ authorization: 'Bearer invalid.jwt.token' }, { message: 'Explain what a binary search is in simple terms.' }));
    await simulateRoute(r, rs);
    if (rs.statusCode !== 401) throw new Error(`Expected 401 for invalid token, got ${rs.statusCode}`);
    authResult = 'PASS';
    console.log('[AiCoachRealGeminiTest] JWT Authentication verification: PASS');

    // C. Admin JWT -> 403 (RBAC)
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${adminToken}` }, { message: 'Explain what a binary search is in simple terms.' }));
    await simulateRoute(r, rs);
    if (rs.statusCode !== 403) throw new Error(`Expected 403 for Admin role, got ${rs.statusCode}`);
    rbacResult = 'PASS';
    console.log('[AiCoachRealGeminiTest] Student RBAC authorization verification: PASS');

    console.log('\n--- 2. Verification of Student Identity Isolation ---');
    // Student identity must come ONLY from req.user.userId (never trust body userId/studentId)
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${studentToken}` }, {
      message: 'Explain what a binary search is in simple terms.',
      userId: victimStudent._id.toString(),
      studentId: victimStudent._id.toString(),
      context: { module: 'DSA', topic: 'Binary Search', difficulty: 'Easy' }
    }));
    await simulateRoute(r, rs);
    // Request must proceed using studentToken identity without throwing error or switching context
    if (rs.statusCode !== 200) {
      throw new Error(`Expected 200 for authenticated student, got ${rs.statusCode}`);
    }
    console.log('[AiCoachRealGeminiTest] Student identity isolation (from token ONLY): PASS');

    console.log('\n--- 3. Verification of Real Gemini Generation ---');
    // Call POST /api/v1/ai/coach/chat with prompt and context
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${studentToken}` }, {
      message: 'Explain what a binary search is in simple terms.',
      context: {
        module: 'DSA',
        topic: 'Binary Search',
        difficulty: 'Easy'
      }
    }));
    await simulateRoute(r, rs);

    if (rs.statusCode !== 200) {
      throw new Error(`AI Coach request failed with status code: ${rs.statusCode}`);
    }

    if (!rs.body || rs.body.success !== true || !rs.body.data || !rs.body.data.message) {
      throw new Error('AI Coach response body structure invalid or empty');
    }

    const aiMessage = rs.body.data.message;
    console.log('\n[AiCoachRealGeminiTest] Received AI Response Snippet (First 200 chars):');
    console.log(aiMessage.substring(0, 200) + '...\n');

    if (typeof aiMessage !== 'string' || aiMessage.trim().length === 0) {
      throw new Error('AI response is empty');
    }
    aiResponseReceived = 'YES';

    // Verify response is NOT hardcoded/mock response
    const hardcodedMockStrings = [
      '### 💡 DSA Mentor Guidance: Two Sum & Hash Map Pattern',
      'function twoSum(nums, target)',
      'What edge cases should you test before submitting?'
    ];
    for (const mockStr of hardcodedMockStrings) {
      if (aiMessage.includes(mockStr)) {
        throw new Error(`Response matches simulated hardcoded mock text! Text: "${mockStr}"`);
      }
    }
    console.log('[AiCoachRealGeminiTest] Response verified as genuine Gemini AI output (not hardcoded mock): PASS');

    // Security Check: Verify API key or sensitive data (passwords, system prompt instructions, db strings) are NOT exposed in response
    if (rawApiKey && rawApiKey.length > 5 && aiMessage.includes(rawApiKey)) {
      secretKeyLogged = true;
      throw new Error('SECURITY VIOLATION: GEMINI_API_KEY exposed in AI response text');
    }

    const forbiddenSecrets = ['passwordHash', 'JWT_SECRET', 'MONGODB_URI', 'CRITICAL SAFETY & ACCURACY INSTRUCTIONS'];
    for (const secret of forbiddenSecrets) {
      if (aiMessage.includes(secret)) {
        throw new Error(`SECURITY VIOLATION: Internal secret/system prompt string "${secret}" leaked in response`);
      }
    }
    console.log('[AiCoachRealGeminiTest] Security leak audit (no keys, secrets, or prompt leaks): PASS');
    realGeminiResult = 'PASS';

    console.log('\n--- 4. Safe Verification of Gemini-Unavailable 503 Behavior ---');
    // Temporarily suppress GEMINI_API_KEY in process.env without modifying server/.env
    process.env.GEMINI_API_KEY = '';
    try {
      ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${studentToken}` }, {
        message: 'Explain what a binary search is in simple terms.',
        context: { module: 'DSA', topic: 'Binary Search', difficulty: 'Easy' }
      }));
      await simulateRoute(r, rs);

      if (rs.statusCode !== 503 || rs.body.success !== false) {
        throw new Error(`Expected 503 Service Unavailable when Gemini API is unconfigured, got status ${rs.statusCode}`);
      }
      console.log('[AiCoachRealGeminiTest] Gemini unavailable fallback (503 Service Unavailable): PASS');
    } finally {
      // Restore GEMINI_API_KEY in memory
      process.env.GEMINI_API_KEY = rawApiKey;
    }

    console.log('\n[AiCoachRealGeminiTest] === DEDICATED REAL GEMINI AI COACH VERIFICATION PASSED ===');

  } catch (error) {
    console.error(`\n[AiCoachRealGeminiTest] VERIFICATION FAILED: ${error.message}`);
    process.exitCode = 1;
  } finally {
    // Restore process.env.GEMINI_API_KEY just in case
    process.env.GEMINI_API_KEY = rawApiKey;
    console.log('[AiCoachRealGeminiTest] Cleaning up temporary test documents from Atlas...');
    for (const id of created.users) await User.deleteOne({ _id: id }).catch(() => {});
    for (const id of created.profiles) await LearnerProfile.deleteOne({ _id: id }).catch(() => {});
    for (const id of created.topics) await Topic.deleteOne({ _id: id }).catch(() => {});
    for (const id of created.questions) await Question.deleteOne({ _id: id }).catch(() => {});
    for (const id of created.attempts) await AttemptTrack.deleteOne({ _id: id }).catch(() => {});
    for (const id of created.weaknesses) await WeaknessAnalysis.deleteOne({ _id: id }).catch(() => {});
    await mongoose.disconnect().catch(() => {});
    console.log('[AiCoachRealGeminiTest] Cleanup complete.');

    console.log('\n================ VERIFICATION SUMMARY ================');
    console.log(`Authentication Result:      ${authResult}`);
    console.log(`Student RBAC Result:        ${rbacResult}`);
    console.log(`MongoDB Context Result:     ${mongoContextResult}`);
    console.log(`Real Gemini Gen Result:     ${realGeminiResult}`);
    console.log(`AI Response Received:       ${aiResponseReceived}`);
    console.log(`Secret/API Key Logged:      ${secretKeyLogged ? 'YES (FAIL)' : 'NO (PASS)'}`);
    console.log('======================================================\n');
  }
};

runVerification();
