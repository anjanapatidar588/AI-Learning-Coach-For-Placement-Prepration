import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import dns from 'dns';
import { connectDB } from '../config/db.js';
import User from '../src/models/User.js';
import Question from '../src/models/Question.js';
import Topic from '../src/models/Topic.js';
import AttemptTrack from '../src/models/AttemptTrack.js';
import { hashPassword } from '../src/utils/passwordUtil.js';
import { generateToken } from '../src/utils/jwtUtil.js';
import { submitDSACode } from '../src/controllers/dsaController.js';
import { protect } from '../src/middleware/authMiddleware.js';
import { authorize } from '../src/middleware/roleMiddleware.js';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const createMockReqRes = (headers = {}, body = {}, query = {}, params = {}) => {
  const req = { headers, body, query, params };
  const res = {
    statusCode: 200,
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

const runDsaExecutionVerification = async () => {
  console.log('[DsaExecutionTest] Starting Step 41 Dedicated DSA Code Execution Verification...');
  const createdIds = { users: [], questions: [], topics: [], attempts: [] };

  try {
    await connectDB();
    console.log('[DsaExecutionTest] Connected to MongoDB Atlas.');

    const passwordHash = await hashPassword('TestPassword123!');

    // Create student 1
    const student1 = await User.create({
      name: 'DSA Execution Test Student 1',
      email: `dsa-exec-1-${Date.now()}@example.invalid`,
      passwordHash,
      role: 'student'
    });
    createdIds.users.push(student1._id);
    const token1 = generateToken({ id: student1._id, role: student1.role });

    // Create student 2
    const student2 = await User.create({
      name: 'DSA Execution Test Student 2',
      email: `dsa-exec-2-${Date.now()}@example.invalid`,
      passwordHash,
      role: 'student'
    });
    createdIds.users.push(student2._id);
    const token2 = generateToken({ id: student2._id, role: student2.role });

    // Create Admin
    const adminUser = await User.create({
      name: 'DSA Execution Admin',
      email: `dsa-exec-admin-${Date.now()}@example.invalid`,
      passwordHash,
      role: 'admin'
    });
    createdIds.users.push(adminUser._id);
    const adminToken = generateToken({ id: adminUser._id, role: adminUser.role });

    // Create DSA Topic & Question with public and hidden test cases
    const topicDSA = await Topic.create({
      category: 'dsa',
      subject: 'Algorithms',
      title: 'Two Pointers',
      slug: `two-pointers-exec-${Date.now()}`,
      order: 1001
    });
    createdIds.topics.push(topicDSA._id);

    const qDSA = await Question.create({
      topicId: topicDSA._id,
      title: 'Sum of Two Numbers',
      slug: `sum-two-exec-${Date.now()}`,
      problemStatement: 'Given two integers, return their sum.',
      codeSnippets: {
        javascript: 'function sum(a, b) { return a + b; }'
      },
      testCases: [
        { input: '2 3', expectedOutput: '5', isHidden: false },
        { input: '10 -5', expectedOutput: '5', isHidden: true }
      ]
    });
    createdIds.questions.push(qDSA._id);

    console.log('[DsaExecutionTest] Created test accounts, topic, and test question.');

    const authStudent = authorize('student');
    const simulateRoute = async (controller, req, res) => {
      const p = await runMiddleware(protect, req, res);
      if (!p) return;
      const a = await runMiddleware(authStudent, req, res);
      if (!a) return;
      await controller(req, res);
    };

    // 1. Unauthenticated request -> 401
    console.log('[DsaExecutionTest] 1. Testing unauthenticated request...');
    let { req: r, res: rs } = createMockReqRes();
    await simulateRoute(submitDSACode, r, rs);
    if (rs.statusCode !== 401) throw new Error(`Expected 401 for unauthenticated request, got ${rs.statusCode}`);
    console.log('PASS: Unauthenticated request rejected (401).');

    // 2. Non-student role -> 403
    console.log('[DsaExecutionTest] 2. Testing non-student role (Admin)...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${adminToken}` }));
    await simulateRoute(submitDSACode, r, rs);
    if (rs.statusCode !== 403) throw new Error(`Expected 403 for Admin role, got ${rs.statusCode}`);
    console.log('PASS: Non-student role rejected (403).');

    // 3. Missing questionId & slug -> 400
    console.log('[DsaExecutionTest] 3. Testing missing questionId & slug...');
    ({ req: r, res: rs } = createMockReqRes(
      { authorization: `Bearer ${token1}` },
      { code: 'console.log("hello");', language: 'javascript' }
    ));
    await simulateRoute(submitDSACode, r, rs);
    if (rs.statusCode !== 400) throw new Error(`Expected 400 for missing questionId, got ${rs.statusCode}`);
    console.log('PASS: Missing questionId returns 400.');

    // 4. Invalid questionId format -> 400
    console.log('[DsaExecutionTest] 4. Testing invalid questionId format...');
    ({ req: r, res: rs } = createMockReqRes(
      { authorization: `Bearer ${token1}` },
      { questionId: 'invalid-hex-id', code: 'console.log("hello");', language: 'javascript' }
    ));
    await simulateRoute(submitDSACode, r, rs);
    if (rs.statusCode !== 400) throw new Error(`Expected 400 for invalid questionId format, got ${rs.statusCode}`);
    console.log('PASS: Invalid questionId format returns 400.');

    // 5. Unsupported language -> 400
    console.log('[DsaExecutionTest] 5. Testing unsupported language...');
    ({ req: r, res: rs } = createMockReqRes(
      { authorization: `Bearer ${token1}` },
      { questionId: qDSA._id.toString(), code: 'print("hello")', language: 'cobol' }
    ));
    await simulateRoute(submitDSACode, r, rs);
    if (rs.statusCode !== 400) throw new Error(`Expected 400 for unsupported language, got ${rs.statusCode}`);
    console.log('PASS: Unsupported language returns 400.');

    // 6. Missing source code -> 400
    console.log('[DsaExecutionTest] 6. Testing missing source code...');
    ({ req: r, res: rs } = createMockReqRes(
      { authorization: `Bearer ${token1}` },
      { questionId: qDSA._id.toString(), language: 'javascript' }
    ));
    await simulateRoute(submitDSACode, r, rs);
    if (rs.statusCode !== 400) throw new Error(`Expected 400 for missing source code, got ${rs.statusCode}`);
    console.log('PASS: Missing source code returns 400.');

    // 7. Oversized source code -> 400
    console.log('[DsaExecutionTest] 7. Testing oversized source code...');
    const oversizedCode = 'a'.repeat(50001);
    ({ req: r, res: rs } = createMockReqRes(
      { authorization: `Bearer ${token1}` },
      { questionId: qDSA._id.toString(), code: oversizedCode, language: 'javascript' }
    ));
    await simulateRoute(submitDSACode, r, rs);
    if (rs.statusCode !== 400) throw new Error(`Expected 400 for oversized source code, got ${rs.statusCode}`);
    console.log('PASS: Oversized source code returns 400.');

    // 8. Identity injection test -> body userId ignored
    console.log('[DsaExecutionTest] 8. Testing student identity isolation (body userId ignored)...');
    ({ req: r, res: rs } = createMockReqRes(
      { authorization: `Bearer ${token1}` },
      {
        questionId: qDSA._id.toString(),
        code: 'console.log(5);',
        language: 'javascript',
        userId: student2._id.toString()
      }
    ));
    await simulateRoute(submitDSACode, r, rs);

    // Determine provider status in environment
    const isProviderConfigured = Boolean(
      process.env.JUDGE0_API_URL || process.env.RAPIDAPI_JUDGE0_URL || process.env.PISTON_API_URL || process.env.CODE_EXECUTION_URL
    );

    if (!isProviderConfigured) {
      console.log('Provider execution configuration: NOT CONFIGURED IN ENVIRONMENT');
      console.log('Provider execution could not be live-tested because provider configuration is unavailable.');

      if (rs.statusCode !== 503) {
        throw new Error(`Expected 503 when provider is not configured, got ${rs.statusCode}`);
      }
      console.log('PASS: Clean 503 Service Unavailable returned when provider configuration is missing.');

      // 13. Verify no AttemptTrack created when execution is unavailable
      const attempts1 = await AttemptTrack.find({ userId: student1._id });
      const attempts2 = await AttemptTrack.find({ userId: student2._id });
      if (attempts1.length > 0 || attempts2.length > 0) {
        throw new Error('AttemptTrack was improperly created when provider execution was unavailable!');
      }
      console.log('PASS: AttemptTrack is NOT created when provider is unavailable/not configured.');
    } else {
      console.log('Provider execution configuration: CONFIGURED');
      if (rs.statusCode !== 200) {
        throw new Error(`Expected 200 for valid submission with configured provider, got ${rs.statusCode}`);
      }
      console.log('PASS: Code execution request completed with HTTP 200.');

      const data = rs.body?.data || {};
      if (!data.status) throw new Error('Response missing normalized status field');
      console.log(`PASS: Real execution result status: ${data.status}`);

      // Check AttemptTrack created only after real execution
      const attempts = await AttemptTrack.find({ userId: student1._id });
      if (attempts.length === 0) throw new Error('AttemptTrack was not created after real execution');
      if (attempts[0].userId.toString() !== student1._id.toString()) {
        throw new Error('AttemptTrack created under wrong student identity!');
      }
      console.log('PASS: AttemptTrack created under correct authenticated student identity.');
    }

    // 15. Verify secret leaks and hidden test cases exposure audit
    const responseBodyStr = JSON.stringify(rs.body || {});
    if (responseBodyStr.includes('isHidden') || responseBodyStr.includes('expectedOutput')) {
      throw new Error('Response exposed hidden test cases or expected outputs!');
    }
    if (responseBodyStr.includes('JUDGE0_KEY') || responseBodyStr.includes('RAPIDAPI_KEY')) {
      throw new Error('Response exposed sensitive execution provider keys!');
    }
    console.log('PASS: Sensitive provider credentials and hidden test case expected outputs are never returned.');

    // Cleanup test data
    console.log('[DsaExecutionTest] Cleaning up temporary test documents from Atlas...');
    for (const id of createdIds.users) await User.deleteOne({ _id: id });
    for (const id of createdIds.topics) await Topic.deleteOne({ _id: id });
    for (const id of createdIds.questions) await Question.deleteOne({ _id: id });
    for (const id of createdIds.attempts) await AttemptTrack.deleteOne({ _id: id });

    console.log('[DsaExecutionTest] PASS: All temporary test data deleted from MongoDB Atlas.');
    console.log('[DsaExecutionTest] === DEDICATED STEP 41 DSA CODE EXECUTION VERIFICATION PASSED ===');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(`[DsaExecutionTest] VERIFICATION FAILED: ${error.message}`);
    for (const id of createdIds.users) await User.deleteOne({ _id: id }).catch(() => {});
    for (const id of createdIds.topics) await Topic.deleteOne({ _id: id }).catch(() => {});
    for (const id of createdIds.questions) await Question.deleteOne({ _id: id }).catch(() => {});
    for (const id of createdIds.attempts) await AttemptTrack.deleteOne({ _id: id }).catch(() => {});
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
};

runDsaExecutionVerification();
